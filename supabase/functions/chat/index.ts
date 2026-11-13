// ============================================================================
// Northwind AI Agent Workspace — Edge Function: chat
// supabase/functions/chat/index.ts
// ----------------------------------------------------------------------------
// Streams a chat reply from Gemini (SSE) for a saved agent or an inline
// (wizard test-chat) agent config, and — when a chatId is supplied — saves
// both turns plus one usage_events row.
//
// WHAT THE PARENT / OPERATOR STILL HAS TO DO (not done by this file):
//   1. Create the Supabase project 'northwind' (a browser task is doing
//      this now) and note its URL + anon key.
//   2. Run supabase/migrations/202611140001_mvp.sql against that project.
//   3. Set the GEMINI_API_KEY secret on the project:
//      `supabase secrets set GEMINI_API_KEY=<key>` — never commit the key.
//   4. Deploy this function: `supabase functions deploy chat`.
//   5. Frontend calls it with the user's Supabase access token in the
//      Authorization header (see request shape below).
//
// No secrets are hardcoded anywhere in this file. GEMINI_API_KEY is read
// from the function's environment at runtime only.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.0";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatRequest = {
  agentId?: string;
  agent?: {
    instructions?: string;
    model?: string;
    temperature?: number;
    name?: string;
  };
  messages: ChatMessage[];
  chatId?: string;
};

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Rough token estimate when Gemini reports no usageMetadata:
// ~1 token per 4 characters.
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  // --- Auth: the caller's Supabase access token, so RLS applies as them. ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonError("Missing Authorization: Bearer <access token> header", 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError("Supabase is not configured on this function", 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // --- Request body. ---
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return jsonError("Request body must be valid JSON", 400);
  }

  const { agentId, agent: inlineAgent, messages, chatId } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError("messages must be a non-empty array", 400);
  }
  if (!agentId && !inlineAgent) {
    return jsonError("Either agentId or inline agent config is required", 400);
  }
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    return jsonError("messages must contain at least one user message", 400);
  }

  // --- Resolve the agent config. ---
  // Saved agent: loaded through the user-scoped client, so RLS enforces
  // workspace membership — a non-member gets no row and a 404 here.
  let instructions = inlineAgent?.instructions ?? "";
  let model = inlineAgent?.model ?? "gemini-2.5-flash";
  let temperature = inlineAgent?.temperature ?? 0.7;
  let savedAgentId: string | null = null;

  if (agentId) {
    const { data, error } = await supabase
      .from("agents")
      .select("id, instructions, model, temperature")
      .eq("id", agentId)
      .single();
    if (error || !data) {
      return jsonError("Agent not found", 404);
    }
    savedAgentId = data.id;
    instructions = data.instructions ?? "";
    model = data.model ?? "gemini-2.5-flash";
    temperature = data.temperature ?? 0.7;
  }

  // --- Gemini key (Edge Function secret, set by the operator). ---
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    return jsonError("GEMINI_API_KEY is not configured", 500);
  }

  // --- Call Gemini with streaming (SSE). ---
  const startedAt = Date.now();
  const geminiRes = await fetch(
    `${GEMINI_BASE}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": geminiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(instructions
          ? { systemInstruction: { parts: [{ text: instructions }] } }
          : {}),
        contents: messages.map((m) => ({
          // Gemini uses 'model' for assistant turns.
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature },
      }),
    },
  );

  if (!geminiRes.ok || !geminiRes.body) {
    const detail = await geminiRes.text().catch(() => "");
    console.error("Gemini request failed", geminiRes.status, detail.slice(0, 500));
    return jsonError(`Gemini request failed (${geminiRes.status})`, 502);
  }

  // --- Stream Gemini's SSE back to the client, accumulating the reply. ---
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => controller.enqueue(encoder.encode(sse(data)));

      let fullText = "";
      let tokensIn = 0;
      let tokensOut = 0;
      let sawUsage = false;

      try {
        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Gemini SSE frames are `data: {...}` lines; a JSON object may
          // span several lines, so split on blank lines, not newlines.
          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            for (const line of frame.split("\n")) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload) as {
                  candidates?: Array<{
                    content?: { parts?: Array<{ text?: string }> };
                  }>;
                  usageMetadata?: {
                    promptTokenCount?: number;
                    candidatesTokenCount?: number;
                  };
                };
                const text =
                  parsed.candidates?.[0]?.content?.parts
                    ?.map((p) => p.text ?? "")
                    .join("") ?? "";
                if (text) {
                  fullText += text;
                  send({ delta: text });
                }
                if (parsed.usageMetadata) {
                  sawUsage = true;
                  tokensIn = parsed.usageMetadata.promptTokenCount ?? tokensIn;
                  tokensOut =
                    parsed.usageMetadata.candidatesTokenCount ?? tokensOut;
                }
              } catch {
                // Ignore a malformed frame; the stream continues.
              }
            }
            boundary = buffer.indexOf("\n\n");
          }
        }

        const latencyMs = Date.now() - startedAt;
        if (!sawUsage) {
          // Fallback estimate when Gemini reports no usageMetadata.
          tokensIn = estimateTokens(
            messages.map((m) => m.content).join("\n"),
          );
          tokensOut = estimateTokens(fullText);
        }
        // costUsd is 0 on the Gemini free tier (no billing attached); when
        // a paid tier / different provider is used, compute it here from
        // the provider's per-token pricing instead of hardcoding 0.
        const costUsd = 0;

        // --- Persistence (only when chatId is given). ---
        // Failures are logged but must NOT fail the stream — the user
        // already has the reply; a missed save is recoverable.
        if (chatId) {
          try {
            const { data: chat, error: chatError } = await supabase
              .from("chats")
              .select("id, workspace_id")
              .eq("id", chatId)
              .single();
            if (chatError || !chat) {
              console.error("chat persistence: chat not found", chatId, chatError);
            } else {
              const workspaceId = chat.workspace_id as string;
              const { error: msgError } = await supabase.from("messages").insert([
                {
                  chat_id: chatId,
                  workspace_id: workspaceId,
                  role: "user",
                  content: lastUserMessage.content,
                  tokens_in: tokensIn,
                  tokens_out: 0,
                  cost_usd: 0,
                },
                {
                  chat_id: chatId,
                  workspace_id: workspaceId,
                  role: "assistant",
                  content: fullText,
                  tokens_in: tokensIn,
                  tokens_out: tokensOut,
                  cost_usd: costUsd,
                },
              ]);
              if (msgError) console.error("chat persistence: messages insert failed", msgError);

              const { error: usageError } = await supabase
                .from("usage_events")
                .insert({
                  workspace_id: workspaceId,
                  agent_id: savedAgentId,
                  chat_id: chatId,
                  model,
                  tokens_in: tokensIn,
                  tokens_out: tokensOut,
                  cost_usd: costUsd,
                  latency_ms: latencyMs,
                });
              if (usageError) console.error("chat persistence: usage insert failed", usageError);

              await supabase
                .from("chats")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", chatId);
            }
          } catch (e) {
            console.error("chat persistence failed", e);
          }
        }

        send({
          done: true,
          chatId: chatId ?? null,
          usage: { tokensIn, tokensOut, costUsd, latencyMs },
        });
      } catch (e) {
        console.error("chat stream failed", e);
        try {
          send({ done: true, chatId: chatId ?? null, error: "Stream interrupted" });
        } catch {
          // Client already gone; nothing to do.
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...CORS_HEADERS, "Content-Type": "text/event-stream" },
  });
});

// ============================================================================
// Northwind AI Agent Workspace — Cloud Function: chat (Firebase, 2nd gen)
// functions/src/index.ts
// ----------------------------------------------------------------------------
// Firebase Cloud Function (2nd gen, region asia-southeast1, Node 20).
// Streams a chat reply from Gemini (SSE) for a saved agent or an inline
// (wizard test-chat) agent config, and — when a chatId is supplied — saves
// both turns plus one usage_events doc in Firestore.
//
// Request (POST, JSON):
//   { agentId?, agent?: { instructions?, model?, temperature?, name? },
//     messages: [{ role: "user" | "assistant", content }], chatId? }
//   Header: Authorization: Bearer <Firebase ID token>
//
// Response: text/event-stream frames
//   data: {"delta": "..."}            (one per Gemini chunk)
//   data: {"done": true, "chatId": "...",
//          "usage": {"tokensIn","tokensOut","costUsd","latencyMs"}}
//   On a stream error the final frame carries { done: true, error: "..." }.
//   Non-stream errors are JSON { "error": "..." } with the HTTP status.
//
// Auth is enforced by the Firebase ID token, NOT by origin: CORS allows "*"
// for the MVP (see CORS_HEADERS below).
//
// WHAT THE OPERATOR STILL HAS TO DO (not done by this file):
//   1. Create the Firebase project (free Spark plan) and put its real id in
//      .firebaserc (currently a placeholder: "northwind").
//   2. Set the Gemini key as a Functions secret — NEVER in code or .env:
//        firebase functions:secrets:set GEMINI_API_KEY
//   3. Deploy: firebase deploy --only functions
//      (or: firebase deploy --only functions:chat)
//   4. Put the deployed URL in the frontend .env as VITE_FIREBASE_CHAT_URL
//      (see .env.example).
//
// No secrets are hardcoded anywhere in this file. GEMINI_API_KEY is read
// from Secret Manager at runtime via defineSecret() only.
// ============================================================================

import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";

admin.initializeApp();
const db = admin.firestore();

// The Gemini API key lives ONLY in Secret Manager. It is injected at runtime
// by the Functions platform because the function declares it in `secrets`
// below; it is never read from a committed file or an env file.
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// MVP: allow any origin. Auth is enforced by the Firebase ID token, not by
// origin, so a wildcard origin does not let an unauthenticated caller in.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

type AgentDoc = {
  workspace_id?: string;
  instructions?: string;
  model?: string;
  temperature?: number;
};

function sendJsonError(res: Response, status: number, message: string): void {
  res
    .status(status)
    .set({ ...CORS_HEADERS, "Content-Type": "application/json" })
    .json({ error: message });
}

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Rough token estimate when Gemini reports no usageMetadata:
// ~1 token per 4 characters.
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export const chat = onRequest(
  {
    region: "asia-southeast1",
    // Node version is governed by the `engines` field in package.json (20).
    secrets: [GEMINI_API_KEY],
    // A streamed chat reply can take a while; the gen2 default (60s) is too
    // short for long generations.
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async (req: Request, res: Response): Promise<void> => {
    // CORS preflight.
    if (req.method === "OPTIONS") {
      res.status(204).set(CORS_HEADERS).end();
      return;
    }
    if (req.method !== "POST") {
      sendJsonError(res, 405, "Method not allowed");
      return;
    }

    // --- Auth: the caller's Firebase ID token. ---
    const authHeader = req.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      sendJsonError(
        res,
        401,
        "Missing Authorization: Bearer <Firebase ID token> header",
      );
      return;
    }
    const idToken = authHeader.slice("Bearer ".length).trim();
    let uid: string;
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      sendJsonError(res, 401, "Invalid or expired Firebase ID token");
      return;
    }

    // --- Request body. ---
    // onRequest parses a JSON body for us; guard anyway.
    const body = (req.body ?? {}) as ChatRequest;
    const { agentId, agent: inlineAgent, messages, chatId } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      sendJsonError(res, 400, "messages must be a non-empty array");
      return;
    }
    if (
      messages.some(
        (m) => !m || typeof m.content !== "string" || (m.role !== "user" && m.role !== "assistant"),
      )
    ) {
      sendJsonError(
        res,
        400,
        "each message must have role 'user' | 'assistant' and a string content",
      );
      return;
    }
    if (!agentId && !inlineAgent) {
      sendJsonError(res, 400, "Either agentId or inline agent config is required");
      return;
    }
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      sendJsonError(res, 400, "messages must contain at least one user message");
      return;
    }

    // --- Resolve the agent config. ---
    let instructions = inlineAgent?.instructions ?? "";
    let model = inlineAgent?.model ?? "gemini-2.5-flash";
    let temperature = inlineAgent?.temperature ?? 0.7;
    let savedAgentId: string | null = null;

    if (agentId) {
      const agentSnap = await db.collection("agents").doc(agentId).get();
      if (!agentSnap.exists) {
        sendJsonError(res, 404, "Agent not found");
        return;
      }
      const agentData = agentSnap.data() as AgentDoc;
      const workspaceId = agentData.workspace_id;
      if (!workspaceId) {
        sendJsonError(res, 404, "Agent not found");
        return;
      }
      // Membership is the tenant check. The doc id is
      // `${workspaceId}_${userId}`; a non-member gets the same 404 as a
      // missing agent so existence is not leaked.
      const memberSnap = await db
        .collection("workspace_members")
        .doc(`${workspaceId}_${uid}`)
        .get();
      if (!memberSnap.exists) {
        sendJsonError(res, 404, "Agent not found");
        return;
      }
      savedAgentId = agentSnap.id;
      instructions = agentData.instructions ?? "";
      model = agentData.model ?? "gemini-2.5-flash";
      temperature =
        typeof agentData.temperature === "number" ? agentData.temperature : 0.7;
    }

    // --- Gemini key (Functions secret, set by the operator). ---
    let geminiKey: string;
    try {
      geminiKey = GEMINI_API_KEY.value();
    } catch {
      sendJsonError(res, 500, "GEMINI_API_KEY is not configured");
      return;
    }
    if (!geminiKey) {
      sendJsonError(res, 500, "GEMINI_API_KEY is not configured");
      return;
    }

    // --- Call Gemini with streaming (SSE). ---
    const startedAt = Date.now();
    let geminiRes: globalThis.Response;
    try {
      geminiRes = await fetch(
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
    } catch (e) {
      console.error("Gemini request failed (network)", e);
      sendJsonError(res, 502, "Gemini request failed");
      return;
    }

    if (!geminiRes.ok || !geminiRes.body) {
      const detail = await geminiRes.text().catch(() => "");
      console.error("Gemini request failed", geminiRes.status, detail.slice(0, 500));
      sendJsonError(res, 502, `Gemini request failed (${geminiRes.status})`);
      return;
    }

    // --- Stream Gemini's SSE back to the client, accumulating the reply. ---
    res.writeHead(200, {
      ...CORS_HEADERS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      // Keep proxies (incl. the Functions front-end) from buffering chunks.
      "X-Accel-Buffering": "no",
    });
    const send = (data: unknown): void => {
      res.write(sse(data));
    };

    let fullText = "";
    let tokensIn = 0;
    let tokensOut = 0;
    let sawUsage = false;

    try {
      const reader = geminiRes.body.getReader();
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
        tokensIn = estimateTokens(messages.map((m) => m.content).join("\n"));
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
          const chatSnap = await db.collection("chats").doc(chatId).get();
          if (!chatSnap.exists) {
            console.error("chat persistence: chat not found", chatId);
          } else {
            const workspaceId = (chatSnap.data() as { workspace_id?: string })
              .workspace_id;
            if (!workspaceId) {
              console.error(
                "chat persistence: chat has no workspace_id",
                chatId,
              );
            } else {
              const now = new Date().toISOString();
              const batch = db.batch();
              batch.set(db.collection("messages").doc(), {
                chat_id: chatId,
                workspace_id: workspaceId,
                role: "user",
                content: lastUserMessage.content,
                tokens_in: tokensIn,
                tokens_out: 0,
                cost_usd: 0,
                created_at: now,
              });
              batch.set(db.collection("messages").doc(), {
                chat_id: chatId,
                workspace_id: workspaceId,
                role: "assistant",
                content: fullText,
                tokens_in: tokensIn,
                tokens_out: tokensOut,
                cost_usd: costUsd,
                created_at: now,
              });
              batch.set(db.collection("usage_events").doc(), {
                workspace_id: workspaceId,
                user_id: uid,
                agent_id: savedAgentId,
                chat_id: chatId,
                model,
                tokens_in: tokensIn,
                tokens_out: tokensOut,
                cost_usd: costUsd,
                latency_ms: latencyMs,
                created_at: now,
              });
              batch.update(db.collection("chats").doc(chatId), {
                updated_at: now,
              });
              await batch.commit();
            }
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
      res.end();
    }
  },
);

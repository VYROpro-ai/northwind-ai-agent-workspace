import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from './supabase';
import type { ThreadMessage } from '@/pages/chat/hooks';

export interface ChatUsage {
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
}

export interface StreamChatOptions {
  agentId?: string;
  /** Inline agent config (wizard draft / test chat) — no agentId, no persistence. */
  agent?: { instructions: string; model: string; temperature: number; name: string };
  messages: { role: 'user' | 'assistant'; content: string }[];
  chatId?: string;
  accessToken: string;
  signal?: AbortSignal;
  onDelta: (textSoFar: string) => void;
}

function chatFunctionUrl() {
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/chat`;
}

export async function createChat(
  workspaceId: string,
  agentId: string | null,
  title: string,
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase
    .from('chats')
    .insert({ workspace_id: workspaceId, agent_id: agentId, user_id: userId, title })
    .select('id')
    .single();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function listChats(workspaceId: string) {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('chats')
    .select('id, workspace_id, agent_id, user_id, title')
    .eq('workspace_id', workspaceId)
    .order('id', { ascending: false });
  if (error || !data) return [];
  return data as { id: string; workspace_id: string; agent_id: string | null; user_id: string; title: string | null }[];
}

/** Messages of a chat, mapped to the ThreadMessage shape used by the chat UI. */
export async function listMessages(chatId: string): Promise<ThreadMessage[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    data as { role: 'user' | 'assistant'; content: string; created_at: string }[]
  ).map((m, i) => ({
    id: i + 1,
    role: m.role === 'assistant' ? 'agent' : 'user',
    text: m.content,
    time: timeFormat.format(new Date(m.created_at)),
  }));
}

/**
 * POSTs to the `chat` Edge Function and parses its SSE stream. Calls onDelta with
 * the full accumulated assistant text as chunks arrive; resolves with the usage
 * object from the final `done` frame. The function persists messages + usage
 * when chatId is provided — this client never inserts messages itself.
 */
export async function streamChat({
  agentId,
  agent,
  messages,
  chatId,
  accessToken,
  signal,
  onDelta,
}: StreamChatOptions): Promise<ChatUsage> {
  const res = await fetch(chatFunctionUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ agentId, agent, messages, chatId }),
    signal,
  });

  const contentType = res.headers.get('content-type') ?? '';
  if (!res.ok || !contentType.includes('text/event-stream')) {
    let message = `Chat request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* keep the generic message */
    }
    throw new Error(message);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Chat stream had no body');
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let usage: ChatUsage = { tokensIn: 0, tokensOut: 0, costUsd: 0, latencyMs: 0 };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      let parsed: { delta?: string; done?: boolean; error?: string; chatId?: string; usage?: ChatUsage };
      try {
        parsed = JSON.parse(payload) as typeof parsed;
      } catch {
        continue;
      }
      if (parsed.error) throw new Error(parsed.error);
      if (typeof parsed.delta === 'string') {
        text += parsed.delta;
        onDelta(text);
      }
      if (parsed.done) {
        if (parsed.usage) usage = parsed.usage;
        return usage;
      }
    }
  }
  return usage;
}

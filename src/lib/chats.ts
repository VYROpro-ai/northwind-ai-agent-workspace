import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
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

function chatFunctionUrl(): string {
  const url = import.meta.env.VITE_FIREBASE_CHAT_URL as string | undefined;
  if (!url) {
    throw new Error(
      'VITE_FIREBASE_CHAT_URL is not set — the chat Cloud Function URL is not configured',
    );
  }
  return url;
}

export async function createChat(
  workspaceId: string,
  agentId: string | null,
  title: string,
): Promise<string | null> {
  if (!isFirebaseConfigured || !db) return null;
  const userId = auth?.currentUser?.uid;
  if (!userId) return null;
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, 'chats'), {
    workspace_id: workspaceId,
    agent_id: agentId,
    user_id: userId,
    title,
    created_at: now,
    updated_at: now,
  });
  return ref.id;
}

export async function listChats(workspaceId: string) {
  if (!isFirebaseConfigured || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, 'chats'),
      where('workspace_id', '==', workspaceId),
      orderBy('created_at', 'desc'),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data() as {
      workspace_id: string;
      agent_id: string | null;
      user_id: string;
      title: string | null;
    };
    return {
      id: d.id,
      workspace_id: data.workspace_id,
      agent_id: data.agent_id,
      user_id: data.user_id,
      title: data.title,
    };
  });
}

/** Messages of a chat, mapped to the ThreadMessage shape used by the chat UI. */
export async function listMessages(chatId: string): Promise<ThreadMessage[]> {
  if (!isFirebaseConfigured || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, 'messages'),
      where('chat_id', '==', chatId),
      orderBy('created_at', 'asc'),
    ),
  );
  const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  return snap.docs.map((d, i) => {
    const m = d.data() as { role: 'user' | 'assistant'; content: string; created_at: string };
    return {
      id: i + 1,
      role: m.role === 'assistant' ? 'agent' : 'user',
      text: m.content,
      time: timeFormat.format(new Date(m.created_at)),
    };
  });
}

/**
 * POSTs to the `chat` Cloud Function and parses its SSE stream. Calls onDelta with
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

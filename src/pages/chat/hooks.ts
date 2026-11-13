import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks';
import { cannedReply } from './data';
import { useAuth } from '@/lib/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { createChat, listMessages, streamChat } from '@/lib/chats';

/** True when the user asked the OS for less motion. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** True at the `xl` breakpoint and up, where side panels sit inline instead of in a drawer. */
export function useIsWide() {
  return useMediaQuery('(min-width: 1280px)');
}

/** Opens a side panel by default on wide screens only, so phones never load with a drawer open. */
export function useSidePanel(defaultOpen: boolean) {
  return useState(() => defaultOpen && window.matchMedia('(min-width: 1280px)').matches);
}

interface TypewriterOptions {
  /** Characters already shown when the hook mounts. */
  from?: number;
  /** Pauses the typing without resetting it. */
  running?: boolean;
  /** Characters added per tick. */
  step?: number;
  /** Tick length in ms. */
  interval?: number;
}

/**
 * Reveals `length` characters over time — the fake token stream used by every chat screen.
 * With reduced motion the whole text appears on the first tick.
 */
export function useTypewriter(
  length: number,
  { from = 0, running = true, step = 2, interval = 28 }: TypewriterOptions = {},
) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(from);
  const done = count >= length;

  useEffect(() => {
    if (!running || done) return;
    const id = window.setInterval(() => {
      setCount((c) => Math.min(length, c + (reduced ? length : step)));
    }, interval);
    return () => window.clearInterval(id);
  }, [running, done, length, reduced, step, interval]);

  return { count: Math.min(count, length), done, setCount };
}

/** Whole seconds elapsed while `running` is true. */
export function useElapsed(running: boolean, initial = 0) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return [seconds, setSeconds] as const;
}

export interface ThreadMessage {
  id: number;
  role: 'user' | 'agent';
  text: string;
  time: string;
}

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

/**
 * Messages typed into the composer during this visit. Each user message gets a canned agent reply
 * after a short "thinking" pause, so the thread feels alive without a backend.
 */
export function useChatThread(reply = cannedReply) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const timers = useRef<number[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const send = useCallback(
    (text: string) => {
      const time = timeFormat.format(new Date());
      setMessages((list) => [...list, { id: nextId.current++, role: 'user', text, time }]);
      setThinking(true);
      timers.current.push(
        window.setTimeout(() => {
          setThinking(false);
          setMessages((list) => [...list, { id: nextId.current++, role: 'agent', text: reply, time }]);
        }, 900),
      );
    },
    [reply],
  );

  return { messages, thinking, send };
}

export interface RealAgentConfig {
  /** DB id — when present the Edge Function loads the agent; otherwise the inline config is sent. */
  id?: string;
  name: string;
  instructions: string;
  model: string;
  temperature: number;
}

/**
 * Real chat thread: same shape as useChatThread, plus streaming state, the chat id
 * and any error. Creates a chat row on first send (when the agent has a DB id),
 * streams the assistant reply via the `chat` Cloud Function and lets the function
 * persist messages + usage — this client never inserts messages itself.
 * With a null agent, send() is a no-op.
 */
export function useRealChatThread(
  agent: RealAgentConfig | null,
  opts?: { resetKey?: string | number; chatId?: string },
) {
  const { workspace, getAccessToken } = useAuth();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [chatId, setChatId] = useState<string | null>(opts?.chatId ?? null);
  const [error, setError] = useState<string | null>(null);
  const chatIdRef = useRef<string | null>(opts?.chatId ?? null);
  const streamingIdRef = useRef<number | null>(null);
  const nextId = useRef(1);
  const messagesRef = useRef<ThreadMessage[]>([]);
  const resetKey = opts?.resetKey;
  const existingChatId = opts?.chatId;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Fresh thread when the selected agent changes.
  useEffect(() => {
    setMessages([]);
    messagesRef.current = [];
    setThinking(false);
    setStreaming(false);
    setError(null);
    setChatId(null);
    chatIdRef.current = null;
    streamingIdRef.current = null;
    nextId.current = 1;
  }, [resetKey]);

  // Load an existing chat's history (route /chat/:id).
  useEffect(() => {
    if (!existingChatId || !isFirebaseConfigured) return;
    let cancelled = false;
    void listMessages(existingChatId).then((rows) => {
      if (cancelled) return;
      if (rows.length > 0) {
        setMessages(rows);
        messagesRef.current = rows;
        nextId.current = rows.length + 1;
      }
      setChatId(existingChatId);
      chatIdRef.current = existingChatId;
    });
    return () => {
      cancelled = true;
    };
  }, [existingChatId]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || !agent || thinking) return;
      setError(null);
      const time = timeFormat.format(new Date());
      const userMsg: ThreadMessage = { id: nextId.current++, role: 'user', text: question, time };
      const history = [...messagesRef.current, userMsg];
      messagesRef.current = history;
      setMessages(history);
      setThinking(true);
      setStreaming(true);
      const agentMsgId = nextId.current++;
      streamingIdRef.current = agentMsgId;
      setMessages((list) => [...list, { id: agentMsgId, role: 'agent', text: '', time }]);
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('You are signed out. Sign in again to chat.');
        let cid = chatIdRef.current;
        if (!cid && agent.id && workspace) {
          cid = await createChat(workspace.id, agent.id, question.slice(0, 60));
          if (cid) {
            chatIdRef.current = cid;
            setChatId(cid);
          }
        }
        await streamChat({
          agentId: agent.id,
          agent: agent.id
            ? undefined
            : { instructions: agent.instructions, model: agent.model, temperature: agent.temperature, name: agent.name },
          messages: history.map((m) => ({
            role: m.role === 'agent' ? ('assistant' as const) : ('user' as const),
            content: m.text,
          })),
          chatId: cid ?? undefined,
          accessToken: token,
          onDelta: (t) => {
            setMessages((list) => list.map((m) => (m.id === agentMsgId ? { ...m, text: t } : m)));
          },
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chat failed');
        setMessages((list) => list.filter((m) => m.id !== agentMsgId));
      } finally {
        setThinking(false);
        setStreaming(false);
        streamingIdRef.current = null;
      }
    },
    [agent, thinking, workspace, getAccessToken],
  );

  return {
    messages,
    thinking,
    send,
    streaming,
    streamingId: streaming ? streamingIdRef.current : null,
    chatId,
    error,
  };
}

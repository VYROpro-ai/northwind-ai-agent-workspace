import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks';
import { cannedReply } from './data';

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

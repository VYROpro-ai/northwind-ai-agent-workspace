import { useEffect, useRef, useState } from 'react';
import { cannedReply, type ChatTurn } from '../data';

/** Local, backend-free conversation: user turns get a canned agent reply after a short "typing" delay. */
export function useTestConversation(seed: ChatTurn[]) {
  const [turns, setTurns] = useState<ChatTurn[]>(seed);
  const [typing, setTyping] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const ask = (text: string) => {
    const question = text.trim();
    if (!question || typing) return;
    setTurns((list) => [...list, { id: Date.now(), from: 'user', text: question }]);
    setTyping(true);
    timer.current = window.setTimeout(() => {
      setTurns((list) => [...list, { id: Date.now(), from: 'agent', ...cannedReply(question) }]);
      setTyping(false);
    }, 1200);
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setTyping(false);
    setTurns(seed);
  };

  return { turns, typing, ask, reset };
}

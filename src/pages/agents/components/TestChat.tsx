import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { IconButton } from '@/components/ui';
import { TypingDots } from '@/components/ai';
import type { ChatTurn } from '../data';
import { ChatInput } from './ChatInput';
import { ChatTurnView } from './ChatTurn';
import { useTestConversation } from './useTestConversation';

const seed: ChatTurn[] = [
  { id: 1, from: 'user', text: 'Hi, I was charged twice for order #48213. Can I get my money back?' },
  {
    id: 2,
    from: 'agent',
    tool: 'Search CRM · 0.8 s',
    text:
      'Hi Dana, I’m sorry about that. I can see order #48213 was charged $240 twice on Oct 22. ' +
      'You qualify for a full refund of the extra charge',
    cite: true,
    after: '. I’ve asked a teammate to approve it.',
    meta: '640 tokens · $0.01 · 1.9 s',
  },
];

const suggestions = ['Where is my order?', 'Cancel my plan', 'Refund older than 30 days'];

export interface TestChatProps {
  /** Context line under the header, e.g. "Uses your latest saved changes". */
  note?: string;
  /** Shows a close button (used when the panel sits in a drawer). */
  onClose?: () => void;
  className?: string;
}

/** Part · Test chat — live side panel for trying a draft agent. */
export function TestChat({ note = 'Uses your latest saved changes', onClose, className }: TestChatProps) {
  const { turns, typing, ask, reset } = useTestConversation(seed);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [turns, typing]);

  return (
    <aside
      aria-label="Test chat"
      className={cn('flex h-full min-h-0 flex-col bg-surface text-fg', className)}
    >
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-border pr-3 pl-5">
        <h2 className="flex-1 text-body-m font-semibold">Test chat</h2>
        <span className="inline-flex h-[22px] items-center rounded-sm bg-subtle px-2 text-caption font-medium text-fg-2">
          Draft
        </span>
        <IconButton icon="refresh" label="Reset test chat" variant="ghost" size="sm" onClick={reset} />
        {onClose && (
          <IconButton icon="close" label="Close test chat" variant="ghost" size="sm" onClick={onClose} />
        )}
      </div>
      <p className="flex shrink-0 items-center gap-2 bg-ai-subtle px-5 py-2 text-body-s text-ai-text">
        <Icon name="refresh" size={14} strokeWidth={2} />
        {note}
      </p>

      <div
        ref={scroller}
        aria-live="polite"
        className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-4 overflow-y-auto p-5"
      >
        {turns.map((turn) => (
          <ChatTurnView key={turn.id} turn={turn} compact />
        ))}
        {typing && <TypingDots className="self-start" />}
      </div>

      <div className="flex shrink-0 flex-col gap-2 px-5 pb-3">
        <span className="text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">Try asking</span>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={typing}
              onClick={() => ask(s)}
              className="h-7 rounded-full border border-border px-2.5 text-body-s text-fg-2 transition-colors hover:bg-subtle hover:text-fg disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-4 pt-3 pb-4">
        <ChatInput label="Test message" placeholder="Ask as a customer would…" busy={typing} onSend={ask} />
      </div>
    </aside>
  );
}

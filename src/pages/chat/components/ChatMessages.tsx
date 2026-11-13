import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AiBadge, StreamingCaret, TypingDots, UserMessage } from '@/components/ai';
import { IconButton, useToast } from '@/components/ui';
import type { ChatAgent } from '../data';
import { useTypewriter, type ThreadMessage } from '../hooks';
import { AgentMark } from './ChatHeader';

/** Agent reply row: 32 px agent tile, name + AI badge + time/status, body and optional footer. */
export function AgentTurn({
  agent,
  time,
  status,
  meta,
  hideHeader,
  children,
  footer,
  className,
}: {
  agent: ChatAgent;
  time?: string;
  /** Inline status after the badge (thought chip, "Writing · 4 s"…). */
  status?: ReactNode;
  /** Right side of the header (tokens · cost). */
  meta?: ReactNode;
  /** Replies grouped under a previous header (W4-07) skip the name row. */
  hideHeader?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article aria-label={`${agent.name} reply`} className={cn('flex gap-3', className)}>
      <AgentMark agent={agent} size={32} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {!hideHeader && (
          <div className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-body-m font-semibold text-fg">{agent.name}</span>
            <AiBadge />
            {time && <span className="text-body-s text-fg-3">{time}</span>}
            {status}
            {meta && <span className="ml-auto font-mono text-body-s text-fg-3">{meta}</span>}
          </div>
        )}
        <div
          className={cn('flex flex-col gap-2.5 text-body-m leading-[22px] text-fg', hideHeader && 'pt-0.5')}
        >
          {children}
        </div>
        {footer}
      </div>
    </article>
  );
}

/** Thumbs, copy and regenerate under a reply, plus optional extras after a divider. */
export function ReplyActions({
  copyText,
  onRegenerate,
  extra,
}: {
  copyText?: string;
  onRegenerate?: () => void;
  extra?: ReactNode;
}) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const toast = useToast();
  const rate = (next: 'up' | 'down') => {
    setVote((v) => (v === next ? null : next));
    if (vote !== next)
      toast({ title: 'Thanks for the feedback', description: 'It helps tune this agent’s answers.' });
  };
  return (
    <div className="mt-1 -ml-1.5 flex flex-wrap items-center gap-0.5">
      <IconButton
        icon="thumbs-up"
        label="Good answer"
        variant="ghost"
        size="xs"
        aria-pressed={vote === 'up'}
        className={cn(vote === 'up' && 'bg-brand-subtle text-brand-text')}
        onClick={() => rate('up')}
      />
      <IconButton
        icon="thumbs-down"
        label="Bad answer"
        variant="ghost"
        size="xs"
        aria-pressed={vote === 'down'}
        className={cn(vote === 'down' && 'bg-brand-subtle text-brand-text')}
        onClick={() => rate('down')}
      />
      <IconButton
        icon="copy"
        label="Copy"
        variant="ghost"
        size="xs"
        onClick={() => {
          if (copyText) void navigator.clipboard?.writeText(copyText).catch(() => undefined);
          toast({ title: 'Copied to clipboard' });
        }}
      />
      <IconButton
        icon="refresh"
        label="Regenerate"
        variant="ghost"
        size="xs"
        onClick={() =>
          onRegenerate ? onRegenerate() : toast({ title: 'Regenerating answer…', tone: 'info' })
        }
      />
      {extra && (
        <>
          <span aria-hidden className="mx-1.5 h-4 w-px bg-border" />
          {extra}
        </>
      )}
    </div>
  );
}

/** Small outlined pill used for "Sources (2)" and similar footer actions. */
export function FooterPill({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-[26px] items-center gap-1.5 rounded-full border px-2.5 text-body-s font-medium transition-colors',
        active
          ? 'border-brand-border bg-brand-subtle text-brand-text'
          : 'border-border bg-surface text-fg-2 hover:bg-subtle hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}

/** "Writing · 4 s" / "Stopped · 4 s" status after the AI badge. */
export function StreamStatus({ state, seconds }: { state: 'writing' | 'stopped'; seconds: number }) {
  return state === 'writing' ? (
    <span className="inline-flex items-center gap-1.5 text-body-s text-ai-text" role="status">
      <span aria-hidden className="size-1.5 animate-pulse-soft rounded-full bg-ai-caret" />
      Writing · {seconds} s
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-body-s text-fg-2" role="status">
      <span aria-hidden className="size-2 rounded-[2px] bg-fg-3" />
      Stopped · {seconds} s
    </span>
  );
}

/** Plain text that types itself in, with a caret while streaming. */
export function StreamedText({ text }: { text: string }) {
  const { count, done } = useTypewriter(text.length, { step: 3 });
  return (
    <p>
      {text.slice(0, count)}
      {!done && <StreamingCaret />}
    </p>
  );
}

/** Messages sent from the composer during this visit, with the agent's canned replies. */
export function ThreadMessages({
  agent,
  messages,
  thinking,
  streamingId,
}: {
  agent: ChatAgent;
  messages: ThreadMessage[];
  thinking: boolean;
  /** Id of the message currently streaming in — rendered in full with a caret, not typewritten. */
  streamingId?: number | null;
}) {
  return (
    <>
      {messages.map((m) =>
        m.role === 'user' ? (
          <UserMessage key={m.id} meta={m.time}>
            {m.text}
          </UserMessage>
        ) : (
          <AgentTurn key={m.id} agent={agent} time={m.time} footer={<ReplyActions copyText={m.text} />}>
            {m.id === streamingId ? (
              <p>
                {m.text}
                <StreamingCaret />
              </p>
            ) : (
              <StreamedText text={m.text} />
            )}
          </AgentTurn>
        ),
      )}
      {thinking && (
        <AgentTurn agent={agent}>
          <TypingDots className="self-start" />
        </AgentTurn>
      )}
    </>
  );
}

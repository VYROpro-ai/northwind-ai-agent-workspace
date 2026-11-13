import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';

/** "AI" label shown next to agent names. */
export function AiBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-[18px] items-center rounded-xs border border-ai-border bg-ai-subtle px-1.5 text-[10px] font-semibold text-ai-text',
        className,
      )}
    >
      AI
    </span>
  );
}

/** Blinking violet caret at the end of streaming text. */
export function StreamingCaret() {
  return (
    <span
      aria-hidden
      className="ml-px inline-block h-[1.1em] w-0.5 translate-y-[3px] animate-caret bg-ai-caret"
    />
  );
}

/** Three-dot typing indicator. */
export function TypingDots({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Agent is typing"
      className={cn('inline-flex items-center gap-1 rounded-full bg-ai-subtle px-3 py-2', className)}
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-pulse-soft rounded-full bg-ai"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** "Thought for 3 s" chip that toggles the reasoning block. */
export function ThoughtChip({
  seconds,
  onClick,
  open,
}: {
  seconds: number;
  onClick?: () => void;
  open?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-body-s font-medium text-ai-text hover:bg-ai-subtle"
    >
      <Icon name="reasoning" size={13} strokeWidth={2} />
      Thought for {seconds} s
      {onClick && <Icon name={open ? 'chevron-up' : 'chevron-right'} size={12} strokeWidth={2.25} />}
    </button>
  );
}

/** Numbered inline citation marker. */
export function CitationChip({
  n,
  active,
  unavailable,
  onClick,
}: {
  n: number;
  active?: boolean;
  unavailable?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Source ${n}`}
      className={cn(
        'mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-px items-center justify-center rounded-xs px-1 align-middle text-[11px] font-semibold transition-colors',
        unavailable
          ? 'bg-subtle text-fg-disabled line-through'
          : active
            ? 'bg-brand text-white'
            : 'bg-brand-subtle text-brand-text hover:bg-brand hover:text-white',
      )}
    >
      {n}
    </button>
  );
}

/** Suggestion chip under the composer. */
export function SuggestionChip({
  children,
  ai,
  onClick,
}: {
  children: ReactNode;
  ai?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-13 font-medium transition-colors',
        ai
          ? 'border-ai-border bg-ai-subtle text-ai-text hover:border-ai'
          : 'border-border bg-surface text-fg hover:bg-subtle',
      )}
    >
      {children}
    </button>
  );
}

/** Token / context meter: label, value of max, thin bar. */
export function TokenMeter({
  label,
  value,
  max,
  warn,
}: {
  label: string;
  value: number;
  max: number;
  warn?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn('flex justify-between text-body-s', warn ? 'text-warn-text' : 'text-fg-2')}>
        <span>{label}</span>
        <span className="font-mono">
          {value.toLocaleString()} / {Math.round(max / 1000)}K
        </span>
      </div>
      <div className="h-1 rounded-full bg-subtle">
        <div
          className={cn('h-full rounded-full', warn ? 'bg-warn' : 'bg-brand')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

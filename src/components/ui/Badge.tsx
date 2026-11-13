import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { Spinner } from './Spinner';

export type Tone = 'neutral' | 'brand' | 'ai' | 'ok' | 'warn' | 'danger' | 'info' | 'inverse';

const tones: Record<Tone, string> = {
  neutral: 'bg-subtle text-fg-2 border-border',
  brand: 'bg-brand-subtle text-brand-text border-brand-border',
  ai: 'bg-ai-subtle text-ai-text border-ai-border',
  ok: 'bg-ok-subtle text-ok-text border-ok-border',
  warn: 'bg-warn-subtle text-warn-text border-warn-border',
  danger: 'bg-danger-subtle text-danger-text border-danger-border',
  info: 'bg-info-subtle text-info-text border-info-border',
  inverse: 'bg-inverse text-on-inverse border-transparent',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: IconName;
  /** Small coloured dot before the label. */
  dot?: boolean;
  /** Shows a spinner — for "Running", "Indexing" etc. */
  spinning?: boolean;
  /** Draw the 1 px border. Status pills use it, compact tags don't. */
  bordered?: boolean;
  size?: 'sm' | 'md';
  children?: ReactNode;
}

/** Status pill / tag. Status always pairs an icon or dot with a word — never colour alone. */
export function Badge({
  tone = 'neutral',
  icon,
  dot,
  spinning,
  bordered = true,
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'h-5 px-1.5 text-caption' : 'h-6 px-2 text-body-s',
        'border',
        tones[tone],
        !bordered && 'border-transparent',
        className,
      )}
      {...props}
    >
      {spinning && <Spinner size={11} />}
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {icon && !spinning && <Icon name={icon} size={size === 'sm' ? 11 : 12} strokeWidth={2.25} />}
      {children}
    </span>
  );
}

/** Small numeric counter (sidebar badges, unread counts). */
export function CountBadge({ count, className }: { count: number | string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-strong px-[5px] text-[10px] leading-[18px] font-bold text-white',
        className,
      )}
    >
      {count}
    </span>
  );
}

export type RunStatus = 'queued' | 'running' | 'waiting' | 'succeeded' | 'failed' | 'cancelled';

const runStatus: Record<RunStatus, { tone: Tone; icon?: IconName; spinning?: boolean; label: string }> = {
  queued: { tone: 'info', icon: 'clock', label: 'Queued' },
  running: { tone: 'brand', spinning: true, label: 'Running' },
  waiting: { tone: 'warn', icon: 'clock', label: 'Waiting' },
  succeeded: { tone: 'ok', icon: 'check-sm', label: 'Succeeded' },
  failed: { tone: 'danger', icon: 'close', label: 'Failed' },
  cancelled: { tone: 'neutral', icon: 'reject', label: 'Cancelled' },
};

/** Pre-configured pill for run states used across Runs, Home and Analytics. */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: RunStatus;
  label?: string;
  className?: string;
}) {
  const s = runStatus[status];
  return (
    <Badge tone={s.tone} icon={s.icon} spinning={s.spinning} className={className}>
      {label ?? s.label}
    </Badge>
  );
}

import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { nodeIcons, nodeTints, type NodeState, type WorkflowNodeData } from '../data';

type BadgeKind = Exclude<NodeState, 'pending'> | 'ai' | 'del';

const badges: Record<BadgeKind, { className: string; icon: IconName }> = {
  ok: { className: 'bg-ok-subtle text-ok-text', icon: 'check-sm' },
  fail: { className: 'bg-danger-subtle text-danger-text', icon: 'close' },
  run: { className: 'bg-ai-subtle text-ai-text', icon: 'wf-running' },
  warn: { className: 'bg-warn-subtle text-warn-text', icon: 'wf-warn-mark' },
  skip: { className: 'bg-subtle text-fg-3', icon: 'minus' },
  add: { className: 'bg-ok-subtle text-ok-text', icon: 'plus' },
  chg: { className: 'bg-warn-subtle text-warn-text', icon: 'minus' },
  del: { className: 'bg-danger-subtle text-danger-text', icon: 'minus' },
  ai: { className: 'bg-ai-subtle text-ai-text', icon: 'sparkle' },
};

/** Border / fill per state — status is always paired with a badge word, never colour alone. */
const frames: Record<NodeState, string> = {
  ok: 'border border-ok-border',
  run: 'border-[1.5px] border-ai shadow-[0_0_0_4px_var(--ai-subtle)]',
  fail: 'border-[1.5px] border-danger shadow-[0_0_0_4px_var(--danger-subtle)]',
  warn: 'border-[1.5px] border-warn',
  skip: 'border border-border opacity-50',
  pending: 'border border-border opacity-50',
  add: 'border-[1.5px] border-ok bg-ok-subtle',
  chg: 'border-[1.5px] border-warn',
};

export interface WorkflowNodeProps {
  node: WorkflowNodeData;
  state?: NodeState;
  /** Short word shown in the state badge, e.g. "2.1 s" or "Failed". */
  label?: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** Comp-Workflow node · 64 px card with a tinted type chip, kind, title, subtitle and a state badge. */
export function WorkflowNode({
  node,
  state,
  label,
  selected,
  onSelect,
  className,
  style,
}: WorkflowNodeProps) {
  let frame = state ? frames[state] : 'border border-border';
  let badge: { kind: BadgeKind; text: string } | null =
    state && state !== 'pending' && label ? { kind: state, text: label } : null;
  let kindColor = 'text-fg-3';

  if (node.variant === 'ai') {
    frame = 'border-[1.5px] border-dashed border-ai bg-ai-subtle';
    kindColor = 'text-ai-text';
    badge = { kind: 'ai', text: 'AI' };
  } else if (node.variant === 'del') {
    frame = 'border-[1.5px] border-dashed border-danger bg-danger-subtle';
    kindColor = 'text-danger-text';
    badge = { kind: 'del', text: 'Removed' };
  } else if (node.variant === 'orphan') {
    frame = 'border-[1.5px] border-warn';
    badge = { kind: 'warn', text: 'Not connected' };
  }
  if (selected) frame = cn(frame, 'border-2 border-solid border-brand shadow-[0_0_0_4px_var(--focus-ring)]');

  const b = badge ? badges[badge.kind] : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={style}
      className={cn(
        'flex h-16 items-center gap-2.5 rounded-lg bg-surface px-3 text-left shadow-raised transition-[box-shadow,border-color]',
        'hover:border-border-strong focus-visible:outline-offset-4',
        frame,
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex size-[34px] shrink-0 items-center justify-center rounded-[9px]',
          nodeTints[node.type],
        )}
      >
        <Icon name={nodeIcons[node.type]} size={18} strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className={cn('text-caption font-semibold tracking-[0.02em] uppercase', kindColor)}>
          {node.kind}
        </span>
        <span
          className={cn('truncate text-13 font-semibold text-fg', node.variant === 'del' && 'line-through')}
        >
          {node.title}
        </span>
        <span className="truncate text-caption text-fg-3">{node.sub}</span>
      </span>
      {badge && b && (
        <span
          className={cn(
            'inline-flex h-[22px] shrink-0 items-center gap-1 rounded-full px-[7px] text-caption font-semibold whitespace-nowrap',
            b.className,
          )}
        >
          <Icon name={b.icon} size={11} strokeWidth={2.6} />
          {badge.text}
        </span>
      )}
    </button>
  );
}

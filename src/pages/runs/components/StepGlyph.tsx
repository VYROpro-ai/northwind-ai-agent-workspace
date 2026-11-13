import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { StepState } from '../data';

const glyphs = {
  done: { icon: 'check-sm', className: 'text-ok-text', label: 'Done' },
  waiting: { icon: 'clock', className: 'text-warn-text', label: 'Waiting' },
  pending: { icon: 'minus', className: 'text-fg-3', label: 'Not started' },
  failed: { icon: 'close', className: 'text-danger-text', label: 'Failed' },
} as const;

/** Small status mark in front of a step name; carries a text label for screen readers. */
export function StepGlyph({
  state,
  size = 13,
  pendingIcon = 'minus',
  className,
}: {
  state: StepState;
  size?: number;
  /** Not-started steps use a dash in the timeline and a clock in the trace list. */
  pendingIcon?: 'minus' | 'clock';
  className?: string;
}) {
  const g = glyphs[state];
  return (
    <Icon
      name={state === 'pending' ? pendingIcon : g.icon}
      size={size}
      strokeWidth={2.6}
      label={g.label}
      className={cn('shrink-0', g.className, className)}
    />
  );
}

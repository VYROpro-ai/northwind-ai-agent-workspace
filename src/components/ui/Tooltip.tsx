import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** CSS-only tooltip shown on hover and keyboard focus. Keep content short. */
export function Tooltip({
  content,
  side = 'top',
  children,
  className,
}: {
  content: ReactNode;
  side?: 'top' | 'bottom';
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('group/tip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-64 -translate-x-1/2 rounded-sm bg-inverse px-2 py-1 text-body-s text-on-inverse opacity-0 shadow-overlay transition-opacity delay-150',
          'group-focus-within/tip:opacity-100 group-hover/tip:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  );
}

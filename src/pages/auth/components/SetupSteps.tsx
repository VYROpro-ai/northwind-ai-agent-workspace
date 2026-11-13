import { Fragment } from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';

const steps = ['Workspace', 'Team', 'Template'];

/** Onboarding progress: Workspace → Team → Template. `current` is 1-based. */
export function SetupSteps({ current, className }: { current: 1 | 2 | 3; className?: string }) {
  return (
    <ol aria-label="Setup steps" className={cn('flex items-center gap-2 text-13', className)}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <Fragment key={label}>
            {i > 0 && (
              <li
                aria-hidden
                className={cn('h-[1.5px] w-5 shrink-0', n <= current ? 'bg-brand' : 'bg-border')}
              />
            )}
            <li
              aria-current={active ? 'step' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5',
                done && 'text-fg-2',
                active && 'font-semibold text-fg',
                !done && !active && 'text-fg-3',
              )}
            >
              {done ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-brand text-white">
                  <Icon name="check" size={11} strokeWidth={3} />
                </span>
              ) : (
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full text-caption',
                    active ? 'bg-brand text-white' : 'border-[1.5px] border-border-strong',
                  )}
                >
                  {n}
                </span>
              )}
              <span className={cn(!active && 'sr-only sm:not-sr-only')}>{label}</span>
              {done && <span className="sr-only">(done)</span>}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

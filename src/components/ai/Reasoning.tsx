import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Spinner } from '@/components/ui/Spinner';

export interface ReasoningStep {
  title: string;
  detail?: string;
  state?: 'done' | 'active' | 'pending';
}

/** Collapsible reasoning trace shown above an answer. */
export function ReasoningBlock({
  seconds,
  steps,
  defaultOpen = true,
  onViewTrace,
}: {
  seconds: number;
  steps: ReasoningStep[];
  defaultOpen?: boolean;
  onViewTrace?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-ai-border bg-ai-subtle/60 p-3.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-body-s font-medium text-ai-text"
      >
        <Icon name="reasoning" size={14} strokeWidth={2} />
        Thought for {seconds} s
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={12} strokeWidth={2.25} />
      </button>
      {open && (
        <ol className="mt-3 flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span
                className={cn(
                  'inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                  step.state === 'active'
                    ? 'border-ai bg-surface text-ai-text'
                    : step.state === 'pending'
                      ? 'border-border bg-surface text-fg-3'
                      : 'border-border bg-surface text-fg-2',
                )}
              >
                {step.state === 'active' ? <Spinner size={11} className="text-ai" /> : i + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-body-m font-medium',
                    step.state === 'pending' ? 'text-fg-3' : 'text-fg',
                  )}
                >
                  {step.title}
                </p>
                {step.detail && <p className="text-body-s text-fg-2">{step.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
      {open && onViewTrace && (
        <button
          type="button"
          onClick={onViewTrace}
          className="mt-3 text-body-s font-medium text-link underline underline-offset-2"
        >
          View full trace
        </button>
      )}
    </div>
  );
}

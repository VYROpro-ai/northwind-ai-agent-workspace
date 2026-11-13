import { useId, useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/components/icons';

export interface TraceStep {
  title: string;
  time: string;
  summary: string;
}

/**
 * Collapsible, timed reasoning trace (W4-05). Unlike the compact shared ReasoningBlock it shows
 * per-step timings, a connector line and a link to the full run trace.
 */
export function ReasoningTrace({
  seconds,
  steps,
  traceTo,
  defaultOpen = true,
}: {
  seconds: number;
  steps: TraceStep[];
  traceTo: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const listId = useId();
  return (
    <div className="rounded-[18px] border border-ai-border bg-ai-subtle/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={listId}
        className="flex w-full items-center gap-2 rounded-[18px] px-4 py-3 text-left"
      >
        <Icon name="reasoning" size={15} strokeWidth={2} className="text-ai-text" />
        <span className="text-13 font-semibold text-ai-text">Thought for {seconds} s</span>
        <span className="flex-1 text-body-s text-ai-text/80">· {steps.length} steps</span>
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          size={15}
          strokeWidth={2}
          className="text-ai-text"
        />
      </button>
      {open && (
        <div id={listId} className="px-4 pb-3.5">
          <ol className="flex flex-col">
            {steps.map((step, i) => {
              const last = i === steps.length - 1;
              return (
                <li key={step.title} className="relative flex gap-3 pb-3 last:pb-0">
                  {!last && (
                    <span aria-hidden className="absolute top-5 bottom-0 left-[9.5px] w-px bg-ai-border" />
                  )}
                  <span className="relative inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-ai-border bg-surface text-[10px] font-semibold text-ai-text">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-13 font-semibold text-fg">
                      {step.title}
                      <span className="font-mono text-caption font-normal text-fg-3">{step.time}</span>
                    </p>
                    <p className="mt-1 text-13 text-fg-2">{step.summary}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <Link
            to={traceTo}
            className="mt-2.5 ml-8 inline-flex items-center gap-1 text-body-s font-medium text-link hover:underline"
          >
            View full trace
            <Icon name="arrow-up-right" size={12} strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}

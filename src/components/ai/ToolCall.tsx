import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { Spinner } from '@/components/ui/Spinner';

export type ToolCallState =
  'running' | 'succeeded' | 'failed' | 'blocked' | 'approval' | 'timeout' | 'reconnect';

export interface ToolCallProps {
  name: ReactNode;
  /** Secondary line: result summary or input preview. */
  detail?: ReactNode;
  state: ToolCallState;
  duration?: string;
  icon?: IconName;
  /** Expandable input/output payload. */
  input?: ReactNode;
  output?: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
  className?: string;
}

const states: Record<ToolCallState, { label: string; tone: string; box?: string; icon?: IconName }> = {
  running: { label: 'Running', tone: 'text-brand-text', box: 'bg-brand-subtle/50' },
  succeeded: { label: 'Succeeded', tone: 'text-ok-text', icon: 'check-sm' },
  failed: { label: 'Failed', tone: 'text-danger-text', icon: 'close' },
  blocked: {
    label: 'Blocked',
    tone: 'text-danger-text',
    icon: 'policy-block',
    box: 'bg-danger-subtle border-danger-border',
  },
  approval: { label: 'Needs approval', tone: 'text-warn-text', icon: 'approval-wait' },
  timeout: { label: 'Timed out', tone: 'text-fg-3', icon: 'clock' },
  reconnect: { label: 'Reconnect needed', tone: 'text-warn-text', icon: 'integration' },
};

/** A single tool invocation inside an agent reply. */
export function ToolCall({
  name,
  detail,
  state,
  duration,
  icon = 'tool-call',
  input,
  output,
  defaultOpen = false,
  action,
  className,
}: ToolCallProps) {
  const [open, setOpen] = useState(defaultOpen);
  const s = states[state];
  const expandable = Boolean(input || output);
  return (
    <div className={cn('border-border', s.box, className)}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-subtle text-icon">
          <Icon name={icon} size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-13 font-semibold text-fg">{name}</p>
          {detail && (
            <div
              className={cn(
                'mt-0.5 text-body-s',
                state === 'failed' || state === 'blocked' ? 'text-danger-text' : 'text-fg-2',
              )}
            >
              {detail}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {action}
          {!(action && state === 'blocked') && (
            <span className={cn('inline-flex items-center gap-1.5 text-body-s font-medium', s.tone)}>
              {state === 'running' ? (
                <Spinner size={13} />
              ) : (
                s.icon && <Icon name={s.icon} size={13} strokeWidth={2.25} />
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </span>
          )}
          {duration && <span className="font-mono text-body-s text-fg-3">{duration}</span>}
          {expandable && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? 'Hide payload' : 'Show payload'}
              className="rounded-sm p-0.5 text-fg-3 hover:bg-subtle hover:text-fg"
            >
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
      {expandable && open && (
        <div className="mx-3 mb-3 grid grid-cols-1 overflow-hidden rounded-md border border-border bg-sunken font-mono text-body-s sm:mx-4 sm:grid-cols-2">
          <div className="p-3">
            <p className="mb-1 font-sans text-caption text-fg-3">Input</p>
            <div className="text-fg-2">{input}</div>
          </div>
          <div className="border-t border-border p-3 sm:border-t-0 sm:border-l">
            <p className="mb-1 font-sans text-caption text-fg-3">Output</p>
            <div className="text-fg-2">{output}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Collapsible group of tool calls: "Used 4 tools · 3.6 s". */
export function ToolCallGroup({
  count,
  duration,
  children,
  defaultOpen = true,
}: {
  count: number;
  duration?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 bg-sunken px-4 py-2.5 text-left"
      >
        <Icon name="tool-call" size={16} className="text-icon" />
        <span className="flex-1 text-body-m font-medium text-fg">Used {count} tools</span>
        {duration && <span className="font-mono text-body-s text-fg-3">{duration}</span>}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} strokeWidth={2} className="text-fg-3" />
      </button>
      {open && <div className="divide-y divide-border border-t border-border">{children}</div>}
    </div>
  );
}

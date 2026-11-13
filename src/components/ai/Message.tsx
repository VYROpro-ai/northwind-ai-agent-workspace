import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AgentAvatar, type AgentTone } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { AiBadge } from './AiParts';

/** Right-aligned user bubble. */
export function UserMessage({
  children,
  meta,
  className,
}: {
  children: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-end gap-1.5', className)}>
      <div className="max-w-[min(480px,90%)] rounded-2xl rounded-br-md bg-subtle px-3.5 py-2.5 text-body-m text-fg">
        {children}
      </div>
      {meta && <span className="text-body-s text-fg-3">{meta}</span>}
    </div>
  );
}

/** Agent reply with avatar, name, AI badge, optional header extras, body and footer actions. */
export function AgentMessage({
  name,
  tone = 'ai',
  time,
  headerExtra,
  meta,
  children,
  actions = true,
  className,
}: {
  name: string;
  tone?: AgentTone;
  time?: string;
  headerExtra?: ReactNode;
  /** Right side of the header: tokens / cost. */
  meta?: ReactNode;
  children: ReactNode;
  actions?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-3', className)}>
      <AgentAvatar tone={tone} size={28} />
      <div className="min-w-0 flex-1">
        <div className="flex min-h-7 flex-wrap items-center gap-2">
          <span className="text-body-m font-semibold text-fg">{name}</span>
          <AiBadge />
          {time && <span className="text-body-s text-fg-3">{time}</span>}
          {headerExtra}
          {meta && <span className="ml-auto font-mono text-body-s text-fg-3">{meta}</span>}
        </div>
        <div className="mt-1 flex flex-col gap-3 text-body-m leading-6 text-fg">{children}</div>
        {actions && (
          <div className="mt-2 -ml-1.5 flex items-center gap-0.5">
            <IconButton icon="thumbs-up" label="Good answer" variant="ghost" size="xs" />
            <IconButton icon="thumbs-down" label="Bad answer" variant="ghost" size="xs" />
            <IconButton icon="copy" label="Copy" variant="ghost" size="xs" />
            <IconButton icon="refresh" label="Regenerate" variant="ghost" size="xs" />
            <IconButton icon="share" label="Share" variant="ghost" size="xs" />
          </div>
        )}
      </div>
    </div>
  );
}

/** Centred system note: "Priya switched this chat to Model B · 9:16 AM". */
export function SystemMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-body-s text-fg-3" role="note">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

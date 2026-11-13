import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { AgentAvatar } from '@/components/ui';
import { CitationChip } from '@/components/ai';
import type { ChatTurn } from '../data';

/**
 * Compact agent reply for the test chats: avatar + body, no name row (the designs drop it because the
 * whole panel is the agent). `panel` = 26 px robot tile in the side panel, `full` = 30 px "SA" tile.
 */
export function TestAgentMessage({
  variant = 'full',
  children,
  className,
}: {
  variant?: 'panel' | 'full';
  children: ReactNode;
  className?: string;
}) {
  const panel = variant === 'panel';
  return (
    <div className={cn('flex', panel ? 'gap-2.5' : 'gap-3', className)}>
      {panel ? (
        <AgentAvatar tone="ai" size={26} className="rounded-[7px]" />
      ) : (
        <span
          aria-hidden
          className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-brand text-body-s font-semibold text-white"
        >
          SA
        </span>
      )}
      <div className={cn('flex min-w-0 flex-1 flex-col text-fg', panel ? 'gap-2' : 'gap-2.5')}>
        <span className="sr-only">Support Agent (AI) said:</span>
        {children}
      </div>
    </div>
  );
}

/** Customer bubble for the test chats (`panel` = 13 px side-panel bubble, `full` = brand bubble). */
export function TestUserMessage({
  variant = 'full',
  children,
}: {
  variant?: 'panel' | 'full';
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        'self-end rounded-[14px] rounded-br-xs',
        variant === 'panel'
          ? 'max-w-[92%] bg-subtle px-3 py-[9px] text-13 leading-[19px] text-fg'
          : 'max-w-[85%] bg-brand px-3.5 py-2.5 text-body-m leading-[21px] text-white sm:max-w-[70%]',
      )}
    >
      {children}
    </p>
  );
}

/** Superscript source marker used in the full-width test chat. */
export function CiteMark({ n }: { n: number }) {
  return (
    <sup className="font-semibold text-link">
      <span className="sr-only">source </span>
      {n}
    </sup>
  );
}

/** One turn of a test conversation. */
export function ChatTurnView({ turn, compact }: { turn: ChatTurn; compact?: boolean }) {
  const variant = compact ? 'panel' : 'full';
  if (turn.from === 'user') {
    return <TestUserMessage variant={variant}>{turn.text}</TestUserMessage>;
  }
  return (
    <TestAgentMessage variant={variant}>
      {turn.tool && (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 self-start rounded-sm text-fg-2',
            compact
              ? 'h-6 border border-border px-2 text-caption'
              : 'h-[26px] bg-subtle px-2.5 font-mono text-body-s',
          )}
        >
          <Icon name="check-sm" size={compact ? 11 : 12} strokeWidth={2.75} className="text-ok-text" />
          {turn.tool}
        </span>
      )}
      <p className={compact ? 'text-13 leading-5' : 'text-body-m leading-[22px]'}>
        {turn.text}
        {turn.cite &&
          (compact ? (
            <>
              {' '}
              <CitationChip n={1} />
            </>
          ) : (
            <CiteMark n={1} />
          ))}
        {turn.after}
      </p>
      {turn.meta && <p className="font-mono text-caption text-fg-3">{turn.meta}</p>}
    </TestAgentMessage>
  );
}

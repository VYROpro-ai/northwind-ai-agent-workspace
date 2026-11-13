import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import type { AgentRef, AgentTone } from '../data';

const strokeTone: Record<AgentTone, string> = {
  ai: 'text-ai',
  ok: 'text-ok',
  brand: 'text-brand',
  warn: 'text-warn',
  info: 'text-info',
};

const solidTone: Record<AgentTone, string> = {
  ai: 'bg-ai',
  ok: 'bg-ok',
  brand: 'bg-brand',
  warn: 'bg-warn',
  info: 'bg-info',
};

/**
 * Agent glyph used in the dashboard tables.
 * `tile` = 34 px sunken rounded square with a coloured stroke; `dot` = 26 px solid circle with a white glyph.
 */
export function AgentGlyph({ agent, variant = 'tile' }: { agent: AgentRef; variant?: 'tile' | 'dot' }) {
  if (variant === 'dot') {
    return (
      <span
        className={cn(
          'inline-flex size-[26px] shrink-0 items-center justify-center rounded-full text-white',
          solidTone[agent.tone],
        )}
      >
        <Icon name={agent.icon} size={13} strokeWidth={2} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex size-[34px] shrink-0 items-center justify-center rounded-[10px] border border-border bg-sunken',
        strokeTone[agent.tone],
      )}
    >
      <Icon name={agent.icon} size={16} strokeWidth={2} />
    </span>
  );
}

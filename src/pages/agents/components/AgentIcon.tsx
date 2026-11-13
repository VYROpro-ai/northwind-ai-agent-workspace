import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import type { AgentTone } from '@/components/ui';

const tones: Record<AgentTone, string> = {
  ai: 'bg-ai-subtle text-ai-text',
  brand: 'bg-brand-subtle text-brand-text',
  ok: 'bg-ok-subtle text-ok-text',
  warn: 'bg-warn-subtle text-warn-text',
  info: 'bg-info-subtle text-info-text',
  danger: 'bg-danger-subtle text-danger-text',
};

/** Tinted tile with a stroke icon — agent avatars, template marks and avatar pickers. */
export function AgentIcon({
  icon,
  tone = 'ai',
  size = 40,
  shape = 'square',
  className,
}: {
  icon: IconName;
  tone?: AgentTone;
  size?: number;
  shape?: 'square' | 'circle';
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        shape === 'circle' ? 'rounded-full' : 'rounded-[11px]',
        tones[tone],
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name={icon} size={Math.round(size * 0.45)} strokeWidth={2} />
    </span>
  );
}

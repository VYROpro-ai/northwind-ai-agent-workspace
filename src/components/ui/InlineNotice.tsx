import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';

export type NoticeTone = 'info' | 'warn' | 'danger' | 'ai' | 'ok';

const tones: Record<NoticeTone, { box: string; icon: IconName }> = {
  info: { box: 'bg-info-subtle text-info-text', icon: 'info' },
  warn: { box: 'bg-warn-subtle text-warn-text', icon: 'alert-triangle' },
  danger: { box: 'bg-danger-subtle text-danger-text', icon: 'alert-triangle' },
  ai: { box: 'bg-ai-subtle text-ai-text', icon: 'ai-generate' },
  ok: { box: 'bg-ok-subtle text-ok-text', icon: 'check-circle' },
};

/**
 * Borderless tinted notice used across Knowledge and Integrations: coloured message,
 * optional bold lead-in and right-aligned actions. Wraps under the text on small screens.
 */
export function InlineNotice({
  tone = 'info',
  icon,
  title,
  children,
  actions,
  className,
}: {
  tone?: NoticeTone;
  icon?: IconName;
  /** Bold lead-in sentence. */
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-[10px] px-3.5 py-2.5 text-13',
        t.box,
        className,
      )}
    >
      <Icon name={icon ?? t.icon} size={16} strokeWidth={2} className="shrink-0" />
      <p className="min-w-0 flex-1 basis-60">
        {title && <b className="font-semibold">{title}</b>} {children}
      </p>
      {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}

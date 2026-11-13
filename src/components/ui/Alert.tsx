import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { IconButton } from './IconButton';

type AlertTone = 'info' | 'ok' | 'warn' | 'danger' | 'ai' | 'neutral';

const tones: Record<AlertTone, { box: string; title: string; icon: IconName }> = {
  info: { box: 'bg-info-subtle border-info-border', title: 'text-info-text', icon: 'info' },
  ok: { box: 'bg-ok-subtle border-ok-border', title: 'text-ok-text', icon: 'check-circle' },
  warn: { box: 'bg-warn-subtle border-warn-border', title: 'text-warn-text', icon: 'alert-circle' },
  danger: { box: 'bg-danger-subtle border-danger-border', title: 'text-danger-text', icon: 'alert-circle' },
  ai: { box: 'bg-ai-subtle border-ai-border', title: 'text-ai-text', icon: 'question' },
  neutral: { box: 'bg-sunken border-border', title: 'text-fg', icon: 'info' },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/** Inline alert — sits inside content, always pairs an icon with words. */
export function Alert({ tone = 'info', title, children, icon, action, onDismiss, className }: AlertProps) {
  const t = tones[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border p-3.5', t.box, className)}
    >
      <Icon name={icon ?? t.icon} size={18} className={cn('mt-px shrink-0', t.title)} />
      <div className="min-w-0 flex-1 text-body-m">
        {title && <p className={cn('font-medium', t.title)}>{title}</p>}
        {children && <div className="text-fg-2">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
      {onDismiss && <IconButton icon="close" label="Dismiss" variant="ghost" size="xs" onClick={onDismiss} />}
    </div>
  );
}

/** Full-width banner for global states (credits, maintenance, offline). */
export function Banner({
  tone = 'info',
  children,
  action,
  onDismiss,
  className,
}: Omit<AlertProps, 'title' | 'tone'> & { tone?: AlertTone | 'inverse' }) {
  const isInverse = tone === 'inverse';
  const t = isInverse ? null : tones[tone];
  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5 text-body-m',
        isInverse ? 'border-transparent bg-inverse text-on-inverse' : t!.box,
        className,
      )}
    >
      <Icon
        name={isInverse ? 'wifi-off' : t!.icon}
        size={16}
        className={cn('shrink-0', !isInverse && t!.title)}
      />
      <div className="min-w-0 flex-1 text-fg">{children}</div>
      {action}
      {onDismiss && <IconButton icon="close" label="Dismiss" variant="ghost" size="xs" onClick={onDismiss} />}
    </div>
  );
}

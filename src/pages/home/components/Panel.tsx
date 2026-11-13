import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { Card, type CardProps } from '@/components/ui';

/** Dashboard panel — the 20 px-radius raised card used across the Home screens. */
export function Panel({ className, ...props }: CardProps) {
  return <Card elevation="raised" padding="none" className={cn('min-w-0', className)} {...props} />;
}

/** Panel title row: outlined icon chip, 18 px title and right-aligned actions. */
export function PanelHeader({
  icon,
  title,
  aside,
  actions,
  className,
  titleId,
}: {
  icon: IconName;
  title: ReactNode;
  /** Small muted text placed before the actions (e.g. "Resets Nov 12"). */
  aside?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleId?: string;
}) {
  return (
    <div className={cn('relative flex flex-wrap items-center gap-3', className)}>
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-fg">
        <Icon name={icon} size={18} strokeWidth={1.8} />
      </span>
      <h2
        id={titleId}
        className="min-w-0 flex-1 truncate text-[18px] leading-6 font-semibold tracking-[-0.015em]"
      >
        {title}
      </h2>
      {aside}
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card padding. `none` lets tables run edge to edge. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** raised = soft shadow (stat cards, composer), flat = border only. */
  elevation?: 'flat' | 'raised';
  radius?: 'lg' | 'xl' | '2xl';
}

const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
const radii = { lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl' };

export function Card({ padding = 'md', elevation = 'flat', radius = '2xl', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'border border-border bg-surface',
        radii[radius],
        paddings[padding],
        elevation === 'raised' && 'shadow-raised',
        className,
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Leading icon shown in a round outlined chip, as in the dashboard cards. */
  icon?: IconName;
  actions?: ReactNode;
  className?: string;
  as?: 'h2' | 'h3';
}

export function CardHeader({
  title,
  description,
  icon,
  actions,
  className,
  as: Heading = 'h2',
}: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {icon && (
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-fg">
          <Icon name={icon} size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <Heading className="truncate text-h4 font-semibold text-fg">{title}</Heading>
        {description && <p className="mt-0.5 text-body-s text-fg-3">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

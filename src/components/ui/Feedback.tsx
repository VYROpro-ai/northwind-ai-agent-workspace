import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';

export function Progress({
  value,
  tone = 'brand',
  size = 'md',
  className,
  label,
}: {
  /** 0–100 */
  value: number;
  tone?: 'brand' | 'ok' | 'warn' | 'danger' | 'ai' | 'inverse';
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}) {
  const fill = {
    brand: 'bg-brand',
    ok: 'bg-ok',
    warn: 'bg-warn',
    danger: 'bg-danger',
    ai: 'bg-ai',
    inverse: 'bg-inverse',
  }[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'w-full overflow-hidden rounded-full bg-subtle',
        size === 'sm' ? 'h-1' : 'h-1.5',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', fill)}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-md bg-[linear-gradient(90deg,var(--subtle)_25%,var(--sunken)_50%,var(--subtle)_75%)] bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}: {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-fg shadow-raised">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="text-h4 font-semibold text-fg">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-body-m text-fg-2">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function Divider({ label, className }: { label?: ReactNode; className?: string }) {
  if (!label) return <hr className={cn('border-border', className)} />;
  return (
    <div className={cn('flex items-center gap-3', className)} role="separator">
      <span className="h-px flex-1 bg-border" />
      <span className="text-body-s text-fg-3">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Page title block with optional description and right-aligned actions. Wraps on small screens. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-h2 font-semibold text-fg">{title}</h1>
        {description && <p className="mt-1 text-body-m text-fg-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { SettingsNav } from '@/components/app/SettingsNav';
import { Card } from '@/components/ui';

/** Account settings frame: shell, two-level settings nav, page title and right-aligned actions. */
export function AccountLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShell
      active="Settings"
      role="owner"
      crumbs={[{ label: 'Settings', to: '/settings/general' }, { label: title }]}
      mainClassName="lg:px-8 lg:pb-8"
    >
      <SettingsNav className="mb-1" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-[22px] leading-[30px] font-semibold tracking-[-0.015em]">{title}</h1>
          <p className="text-body-m text-fg-2">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </div>
      {children}
    </AppShell>
  );
}

/** Settings card with an optional header (title, description, trailing control). */
export function SettingsSection({
  title,
  description,
  aside,
  tone = 'default',
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Card
      padding="none"
      radius="xl"
      className={cn('flex min-w-0 flex-col', tone === 'danger' && 'border-danger-border', className)}
    >
      {title && (
        <div className="flex items-start gap-3 px-4 py-4 sm:px-[18px]">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2
              className={cn(
                'text-[15px] leading-[22px] font-semibold',
                tone === 'danger' ? 'text-danger-text' : 'text-fg',
              )}
            >
              {title}
            </h2>
            {description && <p className="text-13 leading-[19px] text-fg-2">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </Card>
  );
}

/** Label + hint on the left, control on the right. Stacks on narrow screens. */
export function SettingsRow({
  label,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3 sm:flex-nowrap sm:px-[18px]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 basis-48 flex-col gap-0.5">
        <span className="text-13 font-medium text-fg">{label}</span>
        {hint && <span className="text-body-s leading-[17px] text-fg-3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

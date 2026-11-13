import type { ReactNode } from 'react';
import { AppShell } from '@/layouts/AppShell';
import { SettingsNav } from '@/components/app/SettingsNav';
import { cn } from '@/lib/cn';

/** Settings shell for the Billing pages: settings navigation, page title and actions. */
export function BillingLayout({
  crumb,
  title,
  description,
  actions,
  children,
}: {
  crumb: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShell active="Settings" crumbs={[{ label: 'Settings', to: '/settings/general' }, { label: crumb }]}>
      <div className="flex flex-col gap-5">
        <SettingsNav />
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h1 className="text-[22px] leading-[30px] font-semibold tracking-[-0.015em] text-fg">
                {title}
              </h1>
              <p className="text-body-m text-fg-2">{description}</p>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </AppShell>
  );
}

/** Rounded content card used across the billing pages (radius 18, 1 px border). */
export function BillingCard({
  className,
  children,
  as: Tag = 'section',
}: {
  className?: string;
  children: ReactNode;
  as?: 'section' | 'div';
}) {
  return (
    <Tag className={cn('min-w-0 rounded-2xl border border-border bg-surface', className)}>{children}</Tag>
  );
}

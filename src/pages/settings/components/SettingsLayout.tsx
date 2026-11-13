import type { ReactNode } from 'react';
import { AppShell } from '@/layouts/AppShell';
import { SettingsNav } from '@/components/app/SettingsNav';
import { cn } from '@/lib/cn';
import type { Role } from '@/data/people';

/** Workspace settings shell: AppShell (Settings active) + settings nav + page title row. */
export function SettingsLayout({
  crumb,
  role = 'admin',
  title,
  description,
  actions,
  children,
}: {
  crumb: string;
  role?: Role;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShell
      active="Settings"
      role={role}
      crumbs={[{ label: 'Settings', to: '/settings/general' }, { label: crumb }]}
    >
      <div className="flex flex-col gap-5">
        <SettingsNav />
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex min-w-0 flex-1 basis-72 flex-col gap-1">
              <h1 className="text-[22px] leading-[30px] font-semibold tracking-[-0.015em] text-fg">
                {title}
              </h1>
              <p className="text-body-m text-fg-2">{description}</p>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </AppShell>
  );
}

/** Settings card: radius 18, 1 px border. `danger` swaps the border for the danger zone. */
export function SettingsCard({
  danger,
  className,
  children,
  as: Tag = 'section',
  ...rest
}: {
  danger?: boolean;
  className?: string;
  children: ReactNode;
  as?: 'section' | 'div';
  'aria-labelledby'?: string;
}) {
  return (
    <Tag
      className={cn(
        'flex min-w-0 flex-col rounded-[18px] border bg-surface',
        danger ? 'border-danger-border' : 'border-border',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Card header: 15 px title, optional description and right-side content. */
export function SettingsCardHeader({
  title,
  description,
  aside,
  danger,
  id,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  danger?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-start gap-3 px-[18px] py-4', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2
          id={id}
          className={cn('text-[15px] leading-[22px] font-semibold', danger ? 'text-danger-text' : 'text-fg')}
        >
          {title}
        </h2>
        {description && <p className="text-13 leading-[19px] text-fg-2">{description}</p>}
      </div>
      {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
    </div>
  );
}

/** One setting line inside a card: label + description on the left, control on the right. */
export function SettingsRow({
  label,
  description,
  children,
  className,
  htmlFor,
}: {
  label: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  const Label = htmlFor ? 'label' : 'span';
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2.5 border-t border-border px-[18px] py-3 sm:flex-nowrap',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
        <Label htmlFor={htmlFor} className="text-13 font-medium text-fg">
          {label}
        </Label>
        {description && <span className="text-body-s text-fg-3">{description}</span>}
      </div>
      {children}
    </div>
  );
}

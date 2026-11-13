import { NavLink, useLocation } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { settingsGroups, type SettingsLink } from '@/data/navigation';

/** Two-level settings navigation: group switch (Workspace / Billing / Account) + section links. */
export function SettingsNav({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const isCurrent = (l: SettingsLink) => [l.to, ...(l.match ?? [])].some((path) => pathname.startsWith(path));
  const group = settingsGroups.find((g) => g.links.some(isCurrent)) ?? settingsGroups[0];
  return (
    <nav
      aria-label="Settings"
      className={cn(
        'flex max-w-full flex-col gap-1.5 rounded-3xl border border-border bg-surface p-[5px] shadow-[0_1px_2px_rgb(13_16_24/0.04)] sm:flex-row sm:items-center sm:gap-2.5 sm:rounded-full',
        className,
      )}
    >
      <div className="scrollbar-none flex shrink-0 gap-0.5 overflow-x-auto rounded-full bg-sunken p-[3px]">
        {settingsGroups.map((g) => {
          const on = g.key === group.key;
          return (
            <NavLink
              key={g.key}
              to={g.links[0].to}
              className={cn(
                'inline-flex h-[34px] items-center gap-[7px] rounded-full px-3.5 text-13 font-medium whitespace-nowrap transition-colors',
                on ? 'bg-inverse text-on-inverse shadow-inverse' : 'text-fg-2 hover:text-fg',
              )}
            >
              <Icon name={g.icon} size={14} strokeWidth={2} className={on ? undefined : 'text-fg-3'} />
              {g.label}
            </NavLink>
          );
        })}
      </div>
      <span className="hidden h-[22px] w-px shrink-0 bg-border sm:block" />
      <div className="scrollbar-none flex min-w-0 gap-0.5 overflow-x-auto">
        {group.links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            aria-current={isCurrent(l) ? 'page' : undefined}
            className={cn(
              'inline-flex h-[34px] items-center rounded-full px-3.5 text-13 whitespace-nowrap transition-colors',
              isCurrent(l) ? 'bg-subtle font-semibold text-fg' : 'text-fg-2 hover:text-fg',
            )}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import { Dropdown } from '@/components/ui/Menu';
import { IconButton } from '@/components/ui/IconButton';
import type { Role } from '@/data/people';
import { ThemeSwitch } from './ThemeSwitch';

export interface Crumb {
  label: string;
  to?: string;
}

export interface TopbarProps {
  /** Breadcrumb trail; the last item is the current page. */
  crumbs: Crumb[];
  role?: Role;
  onMenu?: () => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  notificationsOpen?: boolean;
  /** Extra content placed before the search field. */
  extra?: ReactNode;
}

export function Topbar({
  crumbs,
  role = 'owner',
  onMenu,
  onSearch,
  onNotifications,
  notificationsOpen,
  extra,
}: TopbarProps) {
  const navigate = useNavigate();
  const current = crumbs[crumbs.length - 1];
  const showCredits = role === 'owner' || role === 'admin';
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2.5 border-b border-border bg-surface/90 pr-3 pl-3 backdrop-blur sm:pr-5 sm:pl-6">
      <IconButton
        icon="menu"
        label="Open navigation"
        variant="ghost"
        className="lg:hidden"
        onClick={onMenu}
      />
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-body-m">
        {crumbs.slice(0, -1).map((c) => (
          <span key={c.label} className="hidden min-w-0 items-center gap-1.5 sm:flex">
            {c.to ? (
              <Link to={c.to} className="truncate whitespace-nowrap text-fg-3 hover:text-fg">
                {c.label}
              </Link>
            ) : (
              <span className="whitespace-nowrap text-fg-3">{c.label}</span>
            )}
            <Icon name="chevron-right" size={14} strokeWidth={2} className="shrink-0 text-fg-3" />
          </span>
        ))}
        <span aria-current="page" className="truncate font-semibold text-fg">
          {current?.label}
        </span>
      </nav>
      {extra}
      <button
        type="button"
        onClick={onSearch}
        className="hidden h-[38px] w-[280px] items-center gap-2 rounded-full border border-border bg-sunken pr-1.5 pl-3.5 text-left text-13 text-fg-3 transition-colors hover:border-border-strong md:flex"
      >
        <Icon name="search" size={16} strokeWidth={2} className="text-fg" />
        <span className="flex-1">Search or jump to…</span>
        <kbd className="h-6 rounded-full border border-border bg-surface px-2 font-sans text-caption leading-[22px] font-medium text-fg-2">
          ⌘K
        </kbd>
      </button>
      <IconButton icon="search" label="Search" className="md:hidden" onClick={onSearch} />
      {showCredits && (
        <Link
          to="/settings/billing"
          className="hidden h-[38px] items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-body-s font-medium whitespace-nowrap text-fg hover:bg-subtle xl:inline-flex"
        >
          <span className="size-2 rounded-full bg-accent" />
          $188 credits left
        </Link>
      )}
      <ThemeSwitch className="hidden sm:flex" />
      <IconButton
        icon="bell"
        label="Notifications, 3 unread"
        dot
        onClick={onNotifications}
        aria-expanded={notificationsOpen}
        className={notificationsOpen ? 'bg-subtle' : undefined}
      />
      {role !== 'viewer' && (
        <Dropdown
          align="end"
          width={220}
          items={[
            {
              label: 'Agent',
              icon: 'nav-agents',
              shortcut: 'A',
              onSelect: () => navigate('/agents/new/basics'),
            },
            {
              label: 'Workflow',
              icon: 'workflow',
              shortcut: 'W',
              onSelect: () => navigate('/workflows/editor'),
            },
            { label: 'Chat', icon: 'chat', shortcut: 'C', onSelect: () => navigate('/chat') },
          ]}
          trigger={(props) => (
            <button
              type="button"
              {...props}
              className="hidden h-[38px] items-center gap-1.5 rounded-full bg-inverse pr-4 pl-3 text-13 font-medium text-on-inverse shadow-inverse sm:inline-flex"
            >
              <Icon name="plus" size={15} strokeWidth={2.25} />
              New
              <Icon name="chevron-down" size={12} strokeWidth={2.25} className="ml-0.5 opacity-70" />
            </button>
          )}
        />
      )}
    </header>
  );
}

import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { CountBadge } from '@/components/ui/Badge';
import { WorkspaceLogo } from '@/components/brand/Logo';
import { mainNav, navByRole, secondaryNav, type NavItem, type NavKey } from '@/data/navigation';
import { userForRole, type Role } from '@/data/people';

export interface SidebarProps {
  active: NavKey;
  role?: Role;
  onNavigate?: () => void;
  className?: string;
}

function NavRow({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-[38px] shrink-0 items-center gap-3 rounded-full px-3.5 text-body-m transition-colors',
        active ? 'bg-inverse font-medium text-on-inverse shadow-inverse' : 'text-fg hover:bg-subtle',
      )}
    >
      <Icon name={item.icon} size={18} strokeWidth={1.8} className={active ? undefined : 'text-fg-2'} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && !active ? <CountBadge count={item.badge} /> : null}
    </NavLink>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center justify-between px-1.5 pb-1.5">
      <span className="text-caption font-semibold tracking-[0.12em] text-fg-3 uppercase">{children}</span>
      <Icon name="chevron-up" size={12} strokeWidth={2.2} className="text-fg-3" />
    </div>
  );
}

/** Main app navigation (260 px). Filters sections by role, like the kit. */
export function Sidebar({ active, role = 'owner', onNavigate, className }: SidebarProps) {
  const allowed = navByRole[role];
  const others = secondaryNav.filter((n) => n.key !== 'Team' || role === 'owner' || role === 'admin');
  const user = userForRole[role];
  return (
    <nav
      aria-label="Main"
      className={cn('flex h-full w-[260px] flex-col border-r border-border bg-surface', className)}
    >
      <button
        type="button"
        className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border pr-4 pl-[18px] text-left"
      >
        <span className="flex min-w-0 flex-1 items-center">
          <WorkspaceLogo />
        </span>
        <span className="h-[18px] rounded-sm bg-ok-subtle px-1.5 text-[10px] leading-[18px] font-semibold text-ok-text">
          Business
        </span>
        <Icon name="chevrons-up-down" size={14} strokeWidth={2} className="text-fg-3" />
        <span className="sr-only">Switch workspace</span>
      </button>

      <div className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-1 overflow-y-auto px-4 pt-4 pb-3">
        <SectionLabel>Menu</SectionLabel>
        {mainNav
          .filter((n) => allowed.includes(n.key))
          .map((item) => (
            <NavRow key={item.key} item={item} active={item.key === active} onNavigate={onNavigate} />
          ))}
        <div className="mt-3 border-t border-border pt-3.5">
          <SectionLabel>Others</SectionLabel>
        </div>
        {others.map((item) => (
          <NavRow key={item.key} item={item} active={item.key === active} onNavigate={onNavigate} />
        ))}
        <NavLink
          to="/sign-in"
          className="flex h-[38px] shrink-0 items-center gap-3 rounded-full px-3.5 text-body-m text-fg hover:bg-subtle"
        >
          <Icon name="logout" size={18} strokeWidth={1.8} className="text-fg-2" />
          Log out
        </NavLink>
      </div>

      <NavLink
        to="/settings/profile"
        onClick={onNavigate}
        className="mx-4 flex h-16 shrink-0 items-center gap-2.5 border-t border-border px-1 text-left"
      >
        <Avatar name={user.name} src={user.avatar} size="lg" className="[&_img]:size-9" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-m font-semibold text-fg">{user.name}</span>
          <span className="truncate text-body-s text-fg-3">{user.email}</span>
        </span>
        <Icon name="more" size={18} className="text-fg" />
      </NavLink>
    </nav>
  );
}

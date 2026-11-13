import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useDocumentTitle } from '@/lib/hooks';
import { Drawer } from '@/components/ui/Overlay';
import { Sidebar } from '@/components/app/Sidebar';
import { Topbar, type Crumb } from '@/components/app/Topbar';
import { CommandPalette } from '@/components/app/CommandPalette';
import { NotificationsPanel } from '@/components/app/NotificationsPanel';
import { ShellContext } from '@/components/app/ShellContext';
import type { NavKey } from '@/data/navigation';
import type { Role } from '@/data/people';

export interface AppShellProps {
  /** Highlighted sidebar item. */
  active: NavKey;
  /** Breadcrumb trail; last item = current page (also used for the document title). */
  crumbs: Crumb[];
  /** Signed-in role — controls which nav items and header actions show. */
  role?: Role;
  children: ReactNode;
  /** Remove default page padding (for full-bleed layouts). */
  bare?: boolean;
  /** Use the soft gradient wash instead of the flat canvas (dashboards). */
  wash?: boolean;
  /** Open the command palette / notifications on mount (used by the W12-04 and W2-04 state routes). */
  initialOverlay?: 'command' | 'notifications';
  mainClassName?: string;
  /** Extra content in the top bar; defaults to a "Demo data" pill in demo mode. */
  extra?: ReactNode;
}

/**
 * Standard authenticated layout: 260 px sidebar + 56 px top bar + scrolling main.
 * Below 1024 px the sidebar becomes an off-canvas drawer.
 */
export function AppShell({
  active,
  crumbs,
  role = 'owner',
  children,
  bare,
  wash,
  initialOverlay,
  mainClassName,
  extra,
}: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(initialOverlay === 'command');
  const [notificationsOpen, setNotificationsOpen] = useState(initialOverlay === 'notifications');
  useDocumentTitle(crumbs[crumbs.length - 1]?.label ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const shell = useMemo(
    () => ({
      openCommandPalette: () => setPaletteOpen(true),
      openNotifications: () => setNotificationsOpen(true),
    }),
    [],
  );

  return (
    <ShellContext.Provider value={shell}>
      <div className={cn('flex min-h-dvh text-fg', wash ? 'bg-wash-page' : 'bg-canvas')}>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
          <Sidebar active={active} role={role} />
        </div>
        <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" width={260} label="Navigation">
          <Sidebar active={active} role={role} onNavigate={() => setNavOpen(false)} className="border-r-0" />
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            crumbs={crumbs}
            role={role}
            extra={
              extra ??
              (!isSupabaseConfigured ? (
                <span className="hidden shrink-0 items-center rounded-full border border-border bg-subtle px-2.5 py-1 text-body-s font-medium text-fg-2 sm:inline-flex">
                  Demo data
                </span>
              ) : undefined)
            }
            onMenu={() => setNavOpen(true)}
            onSearch={() => setPaletteOpen(true)}
            onNotifications={() => setNotificationsOpen(true)}
            notificationsOpen={notificationsOpen}
          />
          <main
            id="main"
            className={cn(
              'flex min-w-0 flex-1 flex-col',
              !bare && 'gap-4 px-4 pt-6 pb-8 sm:px-6 lg:px-8',
              mainClassName,
            )}
          >
            {children}
          </main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </ShellContext.Provider>
  );
}

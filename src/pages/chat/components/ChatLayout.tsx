import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/lib/hooks';
import { useTheme } from '@/lib/theme';
import { Icon } from '@/components/icons';
import { WorkspaceMonogram } from '@/components/brand/Logo';
import { Avatar, Drawer, IconButton } from '@/components/ui';
import { mainNav, navByRole } from '@/data/navigation';
import { userForRole } from '@/data/people';
import { chatHistory, extraChats, historyAvatarTone, type HistoryGroup } from '../data';
import { useIsWide } from '../hooks';

export type ChatRole = 'member' | 'builder';

/** 64 px icon rail: workspace monogram, role-filtered sections, theme toggle and the signed-in user. */
export function ChatRail({
  role,
  className,
  onNavigate,
}: {
  role: ChatRole;
  className?: string;
  onNavigate?: () => void;
}) {
  const { theme, toggle } = useTheme();
  const items = mainNav.filter((item) => navByRole[role].includes(item.key));
  const me = userForRole[role];
  return (
    <nav
      aria-label="Main"
      className={cn(
        'w-16 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface py-3',
        className,
      )}
    >
      <Link to="/" onClick={onNavigate} className="mt-1 mb-4 rounded-full">
        <WorkspaceMonogram size={34} />
      </Link>
      <ul className="flex flex-col items-center gap-1">
        {items.map((item) => {
          const active = item.key === 'Chat';
          return (
            <li key={item.key}>
              <Link
                to={item.to}
                onClick={onNavigate}
                aria-label={item.label}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full transition-colors',
                  active ? 'bg-inverse text-on-inverse' : 'text-fg-2 hover:bg-subtle hover:text-fg',
                )}
              >
                <Icon name={item.icon} size={20} />
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex-1" />
      <IconButton
        icon={theme === 'dark' ? 'moon' : 'sun'}
        label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        variant="ghost"
        onClick={toggle}
        className="size-10 text-fg-2"
      />
      <Link
        to="/settings/profile"
        onClick={onNavigate}
        className="mt-2 rounded-full"
        aria-label={`${me.name} · profile`}
      >
        <Avatar name={me.name} src={me.avatar} size="md" />
      </Link>
    </nav>
  );
}

/** Groups with the open chat inserted at the top of "Today" when it isn't already listed. */
function historyFor(active: string): HistoryGroup[] {
  const listed = chatHistory.some((g) => g.items.some((i) => i.title === active));
  const extra = extraChats.find((c) => c.title === active);
  if (listed || !extra) return chatHistory;
  return chatHistory.map((g) => (g.label === 'Today' ? { ...g, items: [extra, ...g.items] } : g));
}

/** 272 px "Chats" panel: New chat, search and grouped history. */
export function ChatHistory({
  active,
  className,
  onNavigate,
}: {
  /** Title of the open chat; empty string on a new chat. */
  active: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState('');
  const searchId = useId();
  const isNew = active === '';
  const q = query.trim().toLowerCase();
  const groups = historyFor(active)
    .map((g) => ({ ...g, items: g.items.filter((i) => i.title.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      aria-label="Chat history"
      className={cn('w-[272px] shrink-0 flex-col border-r border-border bg-surface', className)}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border pr-3 pl-4">
        <h2 className="text-h4 font-semibold text-fg">Chats</h2>
        <Link
          to="/chat"
          onClick={onNavigate}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-13 font-medium transition-colors',
            isNew
              ? 'border-brand-border bg-brand-subtle text-brand-text'
              : 'border-border-strong bg-surface text-fg hover:bg-subtle',
          )}
        >
          <Icon name="plus" size={14} strokeWidth={2} />
          New chat
        </Link>
      </div>
      <div className="p-3">
        <label htmlFor={searchId} className="sr-only">
          Search chats
        </label>
        <div className="flex h-[38px] items-center gap-2 rounded-full border border-border bg-sunken px-3 focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]">
          <Icon name="search" size={14} strokeWidth={2} className="shrink-0 text-icon" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="min-w-0 flex-1 bg-transparent text-13 text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-0.5 overflow-y-auto px-2 pb-4">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label} className="flex flex-col gap-0.5">
            <h3 className="px-2 pt-3.5 pb-1.5 text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">
              {group.label}
            </h3>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const on = item.title === active;
                return (
                  <li key={item.title}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'flex h-9 items-center gap-2 rounded-full px-2.5 transition-colors',
                        on ? 'bg-subtle font-semibold text-fg' : 'text-fg-2 hover:bg-subtle hover:text-fg',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] text-[10px] font-semibold',
                          historyAvatarTone[item.avatar],
                        )}
                      >
                        {item.avatar}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-13">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="px-2 py-6 text-center text-13 text-fg-3">No chats match “{query}”.</p>
        )}
      </div>
    </aside>
  );
}

export interface ChatLayoutProps {
  /** Document title. */
  title: string;
  role?: ChatRole;
  /** Title of the open chat in the history panel; empty string for a new chat. */
  activeChat?: string;
  /** Header content (agent switcher, model badge, title, actions). */
  header: ReactNode;
  children: ReactNode;
  /** Optional right-hand panel (sources, file details…). Inline at `xl`, a drawer below. */
  panel?: ReactNode;
  panelOpen?: boolean;
  onPanelClose?: () => void;
  panelWidth?: number;
  panelLabel?: string;
}

/**
 * Chat workspace layout — replaces AppShell on every W4 screen.
 * Under `lg` the history panel moves into a drawer (opened from the header), under `md` the rail joins it.
 */
export function ChatLayout({
  title,
  role = 'member',
  activeChat = '',
  header,
  children,
  panel,
  panelOpen = false,
  onPanelClose,
  panelWidth = 400,
  panelLabel = 'Details',
}: ChatLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);
  const wide = useIsWide();
  useDocumentTitle(title);
  const close = () => setNavOpen(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-fg">
      <a
        href="#chat-main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to conversation
      </a>
      <ChatRail role={role} className="hidden md:flex" />
      <ChatHistory active={activeChat} className="hidden lg:flex" />
      <Drawer open={navOpen} onClose={close} side="left" width={336} label="Chats">
        <div className="flex h-full">
          <ChatRail role={role} className="flex md:hidden" onNavigate={close} />
          <ChatHistory active={activeChat} className="flex flex-1 border-r-0" onNavigate={close} />
        </div>
      </Drawer>

      <main id="chat-main" className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface pr-3 pl-3 sm:gap-3 sm:pr-4 sm:pl-5">
          <IconButton
            icon="menu"
            label="Open chats"
            variant="ghost"
            size="sm"
            onClick={() => setNavOpen(true)}
            className="-ml-1 lg:hidden"
          />
          {header}
        </header>
        {children}
      </main>

      {panel && panelOpen && wide && (
        <aside
          aria-label={panelLabel}
          className="flex shrink-0 flex-col border-l border-border bg-surface"
          style={{ width: panelWidth }}
        >
          {panel}
        </aside>
      )}
      {panel && (
        <Drawer open={panelOpen && !wide} onClose={() => onPanelClose?.()} width={panelWidth} label="Details">
          <div className="flex h-full flex-col">{panel}</div>
        </Drawer>
      )}
    </div>
  );
}

/** Scrolling conversation column, max 760 px and centred. Scrolls to the end when `scrollKey` changes. */
export function ChatThread({
  children,
  scrollKey,
  className,
  innerClassName,
}: {
  children: ReactNode;
  scrollKey?: unknown;
  className?: string;
  innerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (node && scrollKey !== undefined) node.scrollTop = node.scrollHeight;
  }, [scrollKey]);
  return (
    <div
      ref={ref}
      className={cn(
        'min-h-0 flex-1 scrollbar-thin overflow-x-hidden overflow-y-auto px-4 sm:px-8',
        className,
      )}
    >
      <div className={cn('mx-auto flex max-w-[760px] flex-col gap-6 py-6', innerClassName)}>{children}</div>
    </div>
  );
}

/** Bottom dock that pins the composer under the thread. */
export function ComposerDock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('shrink-0 px-3 pt-3 pb-4 sm:px-8 sm:pb-5', className)}>
      <div className="mx-auto flex max-w-[760px] flex-col gap-2">{children}</div>
    </div>
  );
}

/** Header row for a side panel: title, count and close button. */
export function PanelHeader({
  title,
  count,
  onClose,
}: {
  title: string;
  count?: number;
  onClose: () => void;
}) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border pr-3 pl-5">
      <h2 className="text-h4 font-semibold text-fg">
        {title} {count !== undefined && <span className="text-13 font-normal text-fg-3">{count}</span>}
      </h2>
      <IconButton
        icon="close"
        label={`Close ${title.toLowerCase()}`}
        variant="ghost"
        size="sm"
        onClick={onClose}
      />
    </div>
  );
}

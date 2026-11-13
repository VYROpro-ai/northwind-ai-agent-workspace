import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Drawer } from '@/components/ui/Overlay';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';

type Kind = 'approval' | 'done' | 'failed' | 'mention' | 'publish' | 'lock';
type Filter = 'all' | 'approvals' | 'runs' | 'mentions';

interface Notification {
  id: string;
  kind: Kind;
  group: 'Today' | 'Earlier';
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
  /** Approve / Reject / Details actions. */
  actionable?: boolean;
  /** Detail line shown in the success colour (e.g. "Approved by Leo"). */
  positive?: boolean;
  /** Access revoked — dimmed, not clickable. */
  revoked?: boolean;
  to?: string;
}

const kinds: Record<Kind, { icon: IconName; tile: string; filter: Exclude<Filter, 'all'> | null }> = {
  approval: { icon: 'approval', tile: 'bg-warn-subtle text-warn-text', filter: 'approvals' },
  done: { icon: 'check', tile: 'bg-ok-subtle text-ok-text', filter: 'approvals' },
  failed: { icon: 'x-circle', tile: 'bg-danger-subtle text-danger-text', filter: 'runs' },
  mention: { icon: 'at', tile: 'bg-brand-subtle text-brand-text', filter: 'mentions' },
  publish: { icon: 'arrow-up', tile: 'bg-ai-subtle text-ai-text', filter: null },
  lock: { icon: 'lock', tile: 'bg-subtle text-fg-3', filter: null },
};

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    kind: 'approval',
    group: 'Today',
    title: 'Refund $240 to Acme Co.',
    detail: 'Support Agent for Sofia Rossi · High risk · expires in 9 h',
    time: '2 min',
    unread: true,
    actionable: true,
    to: '/approvals/apr_240',
  },
  {
    id: 'n2',
    kind: 'approval',
    group: 'Today',
    title: 'Add tag “VIP” to Acme Co.',
    detail: 'Sales Researcher for Daniel Okafor · Low risk',
    time: '3 min',
    unread: true,
    actionable: true,
    to: '/approvals',
  },
  {
    id: 'n3',
    kind: 'done',
    group: 'Today',
    title: 'Pay invoice INV-2207',
    detail: 'Approved by Leo · 2 min ago',
    time: '6 min',
    positive: true,
    to: '/approvals/apr_240/approved',
  },
  {
    id: 'n4',
    kind: 'failed',
    group: 'Today',
    title: 'Run failed · Sales Researcher',
    detail: 'CRM rejected the request: missing field ‘email’',
    time: '22 min',
    unread: true,
    to: '/runs/run_4833',
  },
  {
    id: 'n5',
    kind: 'mention',
    group: 'Today',
    title: 'Priya mentioned you',
    detail: '“@Maya can you approve the new refund policy before Friday?”',
    time: '1 h',
    to: '/chat',
  },
  {
    id: 'n6',
    kind: 'publish',
    group: 'Earlier',
    title: 'Support Agent v4 published',
    detail: 'By Priya Nair · now live for the whole workspace',
    time: 'Yesterday',
    to: '/agents/support-agent/versions',
  },
  {
    id: 'n7',
    kind: 'lock',
    group: 'Earlier',
    title: 'Q3 board pack summary',
    detail: 'You no longer have access to this chat',
    time: 'Oct 22',
    revoked: true,
  },
];

function NotificationRow({
  n,
  onOpen,
  onDecide,
}: {
  n: Notification;
  onOpen: (n: Notification) => void;
  onDecide: (n: Notification, approved: boolean) => void;
}) {
  const k = kinds[n.kind];
  const title = (
    <span className="min-w-0 flex-1 text-body-m font-semibold text-fg">
      {n.to && !n.revoked ? (
        <Link
          to={n.to}
          onClick={() => onOpen(n)}
          className="after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none"
        >
          {n.title}
        </Link>
      ) : (
        n.title
      )}
    </span>
  );
  return (
    <li
      className={cn(
        'relative flex gap-3 border-b border-border px-5 py-3.5 transition-colors focus-within:bg-subtle',
        n.unread ? 'bg-brand-subtle/50' : 'hover:bg-sunken',
        n.revoked && 'opacity-60',
      )}
    >
      <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-md', k.tile)}>
        <Icon name={k.icon} size={16} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          {title}
          <span className="text-body-s whitespace-nowrap text-fg-3">{n.time}</span>
        </div>
        <p className={cn('text-13', n.positive ? 'text-ok-text' : 'text-fg-2')}>{n.detail}</p>
        {n.actionable && (
          <div className="relative z-[1] mt-1 flex flex-wrap gap-2">
            <Button size="sm" className="h-[30px] shadow-none" onClick={() => onDecide(n, true)}>
              Approve
            </Button>
            <Button size="sm" variant="secondary" className="h-[30px]" onClick={() => onDecide(n, false)}>
              Reject
            </Button>
            <Link
              to={n.to ?? '/approvals'}
              onClick={() => onOpen(n)}
              className="inline-flex h-[30px] items-center px-2 text-13 font-medium text-link hover:underline"
            >
              Details
            </Link>
          </div>
        )}
      </div>
      {n.unread && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </li>
  );
}

/** Notifications drawer opened from the bell (W2-04): filter tabs, inline approvals, mark-all-read. */
export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(
    () => ({
      all: items.length,
      approvals: items.filter((n) => n.actionable).length,
      mentions: items.filter((n) => n.kind === 'mention').length,
    }),
    [items],
  );
  const visible = items.filter((n) => filter === 'all' || kinds[n.kind].filter === filter);
  const unread = items.some((n) => n.unread);

  const update = (id: string, patch: Partial<Notification>) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const handleOpen = (n: Notification) => {
    update(n.id, { unread: false });
    onClose();
  };

  const decide = (n: Notification, approved: boolean) => {
    update(n.id, {
      unread: false,
      actionable: false,
      kind: approved ? 'done' : n.kind,
      positive: approved,
      detail: approved ? 'Approved by you · just now' : 'Rejected by you · just now',
    });
    toast({
      title: approved ? 'Approved' : 'Rejected',
      description: n.title,
      tone: approved ? 'ok' : 'neutral',
      action: { label: 'Undo', onClick: () => update(n.id, n) },
    });
  };

  const groups = (['Today', 'Earlier'] as const)
    .map((group) => ({ group, list: visible.filter((n) => n.group === group) }))
    .filter((g) => g.list.length > 0);

  return (
    <Drawer open={open} onClose={onClose} width={420} label="Notifications">
      <div className="flex h-full flex-col">
        <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-border pr-3 pl-5">
          <h2 className="flex-1 text-[18px] leading-[26px] font-semibold">Notifications</h2>
          <button
            type="button"
            disabled={!unread}
            onClick={() => setItems((list) => list.map((n) => ({ ...n, unread: false })))}
            className="h-8 rounded-full px-2.5 text-13 font-medium text-link hover:bg-subtle disabled:text-fg-disabled disabled:hover:bg-transparent"
          >
            Mark all as read
          </button>
          <IconButton
            icon="settings"
            label="Notification settings"
            variant="ghost"
            size="sm"
            shape="square"
            onClick={() => {
              onClose();
              navigate('/settings/notifications');
            }}
          />
          <IconButton icon="close" label="Close" variant="ghost" size="sm" onClick={onClose} />
        </div>

        <Tabs
          label="Notification filters"
          className="shrink-0 px-5 text-13"
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'approvals', label: 'Approvals', count: counts.approvals || undefined },
            { value: 'runs', label: 'Runs' },
            { value: 'mentions', label: 'Mentions', count: counts.mentions || undefined },
          ]}
        />

        <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto">
          {groups.length === 0 && (
            <p className="px-5 py-12 text-center text-body-m text-fg-3">You’re all caught up.</p>
          )}
          {groups.map(({ group, list }) => (
            <section key={group} aria-label={group}>
              <h3 className="px-5 pt-3 pb-1.5 text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">
                {group}
              </h3>
              <ul>
                {list.map((n) => (
                  <NotificationRow key={n.id} n={n} onOpen={handleOpen} onDecide={decide} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Link
          to="/settings/notifications"
          onClick={onClose}
          className="flex h-12 shrink-0 items-center justify-center border-t border-border text-13 font-medium text-link hover:bg-sunken"
        >
          Notification settings
        </Link>
      </div>
    </Drawer>
  );
}

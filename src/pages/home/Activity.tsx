import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Icon, type IconName } from '@/components/icons';
import { Avatar, Button, Checkbox, Dropdown, EmptyState, Input } from '@/components/ui';
import {
  activityCategories,
  activityFeed,
  olderActivity,
  type ActivityCategory,
  type ActivityEvent,
  type ActivityType,
} from './data';

const typeIcons: Record<ActivityType, { icon: IconName; color: string }> = {
  publish: { icon: 'arrow-up', color: 'text-ok-text' },
  edit: { icon: 'edit', color: 'text-brand-text' },
  invite: { icon: 'plus', color: 'text-info-text' },
  connect: { icon: 'integration', color: 'text-info-text' },
  policy: { icon: 'shield', color: 'text-warn-text' },
  approve: { icon: 'check', color: 'text-ok-text' },
};

const ranges = [
  { value: 0, label: 'Today' },
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
];

function FilterButton({
  active,
  children,
  ...props
}: { active?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex h-[34px] max-w-full items-center gap-1.5 rounded-full border pr-2 pl-3 text-13 font-medium transition-colors',
        active
          ? 'border-brand-border bg-brand-subtle text-brand-text'
          : 'border-border-strong bg-surface text-fg hover:bg-subtle',
      )}
    >
      <span className="truncate">{children}</span>
      <Icon name="chevron-down" size={14} strokeWidth={2} className="shrink-0" />
    </button>
  );
}

function ActorAvatar({ event }: { event: ActivityEvent }) {
  const t = typeIcons[event.type];
  return (
    <span className="relative size-8 shrink-0">
      {event.actor ? (
        <Avatar name={event.actor.name} src={event.actor.avatar} />
      ) : (
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-subtle text-body-s font-semibold text-fg-3">
          ?
        </span>
      )}
      <span className="absolute -right-1 -bottom-1 inline-flex size-[18px] items-center justify-center rounded-full border-[1.5px] border-border bg-surface">
        <Icon name={t.icon} size={10} strokeWidth={2.5} className={t.color} />
      </span>
    </span>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  return (
    <li className="flex min-h-14 items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
      <ActorAvatar event={event} />
      <p className="min-w-0 flex-1 text-body-m text-fg-2">
        <strong className={cn('font-semibold', event.actor ? 'text-fg' : 'text-fg-3')}>
          {event.actor?.name ?? 'Former member'}
        </strong>{' '}
        {event.action}{' '}
        {event.to ? (
          <Link to={event.to} className="font-medium break-words text-link hover:underline">
            {event.object}
          </Link>
        ) : (
          <span className={cn('font-medium', event.deleted && 'text-fg-3 line-through')}>{event.object}</span>
        )}
        {event.suffix && <span className="text-fg-3">{event.suffix}</span>}
      </p>
      <time className="shrink-0 text-body-s whitespace-nowrap text-fg-3">{event.time}</time>
    </li>
  );
}

/** W2-03 · Activity feed */
export default function Activity() {
  const [query, setQuery] = useState('');
  const [person, setPerson] = useState<string | null>(null);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [range, setRange] = useState(7);
  const [showOlder, setShowOlder] = useState(false);

  const all = useMemo(() => (showOlder ? [...activityFeed, ...olderActivity] : activityFeed), [showOlder]);
  const people = useMemo(
    () => Array.from(new Set(all.map((e) => e.actor?.name).filter((n): n is string => Boolean(n)))),
    [all],
  );

  const events = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (e) =>
        e.age <= range &&
        (!person || e.actor?.name === person) &&
        (categories.length === 0 || categories.includes(e.category)) &&
        (!q || `${e.actor?.name ?? 'former member'} ${e.action} ${e.object}`.toLowerCase().includes(q)),
    );
  }, [all, query, person, categories, range]);

  const groups = events.reduce<{ day: string; list: ActivityEvent[] }[]>((acc, e) => {
    const last = acc[acc.length - 1];
    if (last?.day === e.day) last.list.push(e);
    else acc.push({ day: e.day, list: [e] });
    return acc;
  }, []);

  const toggleCategory = (c: ActivityCategory) =>
    setCategories((list) => (list.includes(c) ? list.filter((x) => x !== c) : [...list, c]));

  const clearFilters = () => {
    setQuery('');
    setPerson(null);
    setCategories([]);
    setRange(7);
  };

  return (
    <AppShell
      active="Home"
      role="admin"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Activity' }]}
      mainClassName="lg:px-8 lg:py-7 gap-5"
    >
      <div className="flex w-full max-w-[896px] flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 font-semibold tracking-[-0.02em]">Activity</h1>
          <p className="text-body-m text-fg-2">
            What changed across Northwind Labs. For a full security record, use the{' '}
            <Link to="/settings/audit-log" className="text-link underline underline-offset-2">
              Audit log
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            pill
            size="sm"
            leftIcon="search"
            placeholder="Search activity"
            aria-label="Search activity"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            containerClassName="w-full sm:w-60"
            className="h-[34px] border-border text-13"
          />
          <Dropdown
            items={[
              { label: 'All people', icon: person ? undefined : 'check', onSelect: () => setPerson(null) },
              ...people.map((name) => ({
                label: name,
                icon: person === name ? ('check' as const) : undefined,
                onSelect: () => setPerson(name),
              })),
            ]}
            trigger={(props) => (
              <FilterButton {...props} active={Boolean(person)}>
                {person ?? 'All people'}
              </FilterButton>
            )}
          />
          <Dropdown
            width={220}
            trigger={(props) => (
              <FilterButton {...props} active={categories.length > 0}>
                {categories.length ? `Event: ${categories.join(', ')}` : 'All events'}
              </FilterButton>
            )}
          >
            <fieldset className="flex flex-col gap-2.5 p-2.5">
              <legend className="mb-2 text-body-s font-medium text-fg-3">Event type</legend>
              {activityCategories.map((c) => (
                <Checkbox
                  key={c}
                  label={c}
                  checked={categories.includes(c)}
                  onChange={() => toggleCategory(c)}
                />
              ))}
            </fieldset>
          </Dropdown>
          <Dropdown
            items={ranges.map((r) => ({
              label: r.label,
              icon: range === r.value ? ('check' as const) : undefined,
              onSelect: () => setRange(r.value),
            }))}
            trigger={(props) => (
              <FilterButton {...props}>{ranges.find((r) => r.value === range)?.label}</FilterButton>
            )}
          />
          <Button variant="link" className="px-2 text-13" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>

        <section
          aria-label="Activity"
          className="overflow-hidden rounded-[18px] border border-border bg-surface"
        >
          {groups.length === 0 ? (
            <EmptyState
              icon="history"
              title="No activity matches"
              description="Try a different person, event type or date range."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            groups.map((g) => (
              <div key={g.day}>
                <h2 className="border-b border-border bg-sunken px-4 py-2.5 text-body-s font-semibold text-fg-2 sm:px-5">
                  {g.day}
                </h2>
                <ul>
                  {g.list.map((e) => (
                    <ActivityRow key={e.id} event={e} />
                  ))}
                </ul>
              </div>
            ))
          )}
          {!showOlder && (
            <button
              type="button"
              onClick={() => setShowOlder(true)}
              className="flex h-12 w-full items-center justify-center text-13 font-medium text-link hover:bg-sunken"
            >
              Load more
            </button>
          )}
        </section>
      </div>
    </AppShell>
  );
}

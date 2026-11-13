import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/icons';
import { Avatar, Badge, Button, Dropdown, Modal, Select, Switch, useToast } from '@/components/ui';
import { initialShares, invitable, type ShareEntry, type ShareRole } from '../data';
import type { Person } from '@/data/people';

const roleOptions = [
  { value: 'Can use', label: 'Can use' },
  { value: 'Can edit', label: 'Can edit' },
];

function RoleMenu({
  entry,
  onChange,
  onRemove,
}: {
  entry: ShareEntry;
  onChange: (r: ShareRole) => void;
  onRemove: () => void;
}) {
  if (entry.role === 'Owner') return <span className="text-13 text-fg-3">Owner</span>;
  return (
    <Dropdown
      align="end"
      width={180}
      trigger={(props) => (
        <button
          type="button"
          aria-label={`Access for ${entry.name}: ${entry.role}`}
          className="inline-flex items-center gap-1 rounded-sm px-1 text-13 text-fg hover:bg-subtle"
          {...props}
        >
          {entry.role}
          <Icon name="chevron-down" size={14} strokeWidth={2} className="text-fg-3" />
        </button>
      )}
      items={[
        {
          label: 'Can edit',
          icon: entry.role === 'Can edit' ? 'check' : undefined,
          onSelect: () => onChange('Can edit'),
        },
        {
          label: 'Can use',
          icon: entry.role === 'Can use' ? 'check' : undefined,
          onSelect: () => onChange('Can use'),
        },
        { label: 'Remove access', danger: true, separator: true, onSelect: onRemove },
      ]}
    />
  );
}

/** W3-12 dialog · Share the agent with people and teams. */
export function ShareDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [shares, setShares] = useState<ShareEntry[]>(initialShares);
  const [pending, setPending] = useState<Person[]>([invitable[0]]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<ShareRole>('Can use');
  const [workspace, setWorkspace] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start in the people field (after the dialog's own focus trap has run).
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const shared = new Set(shares.map((s) => s.id));
  const matches = invitable.filter(
    (p) =>
      !shared.has(p.id) &&
      !pending.some((x) => x.id === p.id) &&
      query.trim() &&
      `${p.name} ${p.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const addPending = (p: Person) => {
    setPending([...pending, p]);
    setQuery('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && matches[0]) {
      e.preventDefault();
      addPending(matches[0]);
    } else if (e.key === 'Backspace' && !query && pending.length) {
      setPending(pending.slice(0, -1));
    }
  };

  const invite = () => {
    if (!pending.length) return;
    setShares([
      ...shares,
      ...pending.map((p) => ({ id: p.id, name: p.name, sub: p.email, role, avatar: p.avatar })),
    ]);
    toast({
      title: `Invited ${pending.map((p) => p.name).join(', ')}`,
      description: `They ${role === 'Can edit' ? 'can now edit' : 'can now use'} Support Agent.`,
    });
    setPending([]);
  };

  const copyLink = () => {
    void navigator.clipboard
      ?.writeText(`${window.location.origin}/agents/support-agent`)
      .catch(() => undefined);
    toast({ tone: 'neutral', title: 'Link copied', description: 'Only people with access can open it.' });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share Support Agent"
      icon={
        <span className="mt-[-3px] inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-brand text-body-s font-semibold text-white">
          SA
        </span>
      }
      footer={
        <>
          <Button variant="secondary" leftIcon="link" className="mr-auto" onClick={copyLink}>
            Copy link
          </Button>
          <Button className="px-[18px]" onClick={onClose}>
            Done
          </Button>
        </>
      }
      className="max-w-[560px] bg-raised"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-[10px] border border-border-strong bg-surface px-2 py-1 transition-[border-color,box-shadow] focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]">
            {pending.map((p) => (
              <span
                key={p.id}
                className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-subtle pr-1.5 pl-[3px] text-body-s font-medium"
              >
                <Avatar name={p.name} src={p.avatar} size="xs" />
                {p.name}
                <button
                  type="button"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => setPending(pending.filter((x) => x.id !== p.id))}
                  className="rounded-full text-fg-3 hover:text-fg"
                >
                  <Icon name="close" size={12} strokeWidth={2.25} />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              aria-label="Add people or teams"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="Add people or teams"
              className="h-7 min-w-28 flex-1 bg-transparent text-13 text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
            />
          </div>
          {matches.length > 0 && (
            <ul
              role="listbox"
              aria-label="Suggestions"
              className="absolute inset-x-0 top-full z-10 mt-1 rounded-lg border border-border bg-raised p-1.5 shadow-overlay"
            >
              {matches.map((p) => (
                <li key={p.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => addPending(p)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-subtle"
                  >
                    <Avatar name={p.name} src={p.avatar} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-13 font-medium">{p.name}</span>
                      <span className="block text-body-s text-fg-3">{p.email}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2">
          <Select
            aria-label="Access for new people"
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value as ShareRole)}
            className="h-[42px] w-[100px] text-13"
          />
          <Button className="h-[42px]" disabled={!pending.length} onClick={invite}>
            Invite
          </Button>
        </div>
      </div>

      <h3 className="pt-4 pb-1.5 text-body-s font-semibold tracking-[0.02em] text-fg-3 uppercase">
        People with access
      </h3>
      <ul className="flex flex-col">
        {shares.map((s) => (
          <li key={s.id} className="flex min-h-[46px] items-center gap-2.5">
            {s.team ? (
              <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-md bg-brand text-caption font-semibold text-white">
                ST
              </span>
            ) : (
              <Avatar name={s.name} src={s.avatar} size="md" />
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-13 font-medium">{s.name}</span>
              <span className="truncate text-body-s text-fg-3">{s.sub}</span>
            </div>
            <RoleMenu
              entry={s}
              onChange={(r) => setShares(shares.map((x) => (x.id === s.id ? { ...x, role: r } : x)))}
              onRemove={() => {
                setShares(shares.filter((x) => x.id !== s.id));
                toast({ tone: 'neutral', title: `Removed ${s.name}` });
              }}
            />
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3.5">
        <h3 className="text-body-s font-semibold tracking-[0.02em] text-fg-3 uppercase">General access</h3>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-subtle text-icon">
            <Icon name={workspace ? 'building' : 'lock'} size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <Dropdown
              width={260}
              trigger={(props) => (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-13 font-medium"
                  {...props}
                >
                  {workspace ? 'Everyone at Northwind Labs' : 'Only people with access'}
                  <Icon name="chevron-down" size={14} strokeWidth={2} className="text-fg-3" />
                </button>
              )}
              items={[
                {
                  label: 'Everyone at Northwind Labs',
                  icon: 'building',
                  description: '24 people can find and use it',
                  onSelect: () => setWorkspace(true),
                },
                {
                  label: 'Only people with access',
                  icon: 'lock',
                  description: 'Invite people one by one',
                  onSelect: () => setWorkspace(false),
                },
              ]}
            />
            <p className="text-body-s text-fg-3">
              {workspace
                ? '24 people can find and use this agent'
                : 'Only the people above can open this agent'}
            </p>
          </div>
          {workspace && <span className="text-13 text-fg-2">Can use</span>}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-subtle text-icon">
            <Icon name="code" size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-13 font-medium">
              Embed on a website
              <Badge
                tone="ai"
                size="sm"
                bordered={false}
                className="h-[18px] border-transparent text-[10px] font-semibold"
              >
                Pro
              </Badge>
            </p>
            <p className="text-body-s text-fg-3">Add a chat widget to your help center</p>
          </div>
          <Switch aria-label="Embed on a website (Pro plan)" disabled />
        </div>
      </div>
    </Modal>
  );
}

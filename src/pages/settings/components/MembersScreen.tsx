import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  EmptyState,
  InlineNotice,
  Input,
  Modal,
  Select,
  Tabs,
  useToast,
} from '@/components/ui';
import { Icon } from '@/components/icons';
import { roleLabels, type Role } from '@/data/people';
import {
  assignableRoles,
  inviteSeed,
  members as seedMembers,
  pendingInvites,
  seats,
  teams,
  type Member,
} from '../data';
import { InviteMembersModal } from './InviteMembersModal';
import { MembersTable } from './MembersTable';
import { SettingsCard, SettingsLayout } from './SettingsLayout';
import { dangerSoft } from './styles';

type Tab = 'members' | 'invites' | 'teams';
type RoleFilter = 'all' | Role;

const firstName = (name: string) => name.split(' ')[0];

/** W10-01 · Members (also W10-03 with `inviteOpen`). */
export function MembersScreen({ inviteOpen = false }: { inviteOpen?: boolean }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [list, setList] = useState(seedMembers);
  const [invites, setInvites] = useState(pendingInvites);
  const [tab, setTab] = useState<Tab>('members');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [invite, setInvite] = useState({ open: inviteOpen, key: 0, seed: inviteOpen ? inviteSeed : [] });
  const [removing, setRemoving] = useState<Member | null>(null);
  const [transferTo, setTransferTo] = useState('daniel');

  const removed = seedMembers.length - list.length;
  const memberCount = seats.used - removed;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (m) =>
        (roleFilter === 'all' || m.role === roleFilter) &&
        (!q ||
          m.person.name.toLowerCase().includes(q) ||
          m.person.email.includes(q) ||
          m.teams.some((t) => t.toLowerCase().includes(q))),
    );
  }, [list, query, roleFilter]);

  const update = (id: string, patch: Partial<Member>) =>
    setList((prev) => prev.map((m) => (m.person.id === id ? { ...m, ...patch } : m)));

  const changeRole = (member: Member, role: Role) => {
    const otherAdmins = list.filter((m) => m.role === 'admin' && m.person.id !== member.person.id);
    if (member.role === 'admin' && otherAdmins.length === 0) {
      toast({
        tone: 'warn',
        title: `Can’t change ${firstName(member.person.name)}’s role`,
        description: 'A workspace needs at least one Admin besides the Owner.',
      });
      return;
    }
    update(member.person.id, { role });
    toast({ title: `${member.person.name} is now ${roleLabels[role]}` });
  };

  const toggleSuspend = (member: Member) => {
    const status = member.status === 'active' ? 'suspended' : 'active';
    update(member.person.id, { status });
    toast({
      tone: status === 'active' ? 'ok' : 'neutral',
      title: status === 'active' ? `${member.person.name} reactivated` : `${member.person.name} suspended`,
    });
  };

  const confirmRemove = () => {
    if (!removing) return;
    const target = removing;
    const before = list;
    const heir = list.find((m) => m.person.id === transferTo);
    setList((prev) => prev.filter((m) => m.person.id !== target.person.id));
    setRemoving(null);
    toast({
      title: `${target.person.name} removed`,
      description:
        target.owns && heir ? `Agents and workflows now belong to ${heir.person.name}.` : undefined,
      action: { label: 'Undo', onClick: () => setList(before) },
    });
  };

  const openInvite = () => setInvite((s) => ({ open: true, key: s.key + 1, seed: [] }));
  const closeInvite = () => {
    setInvite((s) => ({ ...s, open: false }));
    if (inviteOpen) navigate('/settings/members', { replace: true });
  };

  const resend = (email: string) => {
    setInvites((prev) =>
      prev.map((i) => (i.email === email ? { ...i, expired: false, sent: 'Just now' } : i)),
    );
    toast({ title: 'Invite resent', description: email });
  };

  const heirs = list.filter(
    (m) => m.person.id !== removing?.person.id && ['owner', 'admin', 'builder'].includes(m.role),
  );
  const expired = invites.find((i) => i.expired);

  return (
    <SettingsLayout
      crumb="Members"
      title="Members"
      description="People in Northwind Labs and what they can do."
      actions={
        <>
          <span className="text-13 font-medium text-fg-2 tabular">
            {memberCount} of {seats.total} seats
          </span>
          <Button size="sm" leftIcon="plus" onClick={openInvite}>
            Invite members
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-end gap-2.5">
        <Tabs<Tab>
          label="Member views"
          value={tab}
          onChange={setTab}
          className={
            'gap-[22px] [&_[role=tab]]:h-[38px] [&_[role=tab]]:px-0 [&_[role=tab]]:text-13 ' +
            '[&_[aria-selected=true]]:font-semibold [&_[role=tab]>span]:bg-transparent ' +
            '[&_[aria-selected=true]>span]:text-brand-text'
          }
          items={[
            { value: 'members', label: 'Members', count: memberCount },
            { value: 'invites', label: 'Pending invites', count: invites.length },
            { value: 'teams', label: 'Teams', count: teams.length },
          ]}
        />
        <span className="hidden flex-1 md:block" />
        {tab === 'members' && (
          <div className="flex w-full flex-wrap gap-2.5 md:w-auto">
            <Input
              pill
              size="sm"
              leftIcon="search"
              placeholder="Search members"
              aria-label="Search members"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              containerClassName="min-w-0 flex-1 md:w-[220px] md:flex-none"
              className="h-[34px] border-border text-13"
            />
            <Dropdown
              align="end"
              width={180}
              trigger={(props) => (
                <button
                  type="button"
                  {...props}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-full border border-border bg-surface pr-2.5 pl-3 text-13 whitespace-nowrap hover:bg-subtle"
                >
                  <span className="text-fg-3">Role</span>
                  <span className="text-fg">{roleFilter === 'all' ? 'All' : roleLabels[roleFilter]}</span>
                  <Icon name="chevron-down" size={14} strokeWidth={2} className="ml-1.5 text-fg-3" />
                </button>
              )}
              items={(['all', 'owner', ...assignableRoles] as RoleFilter[]).map((r) => ({
                label: r === 'all' ? 'All roles' : roleLabels[r],
                icon: r === roleFilter ? 'check' : undefined,
                onSelect: () => setRoleFilter(r),
              }))}
            />
          </div>
        )}
      </div>

      {tab === 'members' && (
        <>
          <MembersTable
            members={filtered}
            onRoleChange={changeRole}
            onToggleSuspend={toggleSuspend}
            onRemove={(m) => {
              setTransferTo(m.person.id === 'daniel' ? 'maya' : 'daniel');
              setRemoving(m);
            }}
            onRemind={(m) =>
              toast({
                title: 'Reminder sent',
                description: `${m.person.name} will get an email to set up 2FA.`,
              })
            }
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SettingsCard className="justify-center gap-3 p-4">
              <InlineNotice tone="warn" className="leading-[18px]">
                A workspace needs at least one Admin besides the Owner. Make someone else an Admin before
                changing Daniel’s role.
              </InlineNotice>
            </SettingsCard>
            {expired ? (
              <SettingsCard className="gap-3 p-4">
                <p className="text-13 leading-[19px] text-fg-2">
                  Pending invite to <b className="font-semibold text-fg">{expired.email}</b> was sent{' '}
                  {expired.sent} and has expired.
                </p>
                <div className="mt-auto flex items-center gap-2">
                  <Badge bordered={false} className="h-5 border-transparent">
                    Expired
                  </Badge>
                  <span className="flex-1" />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-[30px]"
                    onClick={() => resend(expired.email)}
                  >
                    Resend
                  </Button>
                </div>
              </SettingsCard>
            ) : (
              <SettingsCard className="justify-center p-4">
                <p className="flex items-center gap-2 text-13 text-fg-2">
                  <Icon name="check-circle" size={16} className="text-ok-text" />
                  All pending invites are active.
                </p>
              </SettingsCard>
            )}
          </div>
        </>
      )}

      {tab === 'invites' && (
        <SettingsCard as="div">
          {invites.length === 0 ? (
            <EmptyState
              icon="mail"
              title="No pending invites"
              description="Invite teammates to share agents and runs."
            />
          ) : (
            <ul className="divide-y divide-border">
              {invites.map((i) => (
                <li key={i.email} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Avatar name={i.email} size="md" />
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate text-13 font-semibold text-fg">{i.email}</p>
                    <p className="text-body-s text-fg-3">
                      {roleLabels[i.role]} · sent {i.sent}
                    </p>
                  </div>
                  {i.expired ? (
                    <Badge bordered={false} className="border-transparent">
                      Expired
                    </Badge>
                  ) : (
                    <Badge tone="info" icon="clock" bordered={false} className="border-transparent">
                      Pending
                    </Badge>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => resend(i.email)}>
                    Resend
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setInvites((prev) => prev.filter((x) => x.email !== i.email));
                      toast({ tone: 'neutral', title: 'Invite revoked', description: i.email });
                    }}
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SettingsCard>
      )}

      {tab === 'teams' && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((t) => (
            <li key={t.name}>
              <SettingsCard as="div" className="flex-row items-center gap-3 p-4">
                <span className="inline-flex size-10 items-center justify-center rounded-full border border-border text-fg">
                  <Icon name="users" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-13 font-semibold text-fg">{t.name}</p>
                  <p className="text-body-s text-fg-3">
                    {t.members} members · {t.agents} {t.agents === 1 ? 'agent' : 'agents'}
                  </p>
                </div>
              </SettingsCard>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        size="sm"
        title={removing ? `Remove ${removing.person.name}?` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="secondary" className={dangerSoft} onClick={confirmRemove}>
              {removing?.owns ? 'Transfer and remove' : 'Remove member'}
            </Button>
          </>
        }
      >
        {removing && (
          <div className="flex flex-col gap-3">
            <p className="text-13 leading-[19px] text-fg-2">
              {removing.owns
                ? `${firstName(removing.person.name)} owns ${removing.owns.agents} agents and ` +
                  `${removing.owns.workflows} workflows. Choose who owns them next, then remove ` +
                  `${firstName(removing.person.name)}.`
                : `${firstName(removing.person.name)} loses access to Northwind Labs right away. ` +
                  'Their chats and runs stay in the workspace.'}
            </p>
            {removing.owns && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="transfer-owner" className="text-body-s font-semibold text-fg-2">
                  Transfer ownership to
                </label>
                <Select
                  id="transfer-owner"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  options={heirs.map((m) => ({
                    value: m.person.id,
                    label: `${m.person.name} · ${roleLabels[m.role]}`,
                  }))}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      <InviteMembersModal
        key={invite.key}
        open={invite.open}
        onClose={closeInvite}
        initialEmails={invite.seed}
        memberEmails={list.map((m) => m.person.email)}
      />
    </SettingsLayout>
  );
}

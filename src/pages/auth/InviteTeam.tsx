import { useEffect, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import { Avatar, Button, Dropdown, IconButton, useToast } from '@/components/ui';
import { cn } from '@/lib/cn';
import { AuthHeading } from './components/AuthHeading';
import { AuthLayout } from './components/AuthLayout';
import { SetupSteps } from './components/SetupSteps';
import { initialInvites, inviteLink, inviteRoles, seatLimit, type Invite, type InviteRole } from './data';
import { isEmail } from './password';

let nextId = 100;

/** W1-07 · Invite team */
export default function InviteTeam() {
  const navigate = useNavigate();
  const toast = useToast();
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);

  const valid = invites.filter((i) => isEmail(i.email));

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const addEmails = (text: string) => {
    const emails = text.split(/[\s,;]+/).filter(Boolean);
    if (!emails.length) return;
    const existing = new Set(invites.map((i) => i.email.toLowerCase()));
    const fresh = emails.filter((e) => !existing.has(e.toLowerCase()));
    if (fresh.length < emails.length) toast({ title: 'Skipped emails that are already on the list' });
    setInvites((list) => [
      ...list,
      ...fresh.map((email) => ({ id: `i${nextId++}`, email, role: 'Member' as const })),
    ]);
    setDraft('');
  };

  const onDraftKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', ' ', 'Tab'].includes(event.key) && draft.trim()) {
      if (event.key !== 'Tab') event.preventDefault();
      addEmails(draft);
    } else if (event.key === 'Backspace' && !draft && invites.length) {
      setInvites((list) => list.slice(0, -1));
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    addEmails(draft + ' ' + event.clipboardData.getData('text'));
  };

  const setRole = (id: string, role: InviteRole) =>
    setInvites((list) => list.map((i) => (i.id === id ? { ...i, role } : i)));

  const copyLink = () => {
    void navigator.clipboard?.writeText(`https://${inviteLink}`).catch(() => undefined);
    setCopied(true);
    toast({ title: 'Invite link copied', tone: 'ok' });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid.length) return;
    toast({
      title: `${valid.length} ${valid.length === 1 ? 'invite' : 'invites'} sent`,
      description: 'People get an email with a link to join Northwind Labs.',
      tone: 'ok',
    });
    navigate('/onboarding/template');
  };

  return (
    <AuthLayout
      screen="invite"
      title="Invite your team"
      headerAside={<SetupSteps current={2} />}
      footer={false}
    >
      <form noValidate onSubmit={onSubmit} className="flex w-full max-w-[460px] flex-col gap-[22px]">
        <AuthHeading size="md" title="Invite your team">
          Agents work better with reviewers and builders around. Paste several emails at once.
        </AuthHeading>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="invite-emails" className="text-body-m font-medium text-fg">
              Emails and roles
            </label>
            <span className="text-body-s text-fg-2">
              <strong
                className={cn('font-semibold', invites.length > seatLimit ? 'text-warn-text' : 'text-fg')}
              >
                {invites.length} of {seatLimit}
              </strong>{' '}
              seats · Pro trial
            </span>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[10px] border border-border-strong bg-surface p-2 transition-[border-color,box-shadow] focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]">
            <ul className="flex flex-col gap-1.5">
              {invites.map((invite) => (
                <InviteRow
                  key={invite.id}
                  invite={invite}
                  onRole={(role) => setRole(invite.id, role)}
                  onRemove={() => setInvites((list) => list.filter((i) => i.id !== invite.id))}
                />
              ))}
            </ul>
            <input
              id="invite-emails"
              value={draft}
              placeholder="Add more emails…"
              autoComplete="off"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onDraftKey}
              onPaste={onPaste}
              onBlur={() => draft.trim() && addEmails(draft)}
              className="h-8 bg-transparent px-2 text-13 text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
            />
          </div>
          {invites.length > seatLimit && (
            <p className="text-body-s text-warn-text">Extra seats are billed when the trial ends.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body-m font-medium text-fg">Or share an invite link</span>
          <div className="flex gap-2">
            <span className="h-10 min-w-0 flex-1 truncate rounded-md border border-border bg-sunken px-3 font-mono text-13 leading-[38px] text-fg-2">
              {inviteLink}
            </span>
            <Button
              variant="secondary"
              leftIcon={copied ? 'check' : 'copy'}
              className="h-10 px-3.5"
              onClick={copyLink}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <span className="text-body-s text-fg-3">People who join with the link start as Member.</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Button
            variant="ghost"
            size="lg"
            className="px-4 text-[15px]"
            onClick={() => navigate('/onboarding/template')}
          >
            Skip for now
          </Button>
          <Button type="submit" size="lg" className="text-[15px]" disabled={!valid.length}>
            Send {valid.length} {valid.length === 1 ? 'invite' : 'invites'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

function InviteRow({
  invite,
  onRole,
  onRemove,
}: {
  invite: Invite;
  onRole: (role: InviteRole) => void;
  onRemove: () => void;
}) {
  const invalid = !isEmail(invite.email);
  return (
    <li
      className={cn(
        'flex min-h-10 items-center gap-2.5 rounded-md py-1.5 pr-1.5 pl-2',
        invalid ? 'bg-danger-subtle' : 'bg-subtle',
      )}
    >
      {invalid ? (
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-danger-text"
        >
          !
        </span>
      ) : (
        <Avatar name={invite.name ?? invite.email} src={invite.avatar} size="sm" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={cn('truncate text-13', invalid ? 'text-danger-text' : 'text-fg')}>
          {invite.email}
        </span>
        {invalid && <span className="text-caption text-danger-text">Not a valid email address</span>}
      </div>
      {!invalid && (
        <Dropdown
          align="end"
          width={160}
          items={inviteRoles.map((role) => ({
            label: role,
            icon: role === invite.role ? 'check' : undefined,
            onSelect: () => onRole(role),
          }))}
          trigger={(props) => (
            <button
              type="button"
              {...props}
              aria-label={`Role for ${invite.email}: ${invite.role}`}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-surface pr-1.5 pl-2.5 text-body-s font-medium text-fg hover:bg-subtle"
            >
              {invite.role}
              <Icon name="chevron-down" size={12} strokeWidth={2} className="text-icon" />
            </button>
          )}
        />
      )}
      <IconButton
        icon="close"
        label={`Remove ${invite.email}`}
        variant="ghost"
        size="xs"
        onClick={onRemove}
      />
    </li>
  );
}

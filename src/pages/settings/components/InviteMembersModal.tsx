import { useId, useState } from 'react';
import { Button, Modal, Switch, Textarea, useToast } from '@/components/ui';
import { roleOptions, seats, teamOptions } from '../data';
import { emailState } from './email';
import { EmailTagInput } from './EmailTagInput';
import { PrefixSelect } from './PrefixSelect';

/** W10-03 · Invite members dialog with tag-style email input, validation and seat check. */
export function InviteMembersModal({
  open,
  onClose,
  initialEmails = [],
  memberEmails,
}: {
  open: boolean;
  onClose: () => void;
  initialEmails?: string[];
  memberEmails: string[];
}) {
  const toast = useToast();
  const id = useId();
  const [emails, setEmails] = useState(initialEmails);
  const [role, setRole] = useState('member');
  const [team, setTeam] = useState('Support');
  const [message, setMessage] = useState('Welcome! Start with the Support Agent in Chat.');
  const [domainJoin, setDomainJoin] = useState(false);

  const isMember = (email: string) => memberEmails.includes(email);
  const states = emails.map((e) => ({ email: e, state: emailState(e, isMember) }));
  const valid = states.filter((s) => s.state === 'valid');
  const seatsLeft = seats.total - seats.used;
  const overSeats = valid.length > seatsLeft;
  const errors = [
    ...states.filter((s) => s.state === 'invalid').map((s) => `${s.email} isn’t a valid email address.`),
    ...states.filter((s) => s.state === 'member').map((s) => `${s.email} is already a member.`),
    ...(overSeats
      ? [
          `${valid.length} valid invites but only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left. ` +
            'Add a seat or remove one invite.',
        ]
      : []),
  ];

  const send = () => {
    const extra = Math.max(0, valid.length - seatsLeft);
    toast({
      title: `${valid.length} invite${valid.length === 1 ? '' : 's'} sent`,
      description: extra
        ? `${extra} seat${extra === 1 ? '' : 's'} added at $${seats.extraSeatPrice}/month each.`
        : `They’ll join as ${roleOptions.find((r) => r.value === role)?.label} in ${team}.`,
    });
    setEmails([]);
    onClose();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://northwind.app/northwind/join/k3f9-2xq7');
    } catch {
      /* clipboard blocked — still confirm */
    }
    toast({
      title: 'Invite link copied',
      description: 'Anyone with the link can request to join.',
      tone: 'info',
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Invite members"
      description={`${seatsLeft} seat left on ${seats.plan}. Extra seats are $${seats.extraSeatPrice}/month each.`}
      className="sm:max-w-[580px]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-emails`} className="text-body-s font-semibold text-fg-2">
            Email addresses
          </label>
          <EmailTagInput
            id={`${id}-emails`}
            value={emails}
            onChange={setEmails}
            isMember={isMember}
            describedBy={errors.length ? `${id}-errors` : `${id}-hint`}
          />
          {errors.length ? (
            <ul
              id={`${id}-errors`}
              className="flex flex-col gap-0.5 pt-1 text-body-s text-danger-text"
              aria-live="polite"
            >
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : (
            <p id={`${id}-hint`} className="text-body-s text-fg-3">
              Press Enter or comma after each address. Paste many at once — they become chips.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_200px]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-role`} className="text-body-s font-semibold text-fg-2">
              Role
            </label>
            <PrefixSelect
              id={`${id}-role`}
              pill
              prefix="Role"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-team`} className="text-body-s font-semibold text-fg-2">
              Team
            </label>
            <PrefixSelect
              id={`${id}-team`}
              pill
              prefix="Team"
              options={teamOptions}
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-message`} className="text-body-s font-semibold text-fg-2">
            Personal message (optional)
          </label>
          <Textarea
            id={`${id}-message`}
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-16 rounded-lg text-13"
          />
        </div>

        <Switch
          checked={domainJoin}
          onChange={(e) => setDomainJoin(e.target.checked)}
          label="Anyone with @northwindlabs.com can join as Member"
          description="Skip invites for your own team"
          className="items-center rounded-lg border border-border bg-sunken px-3.5 py-3"
        />

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="link" size="sm" onClick={copyLink} className="mr-auto">
            Copy invite link
          </Button>
          <Button variant="secondary" size="sm" className="h-[34px]" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" className="h-[34px]" onClick={send} disabled={valid.length === 0}>
            {overSeats
              ? 'Add a seat and invite'
              : valid.length > 1
                ? `Send ${valid.length} invites`
                : 'Send invite'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

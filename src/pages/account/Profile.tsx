import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/icons';
import { Avatar, Badge, Button, Field, Input, Modal, useToast } from '@/components/ui';
import { people } from '@/data/people';
import { AccountLayout, SettingsSection } from './components/AccountLayout';
import { TwoFactorSection } from './components/TwoFactorSection';

const me = people.maya;

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const tooShort = next.length > 0 && next.length < 12;
  const mismatch = confirm.length > 0 && confirm !== next;

  const close = () => {
    setNext('');
    setConfirm('');
    onClose();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 12 || next !== confirm) return;
    toast({ title: 'Password updated', description: 'Other sessions were signed out.' });
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Change password"
      description="Use at least 12 characters. You’ll stay signed in on this device."
    >
      <form id="change-password" onSubmit={submit} className="flex flex-col gap-4 pb-2">
        <Field label="Current password">
          {(id) => <Input id={id} type="password" autoComplete="current-password" required />}
        </Field>
        <Field label="New password" error={tooShort ? 'Use at least 12 characters' : undefined}>
          {(id, describedBy) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              aria-describedby={describedBy}
              invalid={tooShort}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
          )}
        </Field>
        <Field label="Confirm new password" error={mismatch ? 'Passwords don’t match' : undefined}>
          {(id, describedBy) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              aria-describedby={describedBy}
              invalid={mismatch}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          )}
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">Update password</Button>
        </div>
      </form>
    </Modal>
  );
}

/** Board labels in "Your details" are 12 px semibold secondary text. */
const compactField = '[&_label]:text-body-s [&_label]:font-semibold [&_label]:text-fg-2';

function DetailsSection() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState(me.avatar);
  const [name, setName] = useState(me.name);
  const [title, setTitle] = useState('Head of Customer Operations');
  const [email, setEmail] = useState(me.email);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(
    () => () => {
      if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo);
    },
    [photo],
  );

  const save = (e: FormEvent) => {
    e.preventDefault();
    toast({ title: 'Profile saved', description: 'Your team will see the changes right away.' });
  };

  return (
    <SettingsSection
      title="Your details"
      aside={
        <Button type="submit" form="profile-details" size="sm" className="h-[30px] shadow-none">
          Save
        </Button>
      }
    >
      <form
        id="profile-details"
        onSubmit={save}
        className="flex flex-col gap-6 px-4 pb-[18px] sm:flex-row sm:items-start sm:px-[18px]"
      >
        <div className="flex shrink-0 flex-col items-center gap-2 self-start">
          <Avatar name={name} src={photo} size="xl" className="[&>img]:size-20 [&>span]:size-20" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setPhoto(URL.createObjectURL(file));
              toast({ title: 'Photo updated', description: 'Save to keep the new photo.' });
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-body-s leading-[18px] font-medium text-link hover:underline"
          >
            Change photo
          </button>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3.5 md:grid-cols-2">
          <Field label="Full name" className={compactField}>
            {(id) => (
              <Input
                id={id}
                className="px-2.5 text-13"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            )}
          </Field>
          <Field label="Job title" className={compactField}>
            {(id) => (
              <Input
                id={id}
                className="px-2.5 text-13"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="organization-title"
              />
            )}
          </Field>
          <Field label="Email" className={compactField}>
            {(id) => (
              <div className="flex flex-col gap-2">
                <Input
                  id={id}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="pr-24 pl-2.5 text-13"
                  rightSlot={
                    <Badge tone="ok" icon="check-sm" bordered={false} className="h-5 border-transparent">
                      Verified
                    </Badge>
                  }
                />
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-s text-warn-text">
                  <Icon name="clock" size={12} strokeWidth={2} />
                  Verify <b className="font-semibold">maya.chen@northwindlabs.com</b> to finish changing your
                  email ·
                  <button
                    type="button"
                    className="font-medium text-link hover:underline"
                    onClick={() =>
                      toast({ title: 'Verification email sent', description: 'maya.chen@northwindlabs.com' })
                    }
                  >
                    Resend
                  </button>
                </p>
              </div>
            )}
          </Field>
          <Field label="Password" className={compactField}>
            {(id) => (
              <div className="flex items-center gap-2">
                <Input
                  id={id}
                  type="password"
                  readOnly
                  value="password-set"
                  containerClassName="flex-1 min-w-0"
                  className="pr-28 pl-2.5 font-mono text-13"
                  rightSlot={
                    <span className="pr-1.5 text-body-s whitespace-nowrap text-fg-3">Changed Aug 3</span>
                  }
                />
                <Button
                  variant="secondary"
                  className="h-9 px-3.5 text-13"
                  onClick={() => setPasswordOpen(true)}
                >
                  Change
                </Button>
              </div>
            )}
          </Field>
        </div>
      </form>
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </SettingsSection>
  );
}

/** W12-01 · Profile */
export default function Profile() {
  return (
    <AccountLayout title="Profile" description="How you appear to your team.">
      <DetailsSection />
      <TwoFactorSection />

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <SettingsSection title="Sign-in methods">
          <div className="flex items-center gap-4 border-t border-border px-4 py-3 sm:px-[18px]">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-13 font-medium">Northwind SSO</span>
              <span className="text-body-s text-fg-3">idp.northwindlabs.com</span>
            </div>
            <Badge tone="ok" dot bordered={false} className="h-5 border-transparent">
              Connected
            </Badge>
          </div>
          <div className="flex items-center gap-4 border-t border-border px-4 py-3 sm:px-[18px]">
            <span className="min-w-0 flex-1 text-13 font-medium">Password</span>
            <Badge bordered={false} className="h-5 border-transparent">
              Backup for Owner
            </Badge>
          </div>
        </SettingsSection>

        <SettingsSection title="Danger zone" tone="danger">
          <div className="flex items-center gap-4 border-t border-border px-4 py-3 sm:px-[18px]">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-13 font-medium">Leave Northwind Labs</span>
              <span className="text-body-s text-fg-3">Transfer ownership first</span>
            </div>
            <Button variant="secondary" size="xs" disabled>
              Leave
            </Button>
          </div>
          <div className="flex items-center gap-4 border-t border-border px-4 py-3 sm:px-[18px]">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-13 font-medium">Delete my account</span>
              <span className="text-body-s text-fg-3">
                You’re the Owner. Transfer ownership before deleting your account.
              </span>
            </div>
            <Button variant="secondary" size="xs" disabled>
              Delete
            </Button>
          </div>
        </SettingsSection>
      </div>
    </AccountLayout>
  );
}

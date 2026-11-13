import { useId, useState } from 'react';
import { Badge, Button, Input, Switch, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { sessions as seedSessions } from './data';
import { SettingsCard, SettingsCardHeader, SettingsLayout, SettingsRow } from './components/SettingsLayout';
import { dangerSoft } from './components/styles';

const CURRENT_IP = '192.0.2.88';

/** True when the IP sits inside one of the comma-separated /8, /16 or /24 ranges. */
function ipAllowed(ip: string, ranges: string) {
  const list = ranges
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  if (!list.length) return true;
  return list.some((range) => {
    const [base, bits = '32'] = range.split('/');
    const octets = Math.min(4, Math.floor(Number(bits) / 8));
    return base.split('.').slice(0, octets).join('.') === ip.split('.').slice(0, octets).join('.');
  });
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  const Tag = htmlFor ? 'label' : 'span';
  return (
    <Tag htmlFor={htmlFor} className="text-body-s font-semibold text-fg-2">
      {children}
    </Tag>
  );
}

function SsoCard() {
  const toast = useToast();
  const id = useId();
  const [provisioning, setProvisioning] = useState(true);
  const [required, setRequired] = useState(false);
  const [testing, setTesting] = useState(false);

  const test = () => {
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      toast({
        title: 'SSO connection works',
        description: 'Signed in as daniel@northwindlabs.com through your IdP.',
      });
    }, 1200);
  };

  return (
    <SettingsCard aria-labelledby={`${id}-title`}>
      <SettingsCardHeader
        id={`${id}-title`}
        title="Single sign-on (SSO)"
        description="SAML with your identity provider. A Business feature, in your free trial until Nov 9."
        aside={
          <>
            <Badge tone="ai" bordered={false} className="h-5 border-transparent">
              Business trial
            </Badge>
            <Badge tone="ok" icon="check-sm" bordered={false} className="h-5 border-transparent">
              Tested · Oct 25
            </Badge>
          </>
        }
        className="pb-0"
      />
      <div className="grid grid-cols-1 gap-x-3 gap-y-4 px-[18px] pt-4 pb-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={`${id}-entity`}>Entity ID</FieldLabel>
          <Input
            id={`${id}-entity`}
            defaultValue="https://idp.northwindlabs.com/saml"
            className="font-mono text-body-s"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={`${id}-url`}>Sign-in URL</FieldLabel>
          <Input
            id={`${id}-url`}
            defaultValue="https://idp.northwindlabs.com/sso"
            className="font-mono text-body-s"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Certificate</FieldLabel>
          <div className="flex h-9 items-center gap-2 rounded-md border border-border-strong bg-surface pr-2 pl-3 text-13">
            <Icon name="file" size={15} className="shrink-0 text-icon" />
            <span className="min-w-0 flex-1 truncate text-fg">northwind-idp.pem</span>
            <Badge tone="warn" bordered={false} size="sm" className="h-5 border-transparent px-1.5">
              Expires in 21 days
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>User provisioning</FieldLabel>
          <div className="flex min-h-9 items-center gap-2.5">
            <Switch
              aria-label="User provisioning"
              checked={provisioning}
              onChange={(e) => setProvisioning(e.target.checked)}
            />
            <span className="text-13 text-fg-2">Create and remove members from your directory</span>
          </div>
        </div>
      </div>
      <SettingsRow
        label="Require SSO for everyone"
        description="Members must sign in through your identity provider. Owner keeps a password backup."
      >
        <div className="flex items-center gap-3">
          <Button size="sm" variant="secondary" loading={testing} onClick={test}>
            Test again
          </Button>
          <Switch
            aria-label="Require SSO for everyone"
            checked={required}
            onChange={(e) => {
              setRequired(e.target.checked);
              toast({
                tone: e.target.checked ? 'ok' : 'neutral',
                title: e.target.checked ? 'SSO is now required' : 'Password sign-in allowed again',
              });
            }}
          />
        </div>
      </SettingsRow>
    </SettingsCard>
  );
}

function TwoFactorCard() {
  const toast = useToast();
  const [required, setRequired] = useState(true);
  return (
    <SettingsCard className="flex-1">
      <SettingsCardHeader
        title="Two-factor authentication"
        aside={
          <Switch
            aria-label="Require two-factor authentication"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
          />
        }
        className="items-center"
      />
      <SettingsRow
        label="Require 2FA for all members"
        description="3 members haven’t set it up yet: Sofia Rossi, Omar Haddad, Jae Kim"
        className="items-start py-4"
      >
        <Button
          size="sm"
          variant="secondary"
          disabled={!required}
          onClick={() =>
            toast({ title: 'Reminders sent', description: 'Sofia, Omar and Jae will get an email today.' })
          }
        >
          Remind them
        </Button>
      </SettingsRow>
    </SettingsCard>
  );
}

function IpRangesCard() {
  const id = useId();
  const [ranges, setRanges] = useState('203.0.113.0/24, 198.51.100.0/24');
  const blocked = !ipAllowed(CURRENT_IP, ranges);
  return (
    <SettingsCard className="flex-1">
      <SettingsCardHeader
        title={<label htmlFor={id}>Allowed IP ranges</label>}
        aside={
          <Badge bordered={false} className="h-5 border-transparent">
            Optional
          </Badge>
        }
        className="items-center"
      />
      <div className="flex flex-col gap-2.5 px-[18px] pb-4">
        <Input
          id={id}
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
          invalid={blocked}
          aria-describedby={blocked ? `${id}-warn` : undefined}
          className="font-mono text-body-s"
        />
        {blocked && (
          <p
            id={`${id}-warn`}
            role="alert"
            className="flex items-center gap-2.5 rounded-[10px] bg-danger-subtle px-3.5 py-2.5 text-13 text-danger-text"
          >
            <Icon name="alert-triangle" size={16} strokeWidth={2} className="shrink-0" />
            Your current IP {CURRENT_IP} isn’t in this list. Saving would sign you out.
          </p>
        )}
      </div>
    </SettingsCard>
  );
}

function SessionsCard() {
  const toast = useToast();
  const [list, setList] = useState(seedSessions);
  const others = list.filter((s) => !s.current);
  return (
    <SettingsCard>
      <SettingsCardHeader
        title="Active sessions"
        description={`${list.length + 3} sessions across 4 members`}
        aside={
          <Button
            size="sm"
            variant="secondary"
            className={dangerSoft}
            disabled={others.length === 0}
            onClick={() => {
              setList((prev) => prev.filter((s) => s.current));
              toast({ title: 'Signed out everyone else', description: 'Only this device stays signed in.' });
            }}
          >
            Sign out everyone
          </Button>
        }
      />
      <ul>
        {list.map((s) => (
          <li key={s.id} className="flex items-center gap-3 border-t border-border px-[18px] py-2.5">
            <Icon
              name={s.device.includes('iPhone') ? 'phone' : 'monitor'}
              size={18}
              className="shrink-0 text-icon"
            />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1.5 text-13 font-medium text-fg">
                {s.device}
                {s.current && (
                  <Badge tone="brand" bordered={false} size="sm" className="border-transparent">
                    This device
                  </Badge>
                )}
              </p>
              <p className="text-body-s text-fg-3">
                {s.where} · {s.when}
              </p>
            </div>
            {!s.current && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setList((prev) => prev.filter((x) => x.id !== s.id));
                  toast({ title: 'Session signed out', description: `${s.device} · ${s.where}` });
                }}
              >
                Sign out
              </Button>
            )}
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}

/** W10-05 · Security (SSO, 2FA, IP ranges, sessions) */
export default function Security() {
  return (
    <SettingsLayout crumb="Security" title="Security" description="Sign-in rules and active sessions.">
      <SsoCard />
      <div className="flex flex-col gap-4 md:flex-row">
        <TwoFactorCard />
        <IpRangesCard />
      </div>
      <SessionsCard />
    </SettingsLayout>
  );
}

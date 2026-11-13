import { useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import { Avatar, Button, useToast } from '@/components/ui';
import { useDocumentTitle } from '@/lib/hooks';
import { people } from '@/data/people';
import { IconTile } from '@/components/ui/Tiles';
import { AppLogo } from './components/AppLogo';
import { consentScopes } from './data';

/** W8-03 · Permission consent — standalone OAuth-style screen shown by the app being connected. */
export default function Consent() {
  useDocumentTitle('Connect Pipeline CRM');
  const navigate = useNavigate();
  const toast = useToast();
  const account = people.daniel;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-[18px] bg-canvas px-4 py-10 text-fg sm:px-6">
      <p className="flex items-center gap-2 text-13 text-fg-3">
        <Icon name="lock" size={13} strokeWidth={2} />
        auth.pipelinecrm.example
      </p>

      <section
        aria-labelledby="consent-title"
        className="flex w-full max-w-[518px] flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-overlay sm:p-7"
      >
        <div className="flex items-center justify-center gap-3.5" aria-hidden>
          <span className="inline-flex size-12 items-center justify-center rounded-[18px] bg-brand text-[22px] font-bold text-white">
            S
          </span>
          <span className="inline-flex size-[34px] items-center justify-center rounded-full bg-subtle text-fg-2">
            <Icon name="link" size={16} strokeWidth={2} />
          </span>
          <AppLogo app="pipeline-crm" size={48} radius={18} />
        </div>

        <div className="flex flex-col gap-1.5 text-center">
          <h1 id="consent-title" className="text-h3 font-semibold text-fg">
            Northwind wants to access your Pipeline CRM
          </h1>
          <p className="text-13 text-fg-2">
            For the Northwind Labs workspace. You can turn off any action later in Integrations.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-fg-2">Account</span>
          <div className="flex min-h-[50px] items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 py-1.5">
            <Avatar name={account.name} src={account.avatar} size="sm" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-13 font-medium text-fg">{account.name}</span>
              <span className="truncate text-body-s text-fg-3">{account.email} · Admin</span>
            </div>
            <Button
              variant="link"
              className="text-body-s"
              onClick={() =>
                toast({
                  title: 'Choose another Pipeline CRM account',
                  description: 'You’ll be asked to sign in.',
                })
              }
            >
              Switch
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 pt-1">
          <span className="text-body-s font-semibold text-fg-2" id="consent-scopes">
            It will be able to
          </span>
          <ul aria-labelledby="consent-scopes" className="flex flex-col gap-3.5">
            {consentScopes.map((scope) => (
              <li key={scope.title} className="flex items-start gap-3">
                <IconTile
                  icon={scope.icon}
                  tone={scope.tone}
                  size={30}
                  iconSize={15}
                  className="rounded-md"
                />
                <div className="flex min-w-0 flex-col gap-px">
                  <span className="text-13 font-medium text-fg">{scope.title}</span>
                  <span className="text-body-s text-fg-3">{scope.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="lg"
            className="h-[42px] flex-1 text-13"
            onClick={() => navigate('/integrations')}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="h-[42px] flex-1 text-13"
            onClick={() => navigate('/integrations/pipeline-crm', { state: { connected: true } })}
          >
            Allow access
          </Button>
        </div>

        <p className="text-center text-body-s text-fg-3">
          You’re signed in to Pipeline CRM. Northwind never sees your Pipeline CRM password.
        </p>
      </section>
    </main>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Badge, Button, Card, Modal, Switch, useToast, type Tone } from '@/components/ui';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { IconTile } from '@/components/ui/Tiles';
import { AppLogo } from './components/AppLogo';
import { moreActions, pipelineActions, pipelineData, pipelineUsedBy, type ActionRisk } from './data';

const riskTone: Record<ActionRisk, Tone> = {
  Read: 'ok',
  Write: 'warn',
  'Deletes data': 'danger',
  'Spends money': 'danger',
};

/** Router state set by the consent screen after "Allow access". */
interface DetailState {
  connected?: boolean;
}

/** W8-02 · Integration detail — connection status, per-action switches, data access and usage. */
export default function IntegrationDetail() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [actions, setActions] = useState(pipelineActions);
  const [connected, setConnected] = useState(true);
  const [testing, setTesting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  // Coming back from the consent screen: confirm the new connection once.
  const announced = useRef(false);
  useEffect(() => {
    if ((location.state as DetailState | null)?.connected && !announced.current) {
      announced.current = true;
      toast({ title: 'Pipeline CRM connected', description: 'Agents can use it again.', tone: 'ok' });
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate, toast]);

  const toggle = (name: string, enabled: boolean) => {
    setActions((list) => list.map((a) => (a.name === name ? { ...a, enabled } : a)));
    toast({ title: `${name} turned ${enabled ? 'on' : 'off'} for every agent` });
  };

  const testConnection = () => {
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      toast({ title: 'Connection works', description: 'contacts.search answered in 212 ms.', tone: 'ok' });
    }, 900);
  };

  return (
    <AppShell
      active="Integrations"
      role="admin"
      crumbs={[{ label: 'Integrations', to: '/integrations' }, { label: 'Pipeline CRM' }]}
    >
      <nav aria-label="Integration location" className="flex items-center gap-2 text-13">
        <Link to="/integrations" className="font-medium text-link hover:underline">
          Integrations
        </Link>
        <span className="text-fg-3" aria-hidden>
          /
        </span>
        <span className="text-fg-2" aria-current="page">
          Pipeline CRM
        </span>
      </nav>

      <Card padding="none" className="flex flex-wrap items-center gap-3.5 rounded-[18px] px-5 py-[18px]">
        <AppLogo app="pipeline-crm" size={52} radius={13} />
        <div className="flex min-w-0 flex-1 basis-72 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-h3 font-semibold text-fg">Pipeline CRM</h1>
            {connected ? (
              <Badge tone="ok" dot bordered={false} className="h-[22px] border-transparent px-2 text-body-s">
                Connected
              </Badge>
            ) : (
              <Badge tone="neutral" bordered={false} className="h-[22px] border-transparent px-2 text-body-s">
                Not connected
              </Badge>
            )}
          </div>
          <p className="text-13 text-fg-2">
            CRM · 18 actions ·{' '}
            {connected
              ? 'Connected by Daniel Okafor on Sep 12 · last used 4 min ago'
              : 'Disconnected just now'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {connected ? (
            <>
              <Button variant="secondary" size="sm" loading={testing} onClick={testConnection}>
                Test connection
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="border-danger-border bg-danger-subtle text-danger-text hover:bg-danger-subtle hover:brightness-95"
                onClick={() => setConfirmDisconnect(true)}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/integrations/pipeline-crm/consent')}>
              Connect
            </Button>
          )}
        </div>
      </Card>

      {connected && (
        <InlineNotice
          tone="info"
          actions={
            <Button
              variant="secondary"
              size="xs"
              className="h-7 px-3 text-13"
              onClick={() => navigate('/integrations/pipeline-crm/consent')}
            >
              Switch account
            </Button>
          }
        >
          Connected with a personal account (daniel@northwindlabs.com). Use a shared service account so access
          doesn’t break if Daniel leaves.
        </InlineNotice>
      )}

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <Card padding="none" className="flex w-full min-w-0 flex-col gap-2 rounded-[18px] p-4 xl:flex-[1.4]">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Actions</h2>
            <span className="text-body-s text-fg-3">
              Turn off any action for every agent in the workspace
            </span>
          </div>
          <ul>
            {actions.map((action) => (
              <li
                key={action.name}
                className="flex items-center gap-3 border-t border-border py-2.5 transition-opacity"
              >
                <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5', !action.enabled && 'opacity-60')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-body-s font-medium text-fg">{action.name}</span>
                    <Badge
                      tone={riskTone[action.risk]}
                      bordered={false}
                      className="h-5 border-transparent px-2 text-body-s"
                    >
                      {action.risk}
                    </Badge>
                    {!action.enabled && (
                      <Badge
                        tone="neutral"
                        bordered={false}
                        className="h-5 border-transparent px-2 text-body-s"
                      >
                        Off for workspace
                      </Badge>
                    )}
                  </div>
                  <span className="text-body-s text-fg-3">{action.description}</span>
                </div>
                <Switch
                  aria-label={`Allow ${action.name}`}
                  checked={action.enabled}
                  onChange={(e) => toggle(action.name, e.target.checked)}
                />
              </li>
            ))}
          </ul>
          <p className="border-t border-border pt-2.5 text-body-s text-fg-3">+ {moreActions} more actions</p>
        </Card>

        <div className="flex w-full min-w-0 flex-col gap-4 xl:flex-1">
          <Card padding="none" className="flex flex-col gap-2 rounded-[18px] p-4">
            <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Data it can see</h2>
            <ul className="flex flex-col gap-2 text-13 leading-[19px] text-fg-2">
              {pipelineData.map((item) => (
                <li key={item} className="before:mr-1 before:content-['•']">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card padding="none" className="flex flex-col gap-2.5 rounded-[18px] p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Used by</h2>
              <span className="text-body-s text-fg-3">3 agents · 2 workflows</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {pipelineUsedBy.map((item) => (
                <li key={item.name}>
                  <Link to={item.to} className="group flex items-center gap-2.5">
                    <IconTile icon="nav-agents" tone={item.tone} size={26} iconSize={15} />
                    <span className="text-13 font-medium text-fg group-hover:text-link">{item.name}</span>
                    <span className="ml-auto text-body-s text-fg-3">{item.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Modal
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        size="sm"
        title="Disconnect Pipeline CRM?"
        description="3 agents and 2 workflows lose access right away. You can reconnect at any time."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmDisconnect(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setConnected(false);
                setConfirmDisconnect(false);
                toast({ title: 'Pipeline CRM disconnected' });
              }}
            >
              Disconnect
            </Button>
          </>
        }
      />
    </AppShell>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Badge, Button, Card, EmptyState, Input, Tabs, useToast } from '@/components/ui';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { IntegrationsShell } from './components/IntegrationsShell';
import { AppLogo } from './components/AppLogo';
import { apps, catalogueSize, type IntegrationApp } from './data';
import { compactTabs } from './utils';

const DETAIL = '/integrations/pipeline-crm';
const CONSENT = '/integrations/pipeline-crm/consent';

function AppStatusBadge({ status }: { status: IntegrationApp['status'] }) {
  const pill = 'border-transparent h-[22px] px-2 text-body-s';
  switch (status) {
    case 'connected':
      return (
        <Badge tone="ok" dot bordered={false} className={pill}>
          Connected
        </Badge>
      );
    case 'reconnect':
      return (
        <Badge tone="danger" icon="alert-triangle" bordered={false} className={pill}>
          Reconnect needed
        </Badge>
      );
    case 'plan':
      return (
        <Badge tone="ai" icon="lock" bordered={false} className={pill}>
          Business plan
        </Badge>
      );
    default:
      return (
        <Badge tone="neutral" bordered={false} className={pill}>
          Not connected
        </Badge>
      );
  }
}

function AppCard({ app }: { app: IntegrationApp }) {
  const navigate = useNavigate();
  const action = {
    connected: { label: 'Manage', variant: 'secondary', to: DETAIL },
    reconnect: { label: 'Reconnect', variant: 'primary', to: CONSENT },
    available: { label: 'Connect', variant: 'primary', to: CONSENT },
    plan: { label: 'Upgrade', variant: 'secondary', to: '/settings/plans' },
  } as const;
  const a = action[app.status];
  return (
    <Card
      padding="none"
      className="relative flex flex-col gap-3 rounded-[18px] p-4 transition-shadow focus-within:shadow-raised hover:shadow-raised"
    >
      <div className="flex items-center gap-3">
        <AppLogo app={app.id} />
        <div className="flex min-w-0 flex-col gap-px">
          <h2 className="text-body-m font-semibold text-fg">
            <Link
              to={DETAIL}
              className="after:absolute after:inset-0 after:rounded-[18px] focus-visible:outline-none"
            >
              {app.name}
            </Link>
          </h2>
          <span className="text-body-s text-fg-3">
            {app.category} · {app.actions} actions
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AppStatusBadge status={app.status} />
        <Button
          variant={a.variant}
          size="sm"
          className="relative z-10 ml-auto h-[30px]"
          aria-label={`${a.label} ${app.name}`}
          onClick={() => navigate(a.to)}
        >
          {a.label}
        </Button>
      </div>
      {app.note && <span className="text-body-s font-medium text-danger-text">{app.note}</span>}
    </Card>
  );
}

/** W8-01 · Integrations directory — filterable grid of app cards. */
export default function Integrations() {
  const toast = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<'all' | 'connected'>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const connectedCount = apps.filter((a) => a.status === 'connected' || a.status === 'reconnect').length;
  const categories = [
    { value: 'All', count: catalogueSize },
    ...[...new Set(apps.map((a) => a.category))].map((c) => ({
      value: c,
      count: apps.filter((a) => a.category === c).length,
    })),
  ];

  const q = query.trim().toLowerCase();
  const visible = apps.filter(
    (a) =>
      (view === 'all' || a.status === 'connected' || a.status === 'reconnect') &&
      (category === 'All' || a.category === category) &&
      (!q || `${a.name} ${a.category}`.toLowerCase().includes(q)),
  );

  return (
    <IntegrationsShell tab="/integrations" current="Apps">
      <div className="flex flex-wrap items-end gap-3">
        <Tabs
          label="Filter apps"
          className={compactTabs}
          value={view}
          onChange={setView}
          items={[
            { value: 'all', label: 'All apps', count: catalogueSize },
            { value: 'connected', label: 'Connected', count: connectedCount },
          ]}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Input
            pill
            size="sm"
            leftIcon="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${catalogueSize} apps`}
            aria-label="Search apps"
            containerClassName="w-full sm:w-[260px]"
            className="h-[34px] border-border text-13"
          />
          <FilterSelect
            label="Category"
            value={category}
            options={categories}
            count={categories.find((c) => c.value === category)?.count}
            onChange={setCategory}
            align="end"
          />
          <Button
            variant="link"
            className="ml-1 text-13"
            onClick={() =>
              toast({ title: 'Request sent', description: 'We’ll let you know when the app is added.' })
            }
          >
            Request an app
          </Button>
        </div>
      </div>

      <InlineNotice
        tone="danger"
        title="Pipeline CRM needs reconnecting."
        className="rounded-[14px]"
        actions={
          <Button
            variant="secondary"
            size="xs"
            className="h-7 px-3 text-13"
            onClick={() => navigate(CONSENT)}
          >
            Reconnect
          </Button>
        }
      >
        The authorisation expired on Oct 24. Support Agent, Sales Researcher and Weekly sales recap can’t use
        it.
      </InlineNotice>

      {visible.length ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((app) => (
            <li key={app.id} className="flex flex-col [&>*]:flex-1">
              <AppCard app={app} />
            </li>
          ))}
        </ul>
      ) : (
        <Card padding="none">
          <EmptyState
            icon="integration"
            title="No apps match"
            description="Try another name or category, or request the app you need."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setCategory('All');
                  setView('all');
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Card>
      )}
    </IntegrationsShell>
  );
}

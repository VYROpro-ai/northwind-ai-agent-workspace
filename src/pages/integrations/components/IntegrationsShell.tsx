import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import { Tabs } from '@/components/ui';
import type { Role } from '@/data/people';
import { compactTabs } from '../utils';

const integrationTabs = [
  { value: '/integrations', label: 'Apps' },
  { value: '/integrations/api-keys', label: 'API keys' },
  { value: '/integrations/webhooks', label: 'Webhooks' },
  { value: '/integrations/tools/check-stock-level', label: 'Custom tools' },
];

/** App shell + "Integrations" header + section tabs shared by the W8 list screens. */
export function IntegrationsShell({
  current,
  tab,
  role = 'admin',
  actions,
  children,
}: {
  current: string;
  /** Route of the active section tab. */
  tab: string;
  role?: Role;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <AppShell
      active="Integrations"
      role={role}
      crumbs={[{ label: 'Integrations', to: '/integrations' }, { label: current }]}
    >
      <PageHeader
        title="Integrations"
        description="Connect the apps your agents work with."
        actions={actions}
      />
      <Tabs
        label="Integrations sections"
        items={integrationTabs}
        value={tab}
        onChange={(to) => navigate(to)}
        className={compactTabs}
      />
      {children}
    </AppShell>
  );
}

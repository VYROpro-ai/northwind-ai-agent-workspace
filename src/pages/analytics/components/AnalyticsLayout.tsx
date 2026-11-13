import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import { Tabs } from '@/components/ui';
import type { Role } from '@/data/people';

export type AnalyticsTab = 'usage' | 'cost' | 'agents' | 'feedback' | 'latency';

const tabs: { value: AnalyticsTab; label: string; crumb: string; to: string }[] = [
  { value: 'usage', label: 'Usage', crumb: 'Usage', to: '/analytics' },
  { value: 'cost', label: 'Token & cost', crumb: 'Token & cost', to: '/analytics/cost' },
  { value: 'agents', label: 'Agent performance', crumb: 'Agent performance', to: '/analytics/agents' },
  { value: 'feedback', label: 'Feedback', crumb: 'Feedback', to: '/analytics/feedback' },
  {
    value: 'latency',
    label: 'Latency & reliability',
    crumb: 'Latency & reliability',
    to: '/analytics/latency',
  },
];

/** Shared frame for every Analytics tab: shell, page title and the section tabs. */
export function AnalyticsLayout({
  tab,
  role = 'owner',
  children,
}: {
  tab: AnalyticsTab;
  role?: Role;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const current = tabs.find((t) => t.value === tab) ?? tabs[0];
  return (
    <AppShell
      active="Analytics"
      role={role}
      crumbs={[{ label: 'Analytics', to: '/analytics' }, { label: current.crumb }]}
    >
      <PageHeader title="Analytics" description="Usage across the Northwind Labs workspace" />
      <Tabs
        label="Analytics sections"
        items={tabs.map(({ value, label }) => ({ value, label }))}
        value={tab}
        onChange={(value) => navigate(tabs.find((t) => t.value === value)?.to ?? '/analytics')}
        className={
          'gap-[22px] [&>button]:h-[37px] [&>button]:px-0 [&>button]:text-13 ' +
          '[&>[aria-selected=true]]:font-semibold'
        }
      />
      {children}
    </AppShell>
  );
}

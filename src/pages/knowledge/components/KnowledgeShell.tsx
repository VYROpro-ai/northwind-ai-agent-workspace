import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import { Tabs } from '@/components/ui';
import type { Role } from '@/data/people';

const knowledgeTabs = [
  { value: '/knowledge', label: 'Sources' },
  { value: '/knowledge/indexing', label: 'Indexing' },
  { value: '/knowledge/retrieval-test', label: 'Retrieval test' },
  { value: '/knowledge/sync', label: 'Sync settings' },
];

/** Board tabs: 13 px labels, 22 px apart, semibold when active. */
const compactTabs =
  'gap-[22px] [&>[role=tab]]:h-[38px] [&>[role=tab]]:px-0 [&>[role=tab]]:text-13 [&>[aria-selected=true]]:font-semibold';

/** App shell + "Knowledge" page header + section tabs shared by the W7 list screens. */
export function KnowledgeShell({
  current,
  tab,
  role = 'builder',
  actions,
  children,
}: {
  /** Current crumb, e.g. "Sources". */
  current: string;
  /** Route of the active section tab (state routes such as /knowledge/upload keep "Sources"). */
  tab: string;
  role?: Role;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <AppShell
      active="Knowledge"
      role={role}
      crumbs={[{ label: 'Knowledge', to: '/knowledge' }, { label: current }]}
    >
      <PageHeader title="Knowledge" description="What your agents can search and cite." actions={actions} />
      <Tabs
        label="Knowledge sections"
        items={knowledgeTabs}
        value={tab}
        onChange={(to) => navigate(to)}
        className={compactTabs}
      />
      {children}
    </AppShell>
  );
}

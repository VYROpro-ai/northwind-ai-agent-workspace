import { useNavigate } from 'react-router';
import { AppShell, type AppShellProps } from '@/layouts/AppShell';
import { Button } from '@/components/ui';
import { attention, kpis } from './data';
import { AttentionCard, KpiCard } from './components/Highlights';
import { CreditUsageCard } from './components/CreditUsageCard';
import { RecentRunsCard } from './components/RecentRunsCard';
import { RunsByStatusCard } from './components/RunsByStatusCard';
import { TopAgentsCard } from './components/TopAgentsCard';
import { WaitingForYouCard } from './components/WaitingForYouCard';

export interface OverviewProps {
  /** Opens the command palette or notifications drawer on load (W12-04 / W2-04 state routes). */
  initialOverlay?: AppShellProps['initialOverlay'];
}

/** W2-01 · Overview dashboard */
export default function Overview({ initialOverlay }: OverviewProps) {
  const navigate = useNavigate();
  return (
    <AppShell
      active="Home"
      role="owner"
      crumbs={[{ label: 'Home' }]}
      wash
      mainClassName="lg:px-6 lg:pb-6"
      initialOverlay={initialOverlay}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[26px] leading-8 font-semibold tracking-[-0.03em]">
            Good morning, Maya <span aria-hidden>👋</span>
          </h1>
          <p className="text-13 text-fg-2">Sunday, Oct 25, 2026 · 4 things need you today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            leftIcon="chat"
            className="h-10 border-border pr-4 pl-3"
            onClick={() => navigate('/chat')}
          >
            Start chat
          </Button>
          <Button
            variant="secondary"
            leftIcon="workflow"
            className="h-10 border-border pr-4 pl-3"
            onClick={() => navigate('/workflows/editor')}
          >
            New workflow
          </Button>
          <Button
            leftIcon="plus"
            className="h-10 pr-[18px] pl-3.5"
            onClick={() => navigate('/agents/new/basics')}
          >
            New agent
          </Button>
        </div>
      </div>

      <section aria-label="Needs attention" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {attention.map((item) => (
          <AttentionCard key={item.title} item={item} />
        ))}
      </section>

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.05fr)_minmax(0,1fr)]">
        <RunsByStatusCard />
        <CreditUsageCard />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1.15fr)]">
        <RecentRunsCard />
        <div className="flex min-w-0 flex-col gap-4">
          <TopAgentsCard />
          <WaitingForYouCard />
        </div>
      </div>
    </AppShell>
  );
}

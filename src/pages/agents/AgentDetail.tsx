import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Icon } from '@/components/icons';
import { Avatar, AvatarGroup, Button, Card, Progress, useToast } from '@/components/ui';
import { people } from '@/data/people';
import {
  agentKnowledge,
  agentTags,
  agentTools,
  detailStats,
  failureReasons,
  latestFeedback,
  publishIndex,
  runsAxis,
  runsDates,
  runsPerDay,
} from './data';
import { AgentHeader } from './components/AgentHeader';
import { ArchiveDialog } from './components/ArchiveDialog';
import { RunsChart } from './components/RunsChart';
import { ShareDialog } from './components/ShareDialog';

export type AgentDialog = 'archive' | 'share';

function SideCard({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <Card padding="none" className="flex flex-col gap-2.5 p-[18px]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-body-m font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </Card>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[26px] items-center gap-[5px] rounded-sm bg-subtle px-2 text-body-s">
      {children}
    </span>
  );
}

/** W3-02 · Agent detail (overview). `dialog` opens the archive or share dialog on load (W3-11, W3-12). */
export default function AgentDetail({ dialog }: { dialog?: AgentDialog }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState<AgentDialog | null>(dialog ?? null);
  const maxFailures = Math.max(...failureReasons.map((f) => f.count));

  const archive = () => {
    setOpen(null);
    toast({
      title: 'Support Agent archived',
      description: '3 workflows paused safely.',
      action: { label: 'Undo', onClick: () => toast({ tone: 'neutral', title: 'Support Agent restored' }) },
    });
    navigate('/agents');
  };

  return (
    <AppShell
      active="Agents"
      role="builder"
      bare
      crumbs={[{ label: 'Agents', to: '/agents' }, { label: 'Support Agent' }]}
    >
      <AgentHeader tab="Overview" onShare={() => setOpen('share')} onArchive={() => setOpen('archive')} />

      <div className="flex flex-col items-start gap-6 px-4 pt-6 pb-10 sm:px-6 lg:px-8 xl:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-4">
            {detailStats.map((s) => (
              <Card key={s.label} padding="sm" className="flex flex-col gap-1.5">
                <span className="text-13 font-medium text-fg-2">{s.label}</span>
                <span className="text-h2 font-semibold tracking-[-0.02em] tabular">{s.value}</span>
                <span className={cn('text-body-s font-medium', s.trend ? 'text-ok-text' : 'text-fg-2')}>
                  {s.trend && <span aria-label="Up">▲ </span>}
                  {s.delta}
                </span>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-h4 font-semibold">Runs per day</h2>
                <p className="text-body-s text-fg-2">Last 30 days · all versions</p>
              </div>
              <div className="flex items-center gap-1.5 text-body-s text-fg-2">
                <span className="h-0.5 w-3.5 bg-chart-1" aria-hidden />
                Runs
                <span className="mx-1 h-3 w-px bg-border" aria-hidden />
                <span className="w-3.5 border-t-2 border-dashed border-fg-3" aria-hidden />
                v4 published
              </div>
            </div>
            <RunsChart
              data={runsPerDay}
              labels={runsDates}
              marker={publishIndex}
              markerLabel="v4 published"
              axis={runsAxis}
            />
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="flex flex-col gap-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-h4 font-semibold">Top failure reasons</h2>
                <span className="text-body-s text-fg-3">71 failed runs · 7 d</span>
              </div>
              <ul className="flex flex-col gap-3.5">
                {failureReasons.map((f) => (
                  <li key={f.label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-13">
                      <span>{f.label}</span>
                      <span className="font-mono text-body-s text-fg-2">{f.count}</span>
                    </div>
                    <Progress value={(f.count / maxFailures) * 100} label={f.label} />
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="flex flex-col gap-1">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-h4 font-semibold">Latest feedback</h2>
                <span className="text-body-s text-fg-3">91% thumbs up</span>
              </div>
              <ul>
                {latestFeedback.map((f) => (
                  <li key={f.text} className="flex gap-2.5 border-t border-border py-2.5">
                    <span
                      className={cn(
                        'inline-flex size-[26px] shrink-0 items-center justify-center rounded-full',
                        f.positive ? 'bg-ok-subtle text-ok-text' : 'bg-danger-subtle text-danger-text',
                      )}
                    >
                      <Icon
                        name={f.positive ? 'thumbs-up' : 'thumbs-down'}
                        size={13}
                        strokeWidth={2}
                        label={f.positive ? 'Thumbs up' : 'Thumbs down'}
                      />
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-13">{f.text}</span>
                      <span className="text-body-s text-fg-3">{f.meta}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <aside
          aria-label="About this agent"
          className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:flex xl:w-[280px] xl:shrink-0 xl:flex-col 2xl:w-[340px]"
        >
          <SideCard title="Details">
            <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-y-2.5 text-13">
              <dt className="text-fg-2">Owner</dt>
              <dd className="inline-flex items-center gap-1.5">
                <Avatar name={people.priya.name} src={people.priya.avatar} size="xs" />
                Priya Nair
              </dd>
              <dt className="text-fg-2">Created</dt>
              <dd>Sep 12, 2026</dd>
              <dt className="text-fg-2">Last edited</dt>
              <dd>Today, 9:20 AM</dd>
              <dt className="text-fg-2">Tags</dt>
              <dd className="flex flex-wrap gap-1">
                {agentTags.map((t) => (
                  <span
                    key={t}
                    className="h-5 rounded-xs border border-border px-1.5 text-caption leading-[18px] text-fg-2"
                  >
                    {t}
                  </span>
                ))}
              </dd>
            </dl>
          </SideCard>

          <SideCard
            title="Who can use it"
            aside={
              <Button variant="link" className="text-body-s" onClick={() => setOpen('share')}>
                Manage
              </Button>
            }
          >
            <p className="text-13 text-fg-2">Whole workspace · 24 people can chat · 3 can edit</p>
            <AvatarGroup
              people={[
                ...[people.maya, people.priya, people.daniel].map((p) => ({ name: p.name, src: p.avatar })),
                ...Array.from({ length: 15 }, (_, i) => ({ name: `Member ${i + 1}` })),
              ]}
              max={3}
            />
          </SideCard>

          <SideCard title="Tools · 6" aside={<span className="text-body-s text-fg-3">2 ask first</span>}>
            <ul className="flex flex-wrap gap-1.5">
              {agentTools.map((t) => (
                <li key={t.name}>
                  <Chip>
                    {t.name}
                    {t.askFirst && (
                      <Icon
                        name="approval"
                        size={11}
                        strokeWidth={2.25}
                        className="text-warn-text"
                        label="Asks first"
                      />
                    )}
                  </Chip>
                </li>
              ))}
            </ul>
          </SideCard>

          <SideCard title="Knowledge · 3">
            <ul className="flex flex-wrap gap-1.5">
              {agentKnowledge.map((k) => (
                <li key={k}>
                  <Chip>{k}</Chip>
                </li>
              ))}
            </ul>
          </SideCard>
        </aside>
      </div>

      <ArchiveDialog open={open === 'archive'} onClose={() => setOpen(null)} onArchive={archive} />
      <ShareDialog open={open === 'share'} onClose={() => setOpen(null)} />
    </AppShell>
  );
}

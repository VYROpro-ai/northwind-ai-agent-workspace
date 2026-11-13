import { useState } from 'react';
import { LineChart } from '@/components/charts';
import { AgentAvatar, Avatar } from '@/components/ui';
import { roleLabels } from '@/data/people';
import { AnalyticsLayout } from './components/AnalyticsLayout';
import { AnalyticsToolbar } from './components/AnalyticsToolbar';
import { ChartCard, RankBars, StatGrid } from './components/Panels';
import { StackedBars } from './components/StackedBars';
import {
  dailyActiveUsers,
  formatK,
  leastUsedAgents,
  niceTicks,
  rangeCaption,
  rangeSeries,
  rangeShort,
  runsBySource,
  runsByTeam,
  topUsers,
  usageKpis,
  type RangeKey,
} from './data';

const sourceSegments = [
  { name: 'Chat', color: 'var(--chart-1)' },
  { name: 'Workflow', color: 'var(--chart-2)' },
  { name: 'API', color: 'var(--chart-3)' },
];

/** W9-01 · Usage overview. `exportOpen` renders W9-06 (export dialog open on top). */
export default function Usage({ exportOpen = false }: { exportOpen?: boolean }) {
  const [range, setRange] = useState<RangeKey>('30d');
  const [compare, setCompare] = useState(true);

  const current = rangeSeries(dailyActiveUsers.current, range);
  const previous = rangeSeries(dailyActiveUsers.previous, range);
  const source = runsBySource[range];
  const sourceMax = Math.max(...source.labels.map((_, i) => source.values.reduce((s, v) => s + v[i], 0)));

  const dauSeries = [
    { name: 'This period', data: current.data, color: 'var(--chart-1)' },
    ...(compare ? [{ name: 'Previous', data: previous.data, color: 'var(--chart-3)', dashed: true }] : []),
  ];

  return (
    <AnalyticsLayout tab="usage">
      <AnalyticsToolbar
        range={range}
        onRangeChange={setRange}
        compare={compare}
        onCompareChange={setCompare}
        report={exportOpen ? 'cost' : 'usage'}
        exportOpen={exportOpen}
      />

      <StatGrid kpis={usageKpis[range]} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartCard
          title="Daily active users"
          subtitle={`${rangeCaption[range]}${compare ? ` · dashed line is the previous ${rangeShort[range].replace(' d', ' days')}` : ''}`}
          legend={dauSeries.map(({ name, color }) => ({ name, color }))}
        >
          <LineChart labels={current.labels} series={dauSeries} height={180} yTicks={4} max={40} />
        </ChartCard>
        <ChartCard
          title="Runs by source"
          subtitle={
            range === 'today'
              ? 'Per 6 hours'
              : range === '7d'
                ? 'Per day'
                : range === '90d'
                  ? 'Per month'
                  : 'Per week'
          }
          legend={sourceSegments}
        >
          <StackedBars
            labels={source.labels}
            values={source.values}
            segments={sourceSegments}
            ticks={niceTicks(sourceMax)}
            format={formatK}
            barWidth={0.55}
            height={172}
            className="mt-auto"
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Runs by team" subtitle="Last 30 days">
          <RankBars items={runsByTeam} label="Runs by team" />
        </ChartCard>

        <ChartCard title="Top users">
          <ul className="flex flex-col gap-3">
            {topUsers.map(({ person, team, value, unit }) => (
              <li key={person.id} className="flex items-center gap-2.5">
                <Avatar name={person.name} src={person.avatar} size="sm" className="[&_img]:size-[26px]" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-13 leading-[19px] font-medium text-fg">{person.name}</span>
                  <span className="truncate text-body-s leading-[18px] text-fg-3">
                    {team} · {roleLabels[person.role]}
                  </span>
                </div>
                <span className="ml-auto shrink-0 text-13 font-medium text-fg tabular">
                  {value} {unit}
                </span>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Least-used agents" className="md:col-span-2 xl:col-span-1">
          <ul className="flex flex-col gap-3">
            {leastUsedAgents.map((agent) => (
              <li key={agent.name} className="flex items-center gap-2.5">
                <AgentAvatar tone={agent.tone} size={26} className="rounded-[7px]" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-13 leading-[19px] font-medium text-fg">{agent.name}</span>
                  <span className="truncate text-body-s leading-[18px] text-fg-3">{agent.meta}</span>
                </div>
                <span className="ml-auto shrink-0 text-13 text-fg-3 tabular">{agent.runs} runs</span>
              </li>
            ))}
          </ul>
          <p className="text-body-s text-fg-3">Archive agents nobody uses to keep the library tidy.</p>
        </ChartCard>
      </div>
    </AnalyticsLayout>
  );
}

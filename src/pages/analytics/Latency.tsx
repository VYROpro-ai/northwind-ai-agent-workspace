import { useState } from 'react';
import { Link } from 'react-router';
import { Table, TableContainer, TBody, TD, TH, THead, TR } from '@/components/ui';
import { cn } from '@/lib/cn';
import { AnalyticsLayout } from './components/AnalyticsLayout';
import { AnalyticsToolbar } from './components/AnalyticsToolbar';
import { IncidentLineChart } from './components/IncidentLineChart';
import { ChartCard, StatGrid } from './components/Panels';
import { StackedBars } from './components/StackedBars';
import {
  failuresByCause,
  latencyIncident,
  latencyKpis,
  latencySeries,
  niceTicks,
  rangeSeries,
  slowestSteps,
  slowStepThreshold,
  uptime,
  type RangeKey,
} from './data';

const causeSegments = [
  { name: 'Model timeout', color: 'var(--chart-1)' },
  { name: 'Tool error', color: 'var(--chart-2)' },
  { name: 'Guardrail', color: 'var(--chart-4)' },
];

/** W9-05 · Latency & reliability. */
export default function Latency() {
  const [range, setRange] = useState<RangeKey>('30d');
  const [compare, setCompare] = useState(true);

  const p50 = rangeSeries(latencySeries.p50, range);
  const p95 = rangeSeries(latencySeries.p95, range);
  const causes = failuresByCause.map((seg) => rangeSeries(seg, range).data.map((v) => Math.round(v)));
  const causeLabels = rangeSeries(failuresByCause[0], range).labels;
  const causeMax = Math.max(...causeLabels.map((_, i) => causes.reduce((s, seg) => s + seg[i], 0)));

  return (
    <AnalyticsLayout tab="latency" role="builder">
      <AnalyticsToolbar
        range={range}
        onRangeChange={setRange}
        compare={compare}
        onCompareChange={setCompare}
        report="performance"
      />

      <StatGrid kpis={latencyKpis[range]} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Latency"
          subtitle="p50 and p95 · seconds"
          legend={[
            { name: 'p50', color: 'var(--chart-1)' },
            { name: 'p95', color: 'var(--chart-2)' },
          ]}
        >
          <IncidentLineChart
            labels={p50.labels}
            series={[
              { name: 'p95', data: p95.data, color: 'var(--chart-2)' },
              { name: 'p50', data: p50.data, color: 'var(--chart-1)' },
            ]}
            format={(v) => `${v} s`}
            incident={latencyIncident}
            height={180}
          />
        </ChartCard>
        <ChartCard
          title="Failures by cause"
          subtitle={range === 'today' ? 'Per hour' : range === '90d' ? 'Per week' : 'Per day'}
          legend={causeSegments}
        >
          <StackedBars
            labels={causeLabels}
            values={causes}
            segments={causeSegments}
            ticks={niceTicks(causeMax)}
            labelEvery={range === '7d' ? 1 : 3}
            barWidth={0.7}
            height={130}
            className="mt-auto"
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.27fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Uptime, last 30 days</h2>
            <span className="text-body-s text-fg-3">Each block is a day</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {uptime.map((row) => (
              <li
                key={row.name}
                className="grid grid-cols-[minmax(0,110px)_minmax(0,1fr)_56px] items-center gap-3 sm:grid-cols-[150px_minmax(0,1fr)_56px]"
              >
                <span className="truncate text-13 font-medium text-fg">{row.name}</span>
                <span
                  className="flex gap-0.5"
                  role="img"
                  aria-label={`${row.name}: ${row.days.filter((d) => !d).length} days with incidents`}
                >
                  {row.days.map((up, i) => (
                    <span
                      key={i}
                      title={`Oct ${i + 1}${up ? '' : ' · incident'}`}
                      className={cn('h-[18px] min-w-0 flex-1 rounded-[2px]', up ? 'bg-ok' : 'bg-danger')}
                    />
                  ))}
                </span>
                <span className="text-right font-mono text-body-s text-fg-2">{row.uptime}</span>
              </li>
            ))}
          </ul>
          <p className="text-body-s text-fg-3">
            SEV1 on Oct 20–21:{' '}
            <Link to="/runs/incidents" className="font-medium text-link hover:underline">
              Model B timeouts in all regions
            </Link>
          </p>
        </section>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <TableContainer>
            <Table className="min-w-[360px] text-13">
              <THead className="bg-sunken">
                <TR>
                  <TH className="font-medium">Slowest steps</TH>
                  <TH className="text-right font-medium">Avg</TH>
                  <TH className="text-right font-medium">p95</TH>
                </TR>
              </THead>
              <TBody>
                {slowestSteps.map((s) => (
                  <TR key={s.step + s.owner}>
                    <TD className="h-[39px] font-mono text-body-s">
                      {s.step} · {s.owner}
                    </TD>
                    <TD className="h-[39px] text-right tabular">{s.avg.toFixed(1)} s</TD>
                    <TD
                      className={cn(
                        'h-[39px] text-right tabular',
                        s.p95 > slowStepThreshold && 'font-semibold text-danger-text',
                      )}
                    >
                      {s.p95.toFixed(1)} s
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </AnalyticsLayout>
  );
}

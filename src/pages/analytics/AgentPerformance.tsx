import { useState } from 'react';
import { Link } from 'react-router';
import { Sparkline } from '@/components/charts';
import { AgentAvatar, Table, TableContainer, TBody, TD, TH, THead, TR } from '@/components/ui';
import { Icon } from '@/components/icons';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { AnalyticsLayout } from './components/AnalyticsLayout';
import { AnalyticsToolbar } from './components/AnalyticsToolbar';
import { ChartCard } from './components/Panels';
import { ScatterPlot } from './components/ScatterPlot';
import { agentPerformance, rangeFactor, thumbsUpAlert, type RangeKey } from './data';

const agentRoute = '/agents/support-agent';

/** W9-03 · Agent performance. */
export default function AgentPerformance() {
  const [range, setRange] = useState<RangeKey>('30d');
  const [compare, setCompare] = useState(true);
  const factor = rangeFactor[range];

  const scored = agentPerformance.filter((a) => a.costPerRun !== undefined && a.thumbsUp !== undefined);
  const points = scored.map((a) => ({
    name: a.name,
    x: a.costPerRun ?? 0,
    y: a.thumbsUp ?? 0,
    size: a.runs,
    labelSide: a.labelSide,
    detail: `$${a.costPerRun?.toFixed(3)} per run · ${a.thumbsUp}% thumbs up · ${formatNumber(a.runs)} runs`,
  }));

  return (
    <AnalyticsLayout tab="agents" role="builder">
      <AnalyticsToolbar
        range={range}
        onRangeChange={setRange}
        compare={compare}
        onCompareChange={setCompare}
        report="performance"
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <TableContainer>
          <Table className="min-w-[760px] text-13">
            <THead className="bg-sunken">
              <TR>
                <TH className="font-medium">Agent</TH>
                <TH className="w-[96px] text-right font-medium">Success</TH>
                <TH className="w-[80px] text-right font-medium">Latency</TH>
                <TH className="w-[86px] text-right font-medium">Cost/run</TH>
                <TH className="w-[86px] text-right font-medium">
                  <Icon name="thumbs-up" size={13} strokeWidth={2} label="Thumbs-up" />
                  rate
                </TH>
                <TH className="w-[70px] text-right font-medium">Eval</TH>
                <TH className="w-[96px] font-medium">Trend</TH>
              </TR>
            </THead>
            <TBody>
              {agentPerformance.map((agent) => {
                const runs = Math.max(1, Math.round(agent.runs * factor));
                const noData = agent.success === undefined;
                return (
                  <TR key={agent.name} className={cn('hover:bg-sunken', noData && 'opacity-60')}>
                    <TD className="h-[58px]">
                      <div className="flex items-center gap-2.5">
                        {agent.tone === 'neutral' ? (
                          <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-subtle text-fg-2">
                            <Icon name="nav-agents" size={15} strokeWidth={1.8} />
                          </span>
                        ) : (
                          <AgentAvatar tone={agent.tone} size={26} className="rounded-[7px]" />
                        )}
                        <div className="flex min-w-0 flex-col">
                          <Link
                            to={agentRoute}
                            className="truncate font-semibold text-fg underline-offset-2 hover:underline"
                          >
                            {agent.name}
                          </Link>
                          <span className="text-body-s text-fg-3">
                            {formatNumber(runs)} runs{noData && ' · not enough data yet'}
                          </span>
                        </div>
                      </div>
                    </TD>
                    {noData ? (
                      <>
                        <TD className="text-right text-fg-disabled" aria-label="No data">
                          —
                        </TD>
                        <TD className="text-body-s text-fg-disabled" aria-label="No data">
                          —
                        </TD>
                        <TD colSpan={4}>
                          <span className="sr-only">Not enough data yet</span>
                        </TD>
                      </>
                    ) : (
                      <>
                        <TD className="text-right tabular">{agent.success}%</TD>
                        <TD className="text-right tabular">{agent.latency?.toFixed(1)} s</TD>
                        <TD className="text-right tabular">${agent.costPerRun?.toFixed(3)}</TD>
                        <TD
                          className={cn(
                            'text-right tabular',
                            (agent.thumbsUp ?? 100) < thumbsUpAlert && 'font-semibold text-danger-text',
                          )}
                        >
                          {agent.thumbsUp}%
                        </TD>
                        <TD className="text-right tabular">{agent.eval}%</TD>
                        <TD>
                          {agent.trend && (
                            <Sparkline
                              data={agent.trend}
                              color="var(--chart-1)"
                              width={72}
                              height={22}
                              className="h-[22px] w-[72px]"
                            />
                          )}
                        </TD>
                      </>
                    )}
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      <ChartCard
        title="Cost vs satisfaction"
        subtitle="Each dot is an agent · size shows runs"
        className="w-full xl:max-w-[794px]"
      >
        <ScatterPlot
          points={points}
          xTicks={[0, 0.1, 0.2, 0.3]}
          yTicks={[60, 70, 80, 90, 100]}
          xMax={0.35}
          formatX={(v) => `$${v.toFixed(2)}`}
          formatY={(v) => `${v}%`}
          zone={{ minX: 0.2, maxY: 80, label: 'Costly and unloved' }}
          initialActive="Research Writer"
          to={agentRoute}
        />
      </ChartCard>
      <p className="text-body-s text-fg-3">Click an agent to open its analytics in Agents.</p>
    </AnalyticsLayout>
  );
}

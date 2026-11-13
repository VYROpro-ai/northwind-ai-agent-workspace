import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AgentAvatar, Badge, Table, TableContainer, TBody, TD, TH, THead, TR } from '@/components/ui';
import { Icon } from '@/components/icons';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { AnalyticsLayout } from './components/AnalyticsLayout';
import { AnalyticsToolbar } from './components/AnalyticsToolbar';
import { Heatmap } from './components/Heatmap';
import { ChartCard } from './components/Panels';
import { SpendForecast } from './components/SpendForecast';
import { StackedBars } from './components/StackedBars';
import {
  costRows,
  dailySpend,
  rangeFactor,
  savingTips,
  spendSummary,
  tokensByHour,
  type CostRow,
  type RangeKey,
} from './data';

const modelSegments = [
  { name: 'Model A', color: 'var(--chart-3)' },
  { name: 'Model B', color: 'var(--chart-1)' },
  { name: 'Model C', color: 'var(--chart-4)' },
];

type SortKey = 'cost' | 'runs';

/** W9-02 · Token & cost. `overBudget` renders the W9-02s forecast-over-budget state. */
export default function TokenCost({ overBudget = false }: { overBudget?: boolean }) {
  const [range, setRange] = useState<RangeKey>('30d');
  const [compare, setCompare] = useState(false);
  const [sort, setSort] = useState<SortKey>('cost');

  const rows = useMemo(() => {
    const f = rangeFactor[range];
    const scaled: CostRow[] = costRows.map((r) => ({
      ...r,
      runs: Math.round(r.runs * f),
      tokensIn: r.tokensIn * f,
      tokensOut: r.tokensOut * f,
      cost: r.cost * f,
    }));
    return scaled.sort((a, b) => b[sort] - a[sort]);
  }, [range, sort]);

  return (
    <AnalyticsLayout tab="cost">
      <AnalyticsToolbar
        range={range}
        onRangeChange={setRange}
        compare={compare}
        onCompareChange={setCompare}
        report="cost"
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <SpendForecast summary={overBudget ? spendSummary.overBudget : spendSummary.onTrack} />
        <section className="flex min-w-0 flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <Icon name="sparkle" size={16} strokeWidth={2} className="text-ai-text" />
            <h2 className="text-[15px] leading-[21px] font-semibold text-fg">Ways to save</h2>
            <Badge tone="ai" size="sm" bordered={false} className="h-5 border-transparent px-2 text-body-s">
              AI
            </Badge>
          </div>
          <ul className="flex flex-col gap-2.5">
            {savingTips.map((tip) => (
              <li key={tip.title} className="flex gap-2.5 rounded-[10px] bg-ai-subtle px-3 py-2.5">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-13 text-fg">{tip.title}</span>
                  <span className="text-body-s text-fg-3">{tip.detail}</span>
                </div>
                <span className="text-13 font-semibold whitespace-nowrap text-ok-text">{tip.saving}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartCard
          title="Daily spend by model"
          subtitle="October · outlined bars are the forecast"
          legend={modelSegments}
        >
          <StackedBars
            labels={dailySpend.labels}
            values={dailySpend.values}
            segments={modelSegments}
            ticks={[0, 20, 40, 60, 80]}
            format={(v) => `$${v}`}
            forecastFrom={dailySpend.forecastFrom}
            threshold={{ value: dailySpend.dailyBudget, label: `Daily budget $${dailySpend.dailyBudget}` }}
            labelEvery={4}
            height={140}
          />
        </ChartCard>
        <ChartCard title="Tokens by hour" subtitle="Mon–Sun · darker is more">
          <Heatmap rows={tokensByHour} />
        </ChartCard>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <TableContainer>
          <Table className="min-w-[760px] text-13">
            <THead className="bg-sunken">
              <TR>
                <TH className="font-medium">Agent or workflow</TH>
                <SortHeader label="Runs" active={sort === 'runs'} onClick={() => setSort('runs')} />
                <TH className="w-[100px] text-right font-medium">Tokens in</TH>
                <TH className="w-[100px] text-right font-medium">Tokens out</TH>
                <SortHeader label="Cost" active={sort === 'cost'} onClick={() => setSort('cost')} />
                <TH className="w-[100px] text-right font-medium">Per run</TH>
                <TH className="w-[80px] text-right font-medium">Change</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.name} className={cn(row.share && 'bg-warn-subtle')}>
                  <TD className="h-11">
                    <div className="flex min-w-0 items-center gap-2">
                      <AgentAvatar tone={row.tone} size={24} className="rounded-[7px]" />
                      <Link
                        to="/agents/support-agent"
                        className="truncate font-semibold text-fg underline-offset-2 hover:underline"
                      >
                        {row.name}
                      </Link>
                      {row.share && <span className="truncate text-warn-text">· {row.share}</span>}
                    </div>
                  </TD>
                  <TD className="h-11 text-right tabular">{formatNumber(row.runs)}</TD>
                  <TD className="h-11 text-right text-fg-2 tabular">{row.tokensIn.toFixed(1)}M</TD>
                  <TD className="h-11 text-right text-fg-2 tabular">{row.tokensOut.toFixed(1)}M</TD>
                  <TD className="h-11 text-right font-semibold tabular">
                    ${formatNumber(Math.round(row.cost))}
                  </TD>
                  <TD className="h-11 text-right text-fg-2 tabular">${row.perRun.toFixed(3)}</TD>
                  <TD
                    className={cn(
                      'h-11 text-right font-medium tabular',
                      row.change >= 10 ? 'text-danger-text' : row.change < 0 ? 'text-ok-text' : 'text-fg-2',
                    )}
                  >
                    {row.change < 0 ? '↓' : '↑'} {Math.abs(row.change)}%
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>
    </AnalyticsLayout>
  );
}

function SortHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <TH className="w-[90px] text-right font-medium" sorted={active ? 'desc' : undefined}>
      <button
        type="button"
        onClick={onClick}
        className="hover:text-fg"
        aria-label={`Sort by ${label.toLowerCase()}`}
      >
        {label}
      </button>
    </TH>
  );
}

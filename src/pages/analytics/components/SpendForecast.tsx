import { useNavigate } from 'react-router';
import { Button, InlineNotice } from '@/components/ui';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { SpendSummary } from '../data';

const usd = (v: number) => `$${formatNumber(v)}`;

/** Month-to-date spend against budget, with the forecast drawn as a hatched extension of the bar. */
export function SpendForecast({ summary }: { summary: SpendSummary }) {
  const navigate = useNavigate();
  const { spent, budget, forecast, scaleMax } = summary;
  const over = forecast > budget;
  const pct = (v: number) => (v / scaleMax) * 100;
  const usedPct = Math.round((spent / budget) * 100);

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <h2 className="sr-only">Spend this month</h2>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-13 font-medium text-fg-2">Spend this month</span>
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="text-[34px] leading-10 font-semibold tracking-[-0.02em] text-fg tabular">
              {usd(spent)}
            </span>
            <span className="text-body-m text-fg-2">
              of {usd(budget)} budget · {usedPct}%
            </span>
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-0.5">
          <span className="text-13 font-medium text-fg-2">Forecast to Oct 31</span>
          <span
            className={cn(
              'text-[26px] leading-8 font-semibold tabular',
              over ? 'text-danger-text' : 'text-ok-text',
            )}
          >
            {usd(forecast)}
          </span>
          <span className={cn('text-body-s font-medium', over ? 'text-danger-text' : 'text-ok-text')}>
            {usd(Math.abs(budget - forecast))} {over ? 'over' : 'under'} budget
          </span>
        </div>
      </div>

      <div
        className="relative h-2.5 rounded-full bg-subtle"
        role="meter"
        aria-label="Spend against budget"
        aria-valuemin={0}
        aria-valuemax={budget}
        aria-valuenow={spent}
        aria-valuetext={`${usd(spent)} spent, ${usd(forecast)} forecast, ${usd(budget)} budget`}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-chart-1"
          style={{ width: `${pct(spent)}%` }}
        />
        <span
          className={cn(
            'absolute inset-y-0 rounded-r-full',
            over
              ? 'bg-[repeating-linear-gradient(135deg,var(--danger)_0_4px,transparent_4px_8px)]'
              : 'bg-[repeating-linear-gradient(135deg,var(--chart-1)_0_4px,transparent_4px_8px)]',
          )}
          style={{ left: `${pct(spent)}%`, width: `${pct(forecast) - pct(spent)}%` }}
        />
        <span className="absolute -top-1 h-[18px] w-0.5 bg-fg" style={{ left: `${pct(budget)}%` }} />
      </div>
      <div className="flex items-center gap-3 text-caption">
        <span className="text-fg-3">Oct 1</span>
        <span className="flex-1" />
        <span className="font-semibold text-fg">Budget {usd(budget)}</span>
        <span className="text-fg-3">Oct 31</span>
      </div>

      <InlineNotice
        tone={over ? 'danger' : 'warn'}
        title={over ? `At this pace you’ll pass the ${usd(budget)} budget on Oct 29.` : undefined}
        className="mt-1 leading-[18px]"
        actions={
          <Button variant="secondary" size="xs" onClick={() => navigate('/settings/billing')}>
            Set spend cap
          </Button>
        }
      >
        {over
          ? 'Set a spend cap to stop surprises.'
          : `Included credits ($1,250) run out around Oct 30. After that, overage is billed up to your ${usd(budget)} cap.`}
      </InlineNotice>
    </section>
  );
}

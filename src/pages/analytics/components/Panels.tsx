import type { ReactNode } from 'react';
import { Legend } from '@/components/charts';
import { cn } from '@/lib/cn';
import type { Kpi } from '../data';

const deltaTones: Record<Kpi['tone'], string> = {
  ok: 'text-ok-text',
  warn: 'text-warn-text',
  danger: 'text-danger-text',
  neutral: 'text-fg-3',
};

/** KPI tile: label, big number and a coloured delta (the delta always carries an arrow, never colour alone). */
export function StatCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-border bg-surface px-4 py-3.5">
      <span className="text-body-s font-medium text-fg-2">{kpi.label}</span>
      <span className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-fg tabular">
        {kpi.value}
      </span>
      <span className={cn('text-body-s font-medium', deltaTones[kpi.tone])}>{kpi.delta}</span>
    </div>
  );
}

export function StatGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <StatCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}

/** Card with a chart title, an optional subtitle, legend or aside, and the chart body. */
export function ChartCard({
  title,
  subtitle,
  legend,
  aside,
  className,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  legend?: { name: string; color: string }[];
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col gap-3.5 rounded-2xl border border-border bg-surface p-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-[15px] leading-[21px] font-semibold text-fg">{title}</h2>
          {subtitle && <p className="text-body-s leading-[18px] text-fg-3">{subtitle}</p>}
        </div>
        {legend && <Legend items={legend} shape="square" className="gap-x-3.5" />}
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Ranked horizontal bars — label, bar and value on one row (runs by team, reasons for 👎). */
export function RankBars({
  items,
  color = 'var(--chart-1)',
  format = (v: number) => String(v),
  label,
}: {
  items: { label: string; value: number }[];
  color?: string;
  format?: (value: number) => string;
  /** Accessible name for the list. */
  label?: string;
}) {
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return (
    <ul className="flex flex-col gap-2.5" aria-label={label}>
      {items.map((item) => (
        <li
          key={item.label}
          className="grid grid-cols-[minmax(0,96px)_minmax(0,1fr)_56px] items-center gap-2.5 text-13 leading-4"
        >
          <span className="truncate text-fg-2">{item.label}</span>
          <span className="h-3.5 rounded-[3px] bg-subtle">
            <span
              className="block h-full rounded-[3px]"
              style={{ width: `${Math.max(2, Math.round((item.value / max) * 100))}%`, background: color }}
            />
          </span>
          <span className="text-right font-medium text-fg tabular">{format(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Squared-off segmented track used by the analytics designs (8 px track, 6 px segments, muted off state). */
export const rectSegmented =
  'rounded-lg p-0.5 [&>button]:h-[30px] [&>button]:rounded-sm [&>button]:px-[11px] [&>button[aria-checked=false]]:text-fg-3';

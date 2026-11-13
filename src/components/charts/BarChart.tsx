import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface BarSegment {
  name: string;
  color: string;
}

export interface BarChartProps {
  labels: string[];
  /** One array per segment, same length as labels. Stacked bottom → top. */
  values: number[][];
  segments: BarSegment[];
  height?: number;
  format?: (value: number) => string;
  /** Index of the highlighted bar (drawn in the inverse colour). */
  highlight?: number;
  className?: string;
  /** Rounded "pill" bars like the dashboard, or square bars. */
  rounded?: boolean;
}

/** Responsive stacked bar chart with a hover tooltip. */
export function BarChart({
  labels,
  values,
  segments,
  height = 240,
  format = String,
  highlight,
  className,
  rounded = true,
}: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const totals = labels.map((_, i) => values.reduce((sum, s) => sum + (s[i] ?? 0), 0));
  const max = Math.max(...totals) * 1.12 || 1;
  const active = hover ?? highlight ?? null;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  return (
    <div className={cn('relative flex w-full gap-3', className)} style={{ height }}>
      <div className="flex flex-col-reverse justify-between pb-6 text-[11px] text-fg-3 tabular">
        {ticks.map((t) => (
          <span key={t}>{format(Math.round(t))}</span>
        ))}
      </div>
      <div
        className="relative flex min-w-0 flex-1 items-end gap-[clamp(4px,1.2vw,12px)] pb-6"
        onMouseLeave={() => setHover(null)}
      >
        {labels.map((label, i) => {
          const isActive = i === active;
          return (
            <div
              key={label + i}
              className="relative flex h-full min-w-0 flex-1 flex-col justify-end"
              onMouseEnter={() => setHover(i)}
            >
              <div
                className={cn(
                  'flex w-full flex-col-reverse overflow-hidden transition-[height]',
                  rounded ? 'rounded-full' : 'rounded-sm',
                )}
                style={{ height: `${(totals[i] / max) * 100}%` }}
              >
                {segments.map((seg, si) => (
                  <div
                    key={seg.name}
                    className={cn(si === 0 && !isActive && 'bg-stripes')}
                    style={{
                      height: `${((values[si][i] ?? 0) / (totals[i] || 1)) * 100}%`,
                      backgroundColor: si === 0 ? (isActive ? 'var(--inverse)' : 'var(--sunken)') : seg.color,
                    }}
                  />
                ))}
              </div>
              <span
                className={cn(
                  'absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap',
                  isActive ? 'font-semibold text-fg' : 'text-fg-3',
                )}
              >
                {label}
              </span>
              {hover === i && (
                <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 min-w-40 -translate-x-1/2 rounded-lg bg-inverse px-3 py-2 text-body-s text-on-inverse shadow-overlay">
                  <p className="mb-1 font-semibold">
                    {label} · {format(totals[i])}
                  </p>
                  {segments.map((seg, si) => (
                    <p key={seg.name} className="flex justify-between gap-4">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ background: si === 0 ? 'var(--ok)' : seg.color }}
                        />
                        {seg.name}
                      </span>
                      <span className="tabular">{format(values[si][i] ?? 0)}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Simple horizontal bar list — top items with share of total. */
export function BarList({
  items,
  format = String,
  color = 'var(--chart-1)',
}: {
  items: { label: string; value: number; hint?: string }[];
  format?: (v: number) => string;
  color?: string;
}) {
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-body-m">
            <span className="truncate text-fg">{item.label}</span>
            <span className="shrink-0 font-medium text-fg tabular">
              {format(item.value)}
              {item.hint && <span className="ml-1.5 font-normal text-fg-3">{item.hint}</span>}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-subtle">
            <div
              className="h-full rounded-full"
              style={{ width: `${(item.value / max) * 100}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

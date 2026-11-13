import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface StackedBarsProps {
  labels: string[];
  segments: { name: string; color: string }[];
  /** One array per segment (bottom → top), each the same length as `labels`. */
  values: number[][];
  /** Height of the plot area in px (axis labels are added below). */
  height?: number;
  /** Y-axis ticks, ascending; the last tick is the top of the scale. */
  ticks: number[];
  format?: (value: number) => string;
  /** Bars from this index on are drawn as dashed outlines (forecast). */
  forecastFrom?: number;
  threshold?: { value: number; label: string };
  /** Show every n-th x label. */
  labelEvery?: number;
  /** Bar width as a share of its slot, 0–1. */
  barWidth?: number;
  className?: string;
}

/** Keeps the tooltip inside the chart near the edges. */
function tipAlign(index: number, count: number) {
  if (index < count * 0.25) return 'left-0';
  if (index >= count * 0.75) return 'right-0';
  return 'left-1/2 -translate-x-1/2';
}

/**
 * Fluid stacked bar chart (HTML, so text stays crisp at any width).
 * Supports forecast bars, a dashed threshold line and a hover tooltip.
 */
export function StackedBars({
  labels,
  segments,
  values,
  height = 168,
  ticks,
  format = String,
  forecastFrom,
  threshold,
  labelEvery = 1,
  barWidth = 0.75,
  className,
}: StackedBarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = ticks[ticks.length - 1] || 1;
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  const total = (i: number) => values.reduce((s, seg) => s + (seg[i] ?? 0), 0);

  return (
    <div
      className={cn('flex w-full gap-2 text-caption text-fg-3', className)}
      role="img"
      aria-label={`Stacked bars of ${segments.map((s) => s.name).join(', ')}`}
    >
      <div className="relative w-8 shrink-0" style={{ height }}>
        {ticks.map((t) => (
          <span key={t} className="absolute right-0 translate-y-1/2 tabular" style={{ bottom: pct(t) }}>
            {format(t)}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <span key={t} className="absolute inset-x-0 h-px bg-chart-grid" style={{ bottom: pct(t) }} />
          ))}
          <div className="absolute inset-0 flex items-end">
            {labels.map((label, i) => {
              const forecast = forecastFrom !== undefined && i >= forecastFrom;
              const sum = total(i);
              return (
                <div
                  key={label + i}
                  className="relative flex h-full min-w-0 flex-1 items-end justify-center"
                  onMouseEnter={() => setHover(i)}
                >
                  <div
                    className={cn(
                      'flex flex-col-reverse transition-opacity',
                      hover !== null && hover !== i && 'opacity-60',
                    )}
                    style={{ width: `${barWidth * 100}%`, height: pct(sum) }}
                  >
                    {segments.map((seg, si) => (
                      <span
                        key={seg.name}
                        className={cn('block w-full', forecast && 'border border-dashed')}
                        style={{
                          height: `${((values[si][i] ?? 0) / (sum || 1)) * 100}%`,
                          background: forecast ? 'transparent' : seg.color,
                          borderColor: forecast ? seg.color : undefined,
                        }}
                      />
                    ))}
                  </div>
                  {hover === i && (
                    <div
                      className={cn(
                        'pointer-events-none absolute bottom-[calc(100%+6px)] z-10 min-w-36 rounded-md bg-inverse px-3 py-2',
                        'text-body-s whitespace-nowrap text-on-inverse shadow-overlay',
                        tipAlign(i, labels.length),
                      )}
                    >
                      <p className="mb-1 font-semibold">
                        {label}
                        {forecast && ' · forecast'} · {format(Math.round(sum * 10) / 10)}
                      </p>
                      {segments.map((seg, si) => (
                        <p key={seg.name} className="flex justify-between gap-4">
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full" style={{ background: seg.color }} />
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
          {threshold && (
            <div
              className="pointer-events-none absolute inset-x-0 border-t-[1.5px] border-dashed [border-top-color:var(--danger-text)]"
              style={{ bottom: pct(threshold.value) }}
            >
              <span className="absolute right-0 bottom-1 font-semibold text-danger-text">
                {threshold.label}
              </span>
            </div>
          )}
        </div>
        <div className="mt-1.5 flex">
          {labels.map((label, i) => (
            <span key={label + i} className="min-w-0 flex-1 text-center whitespace-nowrap">
              {i % labelEvery === 0 ? label : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

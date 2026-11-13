import { useState } from 'react';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { RunBar, RunSeries } from '../data';
import { statusColors } from './statusColors';

/** Wide diagonal hatching from the design — tokenised so it works in both themes. */
const hatch =
  'bg-sunken bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--fg)_5%,transparent)_0_6px,transparent_6px_12px)] shadow-[inset_0_0_0_1px_var(--border)]';
const hatchActive =
  'bg-inverse bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--on-inverse)_12%,transparent)_0_6px,transparent_6px_12px)] dark:bg-none';

const TICKS = 6;
const niceSteps = [1, 2, 5, 10, 20, 25, 50, 100, 150, 200, 250, 300, 400, 500, 1000, 2000, 2500, 5000];

const total = (b: RunBar) => b.succeeded + b.failed + b.waiting;
const formatTick = (v: number) => (v >= 1000 ? `${Number((v / 1000).toFixed(1))}K` : String(v));

function Tooltip({
  bar,
  align,
  late,
}: {
  bar: RunBar;
  align: 'start' | 'center' | 'end';
  /** Centered tooltip in the right half — right-aligned on phones so it never leaves the card. */
  late?: boolean;
}) {
  const rows = [
    { label: 'Succeeded', value: bar.succeeded, dot: statusColors.succeeded },
    { label: 'Failed', value: bar.failed, dot: statusColors.failed },
    { label: 'Waiting', value: bar.waiting, dot: statusColors.waiting },
  ];
  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-[calc(100%+18px)] z-10 w-[168px] rounded-[18px] bg-inverse px-3 py-2.5 text-left text-on-inverse shadow-overlay',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        align === 'center' && late && 'max-sm:right-0 max-sm:left-auto max-sm:translate-x-0',
        align === 'start' && 'left-0',
        align === 'end' && 'right-0',
      )}
    >
      <p className="mb-2 text-body-s font-semibold">
        {bar.title} · {formatNumber(total(bar))} runs
      </p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-1.5 text-body-s leading-[18px]">
          <span className={cn('size-1.5 rounded-full', r.dot)} />
          <span className="flex-1">{r.label}</span>
          <span className="font-semibold tabular">{formatNumber(r.value)}</span>
        </p>
      ))}
      <span
        className={cn(
          'absolute -bottom-[5px] size-2.5 rotate-45 bg-inverse',
          align === 'center' && 'left-1/2 -ml-[5px]',
          align === 'center' && late && 'max-sm:right-4 max-sm:left-auto max-sm:ml-0',
          align === 'start' && 'left-4',
          align === 'end' && 'right-4',
        )}
      />
    </div>
  );
}

/**
 * Hatched pill bars with a failed-runs cap, a highlighted bar and a dark tooltip (W2-01 "Runs by status").
 * Hover or focus a bar to inspect it; otherwise the series' focus bar stays highlighted.
 */
export function RunsStatusChart({ series, showFailed = true }: { series: RunSeries; showFailed?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const { bars, focus, labelEvery } = series;
  const active = hover ?? focus;
  const totals = bars.map(total);
  const rawStep = (Math.max(...totals) * 1.4) / TICKS;
  const step = niceSteps.find((s) => s >= rawStep) ?? Math.ceil(rawStep);
  const axisMax = step * TICKS;
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => (TICKS - i) * step);
  const dense = bars.length > 20;

  const showLabel = (i: number) =>
    i === active || (i % labelEvery === 0 && !(labelEvery > 1 && i === active - 1));

  return (
    <div className="relative flex gap-2.5 pt-14 sm:gap-3.5">
      <div
        aria-hidden
        className="flex h-[220px] shrink-0 flex-col justify-between text-body-s leading-[14px] text-fg-3 tabular"
      >
        {ticks.map((t) => (
          <span key={t}>{formatTick(t)}</span>
        ))}
      </div>
      <div
        role="group"
        aria-label="Runs by status chart"
        className={cn('flex min-w-0 flex-1', dense ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-2')}
        onMouseLeave={() => setHover(null)}
      >
        {bars.map((bar, i) => {
          const isActive = i === active;
          const value = totals[i];
          const prev = i > 0 ? totals[i - 1] : 0;
          const change = prev ? Math.round(((value - prev) / prev) * 100) : null;
          const align = i < 2 ? 'start' : i > bars.length - 3 ? 'end' : 'center';
          return (
            <div key={bar.title} className="flex min-w-0 flex-1 flex-col items-center gap-3">
              <button
                type="button"
                className="relative flex h-[220px] w-full max-w-11 items-end rounded-2xl focus-visible:outline-offset-4"
                // The active bar shows its tooltip inside the button, which then serves as its name.
                aria-label={
                  isActive
                    ? undefined
                    : `${bar.title}: ${formatNumber(value)} runs — ${formatNumber(bar.succeeded)} succeeded, ${formatNumber(bar.failed)} failed, ${formatNumber(bar.waiting)} waiting`
                }
                aria-pressed={isActive}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                <span
                  className={cn(
                    'relative block w-full rounded-2xl transition-[height] duration-300',
                    isActive ? hatchActive : hatch,
                  )}
                  style={{ height: `${(value / axisMax) * 100}%` }}
                >
                  {showFailed && !isActive && bar.failed > 0 && (
                    <span
                      className="absolute inset-x-0 top-0 rounded-t-2xl rounded-b-xs bg-accent/55"
                      style={{ height: `max(3px, ${(bar.failed / value) * 100}%)` }}
                    />
                  )}
                  {isActive && (
                    <>
                      <Tooltip bar={bar} align={align} late={i >= bars.length / 2} />
                      <span className="absolute -top-[7px] left-1/2 z-[1] -ml-[7px] size-3.5 rounded-full border-[3px] border-inverse bg-surface" />
                      {change !== null && !dense && (
                        <span
                          className={cn(
                            'absolute top-4 left-1/2 hidden h-[22px] -translate-x-1/2 items-center rounded-full px-2 text-caption font-semibold whitespace-nowrap text-white sm:inline-flex dark:text-[var(--slate-950)]',
                            change >= 0 ? 'bg-ok' : 'bg-danger',
                          )}
                        >
                          {change >= 0 ? '+' : '−'}
                          {Math.abs(change)}%
                        </span>
                      )}
                    </>
                  )}
                </span>
              </button>
              <span
                aria-hidden
                className={cn(
                  'h-4 text-body-s whitespace-nowrap',
                  isActive ? 'font-semibold text-fg' : 'text-fg-3',
                  !showLabel(i) && 'invisible',
                  Math.abs(i - active) === 1 && 'max-sm:invisible',
                )}
              >
                {isActive && bar.title.includes(',') ? bar.title.split(', ')[1] : bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

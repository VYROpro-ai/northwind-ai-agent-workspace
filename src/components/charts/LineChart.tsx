import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

export interface Series {
  name: string;
  data: number[];
  /** CSS colour, e.g. 'var(--chart-1)'. */
  color: string;
  dashed?: boolean;
  area?: boolean;
}

export interface LineChartProps {
  series: Series[];
  labels: string[];
  height?: number;
  /** Formats y-axis ticks and tooltip values. */
  format?: (value: number) => string;
  yTicks?: number;
  className?: string;
  /** Horizontal reference line (budget, SLO …). */
  threshold?: { value: number; label: string };
  /** Fixed top of the y-axis. Defaults to a rounded value just above the data. */
  max?: number;
}

/** Rounds a raw axis maximum up so ticks land on 1, 2, 2.5 or 5 × 10ⁿ steps. */
function niceMax(raw: number, ticks: number) {
  if (raw <= 0) return 1;
  const rough = raw / ticks;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow;
  return step * ticks;
}

/** Responsive multi-series line / area chart with hover tooltip. */
export function LineChart({
  series,
  labels,
  height = 220,
  format = String,
  yTicks = 4,
  className,
  threshold,
  max: maxProp,
}: LineChartProps) {
  const gradId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const padL = 44;
  const padB = 24;
  const padT = 8;
  const all = series.flatMap((s) => s.data).concat(threshold ? [threshold.value] : []);
  const max = maxProp ?? niceMax(Math.max(...all) * 1.05, yTicks);
  const x = (i: number) => padL + (i / Math.max(1, labels.length - 1)) * (W - padL - 8);
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (max / yTicks) * i);
  const step = Math.ceil(labels.length / 7);

  return (
    <div className={cn('relative w-full', className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Chart of ${series.map((s) => s.name).join(', ')}`}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" />
            <text x={padL - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-fg-3 text-[10px]">
              {format(Math.round(t))}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % step === 0 ? (
            <text key={l + i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-fg-3 text-[10px]">
              {l}
            </text>
          ) : null,
        )}
        {threshold && (
          <g>
            <line
              x1={padL}
              x2={W}
              y1={y(threshold.value)}
              y2={y(threshold.value)}
              stroke="var(--danger)"
              strokeDasharray="4 4"
            />
            <text
              x={W}
              y={y(threshold.value) - 6}
              textAnchor="end"
              className="fill-danger-text text-[10px] font-medium"
            >
              {threshold.label}
            </text>
          </g>
        )}
        {series.map((s, si) => {
          const d = s.data.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ');
          return (
            <g key={s.name}>
              {s.area && (
                <>
                  <defs>
                    <linearGradient id={`${gradId}-${si}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor={s.color} stopOpacity="0.2" />
                      <stop offset="1" stopColor={s.color} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${d} L${x(s.data.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`}
                    fill={`url(#${gradId}-${si})`}
                  />
                </>
              )}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeDasharray={s.dashed ? '5 5' : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {labels.map((_, i) => (
          <rect
            key={i}
            x={x(i) - (W - padL) / labels.length / 2}
            y={0}
            width={(W - padL) / labels.length}
            height={H - padB}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
        {hover !== null && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={H - padB}
              stroke="var(--border-strong)"
              strokeDasharray="3 3"
            />
            {series.map((s) => (
              <circle
                key={s.name}
                cx={x(hover)}
                cy={y(s.data[hover])}
                r="4"
                fill="var(--surface)"
                stroke={s.color}
                strokeWidth="2"
              />
            ))}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 min-w-36 -translate-x-1/2 rounded-md bg-inverse px-3 py-2 text-body-s text-on-inverse shadow-overlay"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <p className="mb-1 font-semibold">{labels[hover]}</p>
          {series.map((s) => (
            <p key={s.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </span>
              <span className="font-medium tabular">{format(s.data[hover])}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function Legend({
  items,
  shape = 'dot',
  className,
}: {
  items: { name: string; color: string }[];
  /** dot = round swatch; square = 10 px rounded square (analytics designs). */
  shape?: 'dot' | 'square';
  className?: string;
}) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-body-s text-fg-2', className)}>
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-1.5">
          <span
            className={shape === 'square' ? 'size-2.5 rounded-[2px]' : 'size-2 rounded-full'}
            style={{ background: i.color }}
          />
          {i.name}
        </li>
      ))}
    </ul>
  );
}

import { useState } from 'react';

const W = 580;
const H = 160;

/** Runs-per-day area chart with a dashed marker where a version was published. */
export function RunsChart({
  data,
  max = 600,
  marker,
  markerLabel,
  axis,
  labels,
}: {
  data: number[];
  /** Per-point labels for the hover tooltip. */
  labels: string[];
  max?: number;
  /** Index of the publish marker. */
  marker: number;
  markerLabel: string;
  /** Evenly spaced x-axis labels. */
  axis: string[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - (v / max) * H;
  const line = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const ticks = [max, (max * 2) / 3, max / 3, 0];

  return (
    <div className="flex gap-2.5">
      <div className="-mt-[7px] flex h-40 w-7 shrink-0 flex-col justify-between text-right font-mono text-caption text-fg-3">
        {ticks.map((t) => (
          <span key={t}>{Math.round(t)}</span>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="relative h-40" onMouseLeave={() => setHover(null)}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            role="img"
            aria-label={`Runs per day, ${labels[0]} to ${labels[labels.length - 1]}. ${markerLabel} on ${labels[marker]}.`}
          >
            {[0.5, 53.3, 106.7].map((gy) => (
              <line
                key={gy}
                x1="0"
                x2={W}
                y1={gy}
                y2={gy}
                stroke="var(--chart-grid)"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1="0"
              x2={W}
              y1={H - 0.5}
              y2={H - 0.5}
              stroke="var(--chart-axis)"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={x(marker)}
              x2={x(marker)}
              y1="0"
              y2={H}
              stroke="var(--fg-3)"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            <polygon points={`0,${H} ${line} ${W},${H}`} fill="var(--chart-1)" fillOpacity="0.12" />
            <polyline
              points={line}
              fill="none"
              stroke="var(--chart-1)"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {hover !== null && (
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1="0"
                y2={H}
                stroke="var(--border-strong)"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {data.map((_, i) => (
              <rect
                key={i}
                x={x(i) - W / data.length / 2}
                y="0"
                width={W / data.length}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            ))}
          </svg>
          {hover !== null && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute size-2.5 -translate-1/2 rounded-full border-2 border-chart-1 bg-surface"
                style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(data[hover]) / H) * 100}%` }}
              />
              <div
                className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-inverse px-2.5 py-1.5 text-body-s whitespace-nowrap text-on-inverse shadow-overlay"
                style={{ left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%` }}
              >
                {labels[hover]} · <span className="font-semibold tabular">{data[hover]}</span> runs
              </div>
            </>
          )}
        </div>
        <div className="flex justify-between text-caption text-fg-3">
          {axis.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

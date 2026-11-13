import { LineChart, type Series } from '@/components/charts';
import { cn } from '@/lib/cn';

/*
 * Geometry of the shared LineChart's viewBox (see components/charts/LineChart.tsx):
 * 600 wide, 44 px left axis, 8 px right gutter, 8 px top and 24 px bottom padding.
 */
const VIEW_W = 600;
const PAD_L = 44;
const PAD_R = 8;
const PAD_T = 8;
const PAD_B = 24;

/** Shared LineChart with a shaded incident window drawn behind the lines (latency percentiles). */
export function IncidentLineChart({
  labels,
  series,
  height = 200,
  format,
  incident,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  format?: (value: number) => string;
  /** Labels bounding the incident; the band is hidden when they are not in view. */
  incident?: { from: string; to: string; label: string };
}) {
  const from = incident ? labels.indexOf(incident.from) : -1;
  const to = incident ? labels.indexOf(incident.to) : -1;
  const step = (VIEW_W - PAD_L - PAD_R) / Math.max(1, labels.length - 1);
  const x = (i: number) => PAD_L + i * step;
  const band =
    from >= 0 && to >= from
      ? {
          left: (Math.max(PAD_L, x(from - 0.5)) / VIEW_W) * 100,
          right: (Math.min(VIEW_W - PAD_R, x(to + 0.5)) / VIEW_W) * 100,
        }
      : null;

  return (
    <div className="relative isolate">
      {band && incident && (
        <div
          className="absolute -z-10 bg-danger-subtle"
          style={{
            left: `${band.left}%`,
            width: `${band.right - band.left}%`,
            top: `${(PAD_T / height) * 100}%`,
            bottom: `${(PAD_B / height) * 100}%`,
          }}
        >
          <span
            className={cn(
              'absolute top-1 text-[10px] font-semibold whitespace-nowrap text-danger-text',
              band.left > 50 ? 'right-1.5' : 'left-1.5',
            )}
          >
            {incident.label}
          </span>
        </div>
      )}
      <LineChart labels={labels} series={series} height={height} format={format} max={20} />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';

export interface ScatterPoint {
  name: string;
  x: number;
  y: number;
  /** Drives bubble size. */
  size: number;
  labelSide?: 'left' | 'right';
  detail: string;
}

/**
 * Bubble scatter (cost per run × thumbs-up rate) built from positioned HTML,
 * so it stays fluid and its labels stay legible at any width.
 */
export function ScatterPlot({
  points,
  xTicks,
  yTicks,
  xMax,
  formatX,
  formatY,
  zone,
  initialActive,
  to,
}: {
  points: ScatterPoint[];
  xTicks: number[];
  yTicks: number[];
  xMax: number;
  formatX: (v: number) => string;
  formatY: (v: number) => string;
  /** Shaded "bad" quadrant: x ≥ minX and y ≤ maxY. */
  zone?: { minX: number; maxY: number; label: string };
  initialActive?: string;
  /** Destination when a bubble is clicked. */
  to?: string;
}) {
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(initialActive ?? null);
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];
  const left = (x: number) => `${(x / xMax) * 100}%`;
  const bottom = (y: number) => `${((y - yMin) / (yMax - yMin)) * 100}%`;
  const radius = (size: number) => 6 + Math.sqrt(size) / 10;

  return (
    <div className="relative h-[280px] w-full overflow-hidden pt-2 pr-3 pb-12 pl-12 text-caption text-fg-3 sm:h-[400px]">
      <div className="relative h-full w-full">
        {yTicks.map((t) => (
          <div key={t} className="absolute inset-x-0 h-px bg-chart-grid" style={{ bottom: bottom(t) }}>
            <span className="absolute -left-2 -translate-x-full -translate-y-1/2 tabular">{formatY(t)}</span>
          </div>
        ))}
        {xTicks.map((t) => (
          <span key={t} className="absolute -bottom-6 -translate-x-1/2 tabular" style={{ left: left(t) }}>
            {formatX(t)}
          </span>
        ))}
        <span className="absolute -bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap">
          Cost per run →
        </span>

        {zone && (
          <div
            className="absolute right-0 bg-danger-subtle"
            style={{ left: left(zone.minX), bottom: 0, height: bottom(zone.maxY) }}
          >
            <span className="absolute right-2 bottom-2 font-semibold text-danger-text">{zone.label}</span>
          </div>
        )}

        {points.map((p) => {
          const r = radius(p.size);
          const isActive = active === p.name;
          return (
            <div key={p.name} className="absolute" style={{ left: left(p.x), bottom: bottom(p.y) }}>
              <button
                type="button"
                aria-label={`${p.name}: ${p.detail}`}
                onMouseEnter={() => setActive(p.name)}
                onFocus={() => setActive(p.name)}
                onClick={() => to && navigate(to)}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-chart-1 transition-opacity',
                  isActive ? 'opacity-90' : 'opacity-55 hover:opacity-80',
                )}
                style={{ width: r * 2, height: r * 2 }}
              />
              {!isActive && (
                <span
                  className={cn(
                    'pointer-events-none absolute whitespace-nowrap text-fg-2',
                    p.labelSide === 'left' ? 'right-0 bottom-2 -translate-x-3' : 'top-0 -translate-y-1/2',
                  )}
                  style={p.labelSide === 'left' ? undefined : { left: r + 6 }}
                >
                  {p.name}
                </span>
              )}
              {isActive && (
                <div
                  role="tooltip"
                  className={cn(
                    'pointer-events-none absolute top-0 z-10 -translate-y-1/2 rounded-md bg-inverse px-2.5 py-2 text-body-s whitespace-nowrap text-on-inverse shadow-overlay',
                    p.x > xMax / 2 ? 'right-0' : 'left-0',
                  )}
                  style={p.x > xMax / 2 ? { marginRight: r + 8 } : { marginLeft: r + 8 }}
                >
                  <b className="font-semibold">{p.name}</b>
                  <br />
                  {p.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

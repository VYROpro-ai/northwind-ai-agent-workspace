import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

/** Donut chart with a centred label. */
export function Donut({
  slices,
  size = 160,
  thickness = 18,
  children,
  className,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  children?: ReactNode;
  className?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offsets = slices.reduce<number[]>(
    (acc, _s, i) => [...acc, i ? acc[i - 1] + (slices[i - 1].value / total) * c : 0],
    [],
  );
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={slices.map((s) => `${s.name} ${s.value}`).join(', ')}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--subtle)"
          strokeWidth={thickness}
        />
        {slices.map((s, i) => {
          const len = (s.value / total) * c;
          return (
            <circle
              key={s.name}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
              strokeDashoffset={-offsets[i]}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}

/** Segmented semi-circle gauge (credit usage). `value` is 0–100. */
export function Gauge({
  value,
  segments = 14,
  children,
  className,
}: {
  value: number;
  segments?: number;
  children?: ReactNode;
  className?: string;
}) {
  const filled = Math.round((value / 100) * segments);
  const cx = 120;
  const cy = 120;
  return (
    <div className={cn('relative mx-auto w-full max-w-[260px]', className)}>
      <svg viewBox="0 0 240 132" className="w-full" role="img" aria-label={`${value}% used`}>
        {Array.from({ length: segments }, (_, i) => {
          const a0 = Math.PI + (i / segments) * Math.PI + 0.03;
          const a1 = Math.PI + ((i + 1) / segments) * Math.PI - 0.03;
          const r0 = 78;
          const r1 = 112;
          const p = (r: number, a: number) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
          return (
            <path
              key={i}
              d={`M${p(r0, a0)} L${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`}
              fill={i < filled ? 'var(--brand)' : 'var(--subtle)'}
              stroke={i < filled ? 'none' : 'var(--border)'}
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      {children && <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">{children}</div>}
    </div>
  );
}

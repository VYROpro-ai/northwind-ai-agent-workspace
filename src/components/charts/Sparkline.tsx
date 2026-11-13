import { useId } from 'react';
import { cn } from '@/lib/cn';

export interface SparklineProps {
  data: number[];
  /** CSS colour; defaults to the ok token. */
  color?: string;
  width?: number;
  height?: number;
  /** Fill the area under the line with a soft gradient. */
  area?: boolean;
  className?: string;
}

function toPath(data: number[], w: number, h: number, pad = 2) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
}

/** Tiny trend line for stat cards. Stretches to its container width. */
export function Sparkline({
  data,
  color = 'var(--ok)',
  width = 100,
  height = 32,
  area,
  className,
}: SparklineProps) {
  const id = useId();
  const pts = toPath(data, width, height);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('h-8 w-24 overflow-visible', className)}
      aria-hidden
    >
      {area && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.22" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={`url(#${id})`} />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

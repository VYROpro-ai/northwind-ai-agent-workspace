/** Day × hour heatmap — cell opacity encodes volume ("darker is more"). */
export function Heatmap({
  rows,
  color = 'var(--chart-1)',
  hourTicks = [0, 6, 12, 18],
}: {
  rows: { day: string; values: number[] }[];
  color?: string;
  hourTicks?: number[];
}) {
  const hours = rows[0]?.values.length ?? 24;
  const level = (v: number) => (v > 0.75 ? 'high' : v > 0.4 ? 'medium' : 'low');
  return (
    <div className="flex flex-col gap-[3px]" role="table" aria-label="Tokens by hour of day">
      {rows.map((row) => (
        <div key={row.day} role="row" className="flex items-center gap-[3px]">
          <span role="rowheader" className="w-[30px] shrink-0 text-caption text-fg-3">
            {row.day}
          </span>
          {row.values.map((v, h) => (
            <span
              key={h}
              role="cell"
              title={`${row.day} ${String(h).padStart(2, '0')}:00 · ${level(v)}`}
              aria-label={`${row.day} ${h}:00, ${level(v)} volume`}
              className="h-4 min-w-0 flex-1 rounded-[2px]"
              style={{ background: color, opacity: Math.max(0.06, v) }}
            />
          ))}
        </div>
      ))}
      <div className="flex items-center gap-[3px]" aria-hidden>
        <span className="w-[30px] shrink-0" />
        {Array.from({ length: hours }, (_, h) => (
          <span key={h} className="min-w-0 flex-1 text-center text-caption text-fg-3">
            {hourTicks.includes(h) ? h : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

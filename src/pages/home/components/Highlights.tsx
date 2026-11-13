import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui';
import type { AttentionItem, Kpi } from '../data';

/** "Needs attention" strip card: tinted icon, one-line summary and a dark pill action. */
export function AttentionCard({ item }: { item: AttentionItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface py-3.5 pr-3.5 pl-4 shadow-raised">
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
          item.tone === 'warn' ? 'bg-warn-subtle text-warn-text' : 'bg-danger-subtle text-danger-text',
        )}
      >
        <Icon name={item.icon} size={18} strokeWidth={2} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className="truncate text-body-m font-semibold">{item.title}</h2>
        <p className="truncate text-body-s text-fg-3">{item.detail}</p>
      </div>
      <Link
        to={item.to}
        className="inline-flex h-8 shrink-0 items-center rounded-full bg-inverse px-3.5 text-13 font-medium text-on-inverse transition-opacity hover:opacity-90"
      >
        {item.cta}
      </Link>
    </div>
  );
}

/** KPI stat card with a delta pill and a sparkline. */
export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-surface px-[18px] py-4 shadow-raised">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-fg">
          <Icon name={kpi.icon} size={15} strokeWidth={2} />
        </span>
        <p className="min-w-0 flex-1 truncate text-13 text-fg-2">{kpi.label}</p>
        <Badge
          tone={kpi.deltaTone}
          bordered={false}
          size="sm"
          className="h-[22px] border-transparent px-2 font-semibold"
        >
          {kpi.delta}
        </Badge>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-[28px] leading-8 font-semibold tracking-[-0.03em] tabular">{kpi.value}</p>
        <svg width="96" height="30" viewBox="0 0 96 30" fill="none" className="shrink-0" aria-hidden>
          <polyline
            points={kpi.trend.map((y, i) => `${Math.min(i * 14, 96)},${y}`).join(' ')}
            stroke={kpi.trendColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

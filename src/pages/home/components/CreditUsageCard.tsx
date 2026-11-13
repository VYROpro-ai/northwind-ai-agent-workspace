import { Link, useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import { Badge, Dropdown, IconButton, type Tone } from '@/components/ui';
import { Gauge } from '@/components/charts';
import { Panel, PanelHeader } from './Panel';

const stats: { label: string; value: string; delta: string; tone: Tone }[] = [
  { label: 'Daily avg', value: '$40.85', delta: '+6%', tone: 'ok' },
  { label: 'Forecast', value: '$1,297', delta: '+$47', tone: 'danger' },
];

/** W2-01 · Credit usage gauge with daily average, forecast and the "runs out" call to action. */
export function CreditUsageCard() {
  const navigate = useNavigate();
  return (
    <Panel className="flex flex-col gap-3.5 px-4 pt-5 pb-[18px] sm:px-5">
      <PanelHeader
        icon="gauge"
        title="Credit usage"
        aside={<span className="text-body-s text-fg-3">Resets Nov 12</span>}
        actions={
          <Dropdown
            align="end"
            items={[
              { label: 'Usage details', icon: 'analytics', onSelect: () => navigate('/analytics/cost') },
              { label: 'Plan & limits', icon: 'credit-card', onSelect: () => navigate('/settings/billing') },
            ]}
            trigger={(props) => (
              <IconButton {...props} icon="more" label="Credit options" className="size-[38px]" />
            )}
          />
        }
      />

      <Gauge value={85} className="mt-2.5 max-w-[280px]">
        <p className="text-[44px] leading-[48px] font-semibold tracking-[-0.04em] tabular">85%</p>
        <p className="text-13 text-fg-2">$1,062 of $1,250</p>
      </Gauge>

      <div className="mt-1.5 grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2.5 rounded-xl border border-border bg-sunken px-3.5 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-body-s text-fg-2">{s.label}</span>
              <Badge
                tone={s.tone}
                bordered={false}
                size="sm"
                className="h-[22px] border-transparent px-2 font-semibold"
              >
                {s.delta}
              </Badge>
            </div>
            <span className="text-h2 font-semibold tracking-[-0.03em] tabular">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="flex h-12 items-center gap-2.5 rounded-full bg-inverse pr-2 pl-2.5 text-13 text-on-inverse shadow-inverse">
        <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <Icon name="bell" size={15} strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 truncate">Runs out by Oct 30</span>
        <Link
          to="/settings/billing"
          className="inline-flex h-8 shrink-0 items-center rounded-full bg-surface px-3.5 text-13 font-semibold text-fg transition-opacity hover:opacity-90"
        >
          Manage plan
        </Link>
      </div>
    </Panel>
  );
}

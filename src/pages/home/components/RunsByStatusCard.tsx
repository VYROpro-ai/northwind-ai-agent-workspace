import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { Icon } from '@/components/icons';
import { Checkbox, Dropdown, IconButton, Segmented, useToast } from '@/components/ui';
import { runRanges, runSeries, type RunRange } from '../data';
import { Panel, PanelHeader } from './Panel';
import { RunsStatusChart } from './RunsStatusChart';
import { statusColors } from './statusColors';

const legend = [
  { label: 'Succeeded', dot: statusColors.succeeded },
  { label: 'Failed', dot: statusColors.failed },
  { label: 'Waiting', dot: statusColors.waiting },
];

/** W2-01 · "Runs by status" panel with a working time-range switch. */
export function RunsByStatusCard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [range, setRange] = useState<RunRange>('14d');
  const [showFailed, setShowFailed] = useState(true);
  const series = runSeries[range];
  const runs = series.bars.reduce((sum, b) => sum + b.succeeded + b.failed + b.waiting, 0);

  return (
    <Panel className="relative overflow-hidden px-4 pt-5 pb-[18px] sm:px-[22px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-wash-hero" />
      <PanelHeader
        icon="chart-square"
        title="Runs by status"
        actions={
          <>
            <Segmented
              label="Time range"
              variant="inverse"
              size="sm"
              options={runRanges}
              value={range}
              onChange={setRange}
            />
            <Dropdown
              align="end"
              width={232}
              trigger={(props) => (
                <IconButton {...props} icon="sliders" label="Chart options" className="size-[38px]" />
              )}
            >
              <div className="flex flex-col gap-3 p-2.5">
                <Checkbox
                  label="Show failed runs"
                  checked={showFailed}
                  onChange={(e) => setShowFailed(e.target.checked)}
                />
              </div>
            </Dropdown>
            <Dropdown
              align="end"
              items={[
                { label: 'View all runs', icon: 'run', onSelect: () => navigate('/runs') },
                { label: 'Open analytics', icon: 'analytics', onSelect: () => navigate('/analytics') },
                {
                  label: 'Download CSV',
                  icon: 'download',
                  separator: true,
                  onSelect: () => toast({ title: 'Export started', description: `Runs · ${range} as CSV` }),
                },
              ]}
              trigger={(props) => (
                <IconButton {...props} icon="more" label="More options" className="size-[38px]" />
              )}
            />
          </>
        }
      />

      <div className="relative mt-3.5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[40px] leading-[44px] font-semibold tracking-[-0.04em] tabular">
            {formatNumber(runs)}{' '}
            <span className="text-body-l font-medium tracking-normal text-fg-3">runs</span>
          </p>
          <p className="inline-flex items-center gap-1.5 text-13 text-fg-2">
            <span className="inline-flex items-center gap-0.5 font-semibold text-ok-text">
              {series.delta}
              <Icon name="arrow-up-right" size={12} strokeWidth={2.4} />
            </span>
            {series.comparison}
          </p>
        </div>
        <ul className="flex gap-3.5 pb-1">
          {legend.map((l) => (
            <li key={l.label} className="inline-flex items-center gap-1.5 text-body-s text-fg-2">
              <span className={cn('size-[7px] rounded-full', l.dot)} />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <RunsStatusChart key={range} series={series} showFailed={showFailed} />
    </Panel>
  );
}

import { BarChart, BarList, Donut, Gauge, Legend, LineChart, Sparkline } from '@/components/charts';
import {
  barLabels,
  barListItems,
  barSegments,
  barValues,
  chartDays,
  donutSlices,
  lineSeries,
  sparkData,
  sparkDown,
} from '../../data';
import { DsSectionBlock, SectionHeader, Specimen } from '../Specimen';

const IMPORT =
  "import { Sparkline, LineChart, Legend, BarChart, BarList, Donut, Gauge } from '@/components/charts'";
const chartSwatches = ['--chart-1', '--chart-2', '--chart-3', '--chart-4'];

/** C10 · Charts — dependency-free SVG charts that read the chart tokens. */
export function ChartsGallery() {
  return (
    <DsSectionBlock id="charts">
      <SectionHeader
        id="charts"
        eyebrow="Components · C10"
        title="Charts"
        description="Lightweight SVG charts with hover tooltips. Pass series colours as var(--chart-1…4) so they re-map in dark mode; grid lines use var(--chart-grid)."
        meta={
          <span className="inline-flex items-center gap-1.5">
            {chartSwatches.map((c) => (
              <span key={c} className="size-3 rounded-full" style={{ background: `var(${c})` }} title={c} />
            ))}
            <span className="ml-1">chart-1…4</span>
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Specimen
          title="Line chart + legend"
          meta="area · dashed"
          importPath={IMPORT}
          className="md:col-span-2"
        >
          <Legend items={lineSeries} className="mb-4" />
          <LineChart series={lineSeries} labels={chartDays} height={240} />
        </Specimen>

        <Specimen title="Sparkline" meta="stat cards">
          <ul className="flex flex-col divide-y divide-border">
            <li className="flex items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-body-s text-fg-3">Runs</p>
                <p className="text-h3 font-semibold text-fg tabular">12,480</p>
                <p className="text-body-s text-ok-text">↑ 12% vs last week</p>
              </div>
              <Sparkline data={sparkData} area />
            </li>
            <li className="flex items-center justify-between gap-4 pt-4">
              <div>
                <p className="text-body-s text-fg-3">Failure rate</p>
                <p className="text-h3 font-semibold text-fg tabular">1.6%</p>
                <p className="text-body-s text-danger-text">↓ 0.4 pts</p>
              </div>
              <Sparkline data={sparkDown} color="var(--danger)" />
            </li>
          </ul>
        </Specimen>

        <Specimen title="Bar chart" meta="stacked · highlight" className="md:col-span-2">
          <Legend items={barSegments} className="mb-4" />
          <BarChart labels={barLabels} values={barValues} segments={barSegments} highlight={4} height={240} />
        </Specimen>

        <Specimen title="Bar list" meta="top items">
          <BarList items={barListItems} format={(v) => v.toLocaleString()} />
        </Specimen>

        <Specimen title="Donut" meta="share of spend">
          <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
            <Donut slices={donutSlices}>
              <span className="text-h3 font-semibold text-fg tabular">$1,284</span>
              <span className="text-body-s text-fg-3">this month</span>
            </Donut>
            <Legend items={donutSlices} className="flex-col items-start" />
          </div>
        </Specimen>

        <Specimen title="Gauge" meta="credit usage">
          <Gauge value={64}>
            <span className="text-h2 font-semibold text-fg tabular">64%</span>
            <span className="text-body-s text-fg-3">6,400 of 10,000 credits</span>
          </Gauge>
        </Specimen>
      </div>
    </DsSectionBlock>
  );
}

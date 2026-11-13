import { useState } from 'react';
import { Button, Segmented } from '@/components/ui';
import { rangeOptions, type RangeKey } from '../data';
import { ExportReportModal, type ReportKind } from './ExportReportModal';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { InlineSwitch } from './InlineSwitch';
import { rectSegmented } from './Panels';

const agentOptions = [
  'All',
  'Support Agent',
  'Sales Researcher',
  'Data Analyst',
  'Meeting Brief',
  'Research Writer',
] as const;
const teamOptions = ['All', 'Support', 'Sales', 'Operations', 'Finance', 'Marketing'] as const;
const modelOptions = ['All', 'Model A Fast', 'Model B Balanced', 'Model C Deep'] as const;

type AgentFilter = (typeof agentOptions)[number];
type TeamFilter = (typeof teamOptions)[number];
type ModelFilter = (typeof modelOptions)[number];

export interface AnalyticsToolbarProps {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  compare: boolean;
  onCompareChange: (compare: boolean) => void;
  /** Report pre-selected in the export dialog. */
  report?: ReportKind;
  /** Open the export dialog on mount (W9-06). */
  exportOpen?: boolean;
}

/** Date range, compare toggle, Agent / Team / Model filters and the Export action. */
export function AnalyticsToolbar({
  range,
  onRangeChange,
  compare,
  onCompareChange,
  report = 'usage',
  exportOpen = false,
}: AnalyticsToolbarProps) {
  const [agent, setAgent] = useState<AgentFilter>('All');
  const [team, setTeam] = useState<TeamFilter>('All');
  const [model, setModel] = useState<ModelFilter>('All');
  const [exporting, setExporting] = useState(exportOpen);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Segmented
        label="Date range"
        options={rangeOptions}
        value={range}
        onChange={onRangeChange}
        size="sm"
        className={rectSegmented}
      />
      <InlineSwitch checked={compare} onChange={onCompareChange}>
        Compare to previous period
      </InlineSwitch>
      <span className="hidden flex-1 lg:block" />
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterSelect label="Agent" value={agent} options={agentOptions} onChange={setAgent} />
        <FilterSelect label="Team" value={team} options={teamOptions} onChange={setTeam} />
        <FilterSelect label="Model" value={model} options={modelOptions} onChange={setModel} align="end" />
        <Button
          variant="secondary"
          size="sm"
          leftIcon="download"
          className="h-[34px]"
          onClick={() => setExporting(true)}
        >
          Export
        </Button>
      </div>
      {exporting && <ExportReportModal open onClose={() => setExporting(false)} defaultReport={report} />}
    </div>
  );
}

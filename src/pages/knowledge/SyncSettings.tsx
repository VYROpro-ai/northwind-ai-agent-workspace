import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Badge,
  Button,
  Card,
  Progress,
  Radio,
  Segmented,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
  type SegmentedOption,
} from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';
import { boardCell as cell } from './utils';
import { KnowledgeShell } from './components/KnowledgeShell';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { IconTile } from '@/components/ui/Tiles';
import {
  nextSyncLabel,
  sourceKinds,
  syncCredits,
  syncSources,
  type SyncFrequency,
  type SyncSource,
  type SyncState,
} from './data';

const frequencyOptions: SegmentedOption<SyncFrequency>[] = [
  {
    value: 'realtime',
    disabled: true,
    label: (
      <>
        Real-time
        <Badge tone="ai" bordered={false} size="sm" className="h-4 border-transparent px-2 text-body-s">
          Pro
        </Badge>
      </>
    ),
  },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'manual', label: 'Manual' },
];

/** Board segmented control: 8 px track, 6 px squared thumbs; the Pro option stays legible. */
const boardSegmented =
  'gap-0 rounded-md p-0.5 [&>button]:h-[26px] [&>button]:gap-1 [&>button]:rounded-sm [&>button]:px-[9px] ' +
  '[&>button]:text-fg-3 [&>button[aria-checked=true]]:text-fg ' +
  '[&>button:disabled]:text-fg-disabled [&>button:disabled]:opacity-100';
/** Board action column: the button fills the 104 px column. */
const actionButton = 'h-7 w-full justify-start px-3 text-13';

function SyncStateBadge({ state }: { state: SyncState }) {
  const pill = 'border-transparent h-5 px-2 text-body-s';
  switch (state.kind) {
    case 'synced':
      return (
        <Badge tone="ok" bordered={false} className={pill}>
          {state.label}
        </Badge>
      );
    case 'syncing':
      return (
        <Badge tone="brand" bordered={false} className={pill}>
          Syncing now
        </Badge>
      );
    case 'failed':
      return (
        <Badge tone="danger" bordered={false} className={pill}>
          {state.label}
        </Badge>
      );
    case 'uploaded':
      return (
        <Badge tone="neutral" bordered={false} className={pill}>
          {state.label}
        </Badge>
      );
  }
}

function SyncRow({
  source,
  onFrequency,
  onSync,
  onReconnect,
}: {
  source: SyncSource;
  onFrequency: (value: SyncFrequency) => void;
  onSync: () => void;
  onReconnect: () => void;
}) {
  const kind = sourceKinds[source.kind];
  const syncing = source.state.kind === 'syncing';
  return (
    <TR className="text-13 [&>td]:h-[50px]">
      <TD className={cell}>
        <div className="flex min-w-0 items-center gap-2.5">
          <IconTile icon={kind.icon} tone={kind.tone} />
          <span className="truncate font-semibold text-fg">{source.name}</span>
        </div>
      </TD>
      <TD className={cell}>
        <Segmented
          size="sm"
          className={boardSegmented}
          label={`Sync frequency for ${source.name}`}
          options={frequencyOptions}
          value={source.frequency}
          onChange={onFrequency}
        />
      </TD>
      <TD className={cell}>
        <SyncStateBadge state={source.state} />
      </TD>
      <TD className={cn(cell, 'truncate text-fg-2 tabular')}>{source.next}</TD>
      <TD className={cell}>
        <div className="flex flex-col items-end gap-1">
          {source.action === 'reconnect' ? (
            <Button variant="secondary" size="xs" className={actionButton} onClick={onReconnect}>
              Reconnect
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="xs"
              className={actionButton}
              disabled={syncing || source.frequency === 'manual'}
              onClick={onSync}
            >
              {source.state.kind === 'syncing' ? `Syncing ${Math.round(source.state.progress)}%` : 'Sync now'}
            </Button>
          )}
          {source.state.kind === 'syncing' && (
            <Progress
              size="sm"
              value={source.state.progress}
              label={`${source.name} sync progress`}
              className="h-[3px] w-[90px]"
            />
          )}
        </div>
      </TD>
    </TR>
  );
}

/** W7-07 · Sync settings — per-source frequency, manual sync, deletion policy and sync credits. */
export default function SyncSettings() {
  const toast = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState(syncSources);
  const [onDelete, setOnDelete] = useState<'delete' | 'keep'>('delete');

  const anySyncing = rows.some((r) => r.state.kind === 'syncing');

  // Advance any running syncs until they finish.
  useEffect(() => {
    if (!anySyncing) return;
    const timer = window.setInterval(() => {
      setRows((list) =>
        list.map((row) => {
          if (row.state.kind !== 'syncing') return row;
          const progress = row.state.progress + 4 + Math.random() * 6;
          return progress >= 100
            ? {
                ...row,
                state: { kind: 'synced', label: 'Synced · just now' },
                next: nextSyncLabel[row.frequency],
              }
            : { ...row, state: { kind: 'syncing', progress } };
        }),
      );
    }, 500);
    return () => window.clearInterval(timer);
  }, [anySyncing]);

  const patch = (id: string, next: Partial<SyncSource>) =>
    setRows((list) => list.map((row) => (row.id === id ? { ...row, ...next } : row)));

  const setFrequency = (row: SyncSource, frequency: SyncFrequency) => {
    patch(row.id, { frequency, next: row.state.kind === 'failed' ? row.next : nextSyncLabel[frequency] });
    toast({ title: `${row.name} now syncs ${frequency === 'manual' ? 'manually' : frequency}` });
  };

  return (
    <KnowledgeShell tab="/knowledge/sync" current="Sync settings" role="admin">
      <InlineNotice
        tone="ai"
        actions={
          <Button
            variant="secondary"
            size="xs"
            className="h-7 px-3 text-13"
            onClick={() => navigate('/settings/plans')}
          >
            Compare plans
          </Button>
        }
      >
        Real-time sync is on the Business plan. Your Pro plan can sync each source up to every hour.
      </InlineNotice>

      <Card padding="none" className="overflow-hidden rounded-[18px]">
        <TableContainer>
          <Table className="min-w-[940px] table-fixed">
            <THead className="border-b border-border bg-sunken font-medium">
              <tr>
                <TH className={cn(cell, 'h-9')}>Source</TH>
                <TH className={cn(cell, 'h-9 w-[362px]')}>Sync frequency</TH>
                <TH className={cn(cell, 'h-9 w-[150px]')}>Last sync</TH>
                <TH className={cn(cell, 'h-9 w-[130px]')}>Next sync</TH>
                <TH className={cn(cell, 'h-9 w-[125px]')}>
                  <span className="sr-only">Actions</span>
                </TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((row) => (
                <SyncRow
                  key={row.id}
                  source={row}
                  onFrequency={(value) => setFrequency(row, value)}
                  onSync={() => patch(row.id, { state: { kind: 'syncing', progress: 0 }, next: '—' })}
                  onReconnect={() =>
                    toast({
                      title: 'Reconnect Docs drive',
                      description: 'Sign in again to restore access to Sales playbooks.',
                    })
                  }
                />
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="none" className="flex flex-col gap-3 rounded-[18px] p-4">
          <h2 className="text-[15px] leading-[22px] font-semibold text-fg" id="on-delete">
            When a doc is deleted at the source
          </h2>
          <div role="radiogroup" aria-labelledby="on-delete" className="flex flex-col gap-2.5">
            <Radio
              name="on-delete"
              checked={onDelete === 'delete'}
              onChange={() => setOnDelete('delete')}
              label={<span className="text-13 font-medium">Delete it here too</span>}
              description="Agents stop citing it on the next sync"
            />
            <Radio
              name="on-delete"
              checked={onDelete === 'keep'}
              onChange={() => setOnDelete('keep')}
              label={<span className="text-13 font-medium">Keep it here</span>}
              description="Marked “Removed at source” so you can decide later"
            />
          </div>
        </Card>

        <Card padding="none" className="flex flex-col gap-2.5 rounded-[18px] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Credits used by sync</h2>
            <span className="text-body-s text-fg-3">This month</span>
          </div>
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="text-[22px] leading-7 font-semibold text-fg tabular">
              {formatCurrency(syncCredits.used)}
            </span>
            <span className="text-13 text-fg-2">
              of {formatCurrency(syncCredits.allowance)} sync allowance
            </span>
          </p>
          <Progress value={(syncCredits.used / syncCredits.allowance) * 100} label="Sync credits used" />
          <p className="text-body-s text-fg-3">
            Hourly wiki sync is 71% of this. Switching it to Daily saves about $3.90 a month.
          </p>
        </Card>
      </div>
    </KnowledgeShell>
  );
}

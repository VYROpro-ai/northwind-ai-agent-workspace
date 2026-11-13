import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Input,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  TableContainer,
  useToast,
} from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { BulkBar, BulkButton } from './components/BulkBar';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { RunsTabs } from './components/RunsTabs';
import { runHref, runRows, totalRuns, type RunRow, type RunState } from './data';

const PAGE_SIZE = 9;

type View = 'all' | 'failed' | 'waiting' | 'costly';
const isCostly = (r: RunRow) => r.cost >= 0.04;

const views: { value: View; label: string; match: (r: RunRow) => boolean }[] = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'failed', label: 'Failed today', match: (r) => r.status === 'failed' },
  { value: 'waiting', label: 'Waiting approval', match: (r) => r.status === 'waiting' },
  { value: 'costly', label: 'Costly runs', match: isCostly },
];

const statusOptions = ['Any', 'Running', 'Waiting', 'Succeeded', 'Failed', 'Cancelled'] as const;
const sourceOptions = ['All agents & workflows', 'Agents only', 'Workflows only'] as const;
const triggerOptions = ['Any', 'Schedule', 'Event', 'Person'] as const;
const dateOptions = ['Last 24 h', 'Last 7 days', 'Last 30 days'] as const;
const costOptions = ['Any', 'Over $0.01', 'Over $0.05'] as const;
const approvalOptions = ['Has approval', 'Approval: yes', 'Approval: no'] as const;

type Filters = {
  status: (typeof statusOptions)[number];
  source: (typeof sourceOptions)[number];
  trigger: (typeof triggerOptions)[number];
  date: (typeof dateOptions)[number];
  cost: (typeof costOptions)[number];
  approval: (typeof approvalOptions)[number];
};

const defaultFilters: Filters = {
  status: 'Any',
  source: 'All agents & workflows',
  trigger: 'Any',
  date: 'Last 24 h',
  cost: 'Any',
  approval: 'Has approval',
};

function triggerKind(r: RunRow): Filters['trigger'] {
  if (r.triggeredBy.startsWith('Every')) return 'Schedule';
  if (r.triggeredBy.startsWith('On ') || r.triggeredBy.startsWith('Webhook')) return 'Event';
  return 'Person';
}

function matches(r: RunRow, f: Filters, query: string) {
  if (f.status !== 'Any' && r.status !== (f.status.toLowerCase() as RunState)) return false;
  if (f.source === 'Agents only' && r.kind !== 'Chat') return false;
  if (f.source === 'Workflows only' && r.kind !== 'Workflow') return false;
  if (f.trigger !== 'Any' && triggerKind(r) !== f.trigger) return false;
  if (f.cost === 'Over $0.01' && r.cost <= 0.01) return false;
  if (f.cost === 'Over $0.05' && r.cost <= 0.05) return false;
  if (f.approval === 'Approval: yes' && r.status !== 'waiting') return false;
  if (f.approval === 'Approval: no' && r.status === 'waiting') return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return [r.id, r.source, r.detail, r.triggeredBy].some((v) => v.toLowerCase().includes(q));
}

/** W6-01 · Runs list */
export default function RunsList() {
  const toast = useToast();
  const [view, setView] = useState<View>('all');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(['run_4834', 'run_4833']));
  const [expanded, setExpanded] = useState<string | null>(null);

  const viewMatch = views.find((v) => v.value === view)!.match;
  const filtered = useMemo(
    () => runRows.filter((r) => viewMatch(r) && matches(r, filters, query.trim())),
    [viewMatch, filters, query],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const isDefault =
    view === 'all' && !query.trim() && JSON.stringify(filters) === JSON.stringify(defaultFilters);
  const total = isDefault ? totalRuns : filtered.length;

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someOnPage = rows.some((r) => selected.has(r.id));
  const togglePage = () =>
    setSelected((s) => {
      const next = new Set(s);
      rows.forEach((r) => (allOnPage ? next.delete(r.id) : next.add(r.id)));
      return next;
    });

  const selectedRuns = runRows.filter((r) => selected.has(r.id));
  const failedSelected = selectedRuns.filter((r) => r.status === 'failed');
  const selectionHint =
    failedSelected.length === selectedRuns.length
      ? selectedRuns.length === 2
        ? 'Both failed'
        : selectedRuns.length > 2
          ? 'All failed'
          : 'Failed'
      : failedSelected.length > 0
        ? `${failedSelected.length} failed`
        : undefined;

  return (
    <AppShell active="Runs" role="builder" crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'All runs' }]}>
      <PageHeader
        title="Runs"
        description="Every agent chat and workflow run in Northwind Labs"
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon="download"
            className="h-[34px] px-3.5"
            onClick={() =>
              toast({ title: 'Export started', description: 'We’ll email you the CSV when it’s ready.' })
            }
          >
            Export CSV
          </Button>
        }
      />
      <RunsTabs />

      <div role="radiogroup" aria-label="Saved views" className="flex flex-wrap items-center gap-1.5">
        {views.map((v) => {
          const on = v.value === view;
          const count = v.value === 'all' ? null : runRows.filter(v.match).length;
          return (
            <button
              key={v.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setView(v.value);
                setPage(1);
              }}
              className={cn(
                'inline-flex h-[30px] items-center gap-1 rounded-full border px-3 text-13 font-medium whitespace-nowrap transition-colors',
                on
                  ? 'border-brand-border bg-brand-subtle text-brand-text'
                  : 'border-border bg-surface text-fg-2 hover:bg-subtle',
              )}
            >
              {v.label}
              {count !== null && <span className="font-normal text-fg-3">{count}</span>}
            </button>
          );
        })}
        <button
          type="button"
          className="ml-1.5 text-13 font-medium text-link hover:underline"
          onClick={() =>
            toast({ title: 'View saved', description: 'Find it under Saved views in the sidebar.' })
          }
        >
          + Save view
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          pill
          size="sm"
          leftIcon="search"
          aria-label="Search runs"
          placeholder="Search run ID, agent or workflow"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          containerClassName="w-full sm:w-[280px]"
          className="h-[34px] border-border text-13"
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={statusOptions}
          onChange={(v) => setFilter('status', v)}
        />
        <FilterSelect
          label="Source"
          value={filters.source}
          options={sourceOptions}
          onChange={(v) => setFilter('source', v)}
        />
        <FilterSelect
          label="Trigger"
          value={filters.trigger}
          options={triggerOptions}
          onChange={(v) => setFilter('trigger', v)}
        />
        <FilterSelect
          label="Date"
          value={filters.date}
          options={dateOptions}
          onChange={(v) => setFilter('date', v)}
        />
        <FilterSelect
          label="Cost"
          value={filters.cost}
          options={costOptions}
          onChange={(v) => setFilter('cost', v)}
        />
        <FilterSelect
          value={filters.approval}
          options={approvalOptions}
          onChange={(v) => setFilter('approval', v)}
        />
      </div>

      {selected.size > 0 && (
        <BulkBar title={`${selected.size} selected`} hint={selectionHint}>
          {failedSelected.length > 0 && (
            <BulkButton
              onClick={() => {
                toast({
                  title: `Retrying ${failedSelected.length} failed ${failedSelected.length === 1 ? 'run' : 'runs'}`,
                  description: 'Each run restarts from its failed step.',
                });
                setSelected(new Set());
              }}
            >
              Retry failed
            </BulkButton>
          )}
          <BulkButton
            onClick={() =>
              toast({
                title: `Exporting ${selected.size} runs`,
                description: 'The CSV downloads in a moment.',
              })
            }
          >
            Export
          </BulkButton>
          <BulkButton tone="quiet" onClick={() => setSelected(new Set())}>
            Clear
          </BulkButton>
        </BulkBar>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <TableContainer>
          <Table className="min-w-[1040px] text-13">
            <THead className="border-b border-border bg-sunken font-medium">
              <tr>
                <TH className="w-10 pl-4 first:pl-4">
                  <Checkbox
                    aria-label="Select all runs on this page"
                    checked={someOnPage}
                    indeterminate={someOnPage && !allOnPage}
                    onChange={togglePage}
                  />
                </TH>
                <TH className="w-[104px]">Run ID</TH>
                <TH className="w-[26%]">Source</TH>
                <TH className="w-[17%]">Triggered by</TH>
                <TH className="w-[142px]">Status</TH>
                <TH className="w-[124px]">Started</TH>
                <TH className="w-[76px] text-right [&>span]:justify-end">Duration</TH>
                <TH className="w-14 text-right [&>span]:justify-end">Steps</TH>
                <TH className="w-[70px] text-right [&>span]:justify-end">Tokens</TH>
                <TH className="w-[76px] text-right [&>span]:justify-end">Cost</TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((run) => (
                <Fragment key={run.id}>
                  <RunTableRow
                    run={run}
                    checked={selected.has(run.id)}
                    onCheck={() => toggle(run.id)}
                    expanded={expanded === run.id}
                    onExpand={() => setExpanded(expanded === run.id ? null : run.id)}
                  />
                  {expanded === run.id && run.error && (
                    <FailureDetails
                      run={run}
                      onRetry={() =>
                        toast({
                          title: `Retrying ${run.id}`,
                          description: `Restarting from ${run.error!.step}.`,
                        })
                      }
                    />
                  )}
                </Fragment>
              ))}
            </TBody>
          </Table>
        </TableContainer>
        {rows.length === 0 && (
          <EmptyState
            icon="search"
            title="No runs match these filters"
            description="Try another status or clear the search."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilters(defaultFilters);
                  setView('all');
                  setQuery('');
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
        <p className="text-13 text-fg-2">
          {filtered.length === 0
            ? 'No runs'
            : `Showing ${(current - 1) * PAGE_SIZE + 1}–${(current - 1) * PAGE_SIZE + rows.length} of ${total.toLocaleString('en-US')}`}
        </p>
        <span className="flex-1" />
        <Button variant="secondary" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={current >= pageCount}
          onClick={() => setPage(current + 1)}
        >
          Next
        </Button>
      </nav>
    </AppShell>
  );
}

const statusPill: Record<RunState, { tone: 'ai' | 'warn' | 'danger' | 'ok' | 'neutral'; label: string }> = {
  running: { tone: 'ai', label: 'Running' },
  waiting: { tone: 'warn', label: 'Waiting approval' },
  failed: { tone: 'danger', label: 'Failed' },
  succeeded: { tone: 'ok', label: 'Succeeded' },
  cancelled: { tone: 'neutral', label: 'Cancelled' },
};

function RunStatus({ run }: { run: RunRow }) {
  const s = statusPill[run.status];
  const icon =
    run.status === 'waiting'
      ? 'clock'
      : run.status === 'failed'
        ? 'close'
        : run.status === 'succeeded'
          ? 'check-sm'
          : undefined;
  return (
    <Badge tone={s.tone} icon={icon} dot={!icon} bordered={false} className="h-[22px] border-transparent">
      {s.label}
    </Badge>
  );
}

function RunTableRow({
  run,
  checked,
  onCheck,
  expanded,
  onExpand,
}: {
  run: RunRow;
  checked: boolean;
  onCheck: () => void;
  expanded: boolean;
  onExpand: () => void;
}) {
  const href = runHref(run);
  const num = 'text-right tabular text-fg';
  return (
    <TR className={cn('h-[53px]', run.status === 'running' && 'bg-ai-subtle', expanded && 'border-b-0')}>
      <TD className="h-[53px] pl-4 first:pl-4">
        <Checkbox aria-label={`Select ${run.id}`} checked={checked} onChange={onCheck} />
      </TD>
      <TD className="h-[53px]">
        <Link to={href} className="font-mono text-body-s text-link hover:underline">
          {run.id}
        </Link>
      </TD>
      <TD className="h-[53px] max-w-0">
        <Link to={href} className="block truncate font-medium text-fg hover:underline">
          {run.source}
        </Link>
        <span className="block truncate text-body-s text-fg-3">
          {run.kind} · {run.detail}
        </span>
      </TD>
      <TD className={cn('h-[53px] max-w-0 truncate text-fg-2', run.triggerMuted && 'italic')}>
        {run.triggeredBy}
      </TD>
      <TD className="h-[53px]">
        {run.status === 'failed' ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={`Failed — ${expanded ? 'hide' : 'show'} error for ${run.id}`}
            onClick={onExpand}
            className="inline-flex items-center gap-1 rounded-full"
          >
            <RunStatus run={run} />
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={13}
              strokeWidth={2}
              className="text-fg-3"
            />
          </button>
        ) : (
          <div className="flex flex-col gap-1">
            <span>
              <RunStatus run={run} />
            </span>
            {run.progress !== undefined && (
              <span
                role="progressbar"
                aria-label={`${run.id} progress`}
                aria-valuenow={run.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="block h-[3px] w-[90px] overflow-hidden rounded-full bg-subtle"
              >
                <span className="block h-full bg-ai" style={{ width: `${run.progress}%` }} />
              </span>
            )}
          </div>
        )}
      </TD>
      <TD className="h-[53px] whitespace-nowrap text-fg-2 tabular">{run.started}</TD>
      <TD className={cn('h-[53px]', num)}>{run.duration}</TD>
      <TD className={cn('h-[53px]', num)}>{run.steps}</TD>
      <TD className={cn('h-[53px]', num)}>{run.tokens}</TD>
      <TD className={cn('h-[53px]', num)}>${run.cost.toFixed(3)}</TD>
    </TR>
  );
}

function FailureDetails({ run, onRetry }: { run: RunRow; onRetry: () => void }) {
  const error = run.error!;
  return (
    <tr className="border-b border-border last:border-0">
      <td colSpan={10} className="px-4 pb-3">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-danger-border bg-danger-subtle px-3.5 py-3">
          <Icon name="alert-circle" size={16} className="shrink-0 text-danger-text" />
          <div className="min-w-0 flex-1">
            <p className="text-13 font-medium text-fg">{error.message}</p>
            <p className="text-body-s text-fg-2">
              {error.step} · <span className="font-mono">{error.code}</span>
            </p>
          </div>
          <Button variant="secondary" size="xs" leftIcon="refresh" onClick={onRetry}>
            Retry
          </Button>
          <Link
            to={runHref(run)}
            className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-body-s font-medium text-link hover:underline"
          >
            Open run
            <Icon name="arrow-right" size={12} strokeWidth={2} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

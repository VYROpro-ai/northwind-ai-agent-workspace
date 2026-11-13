import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import {
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  IconButton,
  Input,
  Badge,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
  type RunStatus,
  type Tone,
} from '@/components/ui';
import { recentRuns, type RecentRun } from '../data';
import { AgentGlyph } from './AgentGlyph';
import { Panel, PanelHeader } from './Panel';

const statusOptions: { value: RunStatus; label: string }[] = [
  { value: 'running', label: 'Running' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
];

const statusTone: Record<RunStatus, Tone> = {
  queued: 'info',
  running: 'brand',
  waiting: 'warn',
  succeeded: 'ok',
  failed: 'danger',
  cancelled: 'neutral',
};

const agentNames = Array.from(new Set(recentRuns.map((r) => r.agent.name)));

function Trigger({ trigger }: { trigger: RecentRun['trigger'] }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {'initials' in trigger ? (
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-subtle text-[9px] font-semibold text-fg-2">
          {trigger.initials}
        </span>
      ) : (
        <Avatar name={trigger.name} src={trigger.avatar} size="sm" />
      )}
      <span className="truncate">{trigger.name}</span>
    </span>
  );
}

/** W2-01 · Recent runs table with selection, search, agent / status filters and export. */
export function RecentRunsCard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(['run_4835']));
  const [agent, setAgent] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Set<RunStatus>>(() => new Set(statusOptions.map((s) => s.value)));
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recentRuns.filter(
      (r) =>
        (!agent || r.agent.name === agent) &&
        statuses.has(r.status) &&
        (!q || `${r.agent.name} ${r.id} ${r.detail}`.toLowerCase().includes(q)),
    );
  }, [agent, statuses, query]);

  const selectedCount = rows.filter((r) => selected.has(r.id)).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const toggleStatus = (status: RunStatus) =>
    setStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  const exportRuns = () => {
    const count = selectedCount || rows.length;
    toast({
      title: `Exported ${count} run${count === 1 ? '' : 's'}`,
      description: 'recent-runs.csv is ready',
    });
  };

  return (
    <Panel className="flex flex-col gap-4 px-4 pt-5 pb-1.5 sm:px-[22px]">
      <PanelHeader
        icon="run"
        title="Recent runs"
        actions={
          <>
            <IconButton
              icon="search"
              label={searchOpen ? 'Hide search' : 'Search runs'}
              aria-pressed={searchOpen}
              className="size-[38px]"
              onClick={() => {
                setSearchOpen((open) => !open);
                setQuery('');
              }}
            />
            <Dropdown
              align="end"
              items={[
                {
                  label: 'All agents',
                  icon: agent === null ? 'check' : undefined,
                  onSelect: () => setAgent(null),
                },
                ...agentNames.map((name) => ({
                  label: name,
                  icon: agent === name ? ('check' as const) : undefined,
                  onSelect: () => setAgent(name),
                })),
              ]}
              trigger={(props) => (
                <button
                  type="button"
                  {...props}
                  className="inline-flex h-[38px] items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-13 font-medium text-fg transition-colors hover:bg-subtle"
                >
                  {agent ?? 'All agents'}
                  <Icon name="chevron-down" size={14} strokeWidth={2} />
                </button>
              )}
            />
            <Dropdown
              align="end"
              width={200}
              trigger={(props) => (
                <IconButton {...props} icon="sliders" label="Filter by status" className="size-[38px]" />
              )}
            >
              <fieldset className="flex flex-col gap-2.5 p-2.5">
                <legend className="mb-2 text-body-s font-medium text-fg-3">Status</legend>
                {statusOptions.map((s) => (
                  <Checkbox
                    key={s.value}
                    label={s.label}
                    checked={statuses.has(s.value)}
                    onChange={() => toggleStatus(s.value)}
                  />
                ))}
              </fieldset>
            </Dropdown>
            <Dropdown
              align="end"
              items={[
                { label: 'Open runs list', icon: 'run', onSelect: () => navigate('/runs') },
                { label: 'Live logs', icon: 'terminal', onSelect: () => navigate('/runs/live') },
                {
                  label: 'Clear selection',
                  icon: 'close',
                  separator: true,
                  disabled: selected.size === 0,
                  onSelect: () => setSelected(new Set()),
                },
              ]}
              trigger={(props) => (
                <IconButton {...props} icon="more" label="More options" className="size-[38px]" />
              )}
            />
            <Button variant="inverse" className="h-10 pr-4 pl-2 shadow-none" onClick={exportRuns}>
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-on-inverse/15">
                <Icon name="upload" size={13} strokeWidth={2.2} />
              </span>
              Export
            </Button>
          </>
        }
      />

      {searchOpen && (
        <Input
          autoFocus
          pill
          size="sm"
          leftIcon="search"
          placeholder="Search by agent, run ID or detail"
          aria-label="Search recent runs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      <TableContainer>
        <Table className="min-w-[600px] table-fixed text-13">
          <THead className="text-13">
            <TR>
              <TH className="w-8 first:pl-1">
                <Checkbox
                  aria-label="Select all runs"
                  checked={selectedCount > 0}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={toggleAll}
                  disabled={rows.length === 0}
                />
              </TH>
              <TH>Agent</TH>
              <TH className="w-[130px]">Started</TH>
              <TH className="w-[18%]">Triggered by</TH>
              <TH className="w-16">Cost</TH>
              <TH className="w-[100px] text-right last:pr-1 [&>span]:justify-end">Status</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id} selected={selected.has(r.id)}>
                <TD className="h-[54px] first:pl-1">
                  <Checkbox
                    aria-label={`Select ${r.id}`}
                    checked={selected.has(r.id)}
                    onChange={() => toggleRow(r.id)}
                  />
                </TD>
                <TD className="h-[54px] max-w-0">
                  <Link to={r.to} className="group flex min-w-0 items-center gap-2.5">
                    <AgentGlyph agent={r.agent} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium group-hover:underline">{r.agent.name}</span>
                      <span className="truncate text-body-s text-fg-3">
                        <span className="font-mono">{r.id}</span> · {r.detail}
                      </span>
                    </span>
                  </Link>
                </TD>
                <TD className="h-[54px] whitespace-nowrap text-fg-2">{r.started}</TD>
                <TD className="h-[54px] max-w-0">
                  <Trigger trigger={r.trigger} />
                </TD>
                <TD className="h-[54px] font-medium tabular">{r.cost}</TD>
                <TD className="h-[54px] text-right last:pr-1">
                  <Badge
                    tone={statusTone[r.status]}
                    bordered={false}
                    className="h-[26px] border-transparent text-caption font-semibold"
                  >
                    {statusOptions.find((o) => o.value === r.status)?.label ?? r.status}
                  </Badge>
                </TD>
              </TR>
            ))}
            {rows.length === 0 && (
              <TR>
                <TD colSpan={6} className="h-24 text-center text-fg-3">
                  No runs match these filters.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </TableContainer>
    </Panel>
  );
}

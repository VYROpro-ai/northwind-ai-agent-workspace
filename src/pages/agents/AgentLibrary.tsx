import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Icon } from '@/components/icons';
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  EmptyState,
  Input,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
} from '@/components/ui';
import { formatNumber } from '@/lib/format';
import { agentCount, agents, type AgentSummary } from './data';
import { listAgents } from '@/lib/agents';
import { useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AgentCard, AgentStatusLabel } from './components/AgentCard';
import { AgentIcon } from './components/AgentIcon';
import { FilterMenu } from './components/FilterMenu';

type SortKey = 'Last edited' | 'Name' | 'Success rate' | 'Runs';
type View = 'grid' | 'table';

const sorters: Record<SortKey, (a: AgentSummary, b: AgentSummary) => number> = {
  'Last edited': (a, b) => a.editedAgo - b.editedAgo,
  Name: (a, b) => a.name.localeCompare(b.name),
  'Success rate': (a, b) => (b.success ?? -1) - (a.success ?? -1),
  Runs: (a, b) => (b.runs ?? -1) - (a.runs ?? -1),
};

const unique = (values: string[]) => [...new Set(values)];

function AgentsTable({ list }: { list: AgentSummary[] }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <TableContainer>
        <Table className="min-w-[760px]">
          <THead>
            <TR>
              <TH>Agent</TH>
              <TH>Status</TH>
              <TH>Model</TH>
              <TH className="text-right">Runs · 7 d</TH>
              <TH className="text-right">Success</TH>
              <TH>Owner</TH>
              <TH>Edited</TH>
            </TR>
          </THead>
          <TBody>
            {list.map((a) => (
              <TR key={a.id}>
                <TD>
                  <Link
                    to={`/agents/${a.id}`}
                    className="flex items-center gap-3 font-medium text-fg hover:underline"
                  >
                    <AgentIcon icon={a.icon} tone={a.tone} size={32} shape="circle" />
                    {a.name}
                  </Link>
                </TD>
                <TD className="text-body-s">
                  <AgentStatusLabel status={a.status} />
                </TD>
                <TD className="whitespace-nowrap text-fg-2">{a.model}</TD>
                <TD className="text-right tabular">{a.runs !== null ? formatNumber(a.runs) : '—'}</TD>
                <TD
                  className={cn(
                    'text-right font-medium tabular',
                    a.success !== null && a.success < 90 && 'text-danger-text',
                  )}
                >
                  {a.success !== null ? `${a.success}%` : '—'}
                </TD>
                <TD>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Avatar name={a.owner.name} src={a.owner.avatar} size="xs" />
                    {a.owner.name}
                  </span>
                </TD>
                <TD className="whitespace-nowrap text-fg-3">{a.edited}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

/** W3-01 · Agent library */
export default function AgentLibrary() {
  const navigate = useNavigate();
  const toast = useToast();
  const { workspace } = useAuth();
  // Real agents when configured; null = demo mode or load failed (fall back to mock).
  const [realAgents, setRealAgents] = useState<AgentSummary[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !workspace) return;
    let cancelled = false;
    void listAgents(workspace.id).then((rows) => {
      if (!cancelled && rows) setRealAgents(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [workspace]);

  const source = realAgents ?? agents;
  const total = realAgents ? realAgents.length : agentCount;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  // `null` keeps the curated order from data.ts until the user picks a sort.
  const [sort, setSort] = useState<SortKey | null>(null);
  const [view, setView] = useState<View>('grid');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source
      .filter((a) => !q || `${a.name} ${a.description}`.toLowerCase().includes(q))
      .filter((a) => !status || a.status === status)
      .filter((a) => !owner || a.owner.name === owner)
      .filter((a) => !model || a.model === model)
      .filter((a) => !tag || a.tags.includes(tag))
      .sort(sort ? sorters[sort] : () => 0);
  }, [query, status, owner, model, tag, sort, source]);

  const filtered = Boolean(query || status || owner || model || tag);
  const clear = () => {
    setQuery('');
    setStatus(null);
    setOwner(null);
    setModel(null);
    setTag(null);
  };

  return (
    <AppShell active="Agents" role="builder" crumbs={[{ label: 'Agents' }]} mainClassName="gap-5 lg:pt-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 font-semibold tracking-[-0.02em] sm:text-[28px] sm:leading-9">
            Agents <span className="text-h4 font-medium text-fg-3">{total}</span>
          </h1>
          <p className="text-body-m text-fg-2">
            Build, test and watch the health of every agent in Northwind Labs.
          </p>
        </div>
        <div className="flex">
          <Button
            leftIcon="plus"
            className="rounded-r-none pr-3.5 pl-3.5"
            onClick={() => navigate('/agents/new/basics')}
          >
            New agent
          </Button>
          <Dropdown
            align="end"
            width={240}
            trigger={(props) => (
              <button
                type="button"
                aria-label="New agent options"
                className="inline-flex h-9 w-8 items-center justify-center rounded-r-full border-l border-white/30 bg-brand-hover text-white transition-colors hover:bg-brand-press"
                {...props}
              >
                <Icon name="chevron-down" size={14} strokeWidth={2} />
              </button>
            )}
            items={[
              {
                label: 'Blank agent',
                icon: 'plus',
                description: 'Start from scratch',
                onSelect: () => navigate('/agents/new/basics'),
              },
              {
                label: 'From a template',
                icon: 'layers',
                description: '48 proven setups',
                onSelect: () => navigate('/agents/templates'),
              },
              {
                label: 'Import from file',
                icon: 'upload',
                description: 'JSON export of an agent',
                onSelect: () =>
                  toast({
                    tone: 'neutral',
                    title: 'Import an agent',
                    description: 'Drop a .json export here.',
                  }),
              },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          pill
          leftIcon="search"
          aria-label="Search agents"
          placeholder="Search agents"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          containerClassName="w-full sm:w-[260px]"
          className="border-border text-13"
        />
        <FilterMenu
          label="Status"
          options={['Published', 'Paused', 'Draft']}
          value={status}
          onChange={setStatus}
        />
        <FilterMenu
          label="Owner"
          options={unique(source.map((a) => a.owner.name))}
          value={owner}
          onChange={setOwner}
        />
        <FilterMenu
          label="Model"
          options={unique(source.map((a) => a.model))}
          value={model}
          onChange={setModel}
        />
        <FilterMenu
          label="Tag"
          options={unique(source.flatMap((a) => a.tags))}
          value={tag}
          onChange={setTag}
        />
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
        )}
        <span className="flex-1" />
        <Dropdown
          align="end"
          width={180}
          trigger={(props) => (
            <Button variant="ghost" size="sm" leftIcon="sort" className="h-9 text-fg-2" {...props}>
              {sort ?? 'Last edited'}
            </Button>
          )}
          items={(Object.keys(sorters) as SortKey[]).map((key) => ({
            label: key,
            icon: key === (sort ?? 'Last edited') ? ('check' as const) : undefined,
            onSelect: () => setSort(key),
          }))}
        />
        <div role="group" aria-label="View" className="inline-flex gap-0.5 rounded-md bg-subtle p-0.5">
          {(['grid', 'table'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-label={v === 'grid' ? 'Grid view' : 'Table view'}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                'inline-flex h-[30px] w-8 items-center justify-center rounded-full transition-colors',
                view === v ? 'bg-surface text-fg shadow-raised' : 'text-icon hover:text-fg',
              )}
            >
              <Icon name={v === 'grid' ? 'grid' : 'list'} size={16} />
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="search"
          title="No agents match"
          description="Try a different search or clear the filters."
          action={
            <Button variant="secondary" onClick={clear}>
              Clear filters
            </Button>
          }
          className="rounded-[20px] border border-dashed border-border-strong"
        />
      ) : view === 'grid' ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-5">
          {list.map((a) => (
            <li key={a.id} className="flex">
              <AgentCard agent={a} />
            </li>
          ))}
        </ul>
      ) : (
        <AgentsTable list={list} />
      )}
    </AppShell>
  );
}

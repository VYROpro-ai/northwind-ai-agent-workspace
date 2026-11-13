import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import { Icon, type IconName } from '@/components/icons';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  EmptyState,
  IconButton,
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
import {
  newWorkflowOptions,
  statusTones,
  workflowFilters,
  workflows,
  type LastRunResult,
  type NewWorkflowOption,
  type WorkflowFilter,
  type WorkflowRow,
} from '../data';

const lastRunIcon: Record<LastRunResult, { icon: IconName; className: string; label: string }> = {
  ok: { icon: 'check-sm', className: 'text-ok-text', label: 'Succeeded' },
  fail: { icon: 'close', className: 'text-danger-text', label: 'Failed' },
  none: { icon: 'minus', className: 'text-fg-3', label: 'No result' },
};

const optionRoutes: Record<NewWorkflowOption['id'], string> = {
  blank: '/workflows/editor/trigger',
  template: '/workflows/editor',
  ai: '/workflows/editor/ai',
};

/** W5-01 · Workflow list. `menuOpen` renders the W5-01s state with the “New workflow” menu open. */
export function WorkflowListScreen({ menuOpen = false }: { menuOpen?: boolean }) {
  const [filter, setFilter] = useState<WorkflowFilter>('All');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(menuOpen);

  const q = query.trim().toLowerCase();
  const rows = workflows.filter(
    (w) =>
      (filter === 'All' || w.status === filter) &&
      (w.name.toLowerCase().includes(q) || w.trigger.toLowerCase().includes(q)),
  );
  const count = (f: WorkflowFilter) =>
    f === 'All' ? workflows.length : workflows.filter((w) => w.status === f).length;
  const active = count('Active');

  return (
    <AppShell
      active="Workflows"
      role="builder"
      crumbs={[{ label: 'Workspace', to: '/' }, { label: 'Workflows' }]}
      mainClassName="gap-5 lg:pt-7"
    >
      <PageHeader
        title={<span className="sm:text-h2">Workflows</span>}
        description={`${workflows.length} workflows · ${active} active · 1,284 runs in the last 7 days`}
        actions={
          <>
            <Input
              pill
              size="md"
              leftIcon="search"
              placeholder="Search workflows"
              aria-label="Search workflows"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              containerClassName="w-full sm:w-[220px]"
              className="border-border text-13"
            />
            <NewWorkflowMenu open={open} onOpenChange={setOpen} />
          </>
        }
      />

      <div role="radiogroup" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
        {workflowFilters.map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'h-[30px] rounded-full border px-3 text-13 font-medium transition-colors',
              filter === f
                ? 'border-brand-border bg-brand-subtle text-brand-text'
                : 'border-border bg-surface text-fg-2 hover:text-fg',
            )}
          >
            {f} <span className="font-normal text-fg-3">{count(f)}</span>
          </button>
        ))}
      </div>

      <section
        aria-label="Workflows"
        className="overflow-hidden rounded-[18px] border border-border bg-surface"
      >
        {rows.length === 0 ? (
          <EmptyState
            icon="workflow"
            title="No workflows match"
            description="Try another status or search term."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilter('All');
                  setQuery('');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <TableContainer>
            <Table className="min-w-[860px] text-13">
              <THead className="border-b border-border bg-sunken [&_th]:h-9 [&_th]:font-medium">
                <tr>
                  <TH className="w-[28%] pl-4 first:pl-4">Name</TH>
                  <TH className="w-[22%]">Trigger</TH>
                  <TH className="w-[108px]">Status</TH>
                  <TH>Last run</TH>
                  <TH className="w-[76px] text-right [&>span]:justify-end">Runs 7d</TH>
                  <TH className="w-[84px] text-right [&>span]:justify-end">Success</TH>
                  <TH className="w-[68px]">Owner</TH>
                  <TH className="w-11 pr-4 last:pr-4">
                    <span className="sr-only">Actions</span>
                  </TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((w) => (
                  <WorkflowTableRow key={w.id} workflow={w} />
                ))}
              </TBody>
            </Table>
          </TableContainer>
        )}
      </section>
    </AppShell>
  );
}

function WorkflowTableRow({ workflow: w }: { workflow: WorkflowRow }) {
  const navigate = useNavigate();
  const toast = useToast();
  const last = lastRunIcon[w.lastRun];
  const pct = parseInt(w.successRate, 10);

  return (
    <TR className={cn('hover:bg-sunken', w.error && 'bg-danger-subtle/40 hover:bg-danger-subtle/60')}>
      <TD className="h-[59px] max-w-[280px] pl-4 first:pl-4">
        <Link to="/workflows/editor" className="block truncate font-semibold text-fg hover:underline">
          {w.name}
        </Link>
        <p className={cn('truncate text-body-s', w.error ? 'text-danger-text' : 'text-fg-3')}>
          {w.description}
        </p>
      </TD>
      <TD>
        <span className="flex items-center gap-2">
          <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-subtle text-fg-2">
            <Icon name={w.triggerIcon} size={14} strokeWidth={1.9} />
          </span>
          <span className="truncate whitespace-nowrap text-fg-2">{w.trigger}</span>
        </span>
      </TD>
      <TD>
        <Badge tone={statusTones[w.status]} dot className="h-[22px] border-transparent">
          {w.status}
        </Badge>
      </TD>
      <TD>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-fg-2">
          <Icon name={last.icon} size={13} strokeWidth={2.6} className={last.className} label={last.label} />
          {w.lastRunLabel}
        </span>
      </TD>
      <TD className="text-right tabular">{w.runs7d}</TD>
      <TD
        className={cn(
          'text-right font-medium tabular',
          Number.isNaN(pct) ? 'text-fg-3' : pct < 90 ? 'text-warn-text' : 'text-fg',
        )}
      >
        {w.successRate}
      </TD>
      <TD>
        <Avatar name={w.owner.name} src={w.owner.avatar} size="sm" className="[&>img]:size-[26px]" />
      </TD>
      <TD className="pr-4 last:pr-4">
        <Dropdown
          align="end"
          width={200}
          items={[
            { label: 'Open editor', icon: 'edit', onSelect: () => navigate('/workflows/editor') },
            { label: 'Test run', icon: 'play', onSelect: () => navigate('/workflows/editor/test') },
            {
              label: 'Compare versions',
              icon: 'history',
              onSelect: () => navigate('/workflows/editor/diff'),
            },
            {
              label: 'Duplicate',
              icon: 'copy',
              onSelect: () =>
                toast({ title: 'Workflow duplicated', description: `${w.name} (copy) saved as a draft.` }),
            },
            {
              label: w.status === 'Paused' ? 'Resume' : 'Pause',
              icon: w.status === 'Paused' ? 'play' : 'pause',
              separator: true,
              onSelect: () =>
                toast({
                  title: w.status === 'Paused' ? 'Workflow resumed' : 'Workflow paused',
                  tone: 'neutral',
                }),
            },
            {
              label: 'Delete',
              icon: 'trash',
              danger: true,
              onSelect: () => toast({ title: 'Workflow deleted', description: w.name, tone: 'danger' }),
            },
          ]}
          trigger={(props) => (
            <IconButton {...props} icon="more" label={`Actions for ${w.name}`} variant="ghost" size="sm" />
          )}
        />
      </TD>
    </TR>
  );
}

function NewWorkflowMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  return (
    <Dropdown
      align="end"
      width={294}
      panelRole="menu"
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-[18px] max-sm:right-auto max-sm:left-0"
      trigger={(props) => (
        <Button {...props} rightIcon="chevron-down" className="pr-3 pl-3.5 text-13">
          New workflow
        </Button>
      )}
    >
      {newWorkflowOptions.map((o) => (
        <button
          key={o.id}
          type="button"
          role="menuitem"
          onClick={() => {
            onOpenChange(false);
            navigate(optionRoutes[o.id]);
          }}
          className="flex w-full gap-2.5 rounded-md p-2.5 text-left transition-colors hover:bg-subtle focus:bg-subtle focus:outline-none"
        >
          <span
            className={cn(
              'inline-flex size-[30px] shrink-0 items-center justify-center rounded-md',
              o.ai ? 'bg-ai-subtle text-ai-text' : 'bg-subtle text-fg-2',
            )}
          >
            <Icon name={o.icon} size={16} strokeWidth={1.8} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-13 font-medium text-fg">{o.title}</span>
            <span className="text-body-s text-fg-3">{o.description}</span>
          </span>
        </button>
      ))}
    </Dropdown>
  );
}

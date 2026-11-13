import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Avatar,
  Button,
  Input,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  useToast,
} from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { tok } from '@/lib/syntax';
import { auditActorName, auditEntries, type AuditActor, type AuditEntry } from './data';
import { PrefixSelect } from './components/PrefixSelect';
import { SettingsLayout } from './components/SettingsLayout';

const actorOptions = [
  { value: 'all', label: 'Anyone' },
  { value: 'people', label: 'People' },
  { value: 'agents', label: 'Agents' },
  { value: 'keys', label: 'API keys' },
];

const actionTypes = Array.from(new Set(auditEntries.map((e) => e.action.split('.')[0])));
const actionOptions = [
  { value: 'all', label: 'All types' },
  ...actionTypes.map((t) => ({ value: t, label: t })),
];

const dateOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: 'today', label: 'Today' },
  { value: '24h', label: 'Last 24 hours' },
];

function ActorCell({ actor }: { actor: AuditActor }) {
  if (actor.kind === 'person') {
    return (
      <span className="flex min-w-0 items-center gap-2">
        <Avatar name={actor.person.name} src={actor.person.avatar} size="sm" />
        <span className="truncate text-fg">{actor.person.name}</span>
      </span>
    );
  }
  const agent = actor.kind === 'agent';
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'inline-flex size-6 shrink-0 items-center justify-center rounded-full',
          agent ? 'bg-ai-subtle text-ai-text' : 'bg-subtle text-icon',
        )}
      >
        <Icon name={agent ? 'nav-agents' : 'key'} size={13} strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className={cn('block truncate text-fg', !agent && 'font-mono')}>{actor.name}</span>
        {agent && <span className="block text-caption text-fg-3">on behalf of {actor.onBehalfOf}</span>}
      </span>
    </span>
  );
}

function JsonBlock({ label, data }: { label: string; data: Record<string, string | number> }) {
  const entries = Object.entries(data);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-body-s font-semibold text-fg-2">{label}</span>
      <pre className="overflow-x-auto rounded-lg bg-code p-3.5 font-mono text-body-s leading-[19px] text-code-fg">
        {'{\n'}
        {entries.map(([k, v], i) => (
          <Fragment key={k}>
            {'  '}
            <span className={tok.key}>"{k}"</span>:{' '}
            {typeof v === 'number' ? (
              <span className={tok.num}>{v}</span>
            ) : (
              <span className={tok.str}>"{v}"</span>
            )}
            {i < entries.length - 1 ? ',\n' : '\n'}
          </Fragment>
        ))}
        {'}'}
      </pre>
    </div>
  );
}

function EntryDetail({ entry }: { entry: AuditEntry }) {
  if (entry.before && entry.after) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <JsonBlock label="Before" data={entry.before} />
        <JsonBlock label="After" data={entry.after} />
      </div>
    );
  }
  const rows: [string, string][] = [
    ['Event ID', entry.id],
    ['Actor', auditActorName(entry.actor)],
    ['Action', entry.action],
    ['Target', entry.target],
    ['IP address', entry.ip ?? 'Not recorded (internal)'],
    ['Location', entry.location ?? '—'],
  ];
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg border border-border bg-surface p-3.5 text-13 sm:grid-cols-3">
      {rows.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-body-s text-fg-3">{k}</dt>
          <dd className="truncate text-fg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** W10-04 · Audit log */
export default function AuditLog() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [actor, setActor] = useState('all');
  const [action, setAction] = useState('all');
  const [date, setDate] = useState('7d');
  const [open, setOpen] = useState<string | null>(auditEntries[0].id);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditEntries.filter((e) => {
      const kind = e.actor.kind === 'person' ? 'people' : e.actor.kind === 'agent' ? 'agents' : 'keys';
      return (
        (actor === 'all' || actor === kind) &&
        (action === 'all' || e.action.startsWith(`${action}.`)) &&
        (date !== 'today' || e.date === 'today') &&
        (!q || [e.action, e.target, auditActorName(e.actor)].some((s) => s.toLowerCase().includes(q)))
      );
    });
  }, [query, actor, action, date]);

  return (
    <SettingsLayout
      crumb="Audit log"
      title="Audit log"
      description="Every important action in Northwind Labs."
      actions={
        <Button
          size="sm"
          variant="secondary"
          leftIcon="download"
          onClick={() =>
            toast({ title: 'Export started', description: `${rows.length} events · audit-log.csv` })
          }
        >
          Export CSV
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Input
          pill
          size="sm"
          leftIcon="search"
          placeholder="Search actions, people or targets"
          aria-label="Search audit log"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          containerClassName="w-full md:w-[300px]"
          className="h-[34px] border-border text-13"
        />
        <PrefixSelect
          pill
          prefix="Actor"
          label="Actor"
          options={actorOptions}
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          containerClassName="w-[calc(50%-5px)] sm:w-[132px]"
        />
        <PrefixSelect
          pill
          prefix="Action"
          label="Action type"
          options={actionOptions}
          value={action}
          onChange={(e) => setAction(e.target.value)}
          containerClassName="w-[calc(50%-5px)] sm:w-[148px]"
        />
        <PrefixSelect
          pill
          prefix="Date"
          label="Date range"
          options={dateOptions}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          containerClassName="w-full sm:w-[152px]"
        />
      </div>

      <div className="rounded-[18px] border border-border bg-surface">
        <TableContainer className="rounded-[17px]">
          <Table className="min-w-[880px] table-fixed text-13">
            <caption className="sr-only">Audit events</caption>
            <colgroup>
              <col className="w-[136px]" />
              <col className="w-[302px]" />
              <col className="w-[160px]" />
              <col />
              <col className="w-[110px]" />
              <col className="w-[110px]" />
              <col className="w-[44px]" />
            </colgroup>
            <THead className="border-b border-border bg-sunken font-medium">
              <tr>
                <TH className="pl-4 first:pl-4">Time</TH>
                <TH>Actor</TH>
                <TH>Action</TH>
                <TH>Target</TH>
                <TH>IP address</TH>
                <TH>Location</TH>
                <TH className="pr-4 last:pr-4">
                  <span className="sr-only">Details</span>
                </TH>
              </tr>
            </THead>
            <TBody>
              {rows.map((e) => {
                const expanded = open === e.id;
                const toggle = () => setOpen(expanded ? null : e.id);
                return (
                  <Fragment key={e.id}>
                    <tr
                      onClick={toggle}
                      className={cn(
                        'cursor-pointer border-b border-border transition-colors last:border-0',
                        expanded ? 'border-transparent bg-brand-subtle' : 'hover:bg-sunken/60',
                      )}
                    >
                      <TD className="h-[42px] py-2 pl-4 font-mono text-body-s whitespace-nowrap text-fg-2 first:pl-4">
                        {e.time}
                      </TD>
                      <TD className="h-[42px] py-2">
                        <ActorCell actor={e.actor} />
                      </TD>
                      <TD className="h-[42px] py-2 font-mono text-body-s text-fg">{e.action}</TD>
                      <TD className="h-[42px] truncate py-2 text-fg-2">{e.target}</TD>
                      <TD className="h-[42px] py-2 font-mono text-body-s text-fg-2">{e.ip ?? '—'}</TD>
                      <TD className="h-[42px] truncate py-2 text-fg-2">{e.location ?? '—'}</TD>
                      <TD className="h-[42px] py-2 pr-4 text-right last:pr-4">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-label={`${expanded ? 'Hide' : 'Show'} details for ${e.action}`}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            toggle();
                          }}
                          className="inline-flex size-6 items-center justify-center rounded-sm text-fg-3 hover:bg-subtle hover:text-fg"
                        >
                          <Icon
                            name={expanded ? 'chevron-down' : 'chevron-right'}
                            size={14}
                            strokeWidth={2}
                          />
                        </button>
                      </TD>
                    </tr>
                    {expanded && (
                      <tr className="border-b border-border bg-brand-subtle last:border-0">
                        <td colSpan={7} className="px-4 pt-1 pb-4">
                          <EntryDetail entry={e} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-13 text-fg-3">
                    No events match these filters.
                  </td>
                </tr>
              )}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] bg-sunken px-3.5 py-2.5 text-13 text-fg-2">
        <Icon name="info" size={16} className="shrink-0 text-icon" />
        <p className="min-w-0 flex-1">Kept for 90 days on Pro. Business keeps the audit log for 1 year.</p>
        <Link to="/settings/plans" className="text-body-s font-medium text-link hover:underline">
          Compare plans
        </Link>
      </div>
    </SettingsLayout>
  );
}

import { useState, type ReactNode } from 'react';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import { Avatar, Badge, Button, Input, useToast, type Tone } from '@/components/ui';
import { cn } from '@/lib/cn';
import { userForRole } from '@/data/people';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { RunsTabs } from './components/RunsTabs';
import { Section } from './components/Section';
import { incidents as seed, type Incident, type IncidentEvent, type IncidentStatus } from './data';

const listFilters = ['Open & investigating', 'Resolved'] as const;
const statuses: IncidentStatus[] = ['Open', 'Investigating', 'Reopened', 'Resolved'];

const sevTone: Record<Incident['sev'], Tone> = { SEV1: 'danger', SEV2: 'warn', SEV3: 'neutral' };
const statusTone: Record<IncidentStatus, Tone> = {
  Open: 'danger',
  Investigating: 'warn',
  Reopened: 'danger',
  Resolved: 'ok',
};
const eventDot: Record<IncidentEvent['tone'], string> = {
  brand: 'bg-brand',
  warn: 'bg-warn',
  danger: 'bg-danger',
  muted: 'bg-fg-disabled',
};

const me = userForRole.admin;

/** W6-09 · Incidents */
export default function Incidents() {
  const toast = useToast();
  const [items, setItems] = useState<Incident[]>(seed);
  const [filter, setFilter] = useState<(typeof listFilters)[number]>('Open & investigating');
  const [selectedId, setSelectedId] = useState(seed[0].id);
  const [comment, setComment] = useState('');
  const [allEvents, setAllEvents] = useState(false);

  const openCount = items.filter((i) => i.status !== 'Resolved').length;
  // Open work first; recently resolved incidents stay listed at the end for context.
  const list =
    filter === 'Resolved'
      ? items.filter((i) => i.status === 'Resolved')
      : [...items.filter((i) => i.status !== 'Resolved'), ...items.filter((i) => i.status === 'Resolved')];
  const incident = items.find((i) => i.id === selectedId) ?? items[0];

  const update = (id: string, patch: Partial<Incident>, event?: Omit<IncidentEvent, 'time'>) =>
    setItems((all) =>
      all.map((i) =>
        i.id === id
          ? { ...i, ...patch, timeline: event ? [{ ...event, time: 'Just now' }, ...i.timeline] : i.timeline }
          : i,
      ),
    );

  const setStatus = (status: IncidentStatus) => {
    if (status === incident.status) return;
    update(
      incident.id,
      { status },
      { author: me.name, text: `Set status to ${status}.`, tone: status === 'Resolved' ? 'brand' : 'warn' },
    );
    toast({
      title: `${incident.sev} marked ${status.toLowerCase()}`,
      description: incident.title,
      tone: status === 'Resolved' ? 'ok' : 'neutral',
    });
  };

  const addComment = () => {
    const text = comment.trim();
    if (!text) return;
    update(incident.id, {}, { author: me.name, text, tone: 'brand' });
    setComment('');
  };

  return (
    <AppShell active="Runs" role="admin" crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'Incidents' }]}>
      <PageHeader
        title="Incidents"
        description="Related failures grouped so the team fixes the cause once."
        actions={
          <>
            <FilterSelect
              label="Status"
              value={filter}
              options={listFilters}
              onChange={setFilter}
              align="end"
            />
            <Button
              variant="secondary"
              size="sm"
              leftIcon="plus"
              className="h-[34px] px-3.5"
              onClick={() =>
                toast({ title: 'Incident drafted', description: 'Pick the failing runs to group under it.' })
              }
            >
              New incident
            </Button>
          </>
        }
      />
      <RunsTabs />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section
          aria-label="Incident list"
          className="overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <p className="bg-sunken px-3.5 py-2.5 text-body-s font-medium text-fg-3">
            {items.length} incidents · {openCount} open
          </p>
          <ul>
            {list.map((i) => {
              const active = i.id === incident.id;
              return (
                <li key={i.id} className="border-t border-border">
                  <button
                    type="button"
                    aria-current={active || undefined}
                    onClick={() => setSelectedId(i.id)}
                    className={cn(
                      'flex w-full flex-col gap-1.5 px-3.5 py-3 text-left transition-colors',
                      active ? 'bg-brand-subtle shadow-[inset_3px_0_0_var(--brand)]' : 'hover:bg-subtle/60',
                    )}
                  >
                    <span className="flex w-full items-center gap-1.5">
                      <Badge
                        tone={sevTone[i.sev]}
                        size="sm"
                        bordered={false}
                        className="h-5 border-transparent px-2 text-body-s"
                      >
                        {i.sev}
                      </Badge>
                      <Badge
                        tone={statusTone[i.status]}
                        size="sm"
                        dot
                        bordered={false}
                        className="h-5 border-transparent px-2 text-body-s"
                      >
                        {i.status}
                      </Badge>
                      <span className="flex-1" />
                      <span className="text-body-s text-fg-3">{i.when}</span>
                    </span>
                    <span className="text-13 font-semibold text-fg">{i.title}</span>
                    <span className="flex items-center gap-2 text-body-s">
                      <span className="text-fg-3">
                        {i.runs} runs · {i.affected}
                      </span>
                      {i.owner ? (
                        <Avatar name={i.owner.name} src={i.owner.avatar} size="xs" />
                      ) : (
                        i.unownedFor && (
                          <span className="font-medium text-warn-text">No owner for {i.unownedFor}</span>
                        )
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && (
            <p className="border-t border-border px-3.5 py-8 text-center text-13 text-fg-3">
              No incidents here.
            </p>
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <section
            aria-labelledby="incident-title"
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone={sevTone[incident.sev]} bordered={false} className="h-[22px] border-transparent">
                {incident.sev}
              </Badge>
              <h2
                id="incident-title"
                className="min-w-0 flex-1 basis-56 text-[18px] leading-6 font-semibold text-fg"
              >
                {incident.title}
              </h2>
              <FilterSelect
                label="Status"
                value={incident.status}
                options={statuses}
                onChange={setStatus}
                align="end"
              />
              <Button
                size="sm"
                leftIcon="check-sm"
                className="h-[34px] px-3.5"
                disabled={incident.status === 'Resolved'}
                onClick={() => setStatus('Resolved')}
              >
                {incident.status === 'Resolved' ? 'Resolved' : 'Resolve'}
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-border pt-3 md:grid-cols-4">
              <Fact label="Owner">
                {incident.owner ? (
                  incident.owner.name
                ) : (
                  <button
                    type="button"
                    className="font-medium text-link hover:underline"
                    onClick={() =>
                      update(
                        incident.id,
                        { owner: me, unownedFor: undefined },
                        { author: me.name, text: 'Took ownership.', tone: 'warn' },
                      )
                    }
                  >
                    Take ownership
                  </button>
                )}
              </Fact>
              <Fact label="Started">{incident.started}</Fact>
              <Fact label="Affected">{incident.affected}</Fact>
              <Fact label="Runs affected">{incident.runs}</Fact>
            </dl>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Section
              title="Failed runs, every 15 min"
              aside={<span className="text-body-s text-fg-3">{incident.rangeLabel}</span>}
              className="gap-2.5"
            >
              <FailureBars buckets={incident.buckets} />
              <div className="flex justify-between text-caption text-fg-3" aria-hidden>
                {incident.range.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </Section>
            <Section title="Root cause" className="gap-2">
              {incident.rootCause ? (
                <>
                  <p className="text-13 leading-5 text-fg-2">
                    {renderCause(incident.rootCause.text, incident.rootCause.code)}
                  </p>
                  <p className="text-body-s text-fg-3">{incident.rootCause.edited}</p>
                </>
              ) : (
                <p className="text-13 text-fg-3">
                  Not known yet. The owner adds it once they’ve found the cause.
                </p>
              )}
            </Section>
          </div>

          <Section
            title="Timeline"
            aside={
              <button
                type="button"
                aria-expanded={allEvents}
                onClick={() => setAllEvents(!allEvents)}
                className="text-body-s text-fg-3 hover:text-fg hover:underline"
              >
                {incident.timeline.length} events
              </button>
            }
            className="gap-2"
          >
            <ol>
              {(allEvents ? incident.timeline : incident.timeline.slice(0, 4)).map((e, i) => (
                <li key={`${e.time}-${i}`} className="flex gap-2.5">
                  <span className="flex w-2.5 flex-col items-center" aria-hidden>
                    <span className={cn('mt-1 size-[9px] shrink-0 rounded-full', eventDot[e.tone])} />
                    <span className="w-px flex-1 bg-border" />
                  </span>
                  <div className="flex flex-1 flex-col gap-0.5 pb-5">
                    <span className="text-body-s text-fg-3">
                      {e.time} · {e.author}
                    </span>
                    <span className="text-13 text-fg">{e.text}</span>
                  </div>
                </li>
              ))}
            </ol>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addComment();
              }}
            >
              <Input
                aria-label="Add a comment"
                placeholder="Add a comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-10 text-13"
              />
            </form>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption font-medium text-fg-3">{label}</dt>
      <dd className="text-13 font-medium text-fg">{children}</dd>
    </div>
  );
}

/** Fills `{0}`, `{1}` placeholders with inline code. */
function renderCause(text: string, code?: [string, string]) {
  if (!code) return text;
  return text.split(/(\{\d\})/).map((part, i) => {
    const m = /^\{(\d)\}$/.exec(part);
    return m ? (
      <code key={i} className="font-mono text-body-s text-fg-2">
        {code[Number(m[1])]}
      </code>
    ) : (
      part
    );
  });
}

/** Simple column chart: empty buckets show as a hairline, failures as red bars. */
function FailureBars({ buckets }: { buckets: number[] }) {
  const max = Math.max(...buckets, 1);
  return (
    <div
      role="img"
      aria-label={`Failed runs per 15 minutes: ${buckets.join(', ')}`}
      className="flex h-[100px] items-end gap-1.5 border-b border-border-strong"
    >
      {buckets.map((value, i) => (
        <div key={i} className="flex flex-1 justify-center" title={`${value} failed`}>
          <span
            className={cn('w-full max-w-[26px] rounded-t-[3px]', value ? 'bg-danger' : 'bg-border')}
            style={{ height: value ? `${Math.max(8, (value / max) * 90)}px` : '2px' }}
          />
        </div>
      ))}
    </div>
  );
}

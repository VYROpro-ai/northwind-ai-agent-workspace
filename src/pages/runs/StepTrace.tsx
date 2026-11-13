import { useState } from 'react';
import { Link } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { Badge, Button, EmptyState, Input, Tabs, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { JsonView } from './components/JsonView';
import { containerPaths, toPlainJson } from './components/json';
import { Section } from './components/Section';
import { StepGlyph } from './components/StepGlyph';
import { MASK, traceSteps, type JsonValue, type TraceStep } from './data';
import { ButtonLink } from './components/ButtonLink';

type TraceTab = 'input' | 'output' | 'prompt' | 'metadata' | 'logs';

const tabs: { value: TraceTab; label: string }[] = [
  { value: 'input', label: 'Input' },
  { value: 'output', label: 'Output' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'metadata', label: 'Metadata' },
  { value: 'logs', label: 'Logs' },
];

/** Initially folded objects, as in the design. */
const defaultCollapsed = new Set(['$.filters']);

/** W6-03 · Step trace */
export default function StepTrace() {
  const [stepId, setStepId] = useState('docs');
  const step = traceSteps.find((s) => s.id === stepId)!;
  const parent = step.child
    ? traceSteps
        .slice(0, traceSteps.indexOf(step))
        .reverse()
        .find((s) => !s.child)
    : undefined;

  return (
    <AppShell active="Runs" role="builder" crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'Step trace' }]}>
      <div className="flex flex-wrap items-center gap-2 text-13">
        <nav aria-label="Trace path" className="flex min-w-0 flex-wrap items-center gap-2">
          <Link to="/runs/run_4835" className="font-mono font-medium text-link hover:underline">
            run_4835
          </Link>
          {parent && (
            <>
              <span className="text-fg-3">/</span>
              <span className="text-fg-2">{parent.name}</span>
            </>
          )}
          <span className="text-fg-3">/</span>
          <h1 className={cn('font-semibold text-fg', step.child && 'font-mono')}>{step.name}</h1>
        </nav>
        <span className="flex-1" />
        <StepStatus step={step} />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label="Steps" className="rounded-2xl border border-border bg-surface p-3">
          <h2 className="mb-0.5 text-body-s font-semibold text-fg-3">Steps</h2>
          <ul className="flex flex-col gap-0.5">
            {traceSteps.map((s) => {
              const active = s.id === stepId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-current={active || undefined}
                    onClick={() => setStepId(s.id)}
                    className={cn(
                      'flex h-9 w-full items-center gap-2 rounded-md pr-2.5 text-left transition-colors',
                      s.child ? 'pl-7 font-mono text-body-s' : 'pl-2.5 text-13 font-semibold',
                      active ? 'bg-brand-subtle font-semibold text-brand-text' : 'text-fg hover:bg-subtle',
                      s.child && !active && 'font-normal text-fg-2',
                    )}
                  >
                    <StepGlyph state={s.state} size={12} pendingIcon="clock" />
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    <span className="font-mono text-caption font-normal text-fg-3">{s.duration}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          {step.state === 'done' ? (
            <>
              <StepInspector key={step.id} step={step} />
              {step.chunks && <ChunkList chunks={step.chunks} />}
            </>
          ) : (
            <section className="rounded-2xl border border-border bg-surface">
              <EmptyState
                icon={step.state === 'waiting' ? 'approval-wait' : 'clock'}
                title={step.state === 'waiting' ? 'Waiting for Leo Martins' : 'This step hasn’t run yet'}
                description={
                  step.state === 'waiting'
                    ? 'The run pauses here until the support lead approves the refund.'
                    : 'Its input and output appear here once the steps before it finish.'
                }
                action={
                  step.state === 'waiting' && <ButtonLink to="/approvals/apr_240">Open approval</ButtonLink>
                }
              />
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StepStatus({ step }: { step: TraceStep }) {
  if (step.state === 'done')
    return (
      <Badge tone="ok" icon="check-sm" bordered={false} className="h-[22px] border-transparent">
        Succeeded · {step.duration}
      </Badge>
    );
  if (step.state === 'waiting')
    return (
      <Badge tone="warn" icon="clock" bordered={false} className="h-[22px] border-transparent">
        Waiting · {step.duration}
      </Badge>
    );
  return (
    <Badge tone="neutral" icon="clock" bordered={false} className="h-[22px] border-transparent">
      Not started
    </Badge>
  );
}

const hasMask = (value: JsonValue | undefined): boolean => {
  if (typeof value === 'string') return value.startsWith(MASK);
  if (Array.isArray(value)) return value.some(hasMask);
  if (value && typeof value === 'object') return Object.values(value).some(hasMask);
  return false;
};

/** Tabbed input / output / prompt / metadata / logs viewer for one finished step. */
function StepInspector({ step }: { step: TraceStep }) {
  const toast = useToast();
  const [tab, setTab] = useState<TraceTab>('input');
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(defaultCollapsed));
  const json = tab === 'input' ? step.input : tab === 'output' ? step.output : undefined;
  const allPaths = json ? containerPaths(json).filter((p) => p !== '$') : [];
  const allCollapsed = allPaths.length > 0 && allPaths.every((p) => collapsed.has(p));

  const toggle = (path: string) =>
    setCollapsed((c) => {
      const next = new Set(c);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const copy = async () => {
    const text = json
      ? toPlainJson(json)
      : tab === 'prompt'
        ? (step.prompt ?? '')
        : (step.logs ?? []).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${tabs.find((t) => t.value === tab)!.label} copied`,
        description: 'Masked values stay masked.',
      });
    } catch {
      toast({ title: 'Couldn’t copy', description: 'Your browser blocked clipboard access.', tone: 'warn' });
    }
  };

  return (
    <section
      aria-label={`${step.name} details`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 pt-3.5 pb-4 sm:px-[18px] sm:pb-[18px]"
    >
      <Tabs
        items={tabs}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setQuery('');
        }}
        label="Step details"
      />
      {json !== undefined && (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            <Input
              type="search"
              pill
              size="sm"
              leftIcon="search"
              aria-label={`Search in ${tab}`}
              placeholder={`Search in ${tab}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              containerClassName="w-full sm:w-[220px]"
              className="h-[34px] border-border text-13"
            />
            <span className="flex-1" />
            {allPaths.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(allPaths))}
              >
                {allCollapsed ? 'Expand all' : 'Collapse all'}
              </Button>
            )}
            <Button variant="secondary" size="sm" leftIcon="copy" onClick={copy}>
              Copy
            </Button>
          </div>
          <JsonView value={json} collapsed={collapsed} onToggle={toggle} query={query} />
          {hasMask(json) && (
            <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] bg-subtle px-3.5 py-2.5 text-13 text-fg-2">
              <Icon name="shield" size={16} strokeWidth={2} className="shrink-0" />
              <p className="min-w-0 flex-1">
                Card details are masked by the <b className="font-semibold">Payment data</b> policy. Only
                Admins can reveal them, and every reveal is saved to the audit log.
              </p>
              <Button
                variant="ghost"
                size="xs"
                disabled
                title="Only Admins can reveal masked values"
                className="h-7 px-3"
              >
                Reveal
              </Button>
            </div>
          )}
        </>
      )}
      {tab === 'prompt' &&
        (step.prompt ? (
          <>
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" leftIcon="copy" onClick={copy}>
                Copy
              </Button>
            </div>
            <p className="rounded-md border border-border bg-sunken px-3.5 py-3 text-13 whitespace-pre-wrap text-fg">
              {step.prompt}
            </p>
          </>
        ) : (
          <p className="py-6 text-center text-13 text-fg-3">This step doesn’t send a prompt to a model.</p>
        ))}
      {tab === 'metadata' && (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 py-1 sm:grid-cols-2">
          {(step.metadata ?? []).map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-caption font-medium text-fg-3">{label}</dt>
              <dd className="text-13 font-medium text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {tab === 'logs' && (
        <pre className="scrollbar-thin overflow-x-auto rounded-md bg-code px-3.5 py-3 font-mono text-[11.5px] leading-[19px] text-code-fg">
          {(step.logs ?? []).join('\n')}
        </pre>
      )}
    </section>
  );
}

function ChunkList({ chunks }: { chunks: NonNullable<TraceStep['chunks']> }) {
  return (
    <Section
      title="Retrieved chunks"
      aside={<span className="text-body-s text-fg-3">{chunks.length} of 5 · sorted by relevance</span>}
      className="gap-2.5"
    >
      <ul className="flex flex-col gap-2.5">
        {chunks.map((chunk) => (
          <li key={chunk.source} className="flex gap-3 rounded-[10px] border border-border p-3">
            <div className="flex w-14 shrink-0 flex-col gap-1.5">
              <span className="font-mono text-13 font-semibold text-fg">{chunk.score.toFixed(2)}</span>
              <span className="block h-1 rounded-full bg-subtle" aria-hidden>
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${chunk.score * 100}%` }}
                />
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {chunk.source.startsWith('Refund policy') ? (
                <Link
                  to="/knowledge/documents/refund-policy-2026"
                  className="text-body-s font-semibold text-fg-2 hover:text-link hover:underline"
                >
                  {chunk.source}
                </Link>
              ) : (
                <span className="text-body-s font-semibold text-fg-2">{chunk.source}</span>
              )}
              <p className="text-13 text-fg">{chunk.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

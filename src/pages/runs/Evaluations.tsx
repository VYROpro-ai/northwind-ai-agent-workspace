import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import { Badge, Button, Table, TableContainer, TBody, TD, TH, THead, TR, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { ButtonLink } from './components/ButtonLink';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { Section } from './components/Section';
import { evalCases, evalMetrics, evalSets, type EvalCase } from './data';

/** Series fills: v4 (live) and v5 (draft). */
const V4 = 'bg-chart-3';
const V5 = 'bg-chart-1';

/** W6-10 · Evaluations */
export default function Evaluations() {
  const toast = useToast();
  const [evalSet, setEvalSet] = useState(evalSets[0]);
  const [caseId, setCaseId] = useState(evalCases[0].id);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState('12 min ago');
  const [blocked, setBlocked] = useState(false);
  const current = evalCases.find((c) => c.id === caseId)!;

  const runAgain = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setLastRun('just now');
      toast({ title: 'Eval finished', description: '40 cases · v5 still scores 5 points lower than v4.' });
    }, 1600);
  };

  return (
    <AppShell
      active="Agents"
      role="builder"
      crumbs={[{ label: 'Support Agent', to: '/agents/support-agent' }, { label: 'Evaluations' }]}
    >
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-13">
        <Link to="/agents" className="font-medium text-link hover:underline">
          Agents
        </Link>
        <span className="text-fg-3">/</span>
        <Link to="/agents/support-agent" className="font-medium text-link hover:underline">
          Support Agent
        </Link>
        <span className="text-fg-3">/</span>
        <span className="text-fg-2" aria-current="page">
          Evaluations
        </span>
      </nav>

      <PageHeader
        title="Support refunds eval"
        description={`40 cases · last run ${lastRun} · comparing v4 (live) with v5 (draft)`}
        actions={
          <>
            <FilterSelect
              label="Eval set"
              value={evalSet}
              options={evalSets}
              onChange={setEvalSet}
              align="end"
            />
            <Button
              variant="secondary"
              size="sm"
              leftIcon="refresh"
              loading={running}
              className="h-[34px] px-3.5"
              onClick={runAgain}
            >
              {running ? 'Running…' : 'Run again'}
            </Button>
          </>
        }
      />

      <div
        role="alert"
        className="flex flex-wrap items-center gap-2.5 rounded-[10px] bg-danger-subtle px-3.5 py-2.5 text-13 text-danger-text"
      >
        <Icon name="alert-triangle" size={16} strokeWidth={2} className="shrink-0" />
        <p className="min-w-0 flex-1 basis-64">
          <b className="font-semibold">v5 scores 5 points lower than v4.</b>{' '}
          {blocked
            ? 'Publishing v5 is blocked until the eval passes.'
            : 'Accuracy dropped on refund-window questions. We suggest blocking publish until it’s fixed.'}
        </p>
        <button
          type="button"
          aria-pressed={blocked}
          onClick={() => {
            setBlocked(!blocked);
            toast({
              title: blocked ? 'Publish unblocked' : 'Publish blocked',
              description: blocked
                ? 'v5 can be published again.'
                : 'Builders can’t publish v5 until the eval passes.',
              tone: blocked ? 'neutral' : 'ok',
            });
          }}
          className="h-[30px] rounded-full border border-danger-border bg-danger-subtle px-3 font-medium transition-colors hover:bg-danger hover:text-white"
        >
          {blocked ? 'Unblock publish' : 'Block publish'}
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="v4 · live" value="85%" note="34 of 40 passed" />
            <Stat
              label="v5 · draft"
              value="80%"
              note="−5 vs v4 · 32 of 40 passed"
              noteClass="text-danger-text"
            />
            <Stat label="Cost per case" value="$0.009" note="+12% vs v4" noteClass="text-warn-text" />
          </div>

          <Section
            title="Score by metric"
            className="gap-2"
            aside={
              <div className="flex items-center gap-3 text-body-s text-fg-2">
                <LegendKey color={V4} label="v4" />
                <LegendKey color={V5} label="v5" />
              </div>
            }
          >
            <TableContainer>
              <table className="w-full min-w-[520px] text-13">
                <caption className="sr-only">Score by metric, v4 compared with v5</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Metric</th>
                    <th scope="col">v4</th>
                    <th scope="col">v5</th>
                    <th scope="col">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {evalMetrics.map((m) => {
                    const delta = m.v5 - m.v4;
                    return (
                      <tr key={m.name} className="border-t border-border">
                        <th scope="row" className="w-[110px] py-2 pr-2.5 text-left font-medium text-fg">
                          {m.name}
                        </th>
                        <td className="py-2 pr-2.5">
                          <ScoreBar value={m.v4} color={V4} muted />
                        </td>
                        <td className="py-2 pr-2.5">
                          <ScoreBar value={m.v5} color={V5} />
                        </td>
                        <td
                          className={cn(
                            'w-11 py-2 text-right font-mono text-body-s font-semibold',
                            delta < 0 ? 'text-danger-text' : delta > 0 ? 'text-ok-text' : 'text-fg-3',
                          )}
                        >
                          {delta > 0 ? `+${delta}` : delta < 0 ? `-${-delta}` : '±0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableContainer>
          </Section>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <TableContainer>
              <Table className="min-w-[440px] text-13">
                <THead className="border-b border-border bg-sunken font-medium">
                  <tr>
                    <TH className="h-[37px] first:pl-4">Case</TH>
                    <TH className="w-[82px]">v4</TH>
                    <TH className="w-[82px] last:pr-4">v5</TH>
                  </tr>
                </THead>
                <TBody>
                  {evalCases.map((c) => {
                    const active = c.id === caseId;
                    return (
                      <TR
                        key={c.id}
                        className={cn(
                          'cursor-pointer',
                          active
                            ? 'bg-brand-subtle shadow-[inset_3px_0_0_var(--brand)]'
                            : 'hover:bg-subtle/60',
                        )}
                        onClick={() => setCaseId(c.id)}
                      >
                        <TD className="h-[39px] first:pl-4">
                          <button
                            type="button"
                            aria-current={active || undefined}
                            onClick={() => setCaseId(c.id)}
                            className={cn('text-left text-fg', active && 'font-medium')}
                          >
                            {c.title}
                          </button>
                        </TD>
                        <TD className="h-[39px]">
                          <PassFail pass={c.v4} />
                        </TD>
                        <TD className="h-[39px]">
                          <PassFail pass={c.v5} />
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </TableContainer>
          </div>
        </div>

        <CaseDetail key={current.id} item={current} />
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  note,
  noteClass,
}: {
  label: string;
  value: string;
  note: string;
  noteClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface px-4 py-3.5">
      <span className="text-body-s font-medium text-fg-2">{label}</span>
      <span className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-fg">{value}</span>
      <span className={cn('text-body-s font-medium text-fg-3', noteClass)}>{note}</span>
    </div>
  );
}

function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('size-2.5 rounded-[2px]', color)} aria-hidden />
      {label}
    </span>
  );
}

function ScoreBar({ value, color, muted }: { value: number; color: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-1.5 flex-1 rounded-full bg-subtle" aria-hidden>
        <span className={cn('block h-full rounded-full', color)} style={{ width: `${value}%` }} />
      </span>
      <span className={cn('w-11 font-mono text-body-s', muted ? 'text-fg-2' : 'text-fg')}>{value}%</span>
    </div>
  );
}

function PassFail({ pass }: { pass: boolean }) {
  return (
    <Badge
      tone={pass ? 'ok' : 'danger'}
      icon={pass ? 'check-sm' : 'close'}
      size="sm"
      bordered={false}
      className="h-5 border-transparent px-2 text-body-s"
    >
      {pass ? 'Pass' : 'Fail'}
    </Badge>
  );
}

function CaseDetail({ item }: { item: EvalCase }) {
  const failed = !item.v5;
  return (
    <section
      aria-label={`Case ${item.number} of 40`}
      className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-[18px]"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-body-s font-semibold text-fg-3">Case {item.number} of 40</h2>
        <span className="flex-1" />
        <Badge
          tone={failed ? 'danger' : 'ok'}
          icon={failed ? 'close' : 'check-sm'}
          size="sm"
          bordered={false}
          className="h-5 border-transparent px-2 text-body-s"
        >
          {failed ? 'v5 failed' : 'v5 passed'}
        </Badge>
      </div>
      <Block title="Question">
        <p className="text-body-m font-medium text-fg">{item.question}</p>
      </Block>
      <Block title="Expected answer">
        <p className="rounded-md bg-ok-subtle px-3 py-2.5 text-13 leading-5 text-fg">{item.expected}</p>
      </Block>
      <Block title="v5 answer">
        <p
          className={cn(
            'rounded-md px-3 py-2.5 text-13 leading-5 text-fg',
            failed ? 'bg-danger-subtle' : 'bg-sunken',
          )}
        >
          {item.answer}
        </p>
      </Block>
      <Block title="Grader notes">
        <p className="text-13 leading-5 text-fg-2">{item.notes}</p>
      </Block>
      <div className="flex flex-wrap items-center gap-1.5">
        <ButtonLink to="/agents/new/publish" className="h-8">
          Open in playground
        </ButtonLink>
        <ButtonLink to="/agents/support-agent/settings" variant="ghost" className="h-8">
          Edit case
        </ButtonLink>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-body-s font-semibold text-fg-2">{title}</h3>
      {children}
    </div>
  );
}

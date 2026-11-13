import { useState } from 'react';
import { AppShell } from '@/layouts/AppShell';
import { Badge, Button, Modal, TableContainer, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { RunSummary } from './components/RunSummary';
import { Section } from './components/Section';
import { StepGlyph } from './components/StepGlyph';
import { runDetailSteps, type StepKind, type TimelineStep } from './data';
import { ButtonLink } from './components/ButtonLink';

const kindColor: Record<StepKind, string> = {
  trigger: 'bg-brand-text',
  ai: 'bg-ai-text',
  tool: 'bg-info-text',
  condition: 'bg-fg-2',
  approval: 'bg-warn-text',
  action: 'bg-ok-text',
};

const kindLabel: Record<StepKind, string> = {
  trigger: 'Trigger',
  ai: 'AI step',
  tool: 'Tool',
  condition: 'Condition',
  approval: 'Approval',
  action: 'Action',
};

/** W6-02 · Run detail timeline */
export default function RunDetail() {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState('classify');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const selected = runDetailSteps.find((s) => s.id === selectedId)!;

  return (
    <AppShell active="Runs" role="builder" crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'run_4835' }]}>
      <RunSummary
        runId="run_4835"
        status={
          cancelled ? (
            <Badge tone="neutral" dot bordered={false} className="h-[22px] border-transparent">
              Cancelled
            </Badge>
          ) : (
            <Badge tone="warn" icon="clock" bordered={false} className="h-[22px] border-transparent">
              Waiting for approval
            </Badge>
          )
        }
        subtitle="Ticket triage & reply · v5 · triggered by a new Helpbase ticket"
        stats={[
          ['Started', 'Today, 9:28 AM'],
          ['Duration', cancelled ? '14 min' : '14 min (waiting)'],
          ['Steps', '4 of 6'],
          ['Tokens', '2,140', 'mono'],
          ['Cost', '$0.011', 'mono'],
          ['Trigger', 'Ticket #9874'],
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            className="h-[34px] px-3.5"
            disabled={cancelled}
            onClick={() => setCancelOpen(true)}
          >
            Cancel run
          </Button>
        }
      />

      {!cancelled && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-2.5 rounded-[10px] bg-warn-subtle px-3.5 py-2.5 text-13 text-warn-text"
        >
          <Icon name="clock" size={16} strokeWidth={2} className="shrink-0" />
          <p className="min-w-0 flex-1">
            <b className="font-semibold">Waiting for Leo Martins · 14 min.</b> Expires in 1 h 46 min, then
            escalates to Maya Chen.
          </p>
          <ButtonLink to="/approvals/apr_240">Open approval</ButtonLink>
        </div>
      )}

      <Waterfall steps={runDetailSteps} selectedId={selectedId} onSelect={setSelectedId} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Section
          title={`${selected.name} · output`}
          aside={
            <ButtonLink to="/runs/run_4835/trace" variant="ghost" icon="arrow-up-right" className="h-7">
              View trace
            </ButtonLink>
          }
        >
          {selected.output ? (
            <pre className="scrollbar-thin overflow-x-auto rounded-md bg-code px-3.5 py-3 font-mono text-[11.5px] leading-[19px] text-code-fg">
              {selected.output}
            </pre>
          ) : (
            <p className="rounded-md border border-dashed border-border-strong px-3.5 py-6 text-center text-13 text-fg-3">
              {selected.state === 'waiting'
                ? 'This step is waiting for a reviewer. Output appears once it’s approved.'
                : 'This step hasn’t run yet.'}
            </p>
          )}
        </Section>
        <Section title="Feedback">
          <p className="text-13 text-fg-3">
            {feedback
              ? `Thanks — you rated this run ${feedback === 'good' ? 'good' : 'bad'}.`
              : 'No feedback yet. Ratings appear once the reply is sent.'}
          </p>
          <div className="flex items-center gap-1.5" role="group" aria-label="Rate this run">
            {(['good', 'bad'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={feedback === value}
                onClick={() => setFeedback(feedback === value ? null : value)}
                className={cn(
                  'inline-flex h-[30px] items-center gap-1.5 rounded-full border px-3 text-13 font-medium transition-colors',
                  feedback === value
                    ? 'border-brand-border bg-brand-subtle text-brand-text'
                    : 'border-border-strong bg-surface text-fg hover:bg-subtle',
                )}
              >
                {value === 'good' ? 'Good' : 'Bad'}
              </button>
            ))}
          </div>
        </Section>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        size="sm"
        title="Cancel run_4835?"
        description="The approval request is withdrawn and the remaining 2 steps won’t run. The customer gets no reply."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Keep running
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setCancelled(true);
                setCancelOpen(false);
                toast({
                  title: 'Run cancelled',
                  description: 'run_4835 stopped at step 5.',
                  tone: 'neutral',
                });
              }}
            >
              Cancel run
            </Button>
          </>
        }
      />
    </AppShell>
  );
}

const axis = ['0 s', '5 s', '10 s', '15 s', '20 s +'];
const grid = 'grid grid-cols-[300px_minmax(0,1fr)_96px] gap-4 px-4';

/** Gantt-style list of steps on a 0–20 s axis. Rows are selectable to inspect their output. */
function Waterfall({
  steps,
  selectedId,
  onSelect,
}: {
  steps: TimelineStep[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section
      aria-label="Step timeline"
      className="overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <TableContainer>
        <div className="min-w-[760px]">
          <div className={cn(grid, 'items-center bg-sunken py-2.5 text-body-s text-fg-3')} aria-hidden>
            <span>Step</span>
            <div className="flex justify-between font-mono text-caption">
              {axis.map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>
            <span className="text-right">Duration</span>
          </div>
          <ul>
            {steps.map((step) => {
              const active = step.id === selectedId;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    aria-current={active || undefined}
                    onClick={() => onSelect(step.id)}
                    className={cn(
                      grid,
                      'h-10 w-full items-center border-t border-border text-left transition-colors',
                      active ? 'bg-brand-subtle shadow-[inset_3px_0_0_var(--brand)]' : 'hover:bg-subtle/60',
                    )}
                  >
                    <span className={cn('flex min-w-0 items-center gap-2', step.child && 'pl-[22px]')}>
                      <StepGlyph state={step.state} />
                      <span
                        className={cn('size-2 shrink-0 rounded-[2px]', kindColor[step.kind])}
                        title={kindLabel[step.kind]}
                      />
                      <span
                        className={cn(
                          'truncate',
                          step.child ? 'font-mono text-body-s text-fg-2' : 'text-13 font-semibold text-fg',
                        )}
                      >
                        {step.name}
                      </span>
                    </span>
                    <span className="relative block h-3.5 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-[length:25%_100%]">
                      <span
                        className={cn(
                          'absolute top-0.5 h-2.5 rounded-[3px]',
                          step.state === 'done' && 'bg-ok',
                          step.state === 'waiting' &&
                            'bg-[repeating-linear-gradient(135deg,var(--warn)_0_6px,var(--warn-subtle)_6px_12px)]',
                          step.state === 'pending' && 'border-[1.5px] border-dashed border-border-strong',
                        )}
                        style={{ left: `${step.offset}%`, width: `${step.width}%` }}
                      />
                    </span>
                    <span
                      className={cn(
                        'text-right font-mono text-body-s',
                        step.state === 'waiting' ? 'text-warn-text' : 'text-fg-2',
                      )}
                    >
                      {step.duration}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </TableContainer>
    </section>
  );
}

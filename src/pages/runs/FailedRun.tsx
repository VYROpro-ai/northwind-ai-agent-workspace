import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { Badge, Button, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { RunSummary } from './components/RunSummary';
import { Section } from './components/Section';
import { StepGlyph } from './components/StepGlyph';
import { failedSteps } from './data';
import { ButtonLink } from './components/ButtonLink';

type RetryMode = 'failed-step' | 'start' | 'edited';

const retryOptions: {
  value: RetryMode;
  title: string;
  description: string;
  disabled?: boolean;
  recommended?: boolean;
}[] = [
  {
    value: 'failed-step',
    title: 'From the failed step',
    description: 'Re-runs Log to CRM only, with the same input. Takes about 1 s.',
    recommended: true,
  },
  {
    value: 'start',
    title: 'From the start',
    description:
      'Disabled: the reply was already sent to the customer. Running it again would send a second email.',
    disabled: true,
  },
  {
    value: 'edited',
    title: 'With edited input',
    description: 'Change the input to Log to CRM, then re-run from that step.',
  },
];

const errorTrace = `CRM_400_FIELD_REQUIRED
  field: email
  got: null
  at pipeline_crm.notes.create
  run_4833 · step 5`;

const code = 'rounded-xs bg-surface px-[5px] py-px font-mono text-body-s';

/** W6-04 · Failed run & retry */
export default function FailedRun() {
  const toast = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<RetryMode>('failed-step');
  const [attempt, setAttempt] = useState(1);
  const [retrying, setRetrying] = useState(false);
  const [fixDismissed, setFixDismissed] = useState(false);

  const retry = () => {
    setRetrying(true);
    window.setTimeout(() => {
      setRetrying(false);
      setAttempt((a) => a + 1);
      toast({
        title: `Attempt ${attempt + 1} of 3 started`,
        description:
          mode === 'edited'
            ? 'Open the Log to CRM node to edit its input.'
            : 'Re-running step 5 · Log to CRM.',
      });
    }, 900);
  };

  return (
    <AppShell active="Runs" role="builder" crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'run_4833' }]}>
      <RunSummary
        runId="run_4833"
        status={
          <Badge tone="danger" icon="close" bordered={false} className="h-[22px] border-transparent">
            Failed
          </Badge>
        }
        subtitle="Ticket triage & reply · v5 · triggered by a new Helpbase ticket"
        stats={[
          ['Started', 'Today, 9:11 AM'],
          ['Duration', '3.8 s'],
          ['Steps', '5 of 6'],
          ['Tokens', '2,610', 'mono'],
          ['Cost', '$0.014', 'mono'],
          ['Attempt', `${attempt} of 3`],
        ]}
      />

      <section
        role="alert"
        className="flex flex-wrap items-start gap-3.5 rounded-2xl border border-danger-border bg-danger-subtle px-4 py-4 sm:px-[18px]"
      >
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-surface text-danger-text">
          <Icon name="close" size={18} strokeWidth={2.4} />
        </span>
        <div className="flex min-w-0 flex-1 basis-72 flex-col gap-1.5">
          <h2 className="text-h4 font-semibold text-fg">
            Pipeline CRM rejected the request: missing field ‘email’
          </h2>
          <p className="text-13 text-fg-2">
            Step 5 · <b className="font-semibold">Log to CRM</b> · error{' '}
            <span className="font-mono text-body-s">CRM_400_FIELD_REQUIRED</span> · 9:11:04 AM
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-center">
          <span className="text-13 font-medium text-danger-text">12 runs failed the same way today</span>
          <ButtonLink to="/runs/incidents">View incident</ButtonLink>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <Section>
            <div className="flex items-center gap-2">
              <Icon name="ai-generate" size={16} strokeWidth={2} className="text-ai-text" />
              <h2 className="text-body-m font-semibold text-fg">Suggested fix</h2>
              <Badge tone="ai" size="sm" bordered={false} className="h-5 border-transparent px-2 text-body-s">
                AI
              </Badge>
            </div>
            {fixDismissed ? (
              <p className="rounded-[10px] border border-border bg-sunken px-3.5 py-3 text-13 text-fg-2">
                Thanks — we’ll use this to improve suggestions.{' '}
                <button
                  type="button"
                  className="font-medium text-link hover:underline"
                  onClick={() => setFixDismissed(false)}
                >
                  Show again
                </button>
              </p>
            ) : (
              <div className="flex flex-col gap-2.5 rounded-[10px] border border-ai-border bg-ai-subtle px-3.5 py-3">
                <p className="text-body-m leading-[22px] text-fg">
                  Map <code className={code}>ticket.customer_email</code> to the CRM{' '}
                  <code className={code}>email</code> field. The field was renamed in Helpbase on Oct 25, so
                  the old mapping is empty.
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <ButtonLink to="/workflows/editor/node" variant="ai">
                    Open node
                  </ButtonLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-[30px]"
                    onClick={() => setFixDismissed(true)}
                  >
                    Not helpful
                  </Button>
                </div>
              </div>
            )}
            <p className="text-body-s text-fg-3">
              Also check: 3 other workflows still use <span className="font-mono">ticket.email</span>.
            </p>
          </Section>

          <Section
            title="Retry this run"
            aside={<span className="text-body-s text-fg-3">Attempt {attempt + 1} of 3 will start</span>}
          >
            <div role="radiogroup" aria-label="Retry from" className="flex flex-col gap-2.5">
              {retryOptions.map((o) => {
                const on = mode === o.value;
                return (
                  <label
                    key={o.value}
                    className={cn(
                      'flex gap-3 rounded-[10px] border px-3.5 py-3 transition-colors',
                      on ? 'border-[1.5px] border-brand bg-brand-subtle' : 'border-border',
                      o.disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:bg-subtle/60',
                      on && 'hover:bg-brand-subtle',
                    )}
                  >
                    <input
                      type="radio"
                      name="retry-mode"
                      value={o.value}
                      checked={on}
                      disabled={o.disabled}
                      onChange={() => setMode(o.value)}
                      className="mt-0.5 size-4 shrink-0 cursor-[inherit] appearance-none rounded-full border-[1.5px] border-border-strong bg-surface transition-[border] checked:border-[5px] checked:border-brand"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-1.5 text-13 font-semibold text-fg">
                        {o.title}
                        {o.recommended && (
                          <Badge
                            tone="brand"
                            size="sm"
                            bordered={false}
                            className="ml-1.5 h-5 border-transparent text-body-s"
                          >
                            Recommended
                          </Badge>
                        )}
                      </span>
                      <span className={cn('text-body-s', o.disabled ? 'text-danger-text' : 'text-fg-2')}>
                        {o.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-[34px] px-3.5"
                onClick={() => navigate('/runs')}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                leftIcon="refresh"
                className="h-[34px] px-3.5"
                loading={retrying}
                disabled={attempt >= 3}
                onClick={retry}
              >
                {mode === 'edited' ? 'Retry with edited input' : 'Retry from failed step'}
              </Button>
            </div>
          </Section>
        </div>

        <Section title="Steps" className="gap-2">
          <ol>
            {failedSteps.map((s) => (
              <li key={s.name} className="flex items-center gap-2 border-t border-border py-[7px] text-13">
                <StepGlyph state={s.state} />
                <span className={cn('flex-1 text-fg', s.state === 'failed' && 'font-semibold')}>
                  {s.name}
                </span>
                <span className="font-mono text-caption text-fg-3">{s.duration}</span>
              </li>
            ))}
          </ol>
          <pre className="mt-2 scrollbar-thin overflow-x-auto rounded-md bg-code px-3.5 py-3 font-mono text-[11.5px] leading-[19px] text-code-fg">
            {errorTrace}
          </pre>
        </Section>
      </div>
    </AppShell>
  );
}

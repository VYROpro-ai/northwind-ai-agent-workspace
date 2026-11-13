import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { UserMessage } from '@/components/ai';
import { Badge, Button, Modal, Spinner, useToast } from '@/components/ui';
import { ChatComposer } from './components/ChatComposer';
import { StandardHeader } from './components/ChatHeader';
import { ChatLayout, ChatThread, ComposerDock } from './components/ChatLayout';
import { AgentTurn, ThreadMessages } from './components/ChatMessages';
import { agents, draftEmail, planSteps, type PlanStep } from './data';
import { useChatThread } from './hooks';

const TITLE = 'Acme Co. double charge refund';
const STEP_MS = 1300;

type PlanState = 'review' | 'running' | 'done' | 'cancelled';
type StepState = 'pending' | 'active' | 'done';

function StepMarker({ n, state }: { n: number; state: StepState | 'idle' }) {
  return (
    <span
      className={cn(
        'mt-px inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-body-s font-semibold transition-colors',
        state === 'done'
          ? 'border-ok-border bg-ok-subtle text-ok-text'
          : state === 'active'
            ? 'border-brand-border bg-brand-subtle text-brand-text'
            : 'border-transparent bg-subtle text-fg-2',
      )}
    >
      {state === 'done' ? (
        <Icon name="check-sm" size={13} strokeWidth={2.5} label="Done" />
      ) : state === 'active' ? (
        <Spinner size={12} />
      ) : (
        n
      )}
    </span>
  );
}

function PlanStepRow({
  step,
  n,
  state,
  onPreview,
}: {
  step: PlanStep;
  n: number;
  state: StepState | 'idle';
  onPreview: () => void;
}) {
  return (
    <li className="flex gap-3 border-b border-border py-3 last:border-b-0">
      <StepMarker n={n} state={state} />
      <div className={cn('flex min-w-0 flex-1 flex-col', step.risks || step.subject ? 'gap-1.5' : 'gap-1')}>
        <p className={cn('text-body-m font-medium', state === 'pending' ? 'text-fg-2' : 'text-fg')}>
          {step.title}
          {state === 'active' && <span className="sr-only"> (running)</span>}
        </p>
        <div
          className={cn(
            'flex flex-wrap gap-y-1.5',
            step.risksBelow ? 'flex-col gap-1.5' : 'items-center gap-x-2.5',
          )}
        >
          <span className="inline-flex items-center gap-1.5 text-body-s text-fg-3">
            <Icon name={step.icon} size={12} strokeWidth={2} />
            {step.tool}
          </span>
          {step.risks && (
            <span className={cn('flex flex-wrap gap-1.5', !step.risksBelow && 'contents')}>
              {step.risks.map((r) => (
                <span
                  key={r.label}
                  className={cn(
                    'inline-flex min-h-[22px] items-center gap-1 rounded-[11px] border px-2 py-0.5 text-caption font-medium',
                    r.tone === 'warn'
                      ? 'border-warn-border bg-warn-subtle text-warn-text'
                      : 'border-border-strong bg-subtle text-fg-2',
                  )}
                >
                  <Icon name={r.icon} size={11} strokeWidth={2.25} />
                  {r.label}
                </span>
              ))}
            </span>
          )}
        </div>
        {step.subject && (
          <div className="mt-0.5 flex items-center gap-2.5 rounded-md border border-border bg-sunken px-2.5 py-2 text-13">
            <span className="text-body-s text-fg-3">Subject</span>
            <span className="min-w-0 flex-1 truncate text-fg">{step.subject}</span>
            <button
              type="button"
              onClick={onPreview}
              className="text-body-s font-medium text-link underline underline-offset-2"
            >
              Preview
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/** W4-06 · Plan & confirm — nothing runs until the user approves; then the steps run one by one. */
export default function PlanConfirm() {
  const agent = agents.support;
  const toast = useToast();
  const [plan, setPlan] = useState<PlanState>('review');
  const [current, setCurrent] = useState(0);
  const [preview, setPreview] = useState(false);
  const { messages, thinking, send } = useChatThread();

  // Advance one step at a time while running.
  useEffect(() => {
    if (plan !== 'running') return;
    const id = window.setTimeout(() => {
      if (current + 1 >= planSteps.length) {
        setCurrent(planSteps.length);
        setPlan('done');
        toast({ title: 'Plan finished', description: 'Refund sent, Dana emailed and ticket #9921 closed.' });
      } else {
        setCurrent(current + 1);
      }
    }, STEP_MS);
    return () => window.clearTimeout(id);
  }, [plan, current, toast]);

  const stepState = (i: number): StepState | 'idle' => {
    if (plan === 'review' || plan === 'cancelled') return 'idle';
    if (i < current) return 'done';
    return i === current ? 'active' : 'pending';
  };

  return (
    <ChatLayout title={TITLE} activeChat={TITLE} header={<StandardHeader title={TITLE} />}>
      <ChatThread scrollKey={messages.length + (thinking ? 1 : 0) || undefined} innerClassName="gap-4">
        <UserMessage>
          Go ahead and refund Acme Co. for the duplicate charge, email Dana to confirm, and log it on the
          ticket.
        </UserMessage>
        <AgentTurn agent={agent} time="9:18 AM">
          <p>
            This touches money and a customer’s inbox, so here’s exactly what I’ll do. Nothing runs until you
            approve.
          </p>
          <section
            aria-label="Proposed plan"
            className={cn(
              'overflow-hidden rounded-[18px] border bg-surface shadow-raised',
              plan === 'cancelled' ? 'border-border opacity-70' : 'border-ai-border',
            )}
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-ai-subtle px-4 py-3.5">
              <Icon name="plan" size={16} className="text-ai-text" />
              <h2 className="flex-1 text-[15px] leading-5 font-semibold text-fg">Here’s what I’ll do</h2>
              <span className="text-body-s text-ai-text">{planSteps.length} steps · about $0.02</span>
            </div>
            <ol className="px-4 py-1" aria-live="polite">
              {planSteps.map((step, i) => (
                <PlanStepRow
                  key={step.title}
                  step={step}
                  n={i + 1}
                  state={stepState(i)}
                  onPreview={() => setPreview(true)}
                />
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-2 border-t border-border bg-sunken px-4 py-3.5">
              {plan === 'review' && (
                <>
                  <Button onClick={() => setPlan('running')}>Approve &amp; run</Button>
                  <Button
                    variant="secondary"
                    leftIcon="edit"
                    onClick={() => toast({ title: 'Reply below to change the plan', tone: 'info' })}
                  >
                    Edit plan
                  </Button>
                  <Button variant="ghost" onClick={() => setPlan('cancelled')}>
                    Cancel
                  </Button>
                  <span className="ml-auto text-body-s text-fg-3">Expires in 24 h</span>
                </>
              )}
              {plan === 'running' && (
                <>
                  <Badge tone="brand" spinning>
                    Running step {current + 1} of {planSteps.length}
                  </Badge>
                  <span className="text-body-s text-fg-3">You’ll get a summary when it’s done.</span>
                </>
              )}
              {plan === 'done' && (
                <>
                  <Badge tone="ok" icon="check-sm">
                    Done · {planSteps.length} of {planSteps.length} steps
                  </Badge>
                  <Link to="/runs/run_4835" className="ml-auto text-13 font-medium text-link hover:underline">
                    View run
                  </Link>
                </>
              )}
              {plan === 'cancelled' && (
                <>
                  <Badge icon="reject">Plan cancelled · nothing ran</Badge>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setPlan('review')}>
                    Restore plan
                  </Button>
                </>
              )}
            </div>
          </section>
        </AgentTurn>
        <ThreadMessages agent={agent} messages={messages} thinking={thinking} />
      </ChatThread>

      <ComposerDock>
        <ChatComposer
          placeholder="Reply to change the plan — e.g. “refund $200 instead”"
          strongBorder
          tools={['attach', 'voice']}
          onSend={send}
        />
      </ComposerDock>

      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title={draftEmail.subject}
        description={`To ${draftEmail.to}`}
        footer={<Button onClick={() => setPreview(false)}>Done</Button>}
      >
        <div className="flex flex-col gap-2.5 text-body-m leading-[22px] text-fg">
          <p>{draftEmail.greeting}</p>
          <p>{draftEmail.body}</p>
          <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-y-1 rounded-md bg-sunken px-3 py-2.5 text-13 leading-5">
            {draftEmail.facts.map((f) => (
              <div key={f.label} className="contents">
                <dt className="text-fg-2">{f.label}</dt>
                <dd className={cn(f.strong && 'font-semibold')}>{f.value}</dd>
              </div>
            ))}
          </dl>
          <p>{draftEmail.closing}</p>
        </div>
      </Modal>
    </ChatLayout>
  );
}

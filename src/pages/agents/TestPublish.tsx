import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, Field, Textarea, useToast } from '@/components/ui';
import { ToolCall, TypingDots } from '@/components/ai';
import { accessOptions, SUPPORT_AGENT_PATH } from './data';
import { ChatInput } from './components/ChatInput';
import { ChatTurnView, CiteMark, TestAgentMessage, TestUserMessage } from './components/ChatTurn';
import { useTestConversation } from './components/useTestConversation';
import { WizardLayout } from './components/WizardLayout';

type Approval = 'pending' | 'approved' | 'denied';
type Access = (typeof accessOptions)[number]['value'];

const evalResults = Array.from({ length: 10 }, (_, i) => i !== 6);

function ToolChip({ children }: { children: string }) {
  return (
    <span className="inline-flex h-[26px] items-center gap-1.5 rounded-sm bg-subtle px-2.5 font-mono text-body-s text-fg-2">
      <Icon name="check-sm" size={12} strokeWidth={2.5} className="text-ok-text" />
      {children}
    </span>
  );
}

function SourceChip({ n, children }: { n: number; children: string }) {
  return (
    <span className="inline-flex h-[26px] items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 text-body-s text-fg-2">
      <span className="font-semibold text-link">{n}</span>
      {children}
    </span>
  );
}

/** The scripted first exchange, including the refund that waits for approval. */
function FirstReply({ approval, onDecide }: { approval: Approval; onDecide: (a: Approval) => void }) {
  return (
    <TestAgentMessage className="max-w-[760px]">
      <div className="flex flex-wrap gap-1.5">
        <ToolChip>orders.lookup · 0.4 s</ToolChip>
        <ToolChip>docs.search · 0.7 s</ToolChip>
      </div>
      <p className="text-body-m leading-[22px]">
        Sorry your lamp arrived broken, Jordan. Order 4471 was delivered on Oct 12, so it’s inside our 30-day
        window
        <CiteMark n={1} />. I can refund the full $64.00 to your original card. Refunds usually land in 3–5
        business days
        <CiteMark n={2} />.
      </p>
      {approval === 'pending' ? (
        <div className="flex flex-col gap-1.5 rounded-[10px] border border-warn-border bg-warn-subtle p-3">
          <p className="flex items-center gap-2 text-13 font-semibold text-warn-text">
            <Icon name="shield" size={14} strokeWidth={2} />
            Wants to run orders.refund · Ask first
          </p>
          <p className="font-mono text-body-s text-fg-2">
            order: 4471 · amount: $64.00 · reason: arrived damaged
          </p>
          <div className="mt-0.5 flex gap-1.5">
            <Button size="xs" className="h-7 px-3" onClick={() => onDecide('approved')}>
              Approve (test)
            </Button>
            <Button variant="secondary" size="xs" className="h-7 px-3" onClick={() => onDecide('denied')}>
              Deny
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          <ToolCall
            name="orders.refund"
            icon="credit-card"
            state={approval === 'approved' ? 'succeeded' : 'blocked'}
            duration={approval === 'approved' ? '0.9 s' : undefined}
            detail={
              approval === 'approved'
                ? 'Test refund of $64.00 approved — no money moved in test mode.'
                : 'Denied in test. The agent will offer a replacement instead.'
            }
          />
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <SourceChip n={1}>Refund policy 2026.pdf · p. 2</SourceChip>
        <SourceChip n={2}>Help center · Refund timing</SourceChip>
      </div>
      <div className="flex items-center gap-3.5 font-mono text-caption text-fg-3">
        <span>2.1 s</span>
        <span>1,240 tokens</span>
        <span>$0.004</span>
        <span className="flex-1" />
        <Link
          to="/runs/run_4835/trace"
          className="font-sans text-body-s font-medium text-link hover:underline"
        >
          View trace
        </Link>
      </div>
    </TestAgentMessage>
  );
}

/** W3-07 · Create agent — 5. Test & publish */
export default function TestPublish() {
  const navigate = useNavigate();
  const toast = useToast();
  const { turns, typing, ask, reset } = useTestConversation([]);
  const [approval, setApproval] = useState<Approval>('pending');
  const [access, setAccess] = useState<Access>('team');
  const [notes, setNotes] = useState(
    'First version. Handles orders, refunds under $100 with approval, and help-center questions.',
  );
  const [publishing, setPublishing] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [turns, typing]);

  const resetChat = () => {
    reset();
    setApproval('pending');
  };

  const decide = (a: Approval) => {
    setApproval(a);
    toast({
      tone: a === 'approved' ? 'ok' : 'neutral',
      title: a === 'approved' ? 'Test refund approved' : 'Test refund denied',
    });
  };

  const publish = () => {
    setPublishing(true);
    window.setTimeout(() => {
      const who = accessOptions.find((o) => o.value === access)?.label ?? '';
      toast({ title: 'Support Agent v1 is live', description: `Published for ${who.toLowerCase()}.` });
      navigate(SUPPORT_AGENT_PATH);
    }, 900);
  };

  return (
    <WizardLayout step={5}>
      <section
        aria-labelledby="test-title"
        className="flex min-h-[560px] min-w-0 flex-1 flex-col border-border xl:min-h-0 xl:border-r"
      >
        <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-b border-border bg-surface px-4 py-3 sm:px-8">
          <h1 id="test-title" className="text-body-m font-semibold">
            Test your agent
          </h1>
          <span className="inline-flex h-[22px] items-center rounded-full bg-subtle px-2 text-body-s text-fg-2">
            Draft v1 · Model B
          </span>
          <span className="flex-1" />
          <Button variant="secondary" size="xs" className="h-[30px]" onClick={resetChat}>
            Reset chat
          </Button>
        </div>
        <div
          ref={scroller}
          aria-live="polite"
          className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-[18px] overflow-y-auto px-4 py-6 sm:px-8"
        >
          <TestUserMessage>
            Hi, I ordered a desk lamp two weeks ago (order 4471) and it arrived broken. Can I get a refund?
          </TestUserMessage>
          <FirstReply approval={approval} onDecide={decide} />
          {turns.map((turn) => (
            <ChatTurnView key={turn.id} turn={turn} />
          ))}
          {typing && <TypingDots className="self-start" />}
        </div>
        <div className="shrink-0 px-4 pt-3.5 pb-[18px] sm:px-8">
          <ChatInput
            size="md"
            label="Test message"
            placeholder="Send a test message…"
            busy={typing}
            onSend={ask}
          />
        </div>
      </section>

      <aside
        aria-labelledby="publish-title"
        className="flex shrink-0 flex-col border-t border-border bg-surface xl:w-[400px] xl:border-t-0"
      >
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
          <div className="flex flex-col gap-2.5 rounded-[18px] border border-ok-border bg-ok-subtle p-3.5">
            <p className="flex items-center gap-2 text-body-m font-semibold text-ok-text">
              <Icon name="check-circle" size={16} strokeWidth={2} />
              Quick check passed · 9 of 10
            </p>
            <ol className="flex gap-[3px]" aria-label="10 test questions, 9 passed">
              {evalResults.map((pass, i) => (
                <li
                  key={i}
                  title={`Question ${i + 1}: ${pass ? 'passed' : 'missed'}`}
                  className={cn('h-1.5 flex-1 rounded-[2px]', pass ? 'bg-ok' : 'bg-danger')}
                />
              ))}
            </ol>
            <p className="text-body-s text-fg-2">
              1 miss: “Can I return a gift without a receipt?” had no source.{' '}
              <Link
                to={`${SUPPORT_AGENT_PATH}/evaluations`}
                className="font-medium text-link hover:underline"
              >
                See details
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 id="publish-title" className="text-h4 font-semibold">
              Publish
            </h2>
            <p className="text-13 text-fg-2">Publishing makes v1 live for the people below.</p>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-13 font-medium">Who can use it</legend>
            {accessOptions.map((o) => {
              const on = o.value === access;
              return (
                <label
                  key={o.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 py-2.5 transition-colors',
                    on ? 'border-brand-border bg-brand-subtle' : 'border-border hover:bg-sunken',
                  )}
                >
                  <input
                    type="radio"
                    name="access"
                    value={o.value}
                    checked={on}
                    onChange={() => setAccess(o.value)}
                    className="size-4 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-border-strong bg-surface transition-[border] checked:border-[5px] checked:border-brand"
                  />
                  <span className="flex-1">
                    <span className="block text-13 font-medium">{o.label}</span>
                    <span className="block text-body-s text-fg-3">{o.sub}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <Field
            label={
              <span className="text-13">
                Release notes <span className="font-normal text-fg-3">(optional)</span>
              </span>
            }
          >
            {(id) => (
              <Textarea
                id={id}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[72px] text-13"
              />
            )}
          </Field>
        </div>
        <div className="sticky bottom-0 flex shrink-0 items-center gap-2 border-t border-border bg-surface px-4 py-3.5 sm:px-6">
          <Button
            variant="secondary"
            size="lg"
            className="h-10 px-4 text-body-m"
            onClick={() => navigate('/agents/new/knowledge')}
          >
            Back
          </Button>
          <span className="flex-1" />
          <Button
            size="lg"
            leftIcon="publish"
            loading={publishing}
            className="h-10 px-[18px] text-body-m"
            onClick={publish}
          >
            Publish agent
          </Button>
        </div>
      </aside>
    </WizardLayout>
  );
}

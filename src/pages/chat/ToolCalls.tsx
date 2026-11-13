import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { StreamingCaret, ToolCall, ToolCallGroup, UserMessage, type ToolCallState } from '@/components/ai';
import { ChatComposer } from './components/ChatComposer';
import { StandardHeader } from './components/ChatHeader';
import { ChatLayout, ChatThread, ComposerDock } from './components/ChatLayout';
import { AgentTurn, ReplyActions, ThreadMessages } from './components/ChatMessages';
import { agents, toolCallAnswer, toolCallPrompt } from './data';
import { useChatThread, useTypewriter } from './hooks';

const TITLE = 'Fix Acme Co. CRM record';

/** JSON-ish line: key in brand, value in green (strings) or amber (null). */
function Pair({ k, children }: { k: string; children: ReactNode }) {
  return (
    <span className="block">
      <span className="text-brand-text">"{k}"</span>: {children}
    </span>
  );
}
const Str = ({ children }: { children: string }) => <span className="text-ok-text">"{children}"</span>;

type Phase = 'running' | 'writing' | 'done' | 'stopped';

/** W4-04 · Tool call states — succeeded, failed, running and policy-blocked calls in one reply. */
export default function ToolCalls() {
  const agent = agents.support;
  const [phase, setPhase] = useState<Phase>('running');
  const full = toolCallAnswer.streamed + toolCallAnswer.rest;
  const { count, done } = useTypewriter(full.length, {
    from: toolCallAnswer.streamed.length,
    running: phase === 'writing',
    step: 2,
  });
  const status: Phase = phase === 'writing' && done ? 'done' : phase;
  const { messages, thinking, send } = useChatThread();

  // The retry finishes after a moment, then the rest of the answer streams in.
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setTimeout(() => setPhase('writing'), 2400);
    return () => window.clearTimeout(id);
  }, [phase]);

  const retryState: ToolCallState =
    phase === 'running' ? 'running' : phase === 'stopped' ? 'timeout' : 'succeeded';
  const working = status === 'running' || status === 'writing';

  return (
    <ChatLayout
      title={TITLE}
      role="builder"
      activeChat={TITLE}
      header={
        <StandardHeader
          title={TITLE}
          share={false}
          actions={
            <Link
              to="/runs/run_4835/trace"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-strong px-2.5 text-13 font-medium text-fg transition-colors hover:bg-subtle"
            >
              <Icon name="trace" size={14} strokeWidth={2} className="text-icon" />
              <span className="hidden sm:inline">View trace</span>
              <span className="sr-only sm:hidden">View trace</span>
            </Link>
          }
        />
      }
    >
      <ChatThread scrollKey={count + messages.length + (thinking ? 1 : 0)} innerClassName="gap-5">
        <UserMessage meta="11:20 AM">{toolCallPrompt}</UserMessage>
        <AgentTurn
          agent={agent}
          status={
            <span className="inline-flex h-[22px] items-center gap-1 rounded-sm bg-ai-subtle px-2 text-body-s font-medium text-ai-text">
              <Icon name="reasoning" size={12} strokeWidth={2} />
              Thought for 3 s
            </span>
          }
          meta={<span className="hidden sm:inline">2,840 tokens · $0.03</span>}
          footer={status === 'done' && <ReplyActions copyText={full} />}
        >
          <ToolCallGroup count={4} duration={phase === 'running' ? '3.6 s' : '4.0 s'}>
            <ToolCall
              name="Search CRM"
              detail="Found 1 customer, 2 orders"
              state="succeeded"
              duration="0.8 s"
              icon="search"
              defaultOpen
              input={
                <>
                  <Pair k="customer">
                    <Str>Acme Co.</Str>
                  </Pair>
                  <Pair k="fields">
                    [<Str>orders</Str>, <Str>email</Str>]
                  </Pair>
                </>
              }
              output={
                <>
                  <Pair k="id">
                    <Str>cus_7781</Str>
                  </Pair>
                  <Pair k="email">
                    <span className="text-warn-text">null</span>
                  </Pair>
                </>
              }
            />
            <ToolCall
              name="Look up payments"
              detail="2 charges on Oct 22 — second was an automatic retry"
              state="succeeded"
              duration="0.6 s"
              icon="credit-card"
              input={
                <Pair k="customer_id">
                  <Str>cus_7781</Str>
                </Pair>
              }
              output={
                <>
                  <Pair k="charges">2</Pair>
                  <Pair k="retry">true</Pair>
                </>
              }
            />
            <ToolCall
              name="Update CRM record"
              detail="CRM rejected the request: missing field ‘email’"
              state="failed"
              duration="0.4 s"
              icon="edit"
              className="[&_p]:text-fg-2"
            />
            <ToolCall
              name={
                <>
                  Update CRM record <span className="font-normal text-fg-2">· retry</span>
                </>
              }
              detail={
                <span className="font-mono">
                  {retryState === 'timeout'
                    ? 'Stopped by you'
                    : 'email = "billing@acme.example", block_retry = true'}
                </span>
              }
              state={retryState}
              duration={phase === 'running' ? '1.2 s' : '1.6 s'}
              icon="edit"
            />
          </ToolCallGroup>

          <div className="overflow-hidden rounded-[18px] border border-danger-border">
            <ToolCall
              name="Send email to dana.whitfield@acme.example"
              detail="Blocked by policy: No external email from Support Agent"
              state="blocked"
              icon="policy-block"
              action={
                <Link
                  to="/settings/guardrails"
                  className="text-body-s font-medium whitespace-nowrap text-link underline underline-offset-2"
                >
                  View policy
                </Link>
              }
            />
          </div>

          <p className={cn(status === 'stopped' && 'text-fg-2')}>
            {full.slice(0, count)}
            {working && <StreamingCaret />}
            {status === 'stopped' && '…'}
          </p>
        </AgentTurn>
        <ThreadMessages agent={agent} messages={messages} thinking={thinking} />
      </ChatThread>

      <ComposerDock>
        <ChatComposer
          placeholder={`Message ${agent.name}…`}
          layout="inline"
          tools={['attach']}
          streaming={working}
          streamingLabel={`${agent.name} is working…`}
          onStop={() => setPhase('stopped')}
          onSend={send}
        />
      </ComposerDock>
    </ChatLayout>
  );
}

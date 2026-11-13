import { useState } from 'react';
import { Link } from 'react-router';
import { UserMessage } from '@/components/ai';
import { ChatComposer } from './components/ChatComposer';
import { StandardHeader } from './components/ChatHeader';
import { ChatLayout, ChatThread, ComposerDock } from './components/ChatLayout';
import { AgentTurn, FooterPill, ThreadMessages } from './components/ChatMessages';
import { ReasoningTrace } from './components/ReasoningTrace';
import { agents, reasoningSteps } from './data';
import { useChatThread } from './hooks';

const TITLE = 'Q3 refund trends by region';

const answerSources = [
  { title: 'Refunds by region · Oct 7–20', where: 'Analytics warehouse', to: '/analytics' },
  { title: 'Carrier incident log · Reno', where: 'Docs drive', to: '/knowledge' },
];

/** W4-05 · Reasoning steps — collapsible, timed trace above the Data Analyst's answer. */
export default function Reasoning() {
  const agent = agents.analyst;
  const [showSources, setShowSources] = useState(false);
  const { messages, thinking, send } = useChatThread();

  return (
    <ChatLayout
      title={TITLE}
      role="builder"
      activeChat={TITLE}
      header={<StandardHeader agentId="analyst" model="Model C Deep" title={TITLE} share={false} />}
    >
      <ChatThread scrollKey={messages.length + (thinking ? 1 : 0) || undefined}>
        <UserMessage meta="2:06 PM">Why did refunds in the West region jump last week?</UserMessage>
        <AgentTurn
          agent={agent}
          time="2:06 PM"
          footer={
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-body-s text-fg-3">7.4 s · 3,120 tokens · $0.04</span>
                <span aria-hidden className="h-4 w-px bg-border" />
                <FooterPill active={showSources} onClick={() => setShowSources(!showSources)}>
                  Sources ({answerSources.length})
                </FooterPill>
              </div>
              {showSources && (
                <ul className="flex animate-fade-in flex-col gap-1.5">
                  {answerSources.map((s, i) => (
                    <li key={s.title}>
                      <Link
                        to={s.to}
                        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-13 hover:bg-subtle"
                      >
                        <span className="inline-flex size-5 items-center justify-center rounded-[5px] bg-brand-subtle text-caption font-semibold text-brand-text">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium text-fg">{s.title}</span>
                        <span className="hidden text-body-s text-fg-3 sm:inline">{s.where}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          }
        >
          <ReasoningTrace seconds={6} steps={reasoningSteps} traceTo="/runs/run_4835/trace" />
          <p>
            West refunds rose from <b className="font-semibold">$4,210</b> to{' '}
            <b className="font-semibold">$9,860</b> week over week. About 70% of the increase comes from one
            cause: a late carrier hand-off on Oct 15–16 that delayed 312 orders out of the Reno warehouse.
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5 marker:text-fg-2">
            <li>Late-delivery refunds: $3,940 of the $5,650 increase</li>
            <li>The rest is normal noise, spread across 6 product lines</li>
            <li>Other regions stayed flat (±4%)</li>
          </ul>
        </AgentTurn>
        <ThreadMessages agent={agent} messages={messages} thinking={thinking} />
      </ChatThread>

      <ComposerDock>
        <ChatComposer placeholder="Ask a follow-up…" layout="inline" tools={[]} strongBorder onSend={send} />
      </ComposerDock>
    </ChatLayout>
  );
}

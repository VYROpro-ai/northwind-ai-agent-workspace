import { useState } from 'react';
import { Icon } from '@/components/icons';
import {
  AgentMessage,
  AiBadge,
  CitationChip,
  Composer,
  ReasoningBlock,
  StreamingCaret,
  SuggestionChip,
  SystemMessage,
  ThoughtChip,
  TokenMeter,
  ToolCall,
  ToolCallGroup,
  TypingDots,
  UserMessage,
} from '@/components/ai';
import { Button, Switch, useToast } from '@/components/ui';
import { demoReasoning, demoToolCalls } from '../../data';
import { DsSectionBlock, ExampleRow, SectionHeader, Specimen, VariantLabel } from '../Specimen';

/** C9 · AI — messages, tool calls, reasoning, composer and inline AI parts. */
export function AiGallery() {
  const toast = useToast();
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<number | null>(1);
  const [streaming, setStreaming] = useState(false);

  return (
    <DsSectionBlock id="ai">
      <SectionHeader
        id="ai"
        eyebrow="Components · C9"
        title="AI"
        description="Violet is reserved for what an agent writes: the AI badge, reasoning, streaming caret and AI actions. Tool calls carry their state as an icon plus a word."
        meta="import from '@/components/ai'"
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Specimen
          title="Messages"
          meta="user · agent · system"
          importPath="import { UserMessage, AgentMessage, SystemMessage } from '@/components/ai'"
          className="xl:col-span-2"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <UserMessage meta="Sofia · 9:14 AM">Can Acme Co. get a refund for order #48213?</UserMessage>
            <AgentMessage
              name="Support Agent"
              time="9:14 AM"
              headerExtra={
                <ThoughtChip seconds={6} open={thoughtOpen} onClick={() => setThoughtOpen(!thoughtOpen)} />
              }
              meta="1,240 tokens · $0.02"
            >
              {thoughtOpen && (
                <ReasoningBlock
                  seconds={6}
                  steps={demoReasoning.map((s) => ({ ...s, state: 'done' as const }))}
                />
              )}
              <p>
                Yes — Acme Co. qualifies for a refund of $240 under the 30-day return policy
                <CitationChip n={1} active={activeCitation === 1} onClick={() => setActiveCitation(1)} />. The
                order was delivered on Oct 2
                <CitationChip n={2} active={activeCitation === 2} onClick={() => setActiveCitation(2)} />, so
                it’s inside the window. I’ll draft the email for Leo to approve
                <StreamingCaret />
              </p>
            </AgentMessage>
            <SystemMessage>Priya switched this chat to Model C · Deep reasoning · 9:16 AM</SystemMessage>
            <div className="flex items-center gap-3">
              <TypingDots />
              <span className="text-body-s text-fg-3">Support Agent is typing…</span>
            </div>
          </div>
        </Specimen>

        <Specimen
          title="Tool call states"
          meta="7 states"
          importPath="import { ToolCall } from '@/components/ai'"
          bodyClassName="p-0 pt-4"
        >
          <div className="divide-y divide-border border-t border-border">
            {demoToolCalls.map((t) => (
              <ToolCall
                key={t.state}
                state={t.state}
                name={t.name}
                detail={t.detail}
                icon={t.icon}
                duration={t.duration}
                action={
                  t.state === 'approval' ? (
                    <Button
                      size="xs"
                      onClick={() => toast({ title: 'Refund approved', description: '$240 to Acme Co.' })}
                    >
                      Approve
                    </Button>
                  ) : t.state === 'reconnect' ? (
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => toast({ title: 'Pipeline CRM reconnected' })}
                    >
                      Reconnect
                    </Button>
                  ) : undefined
                }
              />
            ))}
          </div>
        </Specimen>

        <div className="flex flex-col gap-4">
          <Specimen
            title="Tool call group"
            meta="expandable payload"
            importPath="import { ToolCallGroup } from '@/components/ai'"
          >
            <ToolCallGroup count={3} duration="2.4 s">
              <ToolCall
                state="succeeded"
                name="Search CRM"
                detail="Found 1 customer · Acme Co."
                icon="database"
                duration="0.8 s"
                input={<code>{'{ "query": "Acme Co." }'}</code>}
                output={<code>{'{ "id": "cus_8812", "plan": "Business" }'}</code>}
                defaultOpen
              />
              <ToolCall
                state="succeeded"
                name="Read refund policy"
                detail="Section 3.2 · 30-day window"
                icon="knowledge"
                duration="0.5 s"
              />
              <ToolCall
                state="running"
                name="Draft email"
                detail="Writing to dana.whitfield@acme.example"
                icon="mail"
              />
            </ToolCallGroup>
          </Specimen>
          <Specimen
            title="Reasoning"
            meta="collapsible"
            importPath="import { ReasoningBlock } from '@/components/ai'"
          >
            <ReasoningBlock
              seconds={4}
              steps={demoReasoning}
              onViewTrace={() => toast({ title: 'Opening trace', tone: 'info' })}
            />
          </Specimen>
        </div>

        <Specimen title="Composer" meta="send · stop" importPath="import { Composer } from '@/components/ai'">
          <Composer
            placeholder={streaming ? 'Support Agent is answering…' : 'Ask Support Agent anything…'}
            streaming={streaming}
            onStop={() => {
              setStreaming(false);
              toast({ title: 'Response stopped', tone: 'neutral' });
            }}
            onSend={(text) => {
              setStreaming(true);
              toast({ title: 'Message sent', description: text, tone: 'info' });
            }}
            toolbarRight={
              <button
                type="button"
                className="hidden h-8 items-center gap-1.5 rounded-full px-2.5 text-13 font-medium text-fg-2 hover:bg-subtle sm:inline-flex"
              >
                <Icon name="model" size={14} />
                Balanced
                <Icon name="chevron-down" size={12} strokeWidth={2} />
              </button>
            }
            hint="Agents can make mistakes. Check important info."
          />
          <Switch
            className="mt-4"
            label="Streaming state"
            description="Send turns into Stop while the agent writes."
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
          />
        </Specimen>

        <Specimen
          title="Inline AI parts"
          meta="chips · meters"
          importPath="import { AiBadge, ThoughtChip, CitationChip, SuggestionChip, TokenMeter } from '@/components/ai'"
        >
          <VariantLabel>Badge · caret · typing · thought</VariantLabel>
          <ExampleRow>
            <AiBadge />
            <span className="text-body-m text-fg">
              Streaming
              <StreamingCaret />
            </span>
            <TypingDots />
            <ThoughtChip seconds={3} />
          </ExampleRow>
          <VariantLabel className="mt-5">Citations · default · active · unavailable</VariantLabel>
          <ExampleRow className="gap-1">
            <CitationChip n={1} />
            <CitationChip n={2} active />
            <CitationChip n={3} unavailable />
          </ExampleRow>
          <VariantLabel className="mt-5">Suggestions</VariantLabel>
          <ExampleRow className="gap-2">
            <SuggestionChip ai onClick={() => toast({ title: 'Drafting refund email', tone: 'info' })}>
              <Icon name="sparkle" size={14} />
              Draft the refund email
            </SuggestionChip>
            <SuggestionChip onClick={() => toast({ title: 'Showing order history', tone: 'info' })}>
              Show order history
            </SuggestionChip>
          </ExampleRow>
          <VariantLabel className="mt-5">Token meters</VariantLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TokenMeter label="Context window" value={42_180} max={128_000} />
            <TokenMeter label="Context window" value={118_400} max={128_000} warn />
          </div>
        </Specimen>
      </div>
    </DsSectionBlock>
  );
}

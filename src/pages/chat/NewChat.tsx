import { useState } from 'react';
import { Icon } from '@/components/icons';
import { userForRole } from '@/data/people';
import { ChatComposer, HintKey } from './components/ChatComposer';
import { AgentSwitcher } from './components/ChatHeader';
import { ChatLayout, ChatThread, ComposerDock } from './components/ChatLayout';
import { ThreadMessages } from './components/ChatMessages';
import { PromptLibraryDrawer } from './components/PromptLibraryDrawer';
import { agents, starters, type AgentId } from './data';
import { useChatThread } from './hooks';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export interface NewChatProps {
  /** Overlay open on arrival — used by the W4-01s and W4-09 state routes. */
  overlay?: 'picker' | 'prompts';
}

/** W4-01 · New chat — agent greeting, starter prompts and the composer. */
export default function NewChat({ overlay }: NewChatProps) {
  const [agentId, setAgentId] = useState<AgentId>('support');
  const [promptsOpen, setPromptsOpen] = useState(overlay === 'prompts');
  const [draft, setDraft] = useState('');
  const [hello] = useState(greeting);
  const { messages, thinking, send } = useChatThread();
  const agent = agents[agentId];
  const me = userForRole.member;
  const started = messages.length > 0;

  return (
    <ChatLayout
      title={started ? messages[0].text : 'New chat'}
      role="member"
      activeChat=""
      header={
        <>
          <AgentSwitcher agentId={agentId} onChange={setAgentId} defaultOpen={overlay === 'picker'} />
          <span className="flex-1" />
          <span className="hidden truncate text-13 text-fg-3 sm:block">
            {started ? messages[0].text : 'New chat'}
          </span>
        </>
      }
    >
      {started ? (
        <ChatThread scrollKey={messages.length + (thinking ? 1 : 0)}>
          <ThreadMessages agent={agent} messages={messages} thinking={thinking} />
        </ChatThread>
      ) : (
        <section
          aria-labelledby="new-chat-title"
          className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-8"
        >
          <div className="flex w-full max-w-[680px] flex-col items-center gap-[22px]">
            <span className="inline-flex size-14 items-center justify-center rounded-[14px] border border-ai-border bg-ai-subtle text-ai-text">
              <Icon name="nav-agents" size={28} strokeWidth={1.6} />
            </span>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h1
                id="new-chat-title"
                className="text-[28px] leading-9 font-semibold tracking-[-0.02em] text-fg"
              >
                {hello}, {me.name.split(' ')[0]}
              </h1>
              <p className="text-[15px] leading-[22px] text-fg-2">
                I’m {agent.name}. {agent.intro}
              </p>
            </div>
            <ul className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
              {starters.map((s) => (
                <li key={s.text}>
                  <button
                    type="button"
                    onClick={() => send(s.text)}
                    className="flex h-full w-full items-center gap-2.5 rounded-[18px] border border-border bg-surface px-3.5 py-3 text-left text-13 text-fg transition-colors hover:border-border-strong hover:bg-subtle"
                  >
                    <Icon name={s.icon} size={16} className="shrink-0 text-ai-text" />
                    {s.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ComposerDock>
        <ChatComposer
          placeholder={`Message ${agent.name}…`}
          strongBorder
          tools={['attach', 'prompts-label']}
          trailingTools={['voice']}
          value={draft}
          onValueChange={setDraft}
          onSend={send}
          onOpenPrompts={() => setPromptsOpen(true)}
          hint={
            <>
              Type <HintKey>/</HintKey> for saved prompts, <HintKey>@</HintKey> to mention a file
            </>
          }
        />
      </ComposerDock>

      <PromptLibraryDrawer
        open={promptsOpen}
        onClose={() => setPromptsOpen(false)}
        onInsert={(text) => {
          setDraft(text);
          setPromptsOpen(false);
        }}
      />
    </ChatLayout>
  );
}

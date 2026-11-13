import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Icon } from '@/components/icons';
import { userForRole } from '@/data/people';
import { ChatComposer, HintKey } from './components/ChatComposer';
import { AgentSwitcher } from './components/ChatHeader';
import { ChatLayout, ChatThread, ComposerDock } from './components/ChatLayout';
import { ThreadMessages } from './components/ChatMessages';
import { PromptLibraryDrawer } from './components/PromptLibraryDrawer';
import { agents, starters, type AgentId } from './data';
import { useChatThread, useRealChatThread, type RealAgentConfig } from './hooks';
import { useAuth } from '@/lib/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { getAgent, listAgents } from '@/lib/agents';
import { useToast } from '@/components/ui';

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
  const { id: chatIdParam } = useParams();
  const { workspace } = useAuth();
  const toast = useToast();

  // Real agents for the workspace (configured mode only); matched to the picker by name.
  const [realAgents, setRealAgents] = useState<RealAgentConfig[]>([]);
  useEffect(() => {
    if (!isFirebaseConfigured || !workspace) return;
    let cancelled = false;
    void listAgents(workspace.id).then((rows) => {
      if (cancelled || !rows) return;
      // Summaries carry no instructions; the matched row is loaded in full below.
      setRealAgents(
        rows.map((r) => ({ id: r.id, name: r.name, instructions: '', model: '', temperature: 0.7 })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [workspace]);

  // Full config of the matched real agent (instructions/model come from the DB row).
  const [matchedAgent, setMatchedAgent] = useState<RealAgentConfig | null>(null);
  useEffect(() => {
    const match = realAgents.find(
      (a) => a.name.toLowerCase() === agents[agentId].name.toLowerCase(),
    );
    if (!match || !workspace || !isFirebaseConfigured) {
      setMatchedAgent(null);
      return;
    }
    let cancelled = false;
    void getAgent(workspace.id, match.id ?? '').then((row) => {
      if (cancelled || !row) return;
      setMatchedAgent({
        id: row.id,
        name: row.name,
        instructions: row.instructions ?? '',
        model: row.model,
        temperature: row.temperature,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [realAgents, agentId, workspace]);

  const demo = useChatThread();
  const real = useRealChatThread(matchedAgent, { resetKey: agentId, chatId: chatIdParam });
  const useReal = isFirebaseConfigured && Boolean(matchedAgent);
  const { messages, thinking, send } = useReal ? real : demo;
  const agent = agents[agentId];
  const me = userForRole.member;
  const started = messages.length > 0;

  useEffect(() => {
    if (useReal && real.error) {
      toast({ tone: 'danger', title: 'Chat failed', description: real.error });
    }
  }, [useReal, real.error, toast]);

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
          <ThreadMessages
            agent={agent}
            messages={messages}
            thinking={thinking}
            streamingId={useReal ? real.streamingId : null}
          />
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

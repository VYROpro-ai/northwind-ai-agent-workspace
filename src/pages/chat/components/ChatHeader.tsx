import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { AgentAvatar, Dropdown, IconButton, Input, useToast } from '@/components/ui';
import { agents, recentAgents, type AgentId, type ChatAgent } from '../data';

/** Rounded agent tile used in headers and replies (glyph, or letters for agents like Data Analyst). */
export function AgentMark({ agent, size = 28 }: { agent: ChatAgent; size?: number }) {
  return <AgentAvatar tone={agent.tone} letter={agent.letter} size={size} className="rounded-[7px]" />;
}

/** "Recent agents" menu opened from the agent name in the chat header (W4-01s). */
function AgentPickerPanel({ selected, onSelect }: { selected: AgentId; onSelect: (id: AgentId) => void }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = recentAgents
    .map((id) => agents[id])
    .filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));

  return (
    <>
      <div className="p-2.5">
        <Input
          leftIcon="search"
          className="text-13"
          placeholder="Search agents"
          aria-label="Search agents"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <p className="px-3.5 pt-0.5 pb-1.5 text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">
        Recent
      </p>
      <div role="menu" aria-label="Recent agents">
        {list.map((a) => {
          const on = a.id === selected;
          return (
            <button
              key={a.id}
              type="button"
              role="menuitem"
              disabled={a.paused}
              onClick={() => onSelect(a.id)}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors focus:outline-none disabled:cursor-not-allowed',
                on ? 'bg-brand-subtle' : 'hover:bg-subtle focus:bg-subtle',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-7 shrink-0 items-center justify-center rounded-[7px] text-caption font-semibold text-white',
                  a.tile,
                  a.paused && 'opacity-60',
                )}
              >
                {a.mono}
              </span>
              <span className={cn('flex min-w-0 flex-1 flex-col', a.paused && 'opacity-60')}>
                <span className="text-13 font-medium text-fg">{a.name}</span>
                <span className="truncate text-body-s text-fg-3">{a.description}</span>
              </span>
              {a.paused && (
                <span className="inline-flex items-center gap-1 text-caption font-medium text-warn-text">
                  <Icon name="pause" size={11} strokeWidth={2} />
                  Paused
                </span>
              )}
              {on && (
                <>
                  <Icon name="check" size={14} strokeWidth={2.5} className="text-brand-text" />
                  <span className="sr-only">(selected)</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      {list.length === 0 && <p className="px-3.5 py-3 text-13 text-fg-3">No agents match “{query}”.</p>}
      <Link
        to="/agents"
        className="block border-t border-border px-3.5 py-2.5 text-13 font-medium text-link hover:underline"
      >
        Browse all agents
      </Link>
    </>
  );
}

/** Agent name button in the chat header; opens the agent picker. */
export function AgentSwitcher({
  agentId,
  onChange,
  defaultOpen = false,
}: {
  agentId: AgentId;
  onChange?: (id: AgentId) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toast = useToast();
  const agent = agents[agentId];
  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      width={340}
      className="mt-[18px] overflow-hidden rounded-[18px] p-0"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className={cn(
            'inline-flex h-9 min-w-0 items-center gap-2 rounded-full pr-2 pl-1 text-fg transition-colors hover:bg-subtle',
            open && 'bg-subtle',
          )}
        >
          <AgentMark agent={agent} />
          <span className="truncate text-[15px] leading-5 font-semibold">{agent.name}</span>
          <Icon name="chevron-down" size={16} strokeWidth={2} className="shrink-0 text-icon" />
        </button>
      )}
    >
      <AgentPickerPanel
        selected={agentId}
        onSelect={(id) => {
          setOpen(false);
          if (id === agentId) return;
          onChange?.(id);
          toast({
            title: `Switched to ${agents[id].name}`,
            description: 'New messages in this chat go to this agent.',
          });
        }}
      />
    </Dropdown>
  );
}

/** Small outlined model label next to the agent name. */
export function ModelBadge({ children }: { children: ReactNode }) {
  return (
    <span className="hidden h-[22px] shrink-0 items-center rounded-sm border border-border px-2 text-body-s font-medium text-fg-2 sm:inline-flex">
      {children}
    </span>
  );
}

/** Centred chat title. */
export function HeaderTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="hidden min-w-0 flex-1 truncate text-center text-13 font-normal text-fg-2 md:block">
      {children}
    </h1>
  );
}

/** Share + overflow menu shown at the right of most chat headers. */
export function ChatActions({ share = true, children }: { share?: boolean; children?: ReactNode }) {
  const toast = useToast();
  const navigate = useNavigate();
  return (
    <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
      {children}
      {share && (
        <IconButton
          icon="share"
          label="Share chat"
          variant="ghost"
          onClick={() =>
            toast({
              title: 'Link copied',
              description: 'Anyone in Northwind Labs with the link can view this chat.',
            })
          }
        />
      )}
      <Dropdown
        align="end"
        width={210}
        trigger={(props) => <IconButton icon="more" label="More" variant="ghost" {...props} />}
        items={[
          { label: 'Rename chat', icon: 'edit', onSelect: () => toast({ title: 'Chat renamed' }) },
          {
            label: 'Pin chat',
            icon: 'pin',
            onSelect: () => toast({ title: 'Pinned to the top of your chats' }),
          },
          { label: 'Compare models', icon: 'model-compare', onSelect: () => navigate('/chat/compare') },
          { label: 'Voice mode', icon: 'mic', onSelect: () => navigate('/chat/voice') },
          {
            label: 'Delete chat',
            icon: 'trash',
            danger: true,
            separator: true,
            onSelect: () =>
              toast({
                title: 'Chat deleted',
                tone: 'danger',
                action: { label: 'Undo', onClick: () => toast({ title: 'Chat restored' }) },
              }),
          },
        ]}
      />
    </div>
  );
}

/** Agent switcher + model badge + centred title + actions — the header used by most chat screens. */
export function StandardHeader({
  agentId = 'support',
  model = 'Model B Balanced',
  title,
  share = true,
  actions,
}: {
  agentId?: AgentId;
  model?: string | null;
  title: string;
  share?: boolean;
  /** Extra buttons before share / more. */
  actions?: ReactNode;
}) {
  const [id, setId] = useState(agentId);
  return (
    <>
      <AgentSwitcher agentId={id} onChange={setId} />
      {model && <ModelBadge>{model}</ModelBadge>}
      <HeaderTitle>{title}</HeaderTitle>
      <ChatActions share={share}>{actions}</ChatActions>
    </>
  );
}

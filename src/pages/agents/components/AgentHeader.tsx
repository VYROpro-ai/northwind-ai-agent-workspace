import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AgentAvatar, Badge, Button, Dropdown, IconButton, useToast } from '@/components/ui';
import { SUPPORT_AGENT_PATH } from '../data';

export type AgentTab =
  'Overview' | 'Instructions' | 'Tools' | 'Knowledge' | 'Runs' | 'Evaluations' | 'Settings' | 'Versions';

const tabs: { label: AgentTab; to: string }[] = [
  { label: 'Overview', to: SUPPORT_AGENT_PATH },
  { label: 'Instructions', to: '/agents/new/instructions' },
  { label: 'Tools', to: '/agents/new/tools' },
  { label: 'Knowledge', to: '/agents/new/knowledge' },
  { label: 'Runs', to: '/runs' },
  { label: 'Evaluations', to: `${SUPPORT_AGENT_PATH}/evaluations` },
  { label: 'Settings', to: `${SUPPORT_AGENT_PATH}/settings` },
  { label: 'Versions', to: `${SUPPORT_AGENT_PATH}/versions` },
];

export interface AgentHeaderProps {
  /** Highlighted section tab. */
  tab: AgentTab;
  /** Enables "Publish changes" when the agent has unpublished edits. */
  unpublished?: boolean;
  onShare?: () => void;
  onArchive?: () => void;
  /** Real agent identity; defaults to the mock Support Agent. */
  agent?: { name: string; description: string; status: string; model: string; version?: string };
}

/** Part · Agent header — identity, status, actions and the section tab bar. */
export function AgentHeader({ tab, unpublished, onShare, onArchive, agent }: AgentHeaderProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const name = agent?.name ?? 'Support Agent';
  const description =
    agent?.description ?? 'Answers billing, order and refund questions from the help docs. Asks before refunds or emails.';
  const status = agent?.status ?? 'Published';
  const model = agent?.model ?? 'Model B Balanced';
  const version = agent?.version ?? 'v4';

  return (
    <div className="flex flex-col gap-4 border-b border-border bg-surface px-4 pt-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-4">
        <AgentAvatar tone="ai" size={52} className="rounded-[13px]" />
        <div className="flex min-w-60 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-h2 font-semibold tracking-[-0.015em] text-fg">{name}</h1>
            <Badge
              tone={status === 'Published' ? 'ok' : status === 'Paused' ? 'warn' : 'neutral'}
              dot
              size="sm"
              className="h-[22px] px-2 text-body-s"
            >
              {status}
            </Badge>
            <span className="inline-flex h-[22px] items-center rounded-sm border border-border px-2 text-body-s font-medium text-fg-2">
              {model}
            </span>
            <span className="font-mono text-body-s text-fg-3">{version}</span>
          </div>
          <p className="text-body-m text-fg-2">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" leftIcon="chat" className="px-3" onClick={() => navigate('/chat')}>
            Chat
          </Button>
          <Button
            variant="secondary"
            leftIcon="edit"
            className="px-3"
            onClick={() => navigate('/agents/new/instructions')}
          >
            Edit
          </Button>
          <Button
            disabled={!unpublished}
            className="px-3.5"
            onClick={() =>
              toast({ title: `${name} v5 published`, description: 'Live for the whole workspace.' })
            }
          >
            Publish changes
          </Button>
          <Dropdown
            align="end"
            trigger={(props) => (
              <IconButton icon="more" label="More actions" className="border-border-strong" {...props} />
            )}
            items={[
              { label: 'Share…', icon: 'share', onSelect: onShare },
              {
                label: 'Duplicate',
                icon: 'copy',
                onSelect: () =>
                  toast({ title: 'Support Agent duplicated', description: 'Saved as a new draft.' }),
              },
              {
                label: 'Version history',
                icon: 'history',
                onSelect: () => navigate(`${SUPPORT_AGENT_PATH}/versions`),
              },
              {
                label: 'Archive or delete…',
                icon: 'archive',
                danger: true,
                separator: true,
                onSelect: onArchive,
              },
            ]}
          />
        </div>
      </div>
      <nav aria-label="Agent sections" className="-mb-px scrollbar-none flex gap-6 overflow-x-auto">
        {tabs.map((t) => {
          const on = t.label === tab;
          return (
            <Link
              key={t.label}
              to={t.to}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'shrink-0 border-b-2 pt-2.5 pb-3 text-body-m whitespace-nowrap transition-colors',
                on ? 'border-brand font-semibold text-fg' : 'border-transparent text-fg-2 hover:text-fg',
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

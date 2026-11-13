import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Avatar, AvatarGroup, Dropdown, IconButton, useToast } from '@/components/ui';
import { Sparkline } from '@/components/charts';
import { formatNumber } from '@/lib/format';
import type { AgentStatus, AgentSummary } from '../data';
import { AgentIcon } from './AgentIcon';

const statusText: Record<AgentStatus, string> = {
  Published: 'text-ok-text',
  Paused: 'text-warn-text',
  Draft: 'text-fg-2',
};

/** Coloured dot + word for an agent's status. */
export function AgentStatusLabel({ status }: { status: AgentStatus }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-[5px] font-medium', statusText[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

const toneVar = {
  ai: 'var(--ai-text)',
  brand: 'var(--brand-text)',
  ok: 'var(--ok-text)',
  warn: 'var(--warn-text)',
  info: 'var(--info-text)',
};

const R = 24;
const CIRC = 2 * Math.PI * R;

/** Avatar with a progress ring showing the success rate (dashed when the agent has no runs). */
function HealthRing({ agent, color }: { agent: AgentSummary; color: string }) {
  const pct = agent.success ?? 0;
  return (
    <span className="relative size-[52px] shrink-0">
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx="26"
          cy="26"
          r={R}
          fill="none"
          stroke={agent.success === null ? 'var(--border-strong)' : 'var(--subtle)'}
          strokeWidth="3"
          strokeDasharray={agent.success === null ? '3 5' : undefined}
        />
        {agent.success !== null && (
          <circle
            cx="26"
            cy="26"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${((CIRC * pct) / 100).toFixed(1)} ${CIRC.toFixed(1)}`}
          />
        )}
      </svg>
      <AgentIcon
        icon={agent.icon}
        tone={agent.tone}
        size={38}
        shape="circle"
        className="absolute top-[7px] left-[7px]"
      />
    </span>
  );
}

/** W3-01 agent card — identity, health ring, 7-day runs sparkline, owner and top users. */
export function AgentCard({ agent }: { agent: AgentSummary }) {
  const navigate = useNavigate();
  const toast = useToast();
  const low = agent.success !== null && agent.success < 90;
  const color = low ? 'var(--danger-text)' : toneVar[agent.tone];
  const href = '/agents/support-agent';

  return (
    <article className="relative flex flex-1 flex-col gap-4 rounded-[20px] border border-border bg-surface px-5 pt-5 pb-4 shadow-[0_1px_2px_rgb(13_16_24/0.04)] transition-shadow hover:shadow-raised">
      <div className="flex items-center gap-3.5">
        <HealthRing agent={agent} color={color} />
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <h2 className="truncate text-h4 leading-[22px] font-semibold tracking-[-0.01em]">
            <Link
              to={href}
              className="after:absolute after:inset-0 after:rounded-[20px] focus-visible:outline-none"
            >
              {agent.name}
            </Link>
          </h2>
          <span className="flex min-w-0 items-center gap-1.5 text-body-s text-fg-3">
            <AgentStatusLabel status={agent.status} />
            <span aria-hidden>·</span>
            <span className="truncate">{agent.model}</span>
          </span>
        </div>
        <Dropdown
          align="end"
          width={200}
          trigger={(props) => (
            <IconButton
              icon="more"
              label={`${agent.name} actions`}
              size="sm"
              className="relative z-10 self-start"
              {...props}
            />
          )}
          items={[
            { label: 'Open', icon: 'arrow-up-right', onSelect: () => navigate(href) },
            { label: 'Test in chat', icon: 'chat', onSelect: () => navigate('/chat') },
            { label: 'Settings', icon: 'settings', onSelect: () => navigate(`${href}/settings`) },
            {
              label: 'Duplicate',
              icon: 'copy',
              onSelect: () =>
                toast({ title: `${agent.name} duplicated`, description: 'Saved as a new draft.' }),
            },
            {
              label: 'Archive',
              icon: 'archive',
              danger: true,
              separator: true,
              onSelect: () => navigate(`${href}/archive`),
            },
          ]}
        />
      </div>

      <p className="line-clamp-2 min-h-10 text-13 leading-5 text-fg-2">{agent.description}</p>

      <div className="relative h-[84px] overflow-hidden rounded-[14px] bg-sunken">
        <div className="absolute inset-x-3.5 top-2.5 z-[1] flex items-baseline justify-between gap-2">
          <span className="flex items-baseline gap-1.5">
            <span className="text-h3 leading-[26px] font-semibold tracking-[-0.02em] tabular">
              {agent.runs !== null
                ? formatNumber(agent.runs)
                : agent.status === 'Draft'
                  ? 'No runs yet'
                  : 'Paused'}
            </span>
            <span className="text-caption text-fg-3">
              {agent.runs !== null
                ? 'runs · 7 d'
                : agent.status === 'Draft'
                  ? 'publish to start'
                  : 'since Oct 19'}
            </span>
          </span>
          {agent.success !== null && (
            <span className="flex items-baseline gap-1.5">
              <span className="text-caption text-fg-3">success</span>
              <span className={cn('text-body-m font-semibold tabular', low ? 'text-danger-text' : 'text-fg')}>
                {agent.success}%
              </span>
            </span>
          )}
        </div>
        {agent.trend.length ? (
          <Sparkline
            data={agent.trend}
            color={color}
            width={300}
            height={38}
            area
            className="absolute inset-x-0 bottom-0 h-[38px] w-full"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-2 border-t-2 border-dashed border-border-strong"
          />
        )}
      </div>

      {agent.warning && (
        <p className="-mt-1.5 flex items-center gap-2 text-body-s text-danger-text">
          <Icon name="alert-triangle" size={13} strokeWidth={2.2} />
          <span className="flex-1">{agent.warning}</span>
          <Link
            to="/integrations/pipeline-crm"
            className="relative z-10 font-semibold underline underline-offset-2 hover:no-underline"
          >
            Reconnect
          </Link>
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-3.5 text-body-s text-fg-3">
        <Avatar
          name={agent.owner.name}
          src={agent.owner.avatar}
          size="xs"
          className="size-[22px] [&>img]:size-[22px]"
        />
        <span className="font-medium text-fg">{agent.owner.name}</span>
        <span>· {agent.edited}</span>
        <span className="flex-1" />
        <span title="Used by" className="relative z-10">
          <AvatarGroup people={agent.users.map((p) => ({ name: p.name, src: p.avatar }))} max={3} />
        </span>
      </div>
    </article>
  );
}

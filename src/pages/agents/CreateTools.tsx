import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Badge, Button, EmptyState, Input, Segmented, useToast, type Tone } from '@/components/ui';
import { toolGroups, type ToolGroup, type ToolMode, type ToolRisk } from './data';
import { WizardStep } from './components/WizardLayout';

const riskTone: Record<ToolRisk, Tone> = { Read: 'ok', Write: 'warn', Money: 'danger', Send: 'warn' };
const modes: ToolMode[] = ['Auto-run', 'Ask first', 'Off'];

/** W3-05 · Create agent — 3. Tools */
export default function CreateTools() {
  const toast = useToast();
  const [groups, setGroups] = useState<ToolGroup[]>(toolGroups);
  const [query, setQuery] = useState('');

  const live = groups.filter((g) => g.connected).flatMap((g) => g.tools);
  const on = live.filter((t) => t.mode !== 'Off').length;
  const asking = live.filter((t) => t.mode === 'Ask first').length;

  const setMode = (app: string, name: string, mode: ToolMode) =>
    setGroups((list) =>
      list.map((g) =>
        g.app === app ? { ...g, tools: g.tools.map((t) => (t.name === name ? { ...t, mode } : t)) } : g,
      ),
    );

  const connect = (app: string) => {
    setGroups((list) => list.map((g) => (g.app === app ? { ...g, connected: true } : g)));
    toast({ title: `${app} connected`, description: 'Its tools are now available to this agent.' });
  };

  const q = query.trim().toLowerCase();
  const visible = groups
    .map((g) => ({
      ...g,
      tools: g.tools.filter((t) => !q || `${g.app} ${t.name} ${t.description}`.toLowerCase().includes(q)),
    }))
    .filter((g) => g.tools.length);

  return (
    <WizardStep
      step={3}
      rhythm="dense"
      top={24}
      title="Tools"
      description="Choose what your agent can do, and which actions need a person to approve."
      chatNote="Tools updated · try “refund order 4471”"
      actions={
        <Input
          pill
          size="sm"
          leftIcon="search"
          aria-label="Search tools"
          placeholder="Search tools"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          containerClassName="w-full sm:w-[200px]"
          className="h-[34px] border-border text-13"
        />
      }
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-13">
        <span className="font-semibold">{on} tools on</span>
        <span className="text-fg-3" aria-hidden>
          ·
        </span>
        <span className="inline-flex items-center gap-1.5 text-warn-text">
          <Icon name="shield" size={14} strokeWidth={2} />
          {asking} need approval
        </span>
        <span className="flex-1" />
        <span className="text-fg-3">Approvals go to Leo Martins</span>
      </div>

      {visible.length === 0 && (
        <EmptyState
          icon="tool"
          title="No tools match"
          description={`Nothing found for “${query}”.`}
          className="py-8"
        />
      )}

      {visible.map((g) => (
        <section
          key={g.app}
          aria-labelledby={`app-${g.app}`}
          className="overflow-hidden rounded-[18px] border border-border bg-surface"
        >
          <div className="flex items-center gap-2.5 bg-sunken px-3.5 py-2.5">
            <span
              aria-hidden
              className={cn(
                'inline-flex size-[26px] items-center justify-center rounded-[7px] text-body-s font-semibold text-white',
                g.tint,
              )}
            >
              {g.mono}
            </span>
            <h2 id={`app-${g.app}`} className="text-body-m font-semibold">
              {g.app}
            </h2>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-body-s',
                g.connected ? 'text-ok-text' : 'text-fg-3',
              )}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {g.connected ? 'Connected' : 'Not connected'}
            </span>
            <span className="flex-1" />
            {!g.connected && (
              <Button size="xs" className="h-7 px-3" onClick={() => connect(g.app)}>
                Connect
              </Button>
            )}
          </div>
          <ul>
            {g.tools.map((t) => (
              <li
                key={t.name}
                className={cn(
                  'flex flex-col gap-2 border-t border-border px-3.5 py-2 sm:flex-row sm:items-center sm:gap-3',
                  !g.connected && 'opacity-55',
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-13 font-medium">{t.name}</span>
                    <Badge tone={riskTone[t.risk]} size="sm" className="px-[7px]">
                      {t.risk}
                    </Badge>
                    {t.locked && (
                      <span className="inline-flex items-center gap-1 text-caption text-fg-3">
                        <Icon name="lock" size={11} strokeWidth={2} />
                        Set by workspace policy
                      </span>
                    )}
                  </div>
                  <span className="text-body-s text-fg-3">{t.description}</span>
                </div>
                <Segmented
                  size="sm"
                  label={`${t.name} mode`}
                  value={t.mode}
                  onChange={(mode) => setMode(g.app, t.name, mode)}
                  options={modes.map((m) => ({
                    value: m,
                    label: m,
                    disabled: !g.connected || (t.locked && m !== t.mode),
                  }))}
                  className="shrink-0 self-start rounded-md p-0.5 sm:self-auto [&>button]:h-[26px] [&>button]:rounded-sm"
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </WizardStep>
  );
}

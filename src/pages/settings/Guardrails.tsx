import { useState } from 'react';
import { Link } from 'react-router';
import { Badge, Button, Switch, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { policies as seedPolicies, policyActions, recentMatches, type Policy } from './data';
import { PolicyEditor } from './components/PolicyEditor';
import { SettingsCard, SettingsLayout } from './components/SettingsLayout';

const cols = 'grid-cols-[minmax(0,1fr)_auto_44px_36px] sm:grid-cols-[minmax(0,1fr)_124px_44px_36px]';

function PolicyList({
  policies,
  selected,
  onSelect,
  onToggle,
}: {
  policies: Policy[];
  selected: string | null;
  onSelect: (id: string) => void;
  onToggle: (policy: Policy, on: boolean) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-surface">
      <div
        aria-hidden
        className={cn(
          'grid items-center gap-3 border-b border-border bg-sunken px-4 py-2.5 text-body-s font-medium text-fg-3',
          cols,
        )}
      >
        <span>Policy</span>
        <span>On match</span>
        <span className="text-right">7 d</span>
        <span />
      </div>
      <ul aria-label="Policies">
        {policies.map((p) => {
          const active = p.id === selected;
          const action = policyActions[p.action];
          return (
            <li
              key={p.id}
              className={cn(
                'relative grid items-center gap-3 border-b border-border px-4 py-2.5 last:border-0',
                cols,
                active ? 'bg-brand-subtle/60 shadow-[inset_3px_0_0_var(--brand)]' : 'hover:bg-sunken/60',
              )}
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(p.id)}
                className="min-w-0 text-left after:absolute after:inset-0 after:content-['']"
              >
                <span className="block truncate text-13 font-semibold text-fg">{p.name}</span>
                <span className="block truncate text-body-s text-fg-3">
                  {p.type} · {p.scope}
                </span>
              </button>
              <Badge
                tone={action.tone}
                bordered={false}
                className="h-5 justify-self-start border-transparent"
              >
                {action.label}
              </Badge>
              <span className="text-right text-13 text-fg tabular">{p.matches}</span>
              <span className="relative z-10 justify-self-end">
                <Switch
                  aria-label={`${p.name} on`}
                  checked={p.on}
                  onChange={(e) => onToggle(p, e.target.checked)}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** W10-08 · Guardrails & policies */
export default function Guardrails() {
  const toast = useToast();
  const [list, setList] = useState(seedPolicies);
  const [selected, setSelected] = useState<string | null>('refund');
  const [suggestion, setSuggestion] = useState(true);
  const current = list.find((p) => p.id === selected) ?? null;

  const update = (id: string, patch: Partial<Policy>) =>
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const addPolicy = () => {
    const id = `draft-${list.length + 1}`;
    setList((prev) => [
      ...prev,
      {
        id,
        name: 'Untitled policy',
        type: 'Custom rule',
        scope: 'All agents',
        action: 'log',
        matches: 0,
        on: false,
        rule: '',
      },
    ]);
    setSelected(id);
  };

  return (
    <SettingsLayout
      crumb="Guardrails"
      title="Guardrails"
      description="Rules every agent follows, no matter what it’s asked."
      actions={
        <Button size="sm" leftIcon="plus" onClick={addPolicy}>
          New policy
        </Button>
      }
    >
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_396px]">
        <div className="flex min-w-0 flex-col gap-4">
          <PolicyList
            policies={list}
            selected={selected}
            onSelect={setSelected}
            onToggle={(p, on) => {
              update(p.id, { on });
              toast({ tone: on ? 'ok' : 'neutral', title: `${p.name} ${on ? 'turned on' : 'turned off'}` });
            }}
          />

          {suggestion && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[14px] bg-info-subtle px-4 py-3 text-13 leading-[19px] text-info-text">
              <Icon name="sparkle" size={16} strokeWidth={2} className="shrink-0" />
              <p className="min-w-0 flex-1 basis-60">
                <b className="font-semibold">“Legal and medical advice” blocked 32 messages.</b> Reviewers
                marked 20 of them okay. Narrow the rule?
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSelected('legal');
                  setSuggestion(false);
                }}
              >
                Review
              </Button>
            </div>
          )}

          <SettingsCard className="gap-2 p-4">
            <h2 className="mb-1 text-[15px] leading-[22px] font-semibold text-fg">Recent matches</h2>
            <ul className="flex flex-col gap-2.5">
              {recentMatches.map((m) => (
                <li key={m.run} className="flex items-center gap-3 text-13">
                  <Badge
                    tone={m.kind === 'Approval' ? 'warn' : 'danger'}
                    bordered={false}
                    className="h-5 border-transparent"
                  >
                    {m.kind}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-fg">{m.text}</span>
                  <Link to={m.to} className="text-body-s text-link hover:underline">
                    {m.run}
                  </Link>
                </li>
              ))}
            </ul>
          </SettingsCard>
        </div>

        {current && (
          <PolicyEditor
            key={current.id}
            policy={current}
            onClose={() => setSelected(null)}
            onSave={(patch) => {
              update(current.id, patch);
              toast({
                title: `${current.name} saved`,
                description: 'Agents follow the new rule right away.',
              });
            }}
          />
        )}
      </div>
    </SettingsLayout>
  );
}

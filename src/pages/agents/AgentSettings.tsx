import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Alert, Button, Card, Field, Input, Select, Slider, Switch, useToast } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { models, SUPPORT_AGENT_PATH, type ModelId } from './data';
import { AgentHeader } from './components/AgentHeader';

interface SettingsState {
  model: ModelId;
  cap: string;
  creativity: number;
  maxLength: string;
  context: string;
  fallback: string;
  memory: boolean;
}

/**
 * Last saved values. The live model is B (as in the header); picking C reproduces the design's
 * cost notice + save bar. The page opens clean on purpose.
 */
const saved: SettingsState = {
  model: 'b',
  cap: '400.00',
  creativity: 0.3,
  maxLength: 'medium',
  context: '128k',
  fallback: 'a',
  memory: true,
};

const fieldLabels: Record<keyof SettingsState, string> = {
  model: 'model',
  creativity: 'creativity',
  maxLength: 'answer length',
  context: 'context window',
  fallback: 'fallback model',
  memory: 'memory',
  cap: 'spend cap',
};

const RUNS_PER_MONTH = 12400;

function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3.5">
      <div className="min-w-56 flex-1">
        <p className="text-13 font-medium">{title}</p>
        <p className="text-body-s text-fg-3">{description}</p>
      </div>
      {children}
    </div>
  );
}

/** W3-08 · Agent settings */
export default function AgentSettings() {
  const navigate = useNavigate();
  const toast = useToast();
  const [base, setBase] = useState(saved);
  const [form, setForm] = useState(saved);
  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const changed = (Object.keys(form) as (keyof SettingsState)[]).filter((k) => form[k] !== base[k]);
  const current = models.find((m) => m.id === base.model)!;
  const chosen = models.find((m) => m.id === form.model)!;
  const monthlyDelta = Math.round((chosen.perRun - current.perRun) * RUNS_PER_MONTH);
  const latencyDelta = parseFloat(chosen.speed.slice(1)) - parseFloat(current.speed.slice(1));

  const save = () => {
    setBase(form);
    toast({ title: 'Settings saved', description: 'Publish changes to make them live.' });
  };

  return (
    <AppShell
      active="Agents"
      role="builder"
      bare
      crumbs={[{ label: 'Agents', to: '/agents' }, { label: 'Support Agent' }]}
    >
      <AgentHeader
        tab="Settings"
        unpublished
        onShare={() => navigate(`${SUPPORT_AGENT_PATH}/sharing`)}
        onArchive={() => navigate(`${SUPPORT_AGENT_PATH}/archive`)}
      />

      <div className="flex w-full max-w-[880px] flex-col gap-5 px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        <Card className="flex flex-col gap-3.5" aria-labelledby="model-title" role="group">
          <div>
            <h2 id="model-title" className="text-h4 font-semibold">
              Model
            </h2>
            <p className="text-13 text-fg-2">
              Pick the balance of speed, quality and cost that suits this agent.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="model-title"
            className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3"
          >
            {models.map((m) => {
              const on = form.model === m.id;
              return (
                <label
                  key={m.id}
                  className={cn(
                    'flex cursor-pointer flex-col gap-2 rounded-[10px] p-3.5 transition-colors',
                    on
                      ? 'border-[1.5px] border-brand bg-brand-subtle'
                      : 'border border-border hover:bg-sunken',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="model"
                      checked={on}
                      onChange={() => set('model', m.id)}
                      className="size-4 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-border-strong bg-surface transition-[border] checked:border-[5px] checked:border-brand"
                    />
                    <span className="flex-1 text-body-m font-semibold">{m.name}</span>
                    {base.model === m.id && <span className="text-caption text-fg-3">Current</span>}
                  </span>
                  <span className="text-body-s text-fg-2">{m.description}</span>
                  <span className="flex gap-3 font-mono text-caption text-fg-3">
                    <span>{m.speed}</span>
                    <span>{m.price}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {monthlyDelta !== 0 && (
            <Alert
              tone={monthlyDelta > 0 ? 'warn' : 'ok'}
              icon="alert-triangle"
              className="items-center py-2.5"
            >
              <span className={monthlyDelta > 0 ? 'text-warn-text' : 'text-ok-text'}>
                <b className="font-semibold">
                  About {monthlyDelta > 0 ? '+' : '−'}
                  {formatCurrency(Math.abs(monthlyDelta)).replace('.00', '')}/month
                </b>{' '}
                at the current {RUNS_PER_MONTH.toLocaleString('en-US')} runs a month.{' '}
                {latencyDelta > 0
                  ? `Answers get more thorough, about ${latencyDelta.toFixed(1)} s slower.`
                  : `Answers come back about ${Math.abs(latencyDelta).toFixed(1)} s faster.`}
              </span>
            </Alert>
          )}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-x-6 gap-y-4 pt-1">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-13">
                <span className="font-medium">Creativity</span>
                <span className="font-mono text-fg-2">{form.creativity.toFixed(1)}</span>
              </div>
              <Slider
                label="Creativity"
                value={form.creativity}
                min={0}
                max={1}
                step={0.1}
                onChange={(v) => set('creativity', v)}
              />
              <div className="flex justify-between text-caption text-fg-3">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>
            <Field label={<span className="text-13">Max answer length</span>}>
              {(id) => (
                <Select
                  id={id}
                  pill
                  value={form.maxLength}
                  onChange={(e) => set('maxLength', e.target.value)}
                  className="border-border text-13"
                  options={[
                    { value: 'short', label: 'Short · up to 300 tokens' },
                    { value: 'medium', label: 'Medium · up to 800 tokens' },
                    { value: 'long', label: 'Long · up to 2,000 tokens' },
                  ]}
                />
              )}
            </Field>
            <Field label={<span className="text-13">Context window</span>}>
              {(id) => (
                <Select
                  id={id}
                  pill
                  value={form.context}
                  onChange={(e) => set('context', e.target.value)}
                  className="border-border text-13"
                  options={[
                    { value: '32k', label: '32K tokens' },
                    { value: '128k', label: '128K tokens' },
                    { value: '200k', label: '200K tokens' },
                  ]}
                />
              )}
            </Field>
            <Field
              label={<span className="text-13">Fallback model</span>}
              hint="Used if the main model is busy"
            >
              {(id, describedBy) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  pill
                  value={form.fallback}
                  onChange={(e) => set('fallback', e.target.value)}
                  className="border-border text-13"
                  options={[
                    { value: 'none', label: 'No fallback' },
                    ...models.map((m) => ({ value: m.id, label: m.name })),
                  ]}
                />
              )}
            </Field>
          </div>
        </Card>

        <Card padding="none" className="flex flex-col">
          <h2 className="px-5 pt-5 pb-2 text-h4 font-semibold">Memory and limits</h2>
          <SettingsRow
            title="Remember past conversations"
            description="Keeps 2,140 facts about returning customers · 90-day limit"
          >
            <Button
              variant="secondary"
              size="xs"
              className="h-[30px] px-3"
              disabled={!form.memory}
              onClick={() =>
                toast({ tone: 'neutral', title: 'Memory cleared', description: '2,140 facts removed.' })
              }
            >
              Clear memory
            </Button>
            <Switch
              aria-label="Remember past conversations"
              checked={form.memory}
              onChange={(e) => set('memory', e.target.checked)}
            />
          </SettingsRow>
          <SettingsRow
            title="Monthly spend cap"
            description="Pauses the agent and alerts Maya Chen when reached · $142 used this month"
          >
            <div className="relative w-[140px]">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-13 text-fg-3">
                $
              </span>
              <Input
                aria-label="Monthly spend cap in dollars"
                inputMode="decimal"
                value={form.cap}
                onChange={(e) => set('cap', e.target.value.replace(/[^\d.]/g, ''))}
                className="pl-7 font-mono text-13"
              />
            </div>
          </SettingsRow>
        </Card>

        <Card padding="none" className="flex flex-col border-danger-border">
          <h2 className="px-5 pt-5 pb-2 text-h4 font-semibold text-danger-text">Danger zone</h2>
          <SettingsRow title="Archive agent" description="Stops new runs. You can restore it any time.">
            <Button variant="secondary" size="sm" onClick={() => navigate(`${SUPPORT_AGENT_PATH}/archive`)}>
              Archive
            </Button>
          </SettingsRow>
          <SettingsRow
            title="Delete agent"
            description="Removes the agent, its versions and run history. This can’t be undone."
          >
            <Button
              variant="secondary"
              size="sm"
              className="border-danger-border bg-danger-subtle text-danger-text hover:bg-danger-subtle hover:brightness-95"
              onClick={() => navigate(`${SUPPORT_AGENT_PATH}/archive`)}
            >
              Delete…
            </Button>
          </SettingsRow>
        </Card>

        {changed.length > 0 && (
          <div
            role="status"
            className="sticky bottom-6 z-20 flex flex-wrap items-center gap-3 rounded-[18px] bg-inverse py-2.5 pr-2.5 pl-4 text-on-inverse shadow-[0_12px_32px_rgb(13_16_24/0.24)]"
          >
            <span className="size-2 rounded-full bg-warn" aria-hidden />
            <span className="min-w-48 flex-1 text-body-m">
              <b className="font-semibold">
                {changed.length} unsaved {changed.length === 1 ? 'change' : 'changes'}
              </b>{' '}
              · {changed.map((k) => fieldLabels[k]).join(', ')}
            </span>
            <button
              type="button"
              onClick={() => setForm(base)}
              className="h-[34px] rounded-full px-3.5 text-13 font-medium text-on-inverse transition-opacity hover:opacity-80"
            >
              Discard
            </button>
            <Button size="sm" className="h-[34px] px-3.5" onClick={save}>
              Save changes
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

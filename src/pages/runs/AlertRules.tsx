import { useId, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import {
  Badge,
  Button,
  Field,
  Select,
  Switch,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
} from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { RunsTabs } from './components/RunsTabs';
import { Section } from './components/Section';
import {
  alertMetrics,
  alertRules,
  alertScopes,
  alertWindows,
  type AlertChannel,
  type AlertRule,
} from './data';

const channels: AlertChannel[] = ['In-app', 'Email', 'Chat app', 'Webhook'];

interface Draft {
  metric: string;
  threshold: string;
  window: string;
  scope: string;
  channels: AlertChannel[];
  quietHours: boolean;
}

const emptyDraft: Draft = {
  metric: 'spend_per_day',
  threshold: '60.00',
  window: '1 day',
  scope: 'Sales Researcher',
  channels: ['In-app', 'Email'],
  quietHours: true,
};

/** W6-08 · Alert rules */
export default function AlertRules() {
  const toast = useToast();
  const [rules, setRules] = useState<AlertRule[]>(alertRules);
  const [suggestion, setSuggestion] = useState(true);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [thresholdError, setThresholdError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const metricRef = useRef<HTMLSelectElement>(null);
  const thresholdId = useId();

  const update = (id: string, patch: Partial<AlertRule>) =>
    setRules((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const raiseThreshold = () => {
    update('approvals-waiting', {
      condition: 'pending_approval_age > 2 h',
      status: 'active',
      lastTriggered: '6 times today',
    });
    setSuggestion(false);
    toast({ title: 'Threshold raised to 2 h', description: '“Approvals waiting” now fires after 2 hours.' });
  };

  const metric = alertMetrics.find((m) => m.value === draft.metric)!;

  const createRule = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(draft.threshold);
    if (!draft.threshold.trim() || Number.isNaN(value) || value <= 0) {
      setThresholdError(true);
      return;
    }
    const unit =
      metric.unit === '$'
        ? `$${value}`
        : metric.unit === '#'
          ? `${value}`
          : `${value}${metric.unit === '%' ? '%' : ' s'}`;
    const rule: AlertRule = {
      id: `rule-${rules.length + 1}`,
      name: `${metric.label} · ${draft.scope}`,
      condition: `${draft.metric} > ${unit} · ${draft.window}`,
      scope: draft.scope,
      channels: draft.channels.length ? draft.channels : ['In-app'],
      status: 'active',
      lastTriggered: 'Never',
      enabled: true,
    };
    setRules((list) => [...list, rule]);
    setDraft(emptyDraft);
    toast({ title: 'Alert rule created', description: `${rule.name} is active.` });
  };

  const toggleChannel = (c: AlertChannel) =>
    setDraft((d) => ({
      ...d,
      channels: d.channels.includes(c) ? d.channels.filter((x) => x !== c) : [...d.channels, c],
    }));

  return (
    <AppShell active="Runs" role="admin" crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'Alerts' }]}>
      <PageHeader
        title="Alerts"
        description="Get told when something goes wrong, before customers notice."
        actions={
          <Button
            size="sm"
            leftIcon="plus"
            className="h-[34px] px-3.5"
            onClick={() => {
              formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              metricRef.current?.focus({ preventScroll: true });
            }}
          >
            New alert rule
          </Button>
        }
      />
      <RunsTabs />

      {suggestion && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-2.5 rounded-[10px] bg-warn-subtle px-3.5 py-2.5 text-13 text-warn-text"
        >
          <Icon name="alert-triangle" size={16} strokeWidth={2} className="shrink-0" />
          <p className="min-w-0 flex-1 basis-64">
            <b className="font-semibold">“Approvals waiting” fired 40 times today.</b> Raise the threshold to
            2 h? That would have fired 6 times.
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="h-[30px]" onClick={() => setSuggestion(false)}>
              Keep as is
            </Button>
            <Button variant="secondary" size="sm" className="h-[30px]" onClick={raiseThreshold}>
              Raise to 2 h
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <TableContainer>
          <Table className="min-w-[980px] text-13">
            <THead className="border-b border-border bg-sunken font-medium">
              <tr>
                <TH className="w-[17%] first:pl-4">Rule</TH>
                <TH className="w-[20%]">Condition</TH>
                <TH className="w-[15%]">Scope</TH>
                <TH>Send to</TH>
                <TH className="w-[138px]">Status</TH>
                <TH className="w-[122px]">Last triggered</TH>
                <TH className="w-14 last:pr-4">
                  <span className="sr-only">On</span>
                </TH>
              </tr>
            </THead>
            <TBody>
              {rules.map((rule) => (
                <TR
                  key={rule.id}
                  className={cn(
                    '[&>td]:h-[47px]',
                    rule.status === 'noisy' && rule.enabled && 'bg-warn-subtle',
                  )}
                >
                  <TD className="font-semibold text-fg first:pl-4">{rule.name}</TD>
                  <TD className="font-mono text-body-s text-fg-2">{rule.condition}</TD>
                  <TD className="text-fg-2">{rule.scope}</TD>
                  <TD>
                    <div className="flex flex-wrap items-center gap-1">
                      {rule.channels.map((c) => (
                        <span
                          key={c}
                          className="inline-flex h-[22px] items-center rounded-[5px] bg-subtle px-[7px] text-body-s text-fg-2"
                        >
                          {c}
                        </span>
                      ))}
                      {rule.disconnected && (
                        <Link
                          to="/integrations/webhooks"
                          className="inline-flex items-center gap-1 text-body-s text-warn-text hover:underline"
                        >
                          <Icon name="alert-triangle" size={12} strokeWidth={2.2} />
                          Disconnected
                        </Link>
                      )}
                    </div>
                  </TD>
                  <TD>
                    <RuleStatus rule={rule} />
                  </TD>
                  <TD className="text-fg-2">{rule.lastTriggered}</TD>
                  <TD className="last:pr-4">
                    <Switch
                      aria-label={`${rule.name} ${rule.enabled ? 'on' : 'off'}`}
                      checked={rule.enabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        update(rule.id, {
                          enabled,
                          status: enabled && rule.status === 'muted' ? 'active' : rule.status,
                        });
                        toast({
                          title: `${rule.name} ${enabled ? 'turned on' : 'turned off'}`,
                          tone: 'neutral',
                        });
                      }}
                    />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      <form ref={formRef} onSubmit={createRule} aria-labelledby="new-rule-title" className="scroll-mt-24">
        <Section
          title={<span id="new-rule-title">New alert rule</span>}
          aside={<span className="text-body-s text-fg-3">Draft</span>}
          className="gap-3.5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Field label={<FieldLabel>Metric</FieldLabel>}>
              {(id) => (
                <Select
                  id={id}
                  ref={metricRef}
                  value={draft.metric}
                  options={alertMetrics.map((m) => ({ value: m.value, label: m.label }))}
                  onChange={(e) => setDraft({ ...draft, metric: e.target.value })}
                  className="text-13"
                />
              )}
            </Field>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={thresholdId} className="text-body-s leading-5 font-semibold text-fg-2">
                Is above
              </label>
              <div
                className={cn(
                  'flex h-9 items-center gap-0.5 rounded-md border bg-surface px-2.5 text-13 transition-[border-color,box-shadow] focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
                  thresholdError ? 'border-danger' : 'border-border-strong',
                )}
              >
                {metric.unit === '$' && <span className="text-fg">$</span>}
                <input
                  id={thresholdId}
                  inputMode="decimal"
                  value={draft.threshold}
                  aria-invalid={thresholdError || undefined}
                  aria-describedby={thresholdError ? `${thresholdId}-error` : undefined}
                  onChange={(e) => {
                    setDraft({ ...draft, threshold: e.target.value });
                    setThresholdError(false);
                  }}
                  className="min-w-0 flex-1 bg-transparent pl-1 font-medium text-fg outline-none"
                />
                {metric.unit !== '$' && metric.unit !== '#' && (
                  <span className="text-fg-3">{metric.unit}</span>
                )}
              </div>
              {thresholdError && (
                <p id={`${thresholdId}-error`} className="text-body-s text-danger-text">
                  Enter a number above 0.
                </p>
              )}
            </div>
            <Field label={<FieldLabel>Over</FieldLabel>}>
              {(id) => (
                <Select
                  id={id}
                  value={draft.window}
                  options={alertWindows.map((w) => ({ value: w, label: w }))}
                  onChange={(e) => setDraft({ ...draft, window: e.target.value })}
                  className="text-13"
                />
              )}
            </Field>
            <Field label={<FieldLabel>Scope</FieldLabel>}>
              {(id) => (
                <Select
                  id={id}
                  value={draft.scope}
                  options={alertScopes.map((s) => ({ value: s, label: s }))}
                  onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
                  className="text-13"
                />
              )}
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span id="send-to" className="text-body-s font-semibold text-fg-2">
              Send to
            </span>
            <div role="group" aria-labelledby="send-to" className="flex flex-wrap gap-2">
              {channels.map((c) => {
                const on = draft.channels.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleChannel(c)}
                    className={cn(
                      'inline-flex h-[30px] items-center rounded-full border px-3 text-13 font-medium transition-colors',
                      on
                        ? 'border-brand-border bg-brand-subtle text-brand-text'
                        : 'border-border bg-surface text-fg-2 hover:bg-subtle',
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <span className="flex-1" />
            <Switch
              checked={draft.quietHours}
              onChange={(e) => setDraft({ ...draft, quietHours: e.target.checked })}
              label={<span className="text-13 font-normal text-fg-2">Mute 22:00–07:00</span>}
              className="items-center gap-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-s text-fg-3">Based on the last 30 days, this would have fired 3 times.</p>
            <span className="flex-1" />
            <Button
              variant="secondary"
              size="sm"
              className="h-[34px] px-3.5"
              onClick={() => {
                setDraft(emptyDraft);
                setThresholdError(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-[34px] px-3.5">
              Create rule
            </Button>
          </div>
        </Section>
      </form>
    </AppShell>
  );
}

function RuleStatus({ rule }: { rule: AlertRule }) {
  if (!rule.enabled && rule.status !== 'muted')
    return (
      <Badge tone="neutral" icon="pause" bordered={false} className="h-[22px] border-transparent">
        Off
      </Badge>
    );
  if (rule.status === 'muted')
    return (
      <Badge tone="neutral" icon="pause" bordered={false} className="h-[22px] border-transparent">
        Muted · {rule.mutedUntil}
      </Badge>
    );
  if (rule.status === 'noisy')
    return (
      <Badge tone="warn" icon="alert-triangle" bordered={false} className="h-[22px] border-transparent">
        Noisy
      </Badge>
    );
  return (
    <Badge tone="ok" dot bordered={false} className="h-[22px] border-transparent">
      Active
    </Badge>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <span className="text-body-s font-semibold text-fg-2">{children}</span>;
}

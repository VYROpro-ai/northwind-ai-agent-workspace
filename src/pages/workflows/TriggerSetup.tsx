import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, Dropdown, IconButton, Input, Select, useToast } from '@/components/ui';
import {
  ConfigPanel,
  PanelField,
  PanelHeader,
  PanelLabel,
  TextAction,
  panelSelectClass,
} from './components/ConfigPanel';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowEditorLayout } from './components/WorkflowEditorLayout';
import { nodeTints, triggerTypes } from './data';

const apps = [
  { id: 'helpbase', name: 'Helpbase', letter: 'H', tone: 'bg-ok', connected: true },
  { id: 'shopdesk', name: 'Shopdesk', letter: 'S', tone: 'bg-brand', connected: true },
  { id: 'pipeline', name: 'Pipeline CRM', letter: 'P', tone: 'bg-ai', connected: false },
];

interface Filter {
  id: number;
  field: string;
  op: string;
  value: string;
}

const filterOps = [
  { value: 'is', label: 'is' },
  { value: 'any', label: 'is any of' },
  { value: 'not', label: 'is not' },
  { value: 'contains', label: 'contains' },
];

/** W5-06 · Trigger setup */
export default function TriggerSetup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [type, setType] = useState('app');
  const [appId, setAppId] = useState('helpbase');
  const [filters, setFilters] = useState<Filter[]>([
    { id: 1, field: 'inbox', op: 'is', value: 'Support' },
    { id: 2, field: 'language', op: 'any', value: 'EN, ES' },
  ]);
  const [sampleAt, setSampleAt] = useState('9:41 AM');
  const app = apps.find((a) => a.id === appId) ?? apps[0];

  const patch = (id: number, p: Partial<Filter>) =>
    setFilters((list) => list.map((f) => (f.id === id ? { ...f, ...p } : f)));

  return (
    <WorkflowEditorLayout
      panel={
        <ConfigPanel
          label="Trigger settings"
          header={
            <PanelHeader kind="Trigger" title="New support ticket" icon="zap" tint={nodeTints.trigger} />
          }
          footer={
            <>
              <span className="flex-1" />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSampleAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
                  toast({ title: 'Test event sent', description: 'Helpbase delivered a sample ticket.' });
                }}
              >
                Send test event
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast({ title: 'Trigger saved', description: 'New support ticket' });
                  navigate('/workflows/editor');
                }}
              >
                Done
              </Button>
            </>
          }
        >
          <section className="flex flex-col gap-2">
            <PanelLabel>What starts this workflow?</PanelLabel>
            <div role="radiogroup" aria-label="Trigger type" className="grid grid-cols-3 gap-2">
              {triggerTypes.map((t) => {
                const on = t.id === type;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setType(t.id)}
                    className={cn(
                      'flex flex-col items-start gap-1.5 rounded-[10px] p-2.5 text-left transition-colors',
                      on
                        ? 'border-[1.5px] border-brand bg-brand-subtle text-brand-text'
                        : 'border border-border bg-surface text-fg-2 hover:border-border-strong',
                    )}
                  >
                    <Icon name={t.icon} size={16} strokeWidth={1.9} />
                    <span className={cn('text-body-s font-semibold', on ? 'text-brand-text' : 'text-fg')}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-1.5">
            <PanelLabel>App</PanelLabel>
            {/* The dropdown root is inline; stretch it so the trigger fills the row. */}
            <div className="[&>div]:flex [&>div]:w-full">
              <Dropdown
                width={280}
                items={apps.map((a) => ({
                  label: a.name,
                  description: a.connected ? 'Connected' : 'Not connected',
                  onSelect: () => setAppId(a.id),
                }))}
                trigger={(props) => (
                  <button
                    type="button"
                    {...props}
                    className="flex h-9 w-full min-w-0 items-center gap-2 rounded-full border border-border bg-surface px-2.5 text-13 text-fg hover:border-border-strong"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] text-[10px] font-semibold text-white',
                        app.tone,
                      )}
                    >
                      {app.letter}
                    </span>
                    {app.name}
                    <span
                      className={cn(
                        'ml-1 inline-flex items-center gap-1 text-body-s',
                        app.connected ? 'text-ok-text' : 'text-warn-text',
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" aria-hidden />
                      {app.connected ? 'Connected' : 'Not connected'}
                    </span>
                    <span className="flex-1" />
                    <Icon name="chevron-down" size={14} strokeWidth={2} className="text-fg-3" />
                  </button>
                )}
              />
            </div>
          </section>

          <PanelField label="Event">
            {(id) => (
              <Select
                className={panelSelectClass}
                id={id}
                pill
                defaultValue="created"
                options={[
                  { value: 'created', label: 'New ticket created' },
                  { value: 'updated', label: 'Ticket updated' },
                  { value: 'tagged', label: 'Ticket tagged' },
                  { value: 'reopened', label: 'Ticket reopened' },
                ]}
              />
            )}
          </PanelField>

          <section className="flex flex-col gap-2">
            <PanelLabel>Only when</PanelLabel>
            {filters.map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)_20px] items-center gap-1.5"
              >
                <Input
                  pill
                  aria-label="Field"
                  placeholder="field"
                  value={f.field}
                  onChange={(e) => patch(f.id, { field: e.target.value })}
                  className="px-2.5 font-mono text-body-s"
                />
                <Select
                  pill
                  aria-label="Operator"
                  value={f.op}
                  onChange={(e) => patch(f.id, { op: e.target.value })}
                  options={filterOps}
                  className="pr-7 pl-2.5 text-13"
                />
                <Input
                  pill
                  aria-label="Value"
                  placeholder="value"
                  value={f.value}
                  onChange={(e) => patch(f.id, { value: e.target.value })}
                  className="px-2.5 text-13"
                />
                <IconButton
                  icon="close"
                  label="Remove filter"
                  variant="ghost"
                  size="xs"
                  className="size-5 text-fg-3"
                  onClick={() => setFilters((list) => list.filter((x) => x.id !== f.id))}
                />
              </div>
            ))}
            <TextAction
              onClick={() =>
                setFilters((list) => [...list, { id: Date.now(), field: '', op: 'is', value: '' }])
              }
            >
              + Add filter
            </TextAction>
          </section>

          <div
            role="status"
            className="flex flex-col gap-2 rounded-[10px] border border-ok-border bg-ok-subtle p-3"
          >
            <p className="flex items-center gap-2 text-13 font-semibold text-ok-text">
              <Icon name="check-sm" size={14} strokeWidth={2.4} />
              Sample event received · {sampleAt}
            </p>
            <p className="font-mono text-caption leading-[17px] text-fg-2">
              ticket.id: 9874 · subject: “Charged twice for order 48213” · inbox: Support
            </p>
          </div>
        </ConfigPanel>
      }
    >
      <WorkflowCanvas mode="edit" selected="trigger" />
    </WorkflowEditorLayout>
  );
}

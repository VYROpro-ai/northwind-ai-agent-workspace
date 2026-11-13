import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Avatar, Button, Dropdown, Select, Switch, Tabs, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { people } from '@/data/people';
import {
  ConfigPanel,
  PanelField,
  PanelHeader,
  PanelLabel,
  PanelSection,
  panelSelectClass,
  panelTabsClass,
} from './components/ConfigPanel';
import { MonoBlock, VarToken } from './components/PanelBits';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowEditorLayout } from './components/WorkflowEditorLayout';
import { nodeTints } from './data';

type Tab = 'settings' | 'inputs' | 'output' | 'errors';

const tabs: { value: Tab; label: string }[] = [
  { value: 'settings', label: 'Settings' },
  { value: 'inputs', label: 'Inputs' },
  { value: 'output', label: 'Output preview' },
  { value: 'errors', label: 'Error handling' },
];

interface Approver {
  id: string;
  name: string;
  avatar?: string;
  team?: boolean;
}

const initialApprovers: Approver[] = [
  { id: 'leo', name: people.leo.name, avatar: people.leo.avatar },
  { id: 'support-leads', name: 'Support leads', team: true },
];

const candidates: Approver[] = [
  { id: 'maya', name: people.maya.name, avatar: people.maya.avatar },
  { id: 'daniel', name: people.daniel.name, avatar: people.daniel.avatar },
  { id: 'priya', name: people.priya.name, avatar: people.priya.avatar },
];

/** W5-04 · Node config panel — approval step settings. */
export default function NodeConfig() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('settings');

  return (
    <WorkflowEditorLayout
      panel={
        <ConfigPanel
          label="Step settings"
          header={
            <PanelHeader
              kind="Approval"
              title="Support lead approves"
              icon="wf-approval"
              tint={nodeTints.approval}
            />
          }
          tabs={
            <Tabs
              items={tabs}
              value={tab}
              onChange={setTab}
              label="Step settings"
              className={panelTabsClass}
            />
          }
          footer={
            <>
              <p className="flex-1 text-body-s text-danger-text">1 field needs attention</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/workflows/editor/test')}>
                Test this step
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast({ title: 'Step saved', description: 'Support lead approves' });
                  navigate('/workflows/editor');
                }}
              >
                Done
              </Button>
            </>
          }
        >
          {tab === 'settings' && <SettingsTab />}
          {tab === 'inputs' && (
            <PanelSection label="Available from earlier steps">
              <MonoBlock>
                ticket.customer · ticket.subject · ticket.inbox
                <br />
                classify.summary · classify.priority · classify.confidence
              </MonoBlock>
            </PanelSection>
          )}
          {tab === 'output' && (
            <PanelSection label="Output preview">
              <MonoBlock>
                approval.decision: “approved”
                <br />
                approval.decider: “Leo Martins”
                <br />
                approval.edited_reply: true
              </MonoBlock>
            </PanelSection>
          )}
          {tab === 'errors' && (
            <PanelSection label="If this step fails">
              <Select
                className={panelSelectClass}
                pill
                aria-label="If this step fails"
                defaultValue="retry"
                options={[
                  { value: 'retry', label: 'Retry 3 times, then stop the run' },
                  { value: 'skip', label: 'Skip and continue' },
                  { value: 'stop', label: 'Stop the run' },
                ]}
              />
            </PanelSection>
          )}
        </ConfigPanel>
      }
    >
      <WorkflowCanvas mode="edit" selected="approval" />
    </WorkflowEditorLayout>
  );
}

function SettingsTab() {
  const [approvers, setApprovers] = useState(initialApprovers);
  const available = candidates.filter((c) => !approvers.some((a) => a.id === c.id));

  return (
    <>
      <section className="flex flex-col gap-1.5">
        <PanelLabel>Approvers</PanelLabel>
        <div className="flex min-h-9 flex-wrap items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-13">
          {approvers.map((a) => (
            <span
              key={a.id}
              className="inline-flex h-6 items-center gap-1.5 rounded-full bg-subtle py-0 pr-1 pl-[3px] text-body-s font-medium text-fg"
            >
              {a.team ? (
                <span className="inline-flex size-[18px] items-center justify-center rounded-[5px] bg-brand text-[8px] font-semibold text-white">
                  ST
                </span>
              ) : (
                <Avatar name={a.name} src={a.avatar} size="xs" className="[&>img]:size-[18px]" />
              )}
              {a.name}
              <button
                type="button"
                aria-label={`Remove ${a.name}`}
                onClick={() => setApprovers((list) => list.filter((x) => x.id !== a.id))}
                className="inline-flex size-4 items-center justify-center rounded-full text-fg-3 hover:bg-border hover:text-fg"
              >
                <Icon name="close" size={10} strokeWidth={2.5} />
              </button>
            </span>
          ))}
          <Dropdown
            width={200}
            items={
              available.length
                ? available.map((c) => ({
                    label: c.name,
                    onSelect: () => setApprovers((list) => [...list, c]),
                  }))
                : [{ label: 'Everyone is added', disabled: true }]
            }
            trigger={(props) => (
              <button type="button" {...props} className="text-13 text-fg-3 hover:text-fg">
                Add
              </button>
            )}
          />
        </div>
        <p className="text-body-s text-fg-3">Any one approver can decide</p>
      </section>

      <section className="flex flex-col gap-1.5">
        <PanelLabel>Message to approver</PanelLabel>
        <div
          role="textbox"
          aria-readonly="true"
          aria-label="Message to approver"
          aria-invalid="true"
          className="rounded-md border border-border-strong px-3 py-2.5 text-13 leading-6 text-fg"
        >
          Urgent ticket from <VarToken name="ticket.customer" />: <VarToken name="ticket.subject" />. Agent
          summary: <VarToken name="classify.summary" />. Priority <VarToken name="ticket.priority" missing />
        </div>
        <p className="text-body-s text-danger-text">
          ticket.priority was removed from the trigger. Pick another field.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PanelField label="Timeout">
          {(id) => (
            <Select
              className={panelSelectClass}
              id={id}
              pill
              defaultValue="2h"
              options={[
                { value: '30m', label: '30 minutes' },
                { value: '1h', label: '1 hour' },
                { value: '2h', label: '2 hours' },
                { value: '24h', label: '24 hours' },
              ]}
            />
          )}
        </PanelField>
        <PanelField label="If nobody answers">
          {(id) => (
            <Select
              className={panelSelectClass}
              id={id}
              pill
              defaultValue="escalate"
              options={[
                { value: 'escalate', label: 'Escalate to Maya Chen' },
                { value: 'reject', label: 'Reject automatically' },
                { value: 'approve', label: 'Approve automatically' },
              ]}
            />
          )}
        </PanelField>
      </div>

      <fieldset className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-sunken p-3">
        <legend className="float-left mb-0.5 text-13 font-semibold text-fg">Approver can</legend>
        <ToggleRow label="Edit the reply before approving" />
        <ToggleRow label="Reject with a reason" />
      </fieldset>
    </>
  );
}

function ToggleRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-13 text-fg">
      <span className="flex-1">{label}</span>
      <Switch defaultChecked aria-label={label} />
    </div>
  );
}

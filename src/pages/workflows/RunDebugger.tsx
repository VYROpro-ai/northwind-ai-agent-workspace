import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Button, Tabs, useToast } from '@/components/ui';
import { ConfigPanel, PanelHeader, PanelSection, StatTiles, panelTabsClass } from './components/ConfigPanel';
import { CodePanel, MonoBlock } from './components/PanelBits';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowEditorLayout } from './components/WorkflowEditorLayout';
import { debugStack, nodeTints } from './data';

type Tab = 'error' | 'input' | 'output' | 'logs';

const tabs: { value: Tab; label: string }[] = [
  { value: 'error', label: 'Error' },
  { value: 'input', label: 'Input' },
  { value: 'output', label: 'Output' },
  { value: 'logs', label: 'Logs' },
];

const logs = `9:42:12.804  tickets.reply  POST /tickets/9874/replies
9:42:12.931  ← 422 body is required
9:42:13.012  retry #1 → 422
9:42:13.540  retry #2 → 422
9:42:14.118  retry #3 (backoff 8 s) → 422
9:42:14.121  step failed · Log to CRM skipped`;

/** W5-08 · Run debugger on canvas */
export default function RunDebugger() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('error');

  const inputBlock = (
    <MonoBlock>
      ticket_id: 9874
      <br />
      body: <span className="text-danger-text">""</span>
      <br />
      attachments: [3 items]
      <br />
      <span className="text-fg-3">… 212 more lines</span>
    </MonoBlock>
  );
  const download = (
    <button
      type="button"
      onClick={() => toast({ title: 'Download started', description: 'run_4821-step5-input.json · 84 KB' })}
      className="text-body-s font-medium text-link hover:underline"
    >
      Download full input (84 KB)
    </button>
  );

  return (
    <WorkflowEditorLayout
      title="Run #4821 · Ticket triage & reply"
      topbar={{ status: 'Active', version: 'Run #4821', note: 'Oct 26, 9:42 AM · read-only' }}
      panel={
        <ConfigPanel
          label="Step details"
          header={
            <PanelHeader
              kind="Tool · step 5"
              title="Reply to customer"
              icon="wf-tool"
              tint={nodeTints.tool}
              aside={
                <Badge
                  tone="danger"
                  bordered={false}
                  size="sm"
                  className="h-[22px] border-transparent px-2 font-semibold"
                >
                  Failed · 1.4 s
                </Badge>
              }
            />
          }
          tabs={
            <Tabs
              items={tabs}
              value={tab}
              onChange={setTab}
              label="Step details"
              className={panelTabsClass}
            />
          }
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => navigate('/workflows/editor')}>
                Edit node
              </Button>
              <span className="flex-1" />
              <Button
                size="sm"
                onClick={() =>
                  toast({
                    title: 'Rerun started',
                    description: 'run_4822 resumes from Reply to customer.',
                    tone: 'info',
                  })
                }
              >
                Rerun from this step
              </Button>
            </>
          }
        >
          {tab === 'error' && (
            <>
              <div
                role="alert"
                className="flex flex-col gap-2 rounded-[10px] border border-danger-border bg-danger-subtle p-3"
              >
                <h3 className="text-13 font-semibold text-danger-text">Helpbase rejected the reply</h3>
                <p className="text-body-s leading-[17px] text-fg-2">
                  The message body was empty. In v3, this step read{' '}
                  <code className="font-mono">classify.draft</code>, which no longer exists.
                </p>
              </div>
              <CodePanel label="Error stack">{debugStack}</CodePanel>
              <PanelSection label="Input" aside={download}>
                {inputBlock}
              </PanelSection>
              <StatTiles
                items={[
                  { label: 'Retries', value: '3 of 3' },
                  { label: 'Tokens', value: '0' },
                  { label: 'Cost', value: '$0.00' },
                ]}
              />
            </>
          )}
          {tab === 'input' && (
            <PanelSection label="Input" aside={download}>
              {inputBlock}
            </PanelSection>
          )}
          {tab === 'output' && (
            <PanelSection label="Output">
              <MonoBlock className="text-fg-3">
                No output — the step failed before Helpbase accepted the reply.
              </MonoBlock>
            </PanelSection>
          )}
          {tab === 'logs' && <CodePanel label="Step logs">{logs}</CodePanel>}
        </ConfigPanel>
      }
    >
      <WorkflowCanvas mode="debug" selected="reply" />
    </WorkflowEditorLayout>
  );
}

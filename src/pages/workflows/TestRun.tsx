import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Button, Switch, Textarea, useToast, type Tone } from '@/components/ui';
import { Icon } from '@/components/icons';
import { ConfigPanel, PanelHeader, PanelSection, StatTiles } from './components/ConfigPanel';
import { CodePanel, MonoBlock, PanelSegmented } from './components/PanelBits';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowEditorLayout } from './components/WorkflowEditorLayout';
import { modeStates, testSampleJson, type NodeStateMap } from './data';

type Sample = 'last' | 'saved' | 'custom';
type Phase = 'waiting' | 'passed' | 'rejected';

const phaseStates: Record<Phase, NodeStateMap> = {
  waiting: modeStates.test ?? {},
  passed: {
    ...modeStates.test,
    approval: { state: 'ok', label: '6 s' },
    reply: { state: 'ok', label: '0.4 s' },
    log: { state: 'ok', label: '0.3 s' },
  },
  rejected: {
    ...modeStates.test,
    approval: { state: 'fail', label: 'Rejected' },
    reply: { state: 'skip', label: 'Skipped' },
    log: { state: 'skip', label: 'Skipped' },
  },
};

const phaseBadge: Record<Phase, { tone: Tone; label: string }> = {
  waiting: { tone: 'ai', label: 'Running · step 4 of 6' },
  passed: { tone: 'ok', label: 'Passed · 6 of 6' },
  rejected: { tone: 'danger', label: 'Stopped · step 4' },
};

/** W5-07 · Test run */
export default function TestRun() {
  const navigate = useNavigate();
  const toast = useToast();
  const [sample, setSample] = useState<Sample>('last');
  const [safeMode, setSafeMode] = useState(true);
  const [phase, setPhase] = useState<Phase>('waiting');
  const badge = phaseBadge[phase];

  const approve = () => {
    setPhase('passed');
    toast({ title: 'Test passed', description: 'All 6 steps ran. Nothing reached the customer.' });
  };

  return (
    <WorkflowEditorLayout
      title="Test run · Ticket triage & reply"
      topbar={{ testing: true, note: phase === 'waiting' ? 'Test run in progress' : 'Test run finished' }}
      panel={
        <ConfigPanel
          label="Test run"
          header={
            <PanelHeader
              title="Test run"
              closeTo={null}
              aside={
                <Badge tone={badge.tone} dot bordered={false} className="border-transparent font-semibold">
                  {badge.label}
                </Badge>
              }
            />
          }
          footer={
            <>
              <p className="flex-1 text-body-s text-fg-3">Started 9:42:06 AM</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  toast({ title: 'Test stopped', tone: 'neutral' });
                  navigate('/workflows/editor');
                }}
              >
                {phase === 'waiting' ? 'Stop test' : 'Close'}
              </Button>
            </>
          }
        >
          <PanelSection label="Sample input">
            <PanelSegmented
              label="Sample input"
              value={sample}
              onChange={setSample}
              options={[
                { value: 'last', label: 'Last real event' },
                { value: 'saved', label: 'Saved sample' },
                { value: 'custom', label: 'Custom JSON' },
              ]}
            />
            {sample === 'custom' ? (
              <Textarea
                aria-label="Custom JSON"
                rows={8}
                defaultValue={testSampleJson}
                spellCheck={false}
                className="font-mono text-caption leading-[18px]"
              />
            ) : (
              <CodePanel label="Sample input JSON">{testSampleJson}</CodePanel>
            )}
          </PanelSection>

          <div className="flex items-center gap-2.5 rounded-[10px] border border-ok-border bg-ok-subtle px-3 py-2.5">
            <Icon name="shield" size={16} strokeWidth={2} className="shrink-0 text-ok-text" />
            <div className="flex-1">
              <p className="text-13 font-semibold text-ok-text">Safe mode {safeMode ? 'on' : 'off'}</p>
              <p className="text-body-s text-fg-2">
                {safeMode
                  ? 'Replies and CRM notes are faked. Nothing reaches the customer.'
                  : 'Replies and CRM notes are sent for real.'}
              </p>
            </div>
            <Switch
              checked={safeMode}
              onChange={(e) => setSafeMode(e.target.checked)}
              aria-label="Safe mode"
            />
          </div>

          {phase === 'waiting' && (
            <section
              aria-label="Approval needed"
              className="flex flex-col gap-2.5 rounded-[10px] border-[1.5px] border-ai bg-ai-subtle p-3"
            >
              <h3 className="text-13 font-semibold text-ai-text">Support lead approves · waiting for you</h3>
              <p className="text-body-s leading-[17px] text-fg-2">
                In a test, you answer approvals yourself. Leo won’t be notified.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={approve}>
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPhase('rejected');
                    toast({
                      title: 'Approval rejected',
                      description: 'The test stopped at step 4.',
                      tone: 'warn',
                    });
                  }}
                >
                  Reject
                </Button>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={approve}
                  className="text-body-s font-medium text-link hover:underline"
                >
                  Auto-approve all
                </button>
              </div>
            </section>
          )}

          <StatTiles
            items={[
              { label: 'Duration', value: phase === 'passed' ? '9.1 s' : '2.4 s' },
              { label: 'Tokens', value: '1,120' },
              { label: 'Cost', value: '$0.011' },
            ]}
          />

          <PanelSection label="Output so far · Classify ticket">
            <MonoBlock>
              priority: “urgent” · confidence: 0.91
              <br />
              summary: “Customer charged twice, wants refund”
            </MonoBlock>
          </PanelSection>
        </ConfigPanel>
      }
    >
      <WorkflowCanvas mode="test" states={phaseStates[phase]} />
    </WorkflowEditorLayout>
  );
}

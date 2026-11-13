import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import { Button, IconButton, Input, Select, Tabs, Textarea, useToast } from '@/components/ui';
import {
  ConfigPanel,
  PanelHeader,
  PanelSection,
  TextAction,
  panelSelectClass,
  panelTabsClass,
} from './components/ConfigPanel';
import { InfoNote, PanelSegmented } from './components/PanelBits';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowEditorLayout } from './components/WorkflowEditorLayout';
import { nodeTints } from './data';

interface Rule {
  id: number;
  field: string;
  op: string;
  value: string;
}

/** A branch is a list of OR-ed entries; an entry is a single rule or an AND-ed group. */
type Entry = Rule | Rule[];

const operators = [
  { value: 'equals', label: 'equals' },
  { value: 'not', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'empty', label: 'is empty' },
];

let nextId = 10;
const rule = (field = '', value = '', op = 'equals'): Rule => ({ id: nextId++, field, op, value });

const initialEntries: Entry[] = [
  { id: 1, field: 'classify.priority', op: 'equals', value: 'urgent' },
  [
    { id: 2, field: 'classify.sentiment', op: 'equals', value: 'angry' },
    { id: 3, field: 'customer.plan', op: 'equals', value: 'Enterprise' },
  ],
];

/** W5-05 · Condition / branch config */
export default function Condition() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<'rules' | 'errors'>('rules');

  return (
    <WorkflowEditorLayout
      panel={
        <ConfigPanel
          label="Condition settings"
          header={<PanelHeader kind="Condition" title="If urgent" icon="branch" tint={nodeTints.cond} />}
          tabs={
            <Tabs
              items={[
                { value: 'rules', label: 'Rules' },
                { value: 'errors', label: 'Error handling' },
              ]}
              value={tab}
              onChange={setTab}
              label="Condition settings"
              className={panelTabsClass}
            />
          }
          footer={
            <>
              <p className="flex-1 text-body-s text-fg-3">Last 50 tickets: 9 Yes · 41 No</p>
              <Button
                size="sm"
                onClick={() => {
                  toast({ title: 'Condition saved', description: 'If urgent' });
                  navigate('/workflows/editor');
                }}
              >
                Done
              </Button>
            </>
          }
        >
          {tab === 'rules' ? (
            <RulesTab />
          ) : (
            <PanelSection label="If a field is missing">
              <Select
                className={panelSelectClass}
                pill
                aria-label="If a field is missing"
                defaultValue="else"
                options={[
                  { value: 'else', label: 'Take the No branch' },
                  { value: 'stop', label: 'Stop the run' },
                ]}
              />
            </PanelSection>
          )}
        </ConfigPanel>
      }
    >
      <WorkflowCanvas mode="edit" selected="cond" />
    </WorkflowEditorLayout>
  );
}

function RulesTab() {
  const [mode, setMode] = useState<'rules' | 'ai'>('rules');
  const [branchName, setBranchName] = useState('Yes');
  const [renaming, setRenaming] = useState(false);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [extraBranches, setExtraBranches] = useState<string[]>([]);

  const update = (id: number, patch: Partial<Rule>) =>
    setEntries((list) =>
      list.map((e) =>
        Array.isArray(e)
          ? e.map((r) => (r.id === id ? { ...r, ...patch } : r))
          : e.id === id
            ? { ...e, ...patch }
            : e,
      ),
    );
  const remove = (id: number) =>
    setEntries((list) =>
      list
        .map((e) => (Array.isArray(e) ? e.filter((r) => r.id !== id) : e))
        .filter((e) => (Array.isArray(e) ? e.length > 0 : e.id !== id)),
    );

  return (
    <>
      <PanelSegmented
        label="How to decide"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'rules', label: 'Rules' },
          {
            value: 'ai',
            label: (
              <>
                <Icon name="sparkle" size={12} strokeWidth={2} className="text-ai-text" />
                Use AI to decide
              </>
            ),
          },
        ]}
      />

      <section
        aria-label="Branch 1"
        className="flex flex-col gap-2.5 rounded-[10px] border border-border p-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-caption font-semibold text-fg-3">BRANCH 1</span>
          {renaming ? (
            <Input
              size="sm"
              autoFocus
              aria-label="Branch name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onBlur={() => setRenaming(false)}
              onKeyDown={(e) => e.key === 'Enter' && setRenaming(false)}
              className="h-7 w-32 text-13"
            />
          ) : (
            <span className="text-13 font-semibold text-fg">{branchName}</span>
          )}
          <IconButton
            icon="edit"
            label="Rename branch"
            variant="ghost"
            size="xs"
            className="-my-[3px] size-6 text-fg-3"
            onClick={() => setRenaming(true)}
          />
        </div>

        {mode === 'ai' ? (
          <Textarea
            rows={3}
            aria-label="When should this branch run?"
            defaultValue="The customer is upset or the ticket is about a payment problem."
            className="text-13"
          />
        ) : (
          <>
            {entries.map((entry, i) => (
              <Fragment key={Array.isArray(entry) ? entry[0].id : entry.id}>
                {i > 0 && <Joiner>OR</Joiner>}
                {Array.isArray(entry) ? (
                  <div className="flex flex-col gap-2 rounded-md border border-dashed border-border-strong bg-sunken p-2.5">
                    {entry.map((r, j) => (
                      <Fragment key={r.id}>
                        {j > 0 && <Joiner>AND</Joiner>}
                        <RuleRow rule={r} onChange={update} onRemove={remove} />
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <RuleRow rule={entry} onChange={update} onRemove={remove} />
                )}
              </Fragment>
            ))}
            <div className="flex gap-3.5">
              <TextAction onClick={() => setEntries((list) => [...list, rule()])}>+ Add rule</TextAction>
              <TextAction onClick={() => setEntries((list) => [...list, [rule(), rule()]])}>
                + Add group
              </TextAction>
            </div>
          </>
        )}
      </section>

      {extraBranches.map((name, i) => (
        <div key={name} className="flex items-center gap-2.5 rounded-[10px] border border-border p-3">
          <span className="text-caption font-semibold text-fg-3">BRANCH {i + 2}</span>
          <span className="flex-1 text-13 font-semibold text-fg">{name}</span>
          <span className="text-body-s text-fg-3">No rules yet</span>
        </div>
      ))}

      <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-sunken p-3">
        <span className="text-caption font-semibold text-fg-3">ELSE</span>
        <span className="flex-1 text-13 font-semibold text-fg">No</span>
        <span className="text-body-s text-fg-3">Always runs when nothing matches</span>
      </div>

      <InfoNote>Branches are checked from top to bottom. The first matching branch wins.</InfoNote>

      <button
        type="button"
        onClick={() => setExtraBranches((list) => [...list, `Branch ${list.length + 2}`])}
        className="self-start text-13 font-medium text-link hover:underline"
      >
        + Add branch
      </button>
    </>
  );
}

function Joiner({ children }: { children: string }) {
  return (
    <span className="h-5 self-start rounded-[5px] bg-subtle px-[7px] text-caption leading-5 font-semibold text-fg-2">
      {children}
    </span>
  );
}

function RuleRow({
  rule: r,
  onChange,
  onRemove,
}: {
  rule: Rule;
  onChange: (id: number, patch: Partial<Rule>) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_20px] items-center gap-1.5">
      <Input
        pill
        aria-label="Field"
        placeholder="field"
        value={r.field}
        onChange={(e) => onChange(r.id, { field: e.target.value })}
        className="px-2.5 font-mono text-body-s"
      />
      <Select
        pill
        aria-label="Operator"
        value={r.op}
        onChange={(e) => onChange(r.id, { op: e.target.value })}
        options={operators}
        className="pr-7 pl-2.5 text-13"
      />
      <Input
        pill
        aria-label="Value"
        placeholder="value"
        value={r.value}
        onChange={(e) => onChange(r.id, { value: e.target.value })}
        className="px-2.5 text-13"
      />
      <button
        type="button"
        aria-label="Remove rule"
        onClick={() => onRemove(r.id)}
        className="inline-flex size-5 items-center justify-center rounded-full text-fg-3 hover:bg-subtle hover:text-fg"
      >
        <Icon name="close" size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

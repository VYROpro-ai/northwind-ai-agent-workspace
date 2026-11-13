import type { IconName } from '@/components/icons';
import type { Tone } from '@/components/ui';
import { people, type Person } from '@/data/people';

/* ------------------------------------------------------------------------ */
/* Workflow list (W5-01)                                                     */
/* ------------------------------------------------------------------------ */

export type WorkflowStatus = 'Active' | 'Draft' | 'Paused' | 'Error';
export const statusTones: Record<WorkflowStatus, Tone> = {
  Draft: 'neutral',
  Active: 'ok',
  Paused: 'warn',
  Error: 'danger',
};

export type LastRunResult = 'ok' | 'fail' | 'none';

export interface WorkflowRow {
  id: string;
  name: string;
  description: string;
  triggerIcon: IconName;
  trigger: string;
  status: WorkflowStatus;
  lastRun: LastRunResult;
  lastRunLabel: string;
  runs7d: string;
  successRate: string;
  owner: Person;
  /** Row is highlighted and the description shown as an error. */
  error?: boolean;
}

export const workflows: WorkflowRow[] = [
  {
    id: 'ticket-triage',
    name: 'Ticket triage & reply',
    description: 'Classify, approve urgent, reply, log',
    triggerIcon: 'zap',
    trigger: 'On new ticket · Helpbase',
    status: 'Active',
    lastRun: 'ok',
    lastRunLabel: '2 min ago',
    runs7d: '842',
    successRate: '97%',
    owner: people.priya,
  },
  {
    id: 'refund-approval',
    name: 'Refund over $100 → approval',
    description: 'Used by Support Agent',
    triggerIcon: 'zap',
    trigger: 'On refund request',
    status: 'Active',
    lastRun: 'ok',
    lastRunLabel: '18 min ago',
    runs7d: '126',
    successRate: '99%',
    owner: people.priya,
  },
  {
    id: 'ticket-cleanup',
    name: 'Nightly ticket cleanup',
    description: 'Close stale tickets after 14 days',
    triggerIcon: 'clock',
    trigger: 'Every day 2:00 AM',
    status: 'Active',
    lastRun: 'ok',
    lastRunLabel: 'Today, 2:00 AM',
    runs7d: '7',
    successRate: '100%',
    owner: people.daniel,
  },
  {
    id: 'sales-recap',
    name: 'Weekly sales recap',
    description: 'Pipeline CRM disconnected Oct 24',
    triggerIcon: 'clock',
    trigger: 'Every weekday 9:00 AM',
    status: 'Error',
    lastRun: 'fail',
    lastRunLabel: 'Yesterday, 9:00 AM',
    runs7d: '5',
    successRate: '60%',
    owner: people.daniel,
    error: true,
  },
  {
    id: 'lead-enrichment',
    name: 'Lead enrichment',
    description: 'Webhook from the signup form',
    triggerIcon: 'link',
    trigger: 'Webhook · /leads',
    status: 'Active',
    lastRun: 'ok',
    lastRunLabel: '1 h ago',
    runs7d: '298',
    successRate: '94%',
    owner: people.leo,
  },
  {
    id: 'vip-escalation',
    name: 'VIP customer escalation',
    description: 'Paused by Priya Nair',
    triggerIcon: 'zap',
    trigger: 'On ticket tagged VIP',
    status: 'Paused',
    lastRun: 'none',
    lastRunLabel: 'Oct 20, 4:12 PM',
    runs7d: '0',
    successRate: '—',
    owner: people.priya,
  },
  {
    id: 'invoice-reconciliation',
    name: 'Invoice reconciliation',
    description: 'Not published yet',
    triggerIcon: 'play',
    trigger: 'Manual run',
    status: 'Draft',
    lastRun: 'none',
    lastRunLabel: 'Never run',
    runs7d: '—',
    successRate: '—',
    owner: people.maya,
  },
];

export type WorkflowFilter = 'All' | WorkflowStatus;

export const workflowFilters: WorkflowFilter[] = ['All', 'Active', 'Paused', 'Error', 'Draft'];

export interface NewWorkflowOption {
  id: 'blank' | 'template' | 'ai';
  title: string;
  description: string;
  icon: IconName;
  ai?: boolean;
}

export const newWorkflowOptions: NewWorkflowOption[] = [
  {
    id: 'blank',
    title: 'Blank workflow',
    description: 'Start with a trigger and build from there',
    icon: 'plus',
  },
  {
    id: 'template',
    title: 'From template',
    description: 'Pick from 24 ready-made automations',
    icon: 'grid',
  },
  {
    id: 'ai',
    title: 'Describe it to AI',
    description: '“When a VIP emails, alert Leo on chat”',
    icon: 'sparkle',
    ai: true,
  },
];

/* ------------------------------------------------------------------------ */
/* Canvas                                                                   */
/* ------------------------------------------------------------------------ */

/** Visual node category — drives the icon and the chip tint. */
export type NodeType = 'trigger' | 'agent' | 'cond' | 'approval' | 'tool' | 'output';

/** Per-mode run / diff state drawn on a node. */
export type NodeState = 'ok' | 'fail' | 'run' | 'warn' | 'skip' | 'pending' | 'add' | 'chg';

/** Extra nodes that only exist in some modes. */
export type NodeVariant = 'ai' | 'del' | 'orphan';

export type CanvasMode = 'edit' | 'ai' | 'warn' | 'test' | 'debug' | 'diff';

export type NodeId =
  'trigger' | 'agent' | 'cond' | 'approval' | 'reply' | 'log' | 'alert' | 'survey' | 'orphan';

export interface WorkflowNodeData {
  id: NodeId;
  type: NodeType;
  kind: string;
  title: string;
  sub: string;
  /** Position on the 760 × 660 stage, in px. */
  x: number;
  y: number;
  /** Width in px, defaults to 240. */
  w?: number;
  variant?: NodeVariant;
}

export const nodeIcons: Record<NodeType, IconName> = {
  trigger: 'zap',
  agent: 'wf-agent',
  cond: 'branch',
  approval: 'wf-approval',
  tool: 'wf-tool',
  output: 'wf-output',
};

/** Icon chip tint per node type: [background, foreground]. */
export const nodeTints: Record<NodeType, string> = {
  trigger: 'bg-brand-subtle text-brand-text',
  agent: 'bg-ai-subtle text-ai-text',
  cond: 'bg-subtle text-fg-2',
  approval: 'bg-warn-subtle text-warn-text',
  tool: 'bg-info-subtle text-info-text',
  output: 'bg-ok-subtle text-ok-text',
};

export const STAGE_WIDTH = 760;
export const STAGE_HEIGHT = 660;
export const NODE_HEIGHT = 64;

export const baseNodes: WorkflowNodeData[] = [
  {
    id: 'trigger',
    type: 'trigger',
    kind: 'Trigger',
    title: 'New support ticket',
    sub: 'Helpbase · any inbox',
    x: 200,
    y: 0,
  },
  {
    id: 'agent',
    type: 'agent',
    kind: 'Agent',
    title: 'Classify ticket',
    sub: 'Support Agent · v4',
    x: 200,
    y: 112,
  },
  {
    id: 'cond',
    type: 'cond',
    kind: 'Condition',
    title: 'If urgent',
    sub: 'priority equals “urgent”',
    x: 200,
    y: 224,
  },
  {
    id: 'approval',
    type: 'approval',
    kind: 'Approval',
    title: 'Support lead approves',
    sub: 'Leo Martins · 2 h timeout',
    x: 40,
    y: 352,
  },
  {
    id: 'reply',
    type: 'tool',
    kind: 'Tool',
    title: 'Reply to customer',
    sub: 'Helpbase · tickets.reply',
    x: 200,
    y: 480,
  },
  {
    id: 'log',
    type: 'output',
    kind: 'Output',
    title: 'Log to CRM',
    sub: 'Pipeline CRM · add note',
    x: 200,
    y: 592,
  },
];

/** Nodes added on top of the base graph in specific modes. */
export const extraNodes: Partial<Record<CanvasMode, WorkflowNodeData[]>> = {
  ai: [
    {
      id: 'alert',
      type: 'output',
      kind: 'Suggested',
      title: 'Alert support leads',
      sub: 'If confidence < 70%',
      x: 520,
      y: 112,
      w: 220,
      variant: 'ai',
    },
  ],
  diff: [
    {
      id: 'survey',
      type: 'output',
      kind: 'Removed',
      title: 'Send survey',
      sub: 'Mailroom · mail.send',
      x: 520,
      y: 480,
      w: 220,
      variant: 'del',
    },
  ],
  warn: [
    {
      id: 'orphan',
      type: 'tool',
      kind: 'Tool',
      title: 'Tag ticket',
      sub: 'This step will never run',
      x: 520,
      y: 352,
      w: 220,
      variant: 'orphan',
    },
  ],
};

export type NodeStateMap = Partial<Record<NodeId, { state: NodeState; label?: string }>>;

/** Node states per canvas mode. */
export const modeStates: Partial<Record<CanvasMode, NodeStateMap>> = {
  test: {
    trigger: { state: 'ok', label: '0.2 s' },
    agent: { state: 'ok', label: '2.1 s' },
    cond: { state: 'ok', label: 'Yes' },
    approval: { state: 'run', label: 'Waiting' },
    reply: { state: 'pending' },
    log: { state: 'pending' },
  },
  debug: {
    trigger: { state: 'ok', label: '0.2 s' },
    agent: { state: 'ok', label: '2.1 s' },
    cond: { state: 'ok', label: '0.1 s' },
    approval: { state: 'ok', label: '4 min' },
    reply: { state: 'fail', label: 'Failed' },
    log: { state: 'skip', label: 'Skipped' },
  },
  warn: { reply: { state: 'warn', label: '1 issue' } },
  diff: { approval: { state: 'add', label: 'Added' }, log: { state: 'chg', label: 'Changed' } },
};

export interface WorkflowEdge {
  id: string;
  d: string;
  from: NodeId;
  /** `null` = the "No" branch, which joins the reply step directly. */
  to: NodeId | null;
}

export const edges: WorkflowEdge[] = [
  { id: 'trigger-agent', d: 'M320 64 L320 110', from: 'trigger', to: 'agent' },
  { id: 'agent-cond', d: 'M320 176 L320 222', from: 'agent', to: 'cond' },
  { id: 'cond-approval', d: 'M320 288 C320 322, 160 318, 160 350', from: 'cond', to: 'approval' },
  { id: 'approval-reply', d: 'M160 416 C160 450, 320 446, 320 478', from: 'approval', to: 'reply' },
  {
    id: 'cond-no',
    d: 'M320 288 C320 322, 470 318, 470 360 L470 400 C470 446, 320 440, 320 478',
    from: 'cond',
    to: null,
  },
  { id: 'reply-log', d: 'M320 544 L320 590', from: 'reply', to: 'log' },
];

/** Dashed suggestion edge in AI mode. */
export const aiEdge = 'M440 144 L518 144';

export const branchLabels = [
  { label: 'Yes', x: 196, y: 310 },
  { label: 'No', x: 420, y: 310 },
];

/** "+" insert points on straight edges. */
export const insertPoints = [
  { id: 'after-trigger', x: 310, y: 77 },
  { id: 'after-agent', x: 310, y: 189 },
  { id: 'after-reply', x: 310, y: 557 },
];

/** Where clicking a node takes you in the editor. */
export const nodeRoutes: Partial<Record<NodeId, string>> = {
  trigger: '/workflows/editor/trigger',
  cond: '/workflows/editor/condition',
  approval: '/workflows/editor/node',
};

/* ------------------------------------------------------------------------ */
/* Editor side content                                                       */
/* ------------------------------------------------------------------------ */

export interface StepItem {
  label: string;
  icon: IconName;
  tint: string;
}

export const stepLibrary: { group: string; items: StepItem[] }[] = [
  {
    group: 'Triggers',
    items: [
      { label: 'App event', icon: 'zap', tint: nodeTints.trigger },
      { label: 'Schedule', icon: 'clock', tint: nodeTints.trigger },
    ],
  },
  {
    group: 'AI',
    items: [
      { label: 'Agent', icon: 'wf-agent', tint: nodeTints.agent },
      { label: 'Transform', icon: 'wf-transform', tint: nodeTints.agent },
    ],
  },
  {
    group: 'Logic',
    items: [
      { label: 'Condition', icon: 'branch', tint: nodeTints.cond },
      { label: 'Loop', icon: 'node-loop', tint: nodeTints.cond },
      { label: 'Delay', icon: 'wf-delay', tint: nodeTints.cond },
    ],
  },
  { group: 'Human', items: [{ label: 'Approval', icon: 'wf-approval', tint: nodeTints.approval }] },
  {
    group: 'Tools & output',
    items: [
      { label: 'Tool', icon: 'wf-tool', tint: nodeTints.tool },
      { label: 'Send or save', icon: 'wf-output', tint: nodeTints.output },
    ],
  },
];

export const pickerCategories = [
  'All',
  'Triggers',
  'AI',
  'Tools',
  'Logic',
  'Human',
  'Data',
  'Output',
] as const;
export type PickerCategory = (typeof pickerCategories)[number];

export interface PickerItem extends StepItem {
  description: string;
  category: PickerCategory;
  /** App still needs to be connected before the step can be used. */
  connect?: boolean;
}

export const pickerGroups: { group: string; items: PickerItem[] }[] = [
  {
    group: 'Recently used',
    items: [
      {
        label: 'Agent',
        description: 'Ask an agent to read, decide or write',
        icon: 'wf-agent',
        tint: nodeTints.agent,
        category: 'AI',
      },
      {
        label: 'Approval',
        description: 'Pause until a person says yes or no',
        icon: 'wf-approval',
        tint: nodeTints.approval,
        category: 'Human',
      },
      {
        label: 'Condition',
        description: 'Send each case down a different branch',
        icon: 'branch',
        tint: nodeTints.cond,
        category: 'Logic',
      },
    ],
  },
  {
    group: 'Tools by app',
    items: [
      {
        label: 'Helpbase · Add tag',
        description: 'Tag a ticket so the team can filter it',
        icon: 'wf-tool',
        tint: nodeTints.tool,
        category: 'Tools',
      },
      {
        label: 'Mailroom · Send email',
        description: 'Email the customer from your domain',
        icon: 'mail',
        tint: 'bg-subtle text-fg-3',
        category: 'Output',
        connect: true,
      },
    ],
  },
];

export interface TriggerType {
  id: string;
  label: string;
  icon: IconName;
}

export const triggerTypes: TriggerType[] = [
  { id: 'schedule', label: 'Schedule', icon: 'clock' },
  { id: 'app', label: 'App event', icon: 'zap' },
  { id: 'webhook', label: 'Webhook', icon: 'link' },
  { id: 'manual', label: 'Manual', icon: 'play' },
  { id: 'chat', label: 'Chat message', icon: 'chat' },
  { id: 'form', label: 'Form', icon: 'wf-form' },
];

export const testSampleJson = `{
  "ticket": {
    "id": 9874,
    "subject": "Charged twice for order 48213",
    "customer": "Dana Whitfield",
    "inbox": "Support"
  }
}`;

export const debugStack = `HelpbaseError 422: body is required
  at tickets.reply (step 5)
  at retry #3 (backoff 8 s)
  run_4821 · v3 · 9:42:14 AM`;

export type DiffKind = 'add' | 'chg' | 'del';

export interface DiffChange {
  kind: DiffKind;
  step: string;
  lines: { sign: '+' | '−'; text: string }[];
}

export const versionChanges: DiffChange[] = [
  {
    kind: 'add',
    step: 'Support lead approves',
    lines: [
      { sign: '+', text: 'approvers: Leo Martins, Support leads' },
      { sign: '+', text: 'timeout: 2 h → escalate to Maya Chen' },
    ],
  },
  {
    kind: 'chg',
    step: 'Log to CRM',
    lines: [
      { sign: '−', text: 'note: “Replied to ticket”' },
      { sign: '+', text: 'note: “Replied · approved by approval.decider”' },
    ],
  },
  { kind: 'del', step: 'Send survey', lines: [{ sign: '−', text: 'mail.send · 24 h after reply' }] },
];

export interface PublishCheck {
  label: string;
  meta: string;
  tone: 'ok' | 'info';
}

export const publishChecks: PublishCheck[] = [
  { label: 'All 6 steps are set up', meta: '6 / 6', tone: 'ok' },
  { label: 'Test passed in the last 24 hours', meta: 'Today, 9:48 AM', tone: 'ok' },
  { label: 'Helpbase and Pipeline CRM connected', meta: '2 apps', tone: 'ok' },
  { label: 'Estimated cost per run', meta: '$0.014', tone: 'info' },
];

/** People shown in the editor top bar (currently viewing the workflow). */
export const editorViewers: Person[] = [people.leo, people.priya];

/** Mock data for the 03 · Agents epic. All names and brands are fictional. */
import type { IconName } from '@/components/icons';
import type { AgentTone } from '@/components/ui';
import { people, type Person } from '@/data/people';

export const SUPPORT_AGENT_PATH = '/agents/support-agent';

/* ------------------------------------------------------------------ */
/* W3-01 · Agent library                                               */
/* ------------------------------------------------------------------ */

export type AgentStatus = 'Published' | 'Paused' | 'Draft';
export type AgentModel = 'Model A Fast' | 'Model B Balanced' | 'Model C Pro';

export interface AgentSummary {
  id: string;
  name: string;
  icon: IconName;
  tone: Exclude<AgentTone, 'danger'>;
  description: string;
  status: AgentStatus;
  model: AgentModel;
  tags: string[];
  /** Runs in the last 7 days; null when the agent has not run. */
  runs: number | null;
  /** Success rate in % (null when there are no runs). */
  success: number | null;
  /** Daily runs for the sparkline. */
  trend: number[];
  owner: Person;
  edited: string;
  /** Minutes since the last edit — used for sorting. */
  editedAgo: number;
  warning?: string;
  /** People who use the agent most. */
  users: Person[];
}

export const agents: AgentSummary[] = [
  {
    id: 'support-agent',
    name: 'Support Agent',
    icon: 'chat',
    tone: 'ai',
    description: 'Answers billing, order and refund questions from the help docs.',
    status: 'Published',
    model: 'Model B Balanced',
    tags: ['support', 'billing'],
    runs: 3208,
    success: 97.8,
    trend: [12, 16, 14, 20, 19, 26, 30],
    owner: people.priya,
    edited: '2 h ago',
    editedAgo: 120,
    users: [people.sofia, people.leo, people.omar],
  },
  {
    id: 'sales-researcher',
    name: 'Sales Researcher',
    icon: 'trend-up',
    tone: 'brand',
    description: 'Researches inbound leads and drafts the first outreach email.',
    status: 'Published',
    model: 'Model C Pro',
    tags: ['sales'],
    runs: 1876,
    success: 84.6,
    trend: [26, 24, 27, 20, 16, 13, 10],
    owner: people.daniel,
    edited: 'yesterday',
    editedAgo: 1440,
    warning: 'Pipeline CRM disconnected',
    users: [people.jae, people.dana, people.maya],
  },
  {
    id: 'invoice-processor',
    name: 'Invoice processor',
    icon: 'receipt',
    tone: 'warn',
    description: 'Reads supplier invoices and prepares payments for approval.',
    status: 'Published',
    model: 'Model A Fast',
    tags: ['finance'],
    runs: 2114,
    success: 99.1,
    trend: [14, 18, 16, 22, 21, 24, 28],
    owner: people.maya,
    edited: 'Oct 21',
    editedAgo: 11520,
    users: [people.dana, people.omar],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting notes',
    icon: 'file',
    tone: 'info',
    description: 'Turns call transcripts into notes, owners and follow-up tasks.',
    status: 'Paused',
    model: 'Model A Fast',
    tags: ['operations'],
    runs: null,
    success: null,
    trend: [],
    owner: people.priya,
    edited: 'Oct 19',
    editedAgo: 14400,
    users: [people.leo, people.jae, people.sofia],
  },
  {
    id: 'data-analyst',
    name: 'Data analyst',
    icon: 'analytics',
    tone: 'ok',
    description: 'Answers questions about spreadsheets and builds simple charts.',
    status: 'Draft',
    model: 'Model C Pro',
    tags: ['analytics'],
    runs: null,
    success: null,
    trend: [],
    owner: people.priya,
    edited: '10 min ago',
    editedAgo: 10,
    users: [people.maya],
  },
  {
    id: 'hr-helpdesk',
    name: 'HR helpdesk',
    icon: 'users',
    tone: 'ok',
    description: 'Answers leave, benefits and policy questions for employees.',
    status: 'Published',
    model: 'Model B Balanced',
    tags: ['hr', 'support'],
    runs: 968,
    success: 96.9,
    trend: [10, 14, 12, 16, 18, 15, 21],
    owner: people.daniel,
    edited: 'Oct 18',
    editedAgo: 15840,
    users: [people.sofia, people.dana],
  },
];

/** Total agents in the workspace (the grid shows the first page). */
export const agentCount = 14;

/* ------------------------------------------------------------------ */
/* W3-02 · Agent detail                                                */
/* ------------------------------------------------------------------ */

export const detailStats = [
  { label: 'Runs · 7 d', value: '3,208', delta: '6.1% vs last week', trend: 'up' as const },
  { label: 'Success rate', value: '97.8%', delta: '0.6 pts', trend: 'up' as const },
  { label: 'Avg latency', value: '1.6 s', delta: 'First token 0.5 s' },
  { label: 'Cost per run', value: '$0.04', delta: '$128.32 this week' },
];

export const runsPerDay = [
  310, 290, 330, 350, 300, 260, 240, 360, 380, 400, 390, 340, 300, 280, 410, 420, 440, 430, 380, 340, 320,
  460, 480, 500, 470, 430, 400, 390, 470, 452,
];

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
/** Date label for each point in `runsPerDay` (Sep 26 → Oct 25). */
export const runsDates = runsPerDay.map((_, i) => dayLabel.format(new Date(2026, 8, 26 + i)));

/** Index in `runsPerDay` where v4 was published. */
export const publishIndex = 21;
export const runsAxis = ['Sep 26', 'Oct 3', 'Oct 10', 'Oct 17', 'Oct 25'];

export const failureReasons = [
  { label: 'CRM timeout', count: 27 },
  { label: 'Missing order number', count: 17 },
  { label: 'Blocked: external email', count: 13 },
  { label: 'Refund over policy limit', count: 9 },
  { label: 'Other', count: 5 },
];

export const latestFeedback = [
  {
    text: '“Quoted the old 14-day return window, not 30.”',
    meta: 'Sofia Rossi · Wrong · 1 h ago',
    positive: false,
  },
  { text: '“Fast, and it linked the exact policy section.”', meta: 'Leo Martins · 3 h ago', positive: true },
  {
    text: '“Asked me to approve a refund that was already issued.”',
    meta: 'Maya Chen · Not helpful · yesterday',
    positive: false,
  },
];

export const agentTools = [
  { name: 'Search tickets', askFirst: false },
  { name: 'Update ticket', askFirst: true },
  { name: 'Reply to customer', askFirst: true },
  { name: 'Search CRM', askFirst: false },
  { name: 'Update CRM record', askFirst: false },
  { name: 'Look up payments', askFirst: false },
];

export const agentKnowledge = ['Refund policy 2026.pdf', 'Help center', 'Shipping FAQ'];
export const agentTags = ['support', 'billing', 'tier-1'];

/* ------------------------------------------------------------------ */
/* Create-agent wizard                                                 */
/* ------------------------------------------------------------------ */

export const wizardSteps = [
  { name: 'Basics', to: '/agents/new/basics' },
  { name: 'Instructions', to: '/agents/new/instructions' },
  { name: 'Tools', to: '/agents/new/tools' },
  { name: 'Knowledge', to: '/agents/new/knowledge' },
  { name: 'Test & publish', to: '/agents/new/publish' },
] as const;

export const avatarOptions: { label: string; icon: IconName; tone: AgentTone }[] = [
  { label: 'Robot', icon: 'nav-agents', tone: 'ai' },
  { label: 'Chat', icon: 'chat', tone: 'brand' },
  { label: 'Headset', icon: 'headset', tone: 'ok' },
  { label: 'Receipt', icon: 'receipt', tone: 'warn' },
  { label: 'Search', icon: 'search', tone: 'info' },
  { label: 'Shield', icon: 'shield', tone: 'danger' },
  { label: 'Spark', icon: 'ai-generate', tone: 'ai' },
  { label: 'Book', icon: 'knowledge', tone: 'brand' },
];

/** Accent colours offered for the agent. These are fixed brand hues in both themes. */
export const colorOptions = [
  { label: 'Violet', swatch: 'bg-[var(--violet-600)]', ring: 'ring-[var(--violet-600)]' },
  { label: 'Cobalt', swatch: 'bg-[var(--cobalt-600)]', ring: 'ring-[var(--cobalt-600)]' },
  { label: 'Green', swatch: 'bg-[var(--green-600)]', ring: 'ring-[var(--green-600)]' },
  { label: 'Amber', swatch: 'bg-[var(--amber-500)]', ring: 'ring-[var(--amber-500)]' },
  { label: 'Sky', swatch: 'bg-[var(--sky-600)]', ring: 'ring-[var(--sky-600)]' },
  { label: 'Slate', swatch: 'bg-[var(--slate-600)]', ring: 'ring-[var(--slate-600)]' },
];

export type ToolMode = 'Auto-run' | 'Ask first' | 'Off';
export type ToolRisk = 'Read' | 'Write' | 'Money' | 'Send';

export interface WizardTool {
  name: string;
  risk: ToolRisk;
  description: string;
  mode: ToolMode;
  /** Mode is fixed by a workspace policy. */
  locked?: boolean;
}

export interface ToolGroup {
  app: string;
  mono: string;
  tint: string;
  connected: boolean;
  tools: WizardTool[];
}

export const toolGroups: ToolGroup[] = [
  {
    app: 'Shopdesk',
    mono: 'S',
    tint: 'bg-[var(--cobalt-600)]',
    connected: true,
    tools: [
      {
        name: 'orders.lookup',
        risk: 'Read',
        description: 'Find an order by number or email',
        mode: 'Auto-run',
      },
      {
        name: 'orders.refund',
        risk: 'Money',
        description: 'Refund up to $100 without approval',
        mode: 'Ask first',
        locked: true,
      },
      {
        name: 'orders.update_address',
        risk: 'Write',
        description: 'Change a shipping address before dispatch',
        mode: 'Ask first',
      },
    ],
  },
  {
    app: 'Helpbase',
    mono: 'H',
    tint: 'bg-[var(--green-600)]',
    connected: true,
    tools: [
      { name: 'docs.search', risk: 'Read', description: 'Search help docs and policies', mode: 'Auto-run' },
      {
        name: 'tickets.create',
        risk: 'Write',
        description: 'Open a ticket for the human team',
        mode: 'Auto-run',
      },
      { name: 'tickets.tag', risk: 'Write', description: 'Add tags to an existing ticket', mode: 'Auto-run' },
    ],
  },
  {
    app: 'Mailroom',
    mono: 'M',
    tint: 'bg-[var(--slate-500)]',
    connected: false,
    tools: [{ name: 'mail.send', risk: 'Send', description: 'Send an email to the customer', mode: 'Off' }],
  },
];

export interface KnowledgeSource {
  id: string;
  kind: 'SITE' | 'PDF' | 'DOC' | 'CSV';
  name: string;
  sub: string;
  size: string;
  status: 'indexed' | 'indexing' | 'failed';
  progress?: number;
  selected: boolean;
}

export const knowledgeSources: KnowledgeSource[] = [
  {
    id: 'help',
    kind: 'SITE',
    name: 'Help center',
    sub: 'help.northwindlabs.com · 142 pages',
    size: '18.4 MB',
    status: 'indexed',
    selected: true,
  },
  {
    id: 'refund',
    kind: 'PDF',
    name: 'Refund policy 2026.pdf',
    sub: 'Uploaded by Priya Nair · Oct 21',
    size: '412 KB',
    status: 'indexed',
    selected: true,
  },
  {
    id: 'shipping',
    kind: 'DOC',
    name: 'Shipping times by region',
    sub: 'Docs folder · Support',
    size: '96 KB',
    status: 'indexed',
    selected: true,
  },
  {
    id: 'catalog',
    kind: 'CSV',
    name: 'Product catalog fall 2026.csv',
    sub: 'Uploaded just now',
    size: '6.1 MB',
    status: 'indexing',
    progress: 65,
    selected: true,
  },
  {
    id: 'warranty',
    kind: 'PDF',
    name: 'Warranty terms (scanned).pdf',
    sub: 'No readable text found. Try a text-based PDF.',
    size: '3.8 MB',
    status: 'failed',
    selected: false,
  },
];

export const accessOptions = [
  { value: 'me', label: 'Only me', sub: 'Keep testing privately' },
  { value: 'team', label: 'Support team', sub: '8 people · Northwind Labs' },
  { value: 'workspace', label: 'Everyone in the workspace', sub: '24 people' },
] as const;

/* ------------------------------------------------------------------ */
/* W3-08 · Settings                                                    */
/* ------------------------------------------------------------------ */

export const models = [
  {
    id: 'a',
    name: 'Model A · Fast',
    description: 'Quick replies for simple, high-volume questions.',
    speed: '~0.8 s',
    price: '$0.40 / 1K runs',
    perRun: 0.0004,
  },
  {
    id: 'b',
    name: 'Model B · Balanced',
    description: 'Good quality at a fair cost. Fits most agents.',
    speed: '~2.1 s',
    price: '$3.20 / 1K runs',
    perRun: 0.0032,
  },
  {
    id: 'c',
    name: 'Model C · Deep',
    description: 'Best reasoning for tricky or multi-step cases.',
    speed: '~3.5 s',
    price: '$12.90 / 1K runs',
    perRun: 0.0129,
  },
] as const;

export type ModelId = (typeof models)[number]['id'];

/* ------------------------------------------------------------------ */
/* W3-09 · Version history                                             */
/* ------------------------------------------------------------------ */

export interface AgentVersion {
  id: string;
  tag?: 'Draft' | 'Live';
  note: string;
  meta: string;
}

export const versions: AgentVersion[] = [
  { id: 'v5', tag: 'Draft', note: 'Pricier model test', meta: 'Priya Nair · edited 10 min ago' },
  { id: 'v4', tag: 'Live', note: 'Refunds need approval', meta: 'Priya Nair · Oct 18, 2:40 PM' },
  { id: 'v3', note: 'Added shipping-times doc', meta: 'Priya Nair · Oct 9, 11:05 AM' },
  { id: 'v2', note: 'Shorter, warmer tone', meta: 'Daniel Okafor · Sep 30, 4:12 PM' },
  { id: 'v1', note: 'First version', meta: 'Priya Nair · Sep 22, 9:30 AM' },
];

export interface DiffLine {
  n: number;
  kind: 'context' | 'removed' | 'added';
  text: string;
}

export const instructionsDiff: DiffLine[] = [
  { n: 7, kind: 'context', text: 'MUST DO' },
  { n: 8, kind: 'context', text: '• Cite the help doc for every policy you mention.' },
  { n: 9, kind: 'removed', text: '• Offer a refund when the customer asks.' },
  { n: 9, kind: 'added', text: '• Offer a refund only within 30 days of purchase.' },
  { n: 10, kind: 'added', text: '• Ask for approval before any refund over $100.' },
  { n: 11, kind: 'context', text: '' },
  { n: 12, kind: 'context', text: 'MUST NEVER DO' },
];

/* ------------------------------------------------------------------ */
/* W3-10 · Templates                                                   */
/* ------------------------------------------------------------------ */

export const templateCategories = [
  { name: 'All', count: 48 },
  { name: 'Support', count: 9 },
  { name: 'Sales', count: 8 },
  { name: 'Operations', count: 11 },
  { name: 'Finance', count: 6 },
  { name: 'Marketing', count: 7 },
  { name: 'Engineering', count: 7 },
];

/** Fictional apps a template connects to, with their brand mark. */
export const templateApps: Record<string, { mono: string; tint: string; name: string }> = {
  tickets: { mono: 'S', tint: 'bg-[var(--green-500)]', name: 'Shopdesk tickets' },
  docs: { mono: 'D', tint: 'bg-[var(--cobalt-600)]', name: 'Helpbase docs' },
  crm: { mono: 'R', tint: 'bg-[var(--violet-600)]', name: 'Pipeline CRM' },
  calendar: { mono: 'C', tint: 'bg-[var(--amber-500)]', name: 'Calendar' },
  ledger: { mono: '$', tint: 'bg-[var(--green-600)]', name: 'Ledger' },
  sheets: { mono: 'X', tint: 'bg-[var(--green-600)]', name: 'Sheets' },
  web: { mono: 'W', tint: 'bg-[var(--sky-500)]', name: 'Web search' },
  alerts: { mono: 'A', tint: 'bg-[var(--red-600)]', name: 'Alerts' },
  chat: { mono: 'T', tint: 'bg-[var(--slate-600)]', name: 'Team chat' },
};

export interface AgentTemplate {
  name: string;
  category: string;
  description: string;
  tools: string[];
  rating: string;
  used: string;
  /** Sort key for "Most used". */
  teams: number;
  pro?: boolean;
  icon: IconName;
  tone: AgentTone;
}

export const templates: AgentTemplate[] = [
  {
    name: 'Support triage',
    category: 'Support',
    description: 'Reads new tickets, tags them and drafts a first reply for review.',
    tools: ['tickets.tag', 'docs.search'],
    rating: '4.8',
    used: 'Used by 1.2K teams',
    teams: 1200,
    icon: 'list-check',
    tone: 'brand',
  },
  {
    name: 'Lead qualifier',
    category: 'Sales',
    description: 'Scores inbound leads and books a call with the right rep.',
    tools: ['crm.update', 'calendar.book'],
    rating: '4.7',
    used: 'Used by 860 teams',
    teams: 860,
    icon: 'target',
    tone: 'ok',
  },
  {
    name: 'Invoice reconciler',
    category: 'Finance',
    description: 'Matches invoices to payments and flags anything that doesn’t add up.',
    tools: ['ledger.read', 'sheets.write'],
    rating: '4.6',
    used: 'Used by 410 teams',
    teams: 410,
    pro: true,
    icon: 'receipt',
    tone: 'warn',
  },
  {
    name: 'Meeting brief',
    category: 'Operations',
    description: 'Turns calendar invites into a one-page brief before each call.',
    tools: ['calendar.read', 'docs.search'],
    rating: '4.9',
    used: 'Used by 2.4K teams',
    teams: 2400,
    icon: 'calendar',
    tone: 'ai',
  },
  {
    name: 'Research writer',
    category: 'Marketing',
    description: 'Collects sources on a topic and drafts a cited article outline.',
    tools: ['web.search', 'docs.write'],
    rating: '4.5',
    used: 'Used by 690 teams',
    teams: 690,
    icon: 'edit',
    tone: 'info',
  },
  {
    name: 'Incident commander',
    category: 'Engineering',
    description: 'Opens the incident channel, pulls logs and writes the timeline.',
    tools: ['alerts.read', 'chat.post'],
    rating: '4.7',
    used: 'Used by 320 teams',
    teams: 320,
    pro: true,
    icon: 'alert-triangle',
    tone: 'danger',
  },
];

export const workspaceTemplates = [
  {
    mono: 'RF',
    tint: 'bg-[var(--cobalt-600)]',
    name: 'Refund helper (Northwind)',
    meta: 'Priya Nair · used 14 times',
  },
  {
    mono: 'WR',
    tint: 'bg-[var(--green-600)]',
    name: 'Weekly sales recap',
    meta: 'Daniel Okafor · used 6 times',
  },
];

/* ------------------------------------------------------------------ */
/* W3-11 / W3-12 · Dialogs                                             */
/* ------------------------------------------------------------------ */

export const dependentWorkflows = [
  { name: 'Refund over $100 → approval', meta: 'Runs on every refund request', active: true },
  { name: 'Nightly ticket cleanup', meta: 'Daily at 2:00 AM · Daniel Okafor', active: true },
  { name: 'VIP customer escalation', meta: 'Edited Oct 20 · Priya Nair', active: false },
];

export type ShareRole = 'Owner' | 'Can edit' | 'Can use';

export interface ShareEntry {
  id: string;
  name: string;
  sub: string;
  role: ShareRole;
  avatar?: string;
  team?: boolean;
}

export const initialShares: ShareEntry[] = [
  {
    id: 'priya',
    name: 'Priya Nair (you)',
    sub: people.priya.email,
    role: 'Owner',
    avatar: people.priya.avatar,
  },
  { id: 'leo', name: people.leo.name, sub: people.leo.email, role: 'Can edit', avatar: people.leo.avatar },
  { id: 'support-team', name: 'Support team', sub: 'Team · 8 people', role: 'Can use', team: true },
  {
    id: 'sofia',
    name: people.sofia.name,
    sub: people.sofia.email,
    role: 'Can use',
    avatar: people.sofia.avatar,
  },
];

/** People that can be invited from the share dialog. */
export const invitable: Person[] = [people.omar, people.maya, people.daniel, people.jae];

/* ------------------------------------------------------------------ */
/* Test chat                                                           */
/* ------------------------------------------------------------------ */

export interface ChatTurn {
  id: number;
  from: 'user' | 'agent';
  text: string;
  tool?: string;
  meta?: string;
  /** Adds a citation marker after `text`, followed by `after`. */
  cite?: boolean;
  after?: string;
}

/** Canned agent replies so the draft can be "tested" without a backend. */
export function cannedReply(question: string): Omit<ChatTurn, 'id' | 'from'> {
  const q = question.toLowerCase();
  if (q.includes('order') && !q.includes('refund')) {
    return {
      tool: 'orders.lookup · 0.4 s',
      text: 'Your order 4471 left our warehouse on Oct 24 and should arrive by Oct 29. I’ve sent the tracking link to your email.',
      meta: '412 tokens · $0.01 · 1.2 s',
    };
  }
  if (q.includes('cancel')) {
    return {
      tool: 'docs.search · 0.7 s',
      text: 'You can cancel any time from Settings → Plan. Your plan stays active until the end of the billing period',
      cite: true,
      after: '.',
      meta: '388 tokens · $0.01 · 1.4 s',
    };
  }
  if (q.includes('refund') || q.includes('30 days')) {
    return {
      tool: 'docs.search · 0.6 s',
      text: 'Refunds are only available within 30 days of purchase, so I can’t refund this one. I can offer store credit instead',
      cite: true,
      after: '.',
      meta: '520 tokens · $0.01 · 1.6 s',
    };
  }
  return {
    tool: 'docs.search · 0.5 s',
    text: 'Thanks for the question. I checked the help center and passed the details to a teammate, who will reply within one business day.',
    meta: '356 tokens · $0.01 · 1.1 s',
  };
}

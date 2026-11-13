/* Mock data for the Home epic (W2-01 → W2-03). Fictional workspace: Northwind Labs. */
import type { IconName } from '@/components/icons';
import type { RunStatus, Tone } from '@/components/ui';
import { people, type Person } from '@/data/people';

/* ---------- W2-01 · Overview ---------- */

export interface AttentionItem {
  title: string;
  detail: string;
  icon: IconName;
  tone: 'warn' | 'danger';
  cta: string;
  to: string;
}

export const attention: AttentionItem[] = [
  {
    title: '4 approvals waiting',
    detail: 'Oldest: Refund $240 to Acme Co. · 14 min',
    icon: 'approval',
    tone: 'warn',
    cta: 'Review',
    to: '/approvals',
  },
  {
    title: '12 failed runs in 24 h',
    detail: 'Mostly Sales Researcher · CRM rejected requests',
    icon: 'run',
    tone: 'danger',
    cta: 'View runs',
    to: '/runs',
  },
  {
    title: '1 active incident',
    detail: 'SEV2 · CRM timeouts · Daniel investigating',
    icon: 'alert-triangle',
    tone: 'danger',
    cta: 'Open',
    to: '/runs/incidents',
  },
];

export interface Kpi {
  label: string;
  value: string;
  icon: IconName;
  delta: string;
  deltaTone: Tone;
  /** Sparkline y-coordinates on a 96×30 canvas (0 = top), as drawn on the design. */
  trend: number[];
  /** CSS colour for the sparkline. */
  trendColor: string;
}

export const kpis: Kpi[] = [
  {
    label: 'Runs · 14 d',
    value: '12,480',
    icon: 'run',
    delta: '+8.2%',
    deltaTone: 'ok',
    trend: [26, 22, 24, 16, 18, 11, 13, 6],
    trendColor: 'var(--ok)',
  },
  {
    label: 'Success rate',
    value: '96.4%',
    icon: 'check',
    delta: '−1.1 pts',
    deltaTone: 'danger',
    trend: [8, 7, 9, 8, 10, 9, 12, 11],
    trendColor: 'var(--accent)',
  },
  {
    label: 'Avg latency',
    value: '1.8 s',
    icon: 'clock',
    delta: '0.2 s faster',
    deltaTone: 'ok',
    trend: [10, 13, 12, 17, 15, 19, 20, 22],
    trendColor: 'var(--ok)',
  },
  {
    label: 'Month spend',
    value: '$1,062.40',
    icon: 'dollar',
    delta: '76% of cap',
    deltaTone: 'brand',
    trend: [28, 25, 23, 20, 17, 13, 10, 7],
    trendColor: 'var(--ok)',
  },
];

/* Runs by status — one series per time range. */

export type RunRange = '24h' | '7d' | '14d' | '30d';

export interface RunBar {
  /** Axis label, e.g. "Oct 12" or "14". */
  label: string;
  /** Tooltip heading, e.g. "Thu, Oct 23". */
  title: string;
  succeeded: number;
  failed: number;
  waiting: number;
}

export interface RunSeries {
  bars: RunBar[];
  /** Bar highlighted when nothing is hovered. */
  focus: number;
  /** Show every n-th axis label. */
  labelEvery: number;
  delta: string;
  comparison: string;
}

/** [total, failed, waiting] per bucket. */
type Bucket = [number, number, number];

const today = new Date(2026, 9, 25);

function dayBars(buckets: Bucket[]): RunBar[] {
  return buckets.map(([total, failed, waiting], i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (buckets.length - 1 - i));
    const day = date.getDate();
    return {
      label:
        i === 0 || day === 1
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : String(day),
      title: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      succeeded: total - failed - waiting,
      failed,
      waiting,
    };
  });
}

const last14: Bucket[] = [
  [1081, 62, 18],
  [939, 55, 21],
  [698, 98, 15],
  [630, 84, 12],
  [754, 40, 20],
  [833, 46, 17],
  [881, 45, 19],
  [953, 52, 22],
  [768, 38, 16],
  [836, 46, 18],
  [1062, 52, 24],
  [1210, 31, 25],
  [811, 40, 17],
  [1024, 51, 21],
];

const previous16: Bucket[] = [
  [702, 41, 14],
  [655, 37, 12],
  [588, 52, 11],
  [612, 33, 15],
  [744, 39, 18],
  [801, 47, 16],
  [826, 44, 20],
  [690, 36, 13],
  [574, 61, 12],
  [633, 30, 14],
  [758, 42, 17],
  [812, 45, 19],
  [869, 49, 21],
  [721, 35, 15],
  [659, 33, 13],
  [904, 58, 22],
];

const hours = [
  '10 AM',
  '12 PM',
  '2 PM',
  '4 PM',
  '6 PM',
  '8 PM',
  '10 PM',
  '12 AM',
  '2 AM',
  '4 AM',
  '6 AM',
  '8 AM',
];
const last24h: Bucket[] = [
  [92, 1, 2],
  [118, 2, 3],
  [124, 1, 2],
  [106, 3, 2],
  [74, 1, 1],
  [48, 0, 1],
  [31, 0, 0],
  [19, 0, 0],
  [14, 0, 0],
  [22, 1, 1],
  [58, 1, 1],
  [96, 2, 3],
];

export const runSeries: Record<RunRange, RunSeries> = {
  '24h': {
    bars: last24h.map(([total, failed, waiting], i) => ({
      label: hours[i],
      title: `${i < 7 ? 'Sat' : 'Sun'}, ${hours[i]}`,
      succeeded: total - failed - waiting,
      failed,
      waiting,
    })),
    focus: 11,
    labelEvery: 2,
    delta: '+3.4%',
    comparison: 'vs previous 24 hours',
  },
  '7d': {
    bars: dayBars(last14.slice(-7)),
    focus: 4,
    labelEvery: 1,
    delta: '+5.1%',
    comparison: 'vs previous 7 days',
  },
  '14d': {
    bars: dayBars(last14),
    focus: 11,
    labelEvery: 2,
    delta: '+8.2%',
    comparison: 'vs previous 14 days',
  },
  '30d': {
    bars: dayBars([...previous16, ...last14]),
    focus: 27,
    labelEvery: 5,
    delta: '+11.4%',
    comparison: 'vs previous 30 days',
  },
};

export const runRanges: { value: RunRange; label: string }[] = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 d' },
  { value: '14d', label: '14 d' },
  { value: '30d', label: '30 d' },
];

/* Recent runs + top agents */

export type AgentTone = 'ai' | 'ok' | 'brand' | 'warn' | 'info';

export interface AgentRef {
  name: string;
  icon: IconName;
  tone: AgentTone;
}

export const agents = {
  support: { name: 'Support Agent', icon: 'chat', tone: 'ai' },
  triage: { name: 'Ticket triage & reply', icon: 'workflow', tone: 'ok' },
  sales: { name: 'Sales Researcher', icon: 'trend-up', tone: 'brand' },
  invoice: { name: 'Invoice processor', icon: 'receipt', tone: 'warn' },
  analyst: { name: 'Data analyst', icon: 'analytics', tone: 'info' },
  notes: { name: 'Meeting notes', icon: 'file', tone: 'info' },
  hr: { name: 'HR helpdesk', icon: 'users', tone: 'ok' },
} satisfies Record<string, AgentRef>;

export interface RecentRun {
  id: string;
  agent: AgentRef;
  detail: string;
  started: string;
  /** A person, or a named system trigger. */
  trigger: Person | { name: string; initials: string };
  cost: string;
  status: RunStatus;
  to: string;
}

export const recentRuns: RecentRun[] = [
  {
    id: 'run_4835',
    agent: agents.support,
    detail: 'Refund for Acme Co.',
    started: 'Oct 25, 9:14 AM',
    trigger: people.sofia,
    cost: '$0.07',
    status: 'waiting',
    to: '/runs/run_4835',
  },
  {
    id: 'run_4834',
    agent: agents.triage,
    detail: 'Workflow · v5',
    started: 'Oct 25, 9:02 AM',
    trigger: { name: 'Helpdesk trigger', initials: 'HD' },
    cost: '$0.02',
    status: 'succeeded',
    to: '/runs/run_4835',
  },
  {
    id: 'run_4833',
    agent: agents.sales,
    detail: 'Lead: Pinecrest',
    started: 'Oct 25, 8:47 AM',
    trigger: people.daniel,
    cost: '$0.22',
    status: 'failed',
    to: '/runs/run_4833',
  },
  {
    id: 'run_4832',
    agent: agents.invoice,
    detail: 'INV-20931 · Lumen Freight',
    started: 'Oct 25, 8:30 AM',
    trigger: people.maya,
    cost: '$0.11',
    status: 'succeeded',
    to: '/runs/run_4835',
  },
  {
    id: 'run_4831',
    agent: agents.analyst,
    detail: 'Q3 refunds by region',
    started: 'Oct 25, 8:12 AM',
    trigger: people.priya,
    cost: '$0.19',
    status: 'running',
    to: '/runs/run_4835',
  },
  {
    id: 'run_4830',
    agent: agents.support,
    detail: 'Order #48190 status',
    started: 'Oct 25, 7:58 AM',
    trigger: people.leo,
    cost: '$0.06',
    status: 'succeeded',
    to: '/runs/run_4835',
  },
];

export interface TopAgent {
  agent: AgentRef;
  runs: string;
  success: string;
  /** Success below target — shown in the danger colour. */
  belowTarget?: boolean;
  costPerRun: string;
  thumbsUp: string;
  to: string;
}

export const topAgents: TopAgent[] = [
  {
    agent: agents.support,
    runs: '3,208',
    success: '97.8%',
    costPerRun: '$0.04',
    thumbsUp: '91%',
    to: '/agents/support-agent',
  },
  {
    agent: agents.invoice,
    runs: '2,114',
    success: '99.1%',
    costPerRun: '$0.02',
    thumbsUp: '88%',
    to: '/agents',
  },
  {
    agent: agents.sales,
    runs: '1,876',
    success: '84.6%',
    belowTarget: true,
    costPerRun: '$0.07',
    thumbsUp: '79%',
    to: '/agents',
  },
  {
    agent: agents.notes,
    runs: '1,402',
    success: '98.4%',
    costPerRun: '$0.03',
    thumbsUp: '93%',
    to: '/agents',
  },
  { agent: agents.hr, runs: '968', success: '96.9%', costPerRun: '$0.02', thumbsUp: '86%', to: '/agents' },
];

export interface WaitingApproval {
  title: string;
  meta: string;
  risk: 'Medium' | 'High';
  icon: IconName;
  to: string;
}

export const waitingApprovals: WaitingApproval[] = [
  {
    title: 'Refund $240',
    meta: 'Acme Co. · 14 min',
    risk: 'Medium',
    icon: 'refund',
    to: '/approvals/apr_240',
  },
  {
    title: 'Delete 1,204 contacts',
    meta: 'Data Cleaner · 2 h',
    risk: 'High',
    icon: 'trash',
    to: '/approvals',
  },
];

/* ---------- W2-02 · First-run home ---------- */

export interface SetupStep {
  title: string;
  detail: string;
  done?: boolean;
  cta?: string;
  to?: string;
}

export const setupSteps: SetupStep[] = [
  { title: 'Create workspace', detail: 'Northwind Labs · northwind.app/northwind-labs', done: true },
  { title: 'Create your first agent', detail: 'Support Agent, from the Support template', done: true },
  {
    title: 'Add knowledge',
    detail: 'Upload help docs so answers cite your real policies',
    cta: 'Add knowledge',
    to: '/knowledge/upload',
  },
  {
    title: 'Connect a tool',
    detail: 'Let the agent look up orders in your Support desk',
    cta: 'Connect',
    to: '/integrations',
  },
  {
    title: 'Invite your team',
    detail: 'Add a reviewer to approve risky actions',
    cta: 'Invite',
    to: '/settings/members/invite',
  },
];

/* ---------- W2-03 · Activity feed ---------- */

export type ActivityType = 'publish' | 'edit' | 'invite' | 'connect' | 'policy' | 'approve';
export type ActivityCategory = 'Agents' | 'Workflows' | 'Approvals' | 'Policies' | 'Integrations' | 'Members';

export const activityCategories: ActivityCategory[] = [
  'Agents',
  'Workflows',
  'Approvals',
  'Policies',
  'Integrations',
  'Members',
];

export interface ActivityEvent {
  id: string;
  /** Day group heading. */
  day: string;
  /** Days ago — used by the date-range filter. */
  age: number;
  actor: Person | null;
  type: ActivityType;
  category: ActivityCategory;
  action: string;
  object: string;
  /** Route of the changed object; omitted when it was deleted. */
  to?: string;
  deleted?: boolean;
  suffix?: string;
  time: string;
}

export const activityFeed: ActivityEvent[] = [
  {
    id: 'a1',
    day: 'Today',
    age: 0,
    actor: people.priya,
    type: 'publish',
    category: 'Agents',
    action: 'published',
    object: 'Support Agent v4',
    to: '/agents/support-agent/versions',
    time: '9:20 AM',
  },
  {
    id: 'a2',
    day: 'Today',
    age: 0,
    actor: people.leo,
    type: 'approve',
    category: 'Approvals',
    action: 'approved',
    object: 'Refund $240 to Acme Co.',
    to: '/approvals/apr_240/approved',
    time: '9:15 AM',
  },
  {
    id: 'a3',
    day: 'Today',
    age: 0,
    actor: people.maya,
    type: 'policy',
    category: 'Policies',
    action: 'changed the policy',
    object: 'Refunds over $100 need approval',
    to: '/settings/guardrails',
    time: '8:52 AM',
  },
  {
    id: 'a4',
    day: 'Yesterday',
    age: 1,
    actor: people.daniel,
    type: 'connect',
    category: 'Integrations',
    action: 'connected',
    object: 'CRM',
    to: '/integrations/pipeline-crm',
    suffix: ' · 12 actions',
    time: '4:02 PM',
  },
  {
    id: 'a5',
    day: 'Yesterday',
    age: 1,
    actor: people.priya,
    type: 'edit',
    category: 'Workflows',
    action: 'edited the workflow',
    object: 'Support ticket triage',
    to: '/workflows/editor',
    time: '2:31 PM',
  },
  {
    id: 'a6',
    day: 'Yesterday',
    age: 1,
    actor: people.daniel,
    type: 'invite',
    category: 'Members',
    action: 'invited',
    object: 'omar.haddad@northwindlabs.com',
    to: '/settings/members',
    suffix: ' as Viewer',
    time: '11:08 AM',
  },
  {
    id: 'a7',
    day: 'Oct 22',
    age: 3,
    actor: null,
    type: 'edit',
    category: 'Agents',
    action: 'edited',
    object: 'Holiday macro agent',
    deleted: true,
    suffix: ' (deleted)',
    time: '5:44 PM',
  },
  {
    id: 'a8',
    day: 'Oct 22',
    age: 3,
    actor: people.leo,
    type: 'approve',
    category: 'Approvals',
    action: 'rejected',
    object: 'Email 42 customers about the delay',
    to: '/approvals',
    suffix: ' · “tone too strong”',
    time: '10:12 AM',
  },
];

/** Older events revealed by "Load more". */
export const olderActivity: ActivityEvent[] = [
  {
    id: 'a9',
    day: 'Oct 21',
    age: 4,
    actor: people.jae,
    type: 'publish',
    category: 'Agents',
    action: 'published',
    object: 'Sales Researcher v2',
    to: '/agents',
    time: '6:10 PM',
  },
  {
    id: 'a10',
    day: 'Oct 21',
    age: 4,
    actor: people.maya,
    type: 'invite',
    category: 'Members',
    action: 'invited',
    object: 'jae@northwindlabs.com',
    to: '/settings/members',
    suffix: ' as Builder',
    time: '9:02 AM',
  },
  {
    id: 'a11',
    day: 'Oct 19',
    age: 6,
    actor: people.daniel,
    type: 'policy',
    category: 'Policies',
    action: 'changed the policy',
    object: 'Block exports of customer PII',
    to: '/settings/guardrails',
    time: '3:47 PM',
  },
];

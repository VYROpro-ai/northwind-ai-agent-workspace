import type { AgentTone } from '@/components/ui';
import { people, type Person } from '@/data/people';

/* ------------------------------------------------------------------ */
/* Ranges                                                               */
/* ------------------------------------------------------------------ */

export type RangeKey = 'today' | '7d' | '30d' | '90d' | 'custom';

export const rangeOptions: { value: RangeKey; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 d' },
  { value: '30d', label: '30 d' },
  { value: '90d', label: '90 d' },
  { value: 'custom', label: 'Custom' },
];

/** Short label used in "vs previous …" deltas. */
export const rangeShort: Record<RangeKey, string> = {
  today: 'yesterday',
  '7d': '7 d',
  '30d': '30 d',
  '90d': '90 d',
  custom: 'period',
};

/** Describes the window a chart covers. */
export const rangeCaption: Record<RangeKey, string> = {
  today: 'Today, by hour',
  '7d': 'Oct 20 – 26',
  '30d': 'Oct 1 – 26',
  '90d': 'Last 13 weeks',
  custom: 'Oct 1 – 26',
};

/** Even y-axis ticks (0 … top) that comfortably fit `max`. */
export function niceTicks(max: number, count = 4): number[] {
  const raw = (max * 1.05) / count;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  return Array.from({ length: count + 1 }, (_, i) => Math.round(step * i * 100) / 100);
}

/** 1200 → "1.2K". */
export const formatK = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}K` : String(v));

/** Multiplier applied to count metrics (runs, tokens, cost) for each range. */
export const rangeFactor: Record<RangeKey, number> = {
  today: 1 / 26,
  '7d': 7 / 26,
  '30d': 1,
  '90d': 3.2,
  custom: 1,
};

/** Day-of-month labels for the design's 30-day window (Oct 1 – 26). */
const octDays = Array.from({ length: 26 }, (_, i) => `Oct ${i + 1}`);

/** Relative activity per hour of a weekday — reused for "Today" views and the heatmap. */
export const hourShape = [
  0.1, 0.11, 0.11, 0.1, 0.11, 0.1, 0.11, 0.06, 0.3, 0.58, 0.66, 0.89, 1, 0.91, 0.94, 0.66, 0.55, 0.35, 0.06,
  0.11, 0.1, 0.11, 0.11, 0.1,
];

const weekLabels = Array.from({ length: 13 }, (_, i) => {
  const d = new Date(2026, 6, 29 + i * 7);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
});

const round1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Derives a series for any range from the design's 30-day daily series:
 * 7 d = last week, 90 d = weekly averages with a gentle ramp, Today = hourly profile.
 */
export function rangeSeries(base: number[], range: RangeKey): { labels: string[]; data: number[] } {
  if (range === '7d') return { labels: octDays.slice(-7), data: base.slice(-7) };
  if (range === '90d') {
    const avg = base.reduce((s, v) => s + v, 0) / base.length;
    return {
      labels: weekLabels,
      data: weekLabels.map((_, i) => round1(avg * (0.78 + (i / 12) * 0.24) * (1 + Math.sin(i * 1.7) * 0.06))),
    };
  }
  if (range === 'today') {
    const peak = Math.max(...base.slice(-7));
    return {
      labels: hourShape.map((_, h) => `${String(h).padStart(2, '0')}:00`),
      data: hourShape.map((s) => round1(peak * s)),
    };
  }
  return { labels: octDays, data: base };
}

/* ------------------------------------------------------------------ */
/* W9-01 · Usage                                                        */
/* ------------------------------------------------------------------ */

export interface Kpi {
  label: string;
  value: string;
  delta: string;
  tone: 'ok' | 'warn' | 'neutral' | 'danger';
}

export const usageKpis: Record<RangeKey, Kpi[]> = {
  today: [
    { label: 'Active users', value: '17 of 24', delta: '↑ 2 vs yesterday', tone: 'ok' },
    { label: 'Chats', value: '162', delta: '↑ 6%', tone: 'ok' },
    { label: 'Runs', value: '508', delta: '↑ 11%', tone: 'ok' },
    { label: 'Approvals decided', value: '27', delta: '↓ 4% · median 5 min', tone: 'neutral' },
  ],
  '7d': [
    { label: 'Active users', value: '20 of 24', delta: '↑ 1 vs previous 7 d', tone: 'ok' },
    { label: 'Chats', value: '1,014', delta: '↑ 12%', tone: 'ok' },
    { label: 'Runs', value: '3,296', delta: '↑ 19%', tone: 'ok' },
    { label: 'Approvals decided', value: '158', delta: '↑ 7% · median 6 min', tone: 'ok' },
  ],
  '30d': [
    { label: 'Active users', value: '21 of 24', delta: '↑ 3 vs previous 30 d', tone: 'ok' },
    { label: 'Chats', value: '3,842', delta: '↑ 18%', tone: 'ok' },
    { label: 'Runs', value: '12,480', delta: '↑ 24%', tone: 'ok' },
    { label: 'Approvals decided', value: '612', delta: '↑ 9% · median 6 min', tone: 'ok' },
  ],
  '90d': [
    { label: 'Active users', value: '23 of 24', delta: '↑ 6 vs previous 90 d', tone: 'ok' },
    { label: 'Chats', value: '10,206', delta: '↑ 41%', tone: 'ok' },
    { label: 'Runs', value: '33,950', delta: '↑ 57%', tone: 'ok' },
    { label: 'Approvals decided', value: '1,734', delta: '↑ 22% · median 7 min', tone: 'ok' },
  ],
  custom: [
    { label: 'Active users', value: '21 of 24', delta: '↑ 3 vs previous period', tone: 'ok' },
    { label: 'Chats', value: '3,842', delta: '↑ 18%', tone: 'ok' },
    { label: 'Runs', value: '12,480', delta: '↑ 24%', tone: 'ok' },
    { label: 'Approvals decided', value: '612', delta: '↑ 9% · median 6 min', tone: 'ok' },
  ],
};

export const dailyActiveUsers = {
  current: [
    12, 14, 15, 13, 9, 8, 15, 16, 17, 16, 18, 10, 9, 17, 18, 19, 18, 19, 11, 10, 19, 20, 21, 20, 21, 12,
  ],
  previous: [
    10, 11, 12, 12, 7, 6, 12, 13, 13, 14, 14, 8, 7, 14, 15, 15, 14, 16, 9, 8, 15, 16, 16, 17, 17, 10,
  ],
};

export interface StackedData {
  labels: string[];
  /** One array per segment, bottom → top. */
  values: number[][];
}

/** Runs by source — Chat, Workflow, API. */
export const runsBySource: Record<RangeKey, StackedData> = {
  today: {
    labels: ['00–06', '06–12', '12–18', '18–24'],
    values: [
      [18, 152, 168, 27],
      [12, 58, 61, 15],
      [6, 17, 21, 4],
    ],
  },
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [
      [352, 371, 360, 338, 330, 112, 98],
      [128, 131, 122, 117, 109, 61, 52],
      [44, 51, 40, 38, 31, 12, 9],
    ],
  },
  '30d': {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    values: [
      [1680, 1980, 2180, 2110],
      [680, 800, 880, 780],
      [280, 310, 360, 200],
    ],
  },
  '90d': {
    labels: ['Aug', 'Sep', 'Oct'],
    values: [
      [6120, 7480, 8390],
      [2210, 2730, 3140],
      [940, 1120, 1150],
    ],
  },
  custom: {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    values: [
      [1680, 1980, 2180, 2110],
      [680, 800, 880, 780],
      [280, 310, 360, 200],
    ],
  },
};

export const runsByTeam = [
  { label: 'Support', value: 5980 },
  { label: 'Sales', value: 2410 },
  { label: 'Operations', value: 1880 },
  { label: 'Finance', value: 1240 },
  { label: 'Marketing', value: 970 },
];

export const topUsers: { person: Person; team: string; value: number; unit: string }[] = [
  { person: people.sofia, team: 'Support', value: 612, unit: 'chats' },
  { person: people.priya, team: 'Support', value: 408, unit: 'chats' },
  { person: people.daniel, team: 'Sales', value: 377, unit: 'chats' },
  { person: people.leo, team: 'Support', value: 241, unit: 'approvals' },
];

export const leastUsedAgents: { name: string; meta: string; runs: number; tone: AgentTone }[] = [
  { name: 'Invoice Bot', meta: 'Paused since Oct 18', runs: 4, tone: 'ok' },
  { name: 'Meeting Brief', meta: 'Owner: Maya Chen', runs: 31, tone: 'warn' },
  { name: 'Research Writer', meta: 'Owner: Priya Nair', runs: 48, tone: 'info' },
];

/* ------------------------------------------------------------------ */
/* W9-02 · Token & cost                                                 */
/* ------------------------------------------------------------------ */

export interface SpendSummary {
  spent: number;
  budget: number;
  forecast: number;
  /** Value at the right edge of the budget bar. */
  scaleMax: number;
}

export const spendSummary: Record<'onTrack' | 'overBudget', SpendSummary> = {
  onTrack: { spent: 1062, budget: 1400, forecast: 1297, scaleMax: 1505 },
  overBudget: { spent: 1062, budget: 1200, forecast: 1297, scaleMax: 1505 },
};

export const savingTips = [
  { title: 'Move Sales Researcher to Model B', detail: 'Eval score 88% vs 90% today', saving: '−$190/mo' },
  {
    title: 'Cache help-center answers for Support Agent',
    detail: '31% of questions repeat within a day',
    saving: '−$85/mo',
  },
  {
    title: 'Run Nightly cleanup weekly instead of daily',
    detail: 'Finds 2 tickets per night on average',
    saving: '−$12/mo',
  },
];

/** Daily spend in USD per model for October; days 27–31 are the forecast. */
export const dailySpend = {
  labels: Array.from({ length: 31 }, (_, i) => String(i + 1)),
  forecastFrom: 26,
  dailyBudget: 45,
  values: [
    [
      5.5, 6.5, 6.5, 5.5, 2.5, 2.5, 6.5, 7.5, 7.5, 6.5, 7.5, 3.5, 2.5, 7.5, 7.5, 8.5, 7.5, 8.5, 3.5, 2.5, 8.5,
      8.5, 9.5, 8.5, 9.5, 3.5, 7.5, 7.5, 7.5, 7.5, 7.5,
    ],
    [
      19.5, 22.5, 23.5, 21.5, 10.5, 9.5, 24.5, 24.5, 25.5, 24.5, 25.5, 12.5, 11.5, 25.5, 26.5, 27.5, 26.5,
      28.5, 13.5, 12.5, 28.5, 29.5, 29.5, 29.5, 29.5, 13.5, 25.5, 25.5, 25.5, 25.5, 25.5,
    ],
    [
      9.5, 10.5, 11.5, 9.5, 4.5, 3.5, 11.5, 12.5, 13.5, 11.5, 13.5, 5.5, 4.5, 12.5, 13.5, 13.5, 13.5, 14.5,
      6.5, 5.5, 14.5, 14.5, 15.5, 14.5, 15.5, 7.5, 12.5, 12.5, 12.5, 12.5, 12.5,
    ],
  ],
};

/** Relative token volume per hour (0–1), Monday → Sunday. */
export const tokensByHour: { day: string; values: number[] }[] = [
  { day: 'Mon', values: hourShape },
  {
    day: 'Tue',
    values: [
      0.11, 0.1, 0.11, 0.11, 0.1, 0.11, 0.1, 0.06, 0.35, 0.52, 0.79, 0.79, 0.96, 1, 0.84, 0.79, 0.49, 0.32,
      0.06, 0.1, 0.11, 0.1, 0.11, 0.11,
    ],
  },
  {
    day: 'Wed',
    values: [
      0.1, 0.11, 0.1, 0.11, 0.11, 0.1, 0.11, 0.06, 0.32, 0.61, 0.71, 0.94, 0.85, 0.96, 0.99, 0.71, 0.58, 0.29,
      0.06, 0.11, 0.1, 0.11, 0.1, 0.11,
    ],
  },
  {
    day: 'Thu',
    values: [
      0.11, 0.1, 0.11, 0.1, 0.11, 0.11, 0.1, 0.06, 0.29, 0.55, 0.83, 0.84, 1, 0.85, 0.89, 0.83, 0.52, 0.33,
      0.06, 0.11, 0.11, 0.1, 0.11, 0.1,
    ],
  },
  {
    day: 'Fri',
    values: [
      0.11, 0.11, 0.1, 0.11, 0.1, 0.11, 0.11, 0.06, 0.33, 0.49, 0.75, 0.99, 0.91, 1, 0.79, 0.75, 0.61, 0.3,
      0.06, 0.1, 0.11, 0.11, 0.1, 0.11,
    ],
  },
  {
    day: 'Sat',
    values: [
      0.07, 0.07, 0.08, 0.07, 0.07, 0.07, 0.07, 0.06, 0.13, 0.22, 0.24, 0.31, 0.36, 0.31, 0.32, 0.24, 0.21,
      0.15, 0.06, 0.07, 0.07, 0.07, 0.08, 0.07,
    ],
  },
  {
    day: 'Sun',
    values: [
      0.07, 0.07, 0.07, 0.08, 0.07, 0.07, 0.07, 0.06, 0.15, 0.2, 0.28, 0.28, 0.33, 0.36, 0.29, 0.28, 0.19,
      0.14, 0.06, 0.07, 0.07, 0.07, 0.07, 0.08,
    ],
  },
];

export interface CostRow {
  name: string;
  tone: AgentTone;
  runs: number;
  /** Millions of tokens. */
  tokensIn: number;
  tokensOut: number;
  cost: number;
  perRun: number;
  /** Change vs previous period in %, positive = more spend. */
  change: number;
  share?: string;
}

export const costRows: CostRow[] = [
  {
    name: 'Support Agent',
    tone: 'ai',
    runs: 7912,
    tokensIn: 21.4,
    tokensOut: 4.1,
    cost: 582,
    perRun: 0.074,
    change: 31,
    share: '55% of all spend',
  },
  {
    name: 'Sales Researcher',
    tone: 'brand',
    runs: 1204,
    tokensIn: 9.8,
    tokensOut: 1.6,
    cost: 266,
    perRun: 0.221,
    change: 12,
  },
  {
    name: 'Data Analyst',
    tone: 'brand',
    runs: 642,
    tokensIn: 4.6,
    tokensOut: 0.7,
    cost: 126,
    perRun: 0.196,
    change: -4,
  },
  {
    name: 'Ticket triage & reply',
    tone: 'brand',
    runs: 2310,
    tokensIn: 2.9,
    tokensOut: 0.5,
    cost: 53,
    perRun: 0.023,
    change: 8,
  },
];

/* ------------------------------------------------------------------ */
/* W9-03 · Agent performance                                            */
/* ------------------------------------------------------------------ */

export interface AgentPerf {
  name: string;
  tone: AgentTone | 'neutral';
  runs: number;
  success?: number;
  latency?: number;
  costPerRun?: number;
  thumbsUp?: number;
  eval?: number;
  trend?: number[];
  /** Bubble label placement on the scatter plot. */
  labelSide?: 'left' | 'right';
}

export const agentPerformance: AgentPerf[] = [
  {
    name: 'Support Agent',
    tone: 'ai',
    runs: 7912,
    success: 96,
    latency: 2.1,
    costPerRun: 0.074,
    thumbsUp: 91,
    eval: 85,
    trend: [11, 6, 13, 3, 4, 18, 4, 12, 19, 3, 17, 8],
  },
  {
    name: 'Sales Researcher',
    tone: 'brand',
    runs: 1204,
    success: 92,
    latency: 6.8,
    costPerRun: 0.221,
    thumbsUp: 84,
    eval: 88,
    trend: [3, 4, 15, 14, 4, 9, 4, 18, 15, 4, 19, 5],
  },
  {
    name: 'Data Analyst',
    tone: 'warn',
    runs: 642,
    success: 89,
    latency: 7.4,
    costPerRun: 0.196,
    thumbsUp: 79,
    eval: 81,
    trend: [8, 19, 19, 18, 3, 17, 18, 13, 3, 8, 3, 17],
  },
  {
    name: 'Meeting Brief',
    tone: 'info',
    runs: 31,
    success: 97,
    latency: 3.2,
    costPerRun: 0.044,
    thumbsUp: 93,
    eval: 90,
    trend: [4, 9, 13, 4, 18, 4, 18, 10, 18, 6, 3, 19],
    labelSide: 'left',
  },
  {
    name: 'Research Writer',
    tone: 'ok',
    runs: 48,
    success: 86,
    latency: 9.1,
    costPerRun: 0.312,
    thumbsUp: 68,
    eval: 72,
    trend: [17, 19, 7, 12, 4, 17, 3, 17, 3, 19, 7, 15],
  },
  { name: 'Invoice Bot', tone: 'neutral', runs: 4 },
];

/** Agents whose thumbs-up rate falls below this are flagged. */
export const thumbsUpAlert = 70;

/* ------------------------------------------------------------------ */
/* W9-04 · Feedback                                                     */
/* ------------------------------------------------------------------ */

export type FeedbackReason = 'Wrong' | 'Not helpful' | 'Too slow' | 'Unsafe' | 'Other';

export const feedbackReasons: { label: FeedbackReason; value: number }[] = [
  { label: 'Wrong', value: 31 },
  { label: 'Not helpful', value: 18 },
  { label: 'Too slow', value: 9 },
  { label: 'Unsafe', value: 2 },
  { label: 'Other', value: 6 },
];

export interface FeedbackItem {
  id: string;
  sentiment: 'negative' | 'positive';
  reason?: FeedbackReason;
  author: string;
  agent: string;
  when: string;
  answer: string;
  comment: string;
  reviewed: boolean;
  chatDeleted?: boolean;
}

export const feedbackItems: FeedbackItem[] = [
  {
    id: 'fb-1',
    sentiment: 'negative',
    reason: 'Wrong',
    author: people.sofia.name,
    agent: 'Support Agent',
    when: '2 h ago',
    answer: '“Sorry, refunds are only possible within 30 days of purchase, so this order isn’t eligible.”',
    comment: '“Damaged items have 60 days. Customer was right.”',
    reviewed: false,
  },
  {
    id: 'fb-2',
    sentiment: 'negative',
    reason: 'Too slow',
    author: people.daniel.name,
    agent: 'Data Analyst',
    when: 'Yesterday',
    answer: '“Here’s the chart of Q3 refunds by region… (took 41 s)”',
    comment: '“Took ages for a 2 MB CSV.”',
    reviewed: false,
  },
  {
    id: 'fb-3',
    sentiment: 'negative',
    reason: 'Not helpful',
    author: 'Former member',
    agent: 'Support Agent',
    when: 'Oct 23',
    answer: '“You can cancel any time from Settings → Billing.”',
    comment: '“Didn’t say what happens to my data.”',
    reviewed: true,
    chatDeleted: true,
  },
  {
    id: 'fb-4',
    sentiment: 'positive',
    author: people.leo.name,
    agent: 'Support Agent',
    when: '3 h ago',
    answer: '“I’ve drafted the refund for order #4821 and sent it to you for approval.”',
    comment: '“Exactly what I needed, and it asked first.”',
    reviewed: false,
  },
  {
    id: 'fb-5',
    sentiment: 'positive',
    author: people.priya.name,
    agent: 'Sales Researcher',
    when: 'Oct 24',
    answer: '“Here are five Acme Co. contacts who joined in the last quarter, with sources.”',
    comment: '“Sources made this easy to trust.”',
    reviewed: true,
  },
];

/* ------------------------------------------------------------------ */
/* W9-05 · Latency & reliability                                        */
/* ------------------------------------------------------------------ */

export const latencyKpis: Record<RangeKey, Kpi[]> = {
  today: [
    { label: 'Latency p50', value: '1.9 s', delta: '↓ 0.1 s', tone: 'ok' },
    { label: 'Latency p95', value: '5.3 s', delta: '↑ 0.1 s', tone: 'neutral' },
    { label: 'Time to first token', value: '0.6 s', delta: '— 0.0 s', tone: 'neutral' },
    { label: 'Failure rate', value: '0.9%', delta: '↓ 0.2 pts · 0 incidents', tone: 'ok' },
  ],
  '7d': [
    { label: 'Latency p50', value: '2.3 s', delta: '↑ 0.3 s', tone: 'warn' },
    { label: 'Latency p95', value: '7.2 s', delta: '↑ 1.6 s', tone: 'warn' },
    { label: 'Time to first token', value: '0.7 s', delta: '↑ 0.1 s', tone: 'neutral' },
    { label: 'Failure rate', value: '2.6%', delta: '↑ 1.4 pts · 1 incident', tone: 'warn' },
  ],
  '30d': [
    { label: 'Latency p50', value: '2.0 s', delta: '↑ 0.1 s', tone: 'neutral' },
    { label: 'Latency p95', value: '5.6 s', delta: '↑ 0.4 s', tone: 'warn' },
    { label: 'Time to first token', value: '0.6 s', delta: '↓ 0.1 s', tone: 'ok' },
    { label: 'Failure rate', value: '1.4%', delta: '↑ 0.3 pts · 2 incidents', tone: 'warn' },
  ],
  '90d': [
    { label: 'Latency p50', value: '2.1 s', delta: '↓ 0.2 s', tone: 'ok' },
    { label: 'Latency p95', value: '5.9 s', delta: '↓ 0.3 s', tone: 'ok' },
    { label: 'Time to first token', value: '0.7 s', delta: '↓ 0.2 s', tone: 'ok' },
    { label: 'Failure rate', value: '1.2%', delta: '↓ 0.1 pts · 4 incidents', tone: 'ok' },
  ],
  custom: [
    { label: 'Latency p50', value: '2.0 s', delta: '↑ 0.1 s', tone: 'neutral' },
    { label: 'Latency p95', value: '5.6 s', delta: '↑ 0.4 s', tone: 'warn' },
    { label: 'Time to first token', value: '0.6 s', delta: '↓ 0.1 s', tone: 'ok' },
    { label: 'Failure rate', value: '1.4%', delta: '↑ 0.3 pts · 2 incidents', tone: 'warn' },
  ],
};

export const latencySeries = {
  p50: [
    1.9, 2, 1.9, 2.1, 1.8, 1.8, 2, 2.1, 2, 1.9, 2, 1.8, 1.9, 2.1, 2.2, 2.1, 2, 2.3, 2.1, 3.4, 3.1, 2.2, 2,
    2.1, 2, 1.9,
  ],
  p95: [
    5.1, 5.4, 5.2, 5.6, 4.9, 4.8, 5.3, 5.6, 5.5, 5.2, 5.4, 4.9, 5, 5.7, 5.9, 5.8, 5.4, 6.2, 5.8, 11.8, 10.2,
    6.1, 5.6, 5.7, 5.5, 5.3,
  ],
};

/** The SEV1 window highlighted on the latency chart. */
export const latencyIncident = { from: 'Oct 20', to: 'Oct 21', label: 'SEV1 · Model B timeouts' };

/** Failures per day: model timeout, tool error, guardrail. */
export const failuresByCause = [
  [4, 3, 5, 4, 2, 2, 5, 4, 3, 4, 5, 2, 2, 4, 5, 4, 3, 5, 4, 21, 17, 5, 4, 4, 6, 5],
  [2, 2, 1, 3, 1, 1, 2, 2, 2, 1, 2, 1, 0, 2, 3, 2, 2, 2, 1, 3, 2, 2, 2, 1, 9, 12],
  [1, 1, 2, 1, 0, 1, 1, 2, 1, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 2, 2, 1, 1, 2, 1, 1],
];

const allUp = Array.from({ length: 30 }, () => true);
const downOn = (days: number[]) => allUp.map((_, i) => !days.includes(i));

export const uptime: { name: string; days: boolean[]; uptime: string }[] = [
  { name: 'Model B Balanced', days: downOn([19, 20]), uptime: '99.71%' },
  { name: 'Model C Deep', days: allUp, uptime: '99.98%' },
  { name: 'Helpbase', days: allUp, uptime: '100%' },
  { name: 'Pipeline CRM', days: downOn([28, 29]), uptime: '98.10%' },
  { name: 'Shopdesk', days: allUp, uptime: '99.94%' },
];

export const slowestSteps: { step: string; owner: string; avg: number; p95: number }[] = [
  { step: 'web.search', owner: 'Sales Researcher', avg: 3.9, p95: 8.4 },
  { step: 'model', owner: 'Model C Deep', avg: 3.2, p95: 7.1 },
  { step: 'files.parse', owner: 'Data Analyst', avg: 2.8, p95: 9.6 },
  { step: 'orders.refund', owner: 'Support Agent', avg: 1.4, p95: 3 },
  { step: 'docs.search', owner: 'all agents', avg: 0.7, p95: 1.3 },
];

/** p95 above this many seconds is flagged in the slowest-steps table. */
export const slowStepThreshold = 8;

/** Mock data for the Runs, approvals & monitoring epic (W6). All names and brands are fictional. */
import { people } from '@/data/people';

/* ------------------------------------------------------------------ */
/* Runs list (W6-01)                                                   */
/* ------------------------------------------------------------------ */

export type RunState = 'running' | 'waiting' | 'succeeded' | 'failed' | 'cancelled';

export interface RunRow {
  id: string;
  source: string;
  kind: 'Chat' | 'Workflow';
  /** Second line under the source name, e.g. `v5` or the chat title. */
  detail: string;
  triggeredBy: string;
  /** Italic "former member" style trigger. */
  triggerMuted?: boolean;
  status: RunState;
  /** 0–100, only for running rows. */
  progress?: number;
  started: string;
  duration: string;
  steps: number;
  tokens: string;
  cost: number;
  /** Shown when a failed row is expanded. */
  error?: { message: string; step: string; code: string };
}

export const runRows: RunRow[] = [
  {
    id: 'run_4836',
    source: 'Support Agent',
    kind: 'Chat',
    detail: '“Where is order 50112?”',
    triggeredBy: 'Sofia Rossi',
    status: 'running',
    progress: 45,
    started: 'Just now',
    duration: '4 s',
    steps: 3,
    tokens: '1.2K',
    cost: 0.004,
  },
  {
    id: 'run_4835',
    source: 'Ticket triage & reply',
    kind: 'Workflow',
    detail: 'v5',
    triggeredBy: 'On new ticket',
    status: 'waiting',
    started: '14 min ago',
    duration: '14 min',
    steps: 4,
    tokens: '2.1K',
    cost: 0.011,
  },
  {
    id: 'run_4834',
    source: 'Weekly sales recap',
    kind: 'Workflow',
    detail: 'v2',
    triggeredBy: 'Every weekday 9 AM',
    status: 'failed',
    started: '22 min ago',
    duration: '6.1 s',
    steps: 5,
    tokens: '3.4K',
    cost: 0.021,
    error: {
      message: 'Pipeline CRM disconnected · token expired Oct 24',
      step: 'Step 2 · Fetch deals',
      code: 'CRM_401_TOKEN_EXPIRED',
    },
  },
  {
    id: 'run_4833',
    source: 'Ticket triage & reply',
    kind: 'Workflow',
    detail: 'v5',
    triggeredBy: 'On new ticket',
    status: 'failed',
    started: '31 min ago',
    duration: '3.8 s',
    steps: 6,
    tokens: '2.6K',
    cost: 0.014,
    error: {
      message: 'Pipeline CRM rejected the request: missing field ‘email’',
      step: 'Step 5 · Log to CRM',
      code: 'CRM_400_FIELD_REQUIRED',
    },
  },
  {
    id: 'run_4832',
    source: 'Lead enrichment',
    kind: 'Workflow',
    detail: 'v3',
    triggeredBy: 'Webhook /leads',
    status: 'succeeded',
    started: '38 min ago',
    duration: '2.2 s',
    steps: 4,
    tokens: '980',
    cost: 0.006,
  },
  {
    id: 'run_4831',
    source: 'Sales Researcher',
    kind: 'Chat',
    detail: '“Brief on Harbor Studio”',
    triggeredBy: 'Daniel Okafor',
    status: 'succeeded',
    started: '44 min ago',
    duration: '18.4 s',
    steps: 9,
    tokens: '12.8K',
    cost: 0.142,
  },
  {
    id: 'run_4830',
    source: 'Support Agent',
    kind: 'Chat',
    detail: '“Refund for Acme Co.”',
    triggeredBy: 'Sofia Rossi',
    status: 'succeeded',
    started: '1 h ago',
    duration: '7.4 s',
    steps: 5,
    tokens: '3.1K',
    cost: 0.04,
  },
  {
    id: 'run_4829',
    source: 'Invoice reconciliation',
    kind: 'Workflow',
    detail: 'draft',
    triggeredBy: 'Former member',
    triggerMuted: true,
    status: 'cancelled',
    started: '2 h ago',
    duration: '—',
    steps: 2,
    tokens: '410',
    cost: 0.002,
  },
  {
    id: 'run_4828',
    source: 'Nightly ticket cleanup',
    kind: 'Workflow',
    detail: 'v1',
    triggeredBy: 'Every day 2 AM',
    status: 'succeeded',
    started: 'Today, 2:00 AM',
    duration: '41 s',
    steps: 3,
    tokens: '640',
    cost: 0.004,
  },
  {
    id: 'run_4827',
    source: 'Support Agent',
    kind: 'Chat',
    detail: '“Change my delivery address”',
    triggeredBy: 'Sofia Rossi',
    status: 'succeeded',
    started: 'Today, 1:48 AM',
    duration: '5.2 s',
    steps: 4,
    tokens: '1.9K',
    cost: 0.009,
  },
  {
    id: 'run_4826',
    source: 'Support Agent',
    kind: 'Chat',
    detail: '“Update card on file”',
    triggeredBy: 'Sofia Rossi',
    status: 'succeeded',
    started: 'Yesterday, 11:32 PM',
    duration: '3.1 s',
    steps: 3,
    tokens: '1.1K',
    cost: 0.005,
  },
  {
    id: 'run_4825',
    source: 'Lead enrichment',
    kind: 'Workflow',
    detail: 'v3',
    triggeredBy: 'Webhook /leads',
    status: 'succeeded',
    started: 'Yesterday, 10:05 PM',
    duration: '2.4 s',
    steps: 4,
    tokens: '1.0K',
    cost: 0.006,
  },
  {
    id: 'run_4824',
    source: 'Ticket triage & reply',
    kind: 'Workflow',
    detail: 'v5',
    triggeredBy: 'On new ticket',
    status: 'succeeded',
    started: 'Yesterday, 9:40 PM',
    duration: '4.6 s',
    steps: 6,
    tokens: '2.4K',
    cost: 0.012,
  },
  {
    id: 'run_4823',
    source: 'Sales Researcher',
    kind: 'Chat',
    detail: '“Compare Pinecrest and Acme”',
    triggeredBy: 'Daniel Okafor',
    status: 'succeeded',
    started: 'Yesterday, 6:12 PM',
    duration: '21.0 s',
    steps: 11,
    tokens: '14.2K',
    cost: 0.158,
  },
  {
    id: 'run_4822',
    source: 'Weekly sales recap',
    kind: 'Workflow',
    detail: 'v2',
    triggeredBy: 'Every weekday 9 AM',
    status: 'succeeded',
    started: 'Yesterday, 9:00 AM',
    duration: '5.8 s',
    steps: 5,
    tokens: '3.2K',
    cost: 0.019,
  },
  {
    id: 'run_4821',
    source: 'Support Agent',
    kind: 'Chat',
    detail: '“Is the lamp back in stock?”',
    triggeredBy: 'Sofia Rossi',
    status: 'cancelled',
    started: 'Yesterday, 8:51 AM',
    duration: '—',
    steps: 1,
    tokens: '220',
    cost: 0.001,
  },
  {
    id: 'run_4820',
    source: 'Nightly ticket cleanup',
    kind: 'Workflow',
    detail: 'v1',
    triggeredBy: 'Every day 2 AM',
    status: 'succeeded',
    started: 'Yesterday, 2:00 AM',
    duration: '38 s',
    steps: 3,
    tokens: '610',
    cost: 0.004,
  },
  {
    id: 'run_4819',
    source: 'Invoice reconciliation',
    kind: 'Workflow',
    detail: 'v1',
    triggeredBy: 'Leo Martins',
    status: 'succeeded',
    started: 'Oct 27, 5:30 PM',
    duration: '12.7 s',
    steps: 7,
    tokens: '5.6K',
    cost: 0.031,
  },
];

/** Total runs in the workspace — the mock list only holds the first pages. */
export const totalRuns = 12480;

/** Route for a run row: failed runs open the failure view, everything else the timeline. */
export const runHref = (run: Pick<RunRow, 'status'>) =>
  run.status === 'failed' ? '/runs/run_4833' : '/runs/run_4835';

/* ------------------------------------------------------------------ */
/* Run detail timeline (W6-02)                                         */
/* ------------------------------------------------------------------ */

export type StepState = 'done' | 'waiting' | 'pending' | 'failed';

/** Colour key of the step type (trigger, model, tool, condition …). */
export type StepKind = 'trigger' | 'ai' | 'tool' | 'condition' | 'approval' | 'action';

export interface TimelineStep {
  id: string;
  name: string;
  kind: StepKind;
  state: StepState;
  /** Child rows (tool calls inside a step) are indented and set in mono. */
  child?: boolean;
  /** Bar position on the 0–20 s axis, in %. */
  offset: number;
  width: number;
  duration: string;
  output?: string;
}

export const runDetailSteps: TimelineStep[] = [
  {
    id: 'trigger',
    name: 'New support ticket',
    kind: 'trigger',
    state: 'done',
    offset: 0,
    width: 1,
    duration: '0.2 s',
    output:
      '{\n  "ticket_id": 9874,\n  "channel": "email",\n  "from": "dana.whitfield@acme.example",\n  "subject": "Charged twice for order 48213"\n}',
  },
  {
    id: 'classify',
    name: 'Classify ticket',
    kind: 'ai',
    state: 'done',
    offset: 1,
    width: 10.5,
    duration: '2.1 s',
    output:
      '{\n  "priority": "urgent",\n  "confidence": 0.91,\n  "summary": "Customer charged twice for order 48213, wants refund",\n  "suggested_reply": "Hi Dana, sorry about the double charge…"\n}',
  },
  {
    id: 'docs',
    name: 'docs.search',
    kind: 'tool',
    state: 'done',
    child: true,
    offset: 2.5,
    width: 3.5,
    duration: '0.7 s',
    output: '{\n  "chunks": 3,\n  "top_score": 0.91,\n  "source": "Refund policy 2026.pdf"\n}',
  },
  {
    id: 'model',
    name: 'model · Model B Balanced',
    kind: 'ai',
    state: 'done',
    child: true,
    offset: 6,
    width: 5,
    duration: '1.0 s',
    output: '{\n  "input_tokens": 1120,\n  "output_tokens": 296,\n  "finish_reason": "stop"\n}',
  },
  {
    id: 'condition',
    name: 'If urgent → Yes',
    kind: 'condition',
    state: 'done',
    offset: 11.5,
    width: 0.8,
    duration: '0.1 s',
    output: '{\n  "branch": "yes",\n  "priority": "urgent"\n}',
  },
  {
    id: 'approval',
    name: 'Support lead approves',
    kind: 'approval',
    state: 'waiting',
    offset: 12,
    width: 88,
    duration: '14 min',
  },
  {
    id: 'reply',
    name: 'Reply to customer',
    kind: 'tool',
    state: 'pending',
    offset: 0,
    width: 0.8,
    duration: '—',
  },
  { id: 'crm', name: 'Log to CRM', kind: 'action', state: 'pending', offset: 0, width: 0.8, duration: '—' },
];

/* ------------------------------------------------------------------ */
/* Step trace (W6-03)                                                  */
/* ------------------------------------------------------------------ */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Strings starting with this marker are rendered as masked policy values. */
export const MASK = '\u0000mask:';

export interface TraceStep {
  id: string;
  name: string;
  state: StepState;
  child?: boolean;
  duration: string;
  input?: JsonValue;
  output?: JsonValue;
  prompt?: string;
  metadata?: [string, string][];
  logs?: string[];
  chunks?: { score: number; source: string; text: string }[];
}

export const traceSteps: TraceStep[] = [
  {
    id: 'trigger',
    name: 'New support ticket',
    state: 'done',
    duration: '0.2 s',
    input: { ticket_id: 9874, channel: 'email', subject: 'Charged twice for order 48213' },
    output: { accepted: true, queued_at: '09:28:02' },
    metadata: [
      ['Type', 'Trigger · Helpbase'],
      ['Started', '9:28:02 AM'],
      ['Retries', '0'],
    ],
    logs: ['09:28:02.114 INFO  Ticket #9874 received from Helpbase'],
  },
  {
    id: 'classify',
    name: 'Classify ticket',
    state: 'done',
    duration: '2.1 s',
    input: { ticket_id: 9874, body: 'Hi, I was charged twice for order 48213…' },
    output: {
      priority: 'urgent',
      confidence: 0.91,
      summary: 'Customer charged twice for order 48213, wants refund',
    },
    prompt:
      'Classify the ticket by priority (low, normal, urgent) and draft a short reply. Cite the refund policy when money is involved.',
    metadata: [
      ['Type', 'Agent step · Support Agent'],
      ['Model', 'Model B Balanced'],
      ['Tokens', '1,416'],
      ['Cost', '$0.006'],
    ],
    logs: ['09:28:02.320 INFO  Step started', '09:28:04.401 INFO  Step finished · urgent (0.91)'],
  },
  {
    id: 'docs',
    name: 'docs.search',
    state: 'done',
    child: true,
    duration: '0.7 s',
    input: {
      query: 'refund double charge order 48213',
      top_k: 5,
      customer: {
        name: 'Dana Whitfield',
        email: 'dana.whitfield@acme.example',
        card: `${MASK}•••• card ending 4417`,
      },
      filters: { collection: 'policies', language: 'en' },
    },
    output: { chunks: 3, top_score: 0.91, latency_ms: 684 },
    metadata: [
      ['Tool', 'docs.search'],
      ['Collection', 'Support policies'],
      ['Latency', '684 ms'],
      ['Cache', 'Miss'],
    ],
    logs: ['09:28:02.512 DEBUG docs.search top_k=5', '09:28:03.196 DEBUG 3 chunks above 0.6'],
    chunks: [
      {
        score: 0.91,
        source: 'Refund policy 2026.pdf · p. 2',
        text: 'Duplicate charges are always refunded in full to the original payment method, regardless of the 30-day window.',
      },
      {
        score: 0.84,
        source: 'Help center · Refund timing',
        text: 'Refunds usually reach the customer’s card in 3–5 business days.',
      },
      {
        score: 0.62,
        source: 'Help center · Billing FAQ',
        text: 'If you see two charges, one may be a pending authorisation that drops off within 48 hours.',
      },
    ],
  },
  {
    id: 'model',
    name: 'model call',
    state: 'done',
    child: true,
    duration: '1.0 s',
    input: { model: 'Model B Balanced', temperature: 0.2, messages: 4 },
    output: { input_tokens: 1120, output_tokens: 296, finish_reason: 'stop' },
    prompt: 'You are Support Agent for Northwind Labs. Answer using the retrieved policy chunks only.',
    metadata: [
      ['Model', 'Model B Balanced'],
      ['Input tokens', '1,120'],
      ['Output tokens', '296'],
    ],
    logs: ['09:28:03.210 DEBUG model call · Model B · 1,120 in / 296 out'],
  },
  {
    id: 'condition',
    name: 'If urgent',
    state: 'done',
    duration: '0.1 s',
    input: { priority: 'urgent' },
    output: { branch: 'yes' },
    metadata: [
      ['Type', 'Condition'],
      ['Rule', 'priority = urgent'],
    ],
    logs: ['09:28:04.512 DEBUG Condition “If urgent” → Yes'],
  },
  { id: 'approval', name: 'Support lead approves', state: 'waiting', duration: '14 min' },
  { id: 'reply', name: 'Reply to customer', state: 'pending', duration: '—' },
  { id: 'crm', name: 'Log to CRM', state: 'pending', duration: '—' },
];

/* ------------------------------------------------------------------ */
/* Failed run (W6-04)                                                  */
/* ------------------------------------------------------------------ */

export const failedSteps: { name: string; state: StepState; duration: string }[] = [
  { name: 'New support ticket', state: 'done', duration: '0.2 s' },
  { name: 'Classify ticket', state: 'done', duration: '2.0 s' },
  { name: 'If urgent → No', state: 'done', duration: '0.1 s' },
  { name: 'Reply to customer', state: 'done', duration: '1.2 s' },
  { name: 'Log to CRM', state: 'failed', duration: '0.4 s' },
];

/* ------------------------------------------------------------------ */
/* Approvals (W6-05, W6-06)                                            */
/* ------------------------------------------------------------------ */

export type Risk = 'high' | 'medium' | 'low';

export interface ApprovalRequest {
  id: string;
  title: string;
  context: string;
  risk: Risk;
  waiting: string;
  expires: string;
  /** Who it is waiting for — "me" is the signed-in reviewer. */
  assignee: 'me' | 'others';
  decided?: 'Approved' | 'Rejected' | 'Expired';
}

export const approvals: ApprovalRequest[] = [
  {
    id: 'apr_238',
    title: 'Delete 1,204 inactive contacts from Pipeline CRM',
    context: 'Data Cleaner · Nightly CRM cleanup workflow',
    risk: 'high',
    waiting: '2 h 10 min',
    expires: '21 h 50 min',
    assignee: 'me',
  },
  {
    id: 'apr_240',
    title: 'Send refund of $240 to Acme Co.',
    context: 'Support Agent · asked by Sofia Rossi in chat',
    risk: 'medium',
    waiting: '14 min',
    expires: '1 h 46 min',
    assignee: 'me',
  },
  {
    id: 'apr_241',
    title: 'Reply to Harbor Studio about a shipping delay',
    context: 'Support Agent · Ticket triage & reply',
    risk: 'low',
    waiting: '6 min',
    expires: '1 h 54 min',
    assignee: 'me',
  },
  {
    id: 'apr_242',
    title: 'Tag 38 tickets as “billing”',
    context: 'Support Agent · Ticket triage & reply',
    risk: 'low',
    waiting: '3 min',
    expires: '40 min',
    assignee: 'me',
  },
  {
    id: 'apr_236',
    title: 'Pause the Weekly sales recap schedule',
    context: 'Sales Researcher · asked by Daniel Okafor',
    risk: 'medium',
    waiting: '3 h 02 min',
    expires: '20 h 58 min',
    assignee: 'others',
  },
  {
    id: 'apr_237',
    title: 'Email 214 trial users about the new plan',
    context: 'Lead enrichment · Webhook /leads',
    risk: 'high',
    waiting: '2 h 40 min',
    expires: '21 h 20 min',
    assignee: 'others',
  },
  {
    id: 'apr_239',
    title: 'Issue $45 store credit to Pinecrest',
    context: 'Support Agent · asked by Sofia Rossi in chat',
    risk: 'low',
    waiting: '1 h 12 min',
    expires: '48 min',
    assignee: 'others',
  },
  {
    id: 'apr_243',
    title: 'Close 12 duplicate tickets',
    context: 'Nightly ticket cleanup · v1',
    risk: 'low',
    waiting: '2 min',
    expires: '1 h 58 min',
    assignee: 'others',
  },
  {
    id: 'apr_244',
    title: 'Update billing address for Acme Co.',
    context: 'Support Agent · asked by Dana Whitfield',
    risk: 'medium',
    waiting: '1 min',
    expires: '1 h 59 min',
    assignee: 'others',
  },
  {
    id: 'apr_231',
    title: 'Refund $18 to Pinecrest',
    context: 'Support Agent · Ticket triage & reply',
    risk: 'low',
    waiting: '—',
    expires: '—',
    assignee: 'me',
    decided: 'Approved',
  },
  {
    id: 'apr_229',
    title: 'Delete 86 bounced leads',
    context: 'Data Cleaner · Nightly CRM cleanup workflow',
    risk: 'high',
    waiting: '—',
    expires: '—',
    assignee: 'me',
    decided: 'Rejected',
  },
  {
    id: 'apr_227',
    title: 'Send renewal reminder to Helpbase',
    context: 'Sales Researcher · asked by Daniel Okafor',
    risk: 'low',
    waiting: '—',
    expires: '—',
    assignee: 'others',
    decided: 'Expired',
  },
];

export const approvalDiff: { field: string; before: string; after: string; struck?: boolean }[] = [
  { field: 'Order', before: '#48213', after: '#48213' },
  { field: 'Refunded', before: '$0.00', after: '$240.00', struck: true },
  { field: 'To', before: '—', after: 'Visa ending 6411' },
  { field: 'Reason', before: '—', after: 'Duplicate charge on Oct 22' },
];

/* ------------------------------------------------------------------ */
/* Live logs (W6-07)                                                   */
/* ------------------------------------------------------------------ */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogLine {
  id: number;
  time: string;
  level: LogLevel;
  source: string;
  message: string;
}

export const initialLogs: Omit<LogLine, 'id'>[] = [
  {
    time: '09:42:14.218',
    level: 'ERROR',
    source: 'Ticket triage & reply',
    message: 'Log to CRM failed: CRM_400_FIELD_REQUIRED (email) · run_4833',
  },
  {
    time: '09:42:14.102',
    level: 'INFO',
    source: 'Support Agent',
    message: 'Reply sent to ticket #9871 · 312 tokens · $0.003',
  },
  {
    time: '09:42:13.871',
    level: 'DEBUG',
    source: 'Support Agent',
    message: 'docs.search top_k=5 · 3 chunks above 0.6',
  },
  {
    time: '09:42:13.540',
    level: 'INFO',
    source: 'Lead enrichment',
    message: 'Webhook /leads received · lead_id=L-20931',
  },
  {
    time: '09:42:12.995',
    level: 'WARN',
    source: 'Sales Researcher',
    message: 'web.search slow response · 4.8 s (p95 is 2.1 s)',
  },
  {
    time: '09:42:12.410',
    level: 'INFO',
    source: 'Ticket triage & reply',
    message: 'Approval requested from Leo Martins · run_4835',
  },
  {
    time: '09:42:12.002',
    level: 'DEBUG',
    source: 'Ticket triage & reply',
    message: 'Condition “If urgent” → Yes (priority=urgent)',
  },
  {
    time: '09:42:11.776',
    level: 'INFO',
    source: 'Support Agent',
    message: 'Chat started by Sofia Rossi · run_4836',
  },
  {
    time: '09:42:11.320',
    level: 'WARN',
    source: 'Guardrails',
    message: 'Blocked output: contained a card number · run_4826',
  },
  {
    time: '09:42:10.904',
    level: 'INFO',
    source: 'Nightly ticket cleanup',
    message: 'Closed 14 stale tickets',
  },
  {
    time: '09:42:10.511',
    level: 'DEBUG',
    source: 'Lead enrichment',
    message: 'crm.lookup company=“Harbor Studio” · hit',
  },
  {
    time: '09:42:09.988',
    level: 'ERROR',
    source: 'Weekly sales recap',
    message: 'Pipeline CRM disconnected · token expired Oct 24',
  },
  {
    time: '09:42:09.402',
    level: 'INFO',
    source: 'Support Agent',
    message: 'Feedback 👍 from Sofia Rossi · run_4830',
  },
  {
    time: '09:42:08.770',
    level: 'DEBUG',
    source: 'Support Agent',
    message: 'model call · Model B · 1,120 in / 296 out',
  },
  {
    time: '09:42:08.115',
    level: 'INFO',
    source: 'Ticket triage & reply',
    message: 'Started from ticket #9874 · run_4835',
  },
  { time: '09:42:07.660', level: 'WARN', source: 'Billing', message: 'Workspace at 81% of monthly credits' },
];

/** Pool the live stream cycles through to simulate new traffic. */
export const streamPool: Omit<LogLine, 'id' | 'time'>[] = [
  { level: 'INFO', source: 'Support Agent', message: 'Reply sent to ticket #9875 · 288 tokens · $0.003' },
  { level: 'DEBUG', source: 'Support Agent', message: 'docs.search top_k=5 · 4 chunks above 0.6' },
  { level: 'INFO', source: 'Lead enrichment', message: 'Webhook /leads received · lead_id=L-20932' },
  { level: 'DEBUG', source: 'Lead enrichment', message: 'crm.lookup company=“Pinecrest” · miss' },
  { level: 'WARN', source: 'Sales Researcher', message: 'web.search slow response · 3.9 s (p95 is 2.1 s)' },
  { level: 'INFO', source: 'Ticket triage & reply', message: 'Started from ticket #9876 · run_4837' },
  {
    level: 'DEBUG',
    source: 'Ticket triage & reply',
    message: 'Condition “If urgent” → No (priority=normal)',
  },
  {
    level: 'ERROR',
    source: 'Ticket triage & reply',
    message: 'Log to CRM failed: CRM_400_FIELD_REQUIRED (email) · run_4837',
  },
  { level: 'INFO', source: 'Support Agent', message: 'Chat started by Sofia Rossi · run_4838' },
  { level: 'DEBUG', source: 'Support Agent', message: 'model call · Model B · 980 in / 214 out' },
  { level: 'WARN', source: 'Guardrails', message: 'Redacted an email address in output · run_4838' },
  { level: 'INFO', source: 'Nightly ticket cleanup', message: 'Scheduled for 2:00 AM tomorrow' },
];

export const logSources = [
  'All sources',
  'Support Agent',
  'Sales Researcher',
  'Ticket triage & reply',
  'Lead enrichment',
  'Weekly sales recap',
  'Nightly ticket cleanup',
  'Guardrails',
  'Billing',
];

/* ------------------------------------------------------------------ */
/* Alert rules (W6-08)                                                 */
/* ------------------------------------------------------------------ */

export type AlertChannel = 'In-app' | 'Email' | 'Chat app' | 'Webhook';

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  scope: string;
  channels: AlertChannel[];
  /** Channel that needs reconnecting. */
  disconnected?: AlertChannel;
  status: 'active' | 'noisy' | 'muted';
  mutedUntil?: string;
  lastTriggered: string;
  enabled: boolean;
}

export const alertRules: AlertRule[] = [
  {
    id: 'failure-rate',
    name: 'Failure rate spike',
    condition: 'failure_rate > 5% · 15 min',
    scope: 'All agents & workflows',
    channels: ['In-app', 'Email'],
    status: 'active',
    lastTriggered: '2 h ago',
    enabled: true,
  },
  {
    id: 'slow-answers',
    name: 'Slow answers',
    condition: 'latency_p95 > 8 s · 10 min',
    scope: 'Support Agent',
    channels: ['Chat app'],
    status: 'active',
    lastTriggered: 'Oct 22',
    enabled: true,
  },
  {
    id: 'daily-spend',
    name: 'Daily spend',
    condition: 'spend_per_day > $40',
    scope: 'Workspace',
    channels: ['Email'],
    status: 'active',
    lastTriggered: 'Yesterday',
    enabled: true,
  },
  {
    id: 'approvals-waiting',
    name: 'Approvals waiting',
    condition: 'pending_approval_age > 1 h',
    scope: 'All reviewers',
    channels: ['In-app'],
    status: 'noisy',
    lastTriggered: '40 times today',
    enabled: true,
  },
  {
    id: 'guardrail-blocks',
    name: 'Guardrail blocks',
    condition: 'guardrail_blocks > 10 · 1 h',
    scope: 'All agents',
    channels: ['Webhook'],
    disconnected: 'Webhook',
    status: 'active',
    lastTriggered: 'Oct 19',
    enabled: true,
  },
  {
    id: 'after-hours',
    name: 'After-hours failures',
    condition: 'failures > 0 · 22:00–07:00',
    scope: 'Workflows',
    channels: ['Email'],
    status: 'muted',
    mutedUntil: '8 AM',
    lastTriggered: 'Today, 2:04 AM',
    enabled: false,
  },
];

export const alertMetrics = [
  { value: 'spend_per_day', label: 'Spend per day', unit: '$' },
  { value: 'failure_rate', label: 'Failure rate', unit: '%' },
  { value: 'latency_p95', label: 'Latency p95', unit: 's' },
  { value: 'guardrail_blocks', label: 'Guardrail blocks', unit: '#' },
];

export const alertWindows = ['15 min', '1 h', '1 day', '7 days'];
export const alertScopes = ['Sales Researcher', 'Support Agent', 'All agents & workflows', 'Workspace'];

/* ------------------------------------------------------------------ */
/* Incidents (W6-09)                                                   */
/* ------------------------------------------------------------------ */

export type IncidentStatus = 'Open' | 'Investigating' | 'Reopened' | 'Resolved';

export interface IncidentEvent {
  time: string;
  author: string;
  text: string;
  tone: 'brand' | 'warn' | 'danger' | 'muted';
}

export interface Incident {
  id: string;
  sev: 'SEV1' | 'SEV2' | 'SEV3';
  status: IncidentStatus;
  title: string;
  when: string;
  runs: number;
  affected: string;
  owner?: { name: string; avatar?: string };
  /** Shown instead of the owner avatar when nobody picked it up yet. */
  unownedFor?: string;
  started: string;
  /** Failed runs per 15-minute bucket. */
  buckets: number[];
  range: [string, string, string];
  rangeLabel: string;
  rootCause: { text: string; code?: [string, string]; edited: string } | null;
  timeline: IncidentEvent[];
}

export const incidents: Incident[] = [
  {
    id: 'inc_31',
    sev: 'SEV2',
    status: 'Investigating',
    title: 'CRM rejects notes: missing ‘email’',
    when: '9:41 AM',
    runs: 12,
    affected: 'Ticket triage & reply',
    owner: people.priya,
    started: 'Today, 9:41 AM',
    buckets: [0, 0, 1, 0, 3, 5, 2, 1, 0, 0],
    range: ['9:00', '10:15', '11:30'],
    rangeLabel: '9:00 – 11:30 AM',
    rootCause: {
      text: 'Helpbase renamed {0} to {1} on Oct 25. The Log to CRM step still maps the old field.',
      code: ['ticket.email', 'ticket.customer_email'],
      edited: 'Edited by Priya Nair · 10 min ago',
    },
    timeline: [
      {
        time: '11:02 AM',
        author: 'Priya Nair',
        text: 'Fixed the field mapping in v6 draft. Testing now.',
        tone: 'brand',
      },
      {
        time: '10:20 AM',
        author: 'Priya Nair',
        text: 'Took ownership and set status to Investigating.',
        tone: 'warn',
      },
      {
        time: '9:56 AM',
        author: 'Alert · Failure rate spike',
        text: 'Failure rate reached 18% over 15 min. Sent to In-app and Email.',
        tone: 'danger',
      },
      {
        time: '9:41 AM',
        author: 'Northwind',
        text: 'Opened automatically after 3 runs failed with the same error.',
        tone: 'muted',
      },
      {
        time: '9:38 AM',
        author: 'Pipeline CRM',
        text: 'First CRM_400_FIELD_REQUIRED error on run_4801.',
        tone: 'danger',
      },
    ],
  },
  {
    id: 'inc_30',
    sev: 'SEV3',
    status: 'Open',
    title: 'Weekly sales recap can’t reach CRM',
    when: 'Yesterday',
    runs: 5,
    affected: 'Weekly sales recap',
    unownedFor: '34 min',
    started: 'Yesterday, 9:00 AM',
    buckets: [1, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    range: ['9:00', '10:15', '11:30'],
    rangeLabel: '9:00 – 11:30 AM',
    rootCause: null,
    timeline: [
      {
        time: '9:22 AM',
        author: 'Alert · Failure rate spike',
        text: 'Failure rate reached 9% over 15 min. Sent to Email.',
        tone: 'danger',
      },
      {
        time: '9:04 AM',
        author: 'Northwind',
        text: 'Opened automatically after 3 runs failed with the same error.',
        tone: 'muted',
      },
    ],
  },
  {
    id: 'inc_29',
    sev: 'SEV2',
    status: 'Reopened',
    title: 'Refund tool slow responses',
    when: 'Oct 24',
    runs: 31,
    affected: 'Support Agent',
    owner: people.daniel,
    started: 'Oct 24, 2:15 PM',
    buckets: [2, 4, 3, 5, 6, 4, 3, 2, 1, 1],
    range: ['2:00', '3:15', '4:30'],
    rangeLabel: '2:00 – 4:30 PM',
    rootCause: {
      text: 'Shopdesk refunds API slowed down after their Oct 24 release. p95 went from 1.2 s to 6.8 s.',
      edited: 'Edited by Daniel Okafor · Oct 24',
    },
    timeline: [
      {
        time: 'Oct 25, 9:10 AM',
        author: 'Northwind',
        text: 'Reopened: 4 slow responses in the last hour.',
        tone: 'danger',
      },
      {
        time: 'Oct 24, 5:02 PM',
        author: 'Daniel Okafor',
        text: 'Shopdesk shipped a fix. Marked resolved.',
        tone: 'brand',
      },
      {
        time: 'Oct 24, 2:15 PM',
        author: 'Alert · Slow answers',
        text: 'p95 latency above 8 s for 10 min.',
        tone: 'warn',
      },
    ],
  },
  {
    id: 'inc_28',
    sev: 'SEV1',
    status: 'Resolved',
    title: 'Model B timeouts in all regions',
    when: 'Oct 21',
    runs: 412,
    affected: '4 agents',
    owner: people.maya,
    started: 'Oct 21, 10:05 AM',
    buckets: [4, 18, 36, 44, 40, 22, 9, 3, 0, 0],
    range: ['10:00', '11:15', '12:30'],
    rangeLabel: '10:00 AM – 12:30 PM',
    rootCause: {
      text: 'Model provider outage. Agents fell back to Model A after we turned on automatic failover.',
      edited: 'Edited by Maya Chen · Oct 21',
    },
    timeline: [
      {
        time: '12:31 PM',
        author: 'Maya Chen',
        text: 'Provider confirmed recovery. Resolved.',
        tone: 'brand',
      },
      {
        time: '10:40 AM',
        author: 'Maya Chen',
        text: 'Turned on failover to Model A for all agents.',
        tone: 'warn',
      },
      {
        time: '10:05 AM',
        author: 'Alert · Failure rate spike',
        text: 'Failure rate reached 61% over 15 min.',
        tone: 'danger',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Evaluations (W6-10)                                                 */
/* ------------------------------------------------------------------ */

export const evalMetrics = [
  { name: 'Accuracy', v4: 88, v5: 79 },
  { name: 'Uses sources', v4: 92, v5: 95 },
  { name: 'Tone', v4: 90, v5: 91 },
  { name: 'Safety', v4: 100, v5: 100 },
];

export interface EvalCase {
  id: string;
  number: number;
  title: string;
  v4: boolean;
  v5: boolean;
  question: string;
  expected: string;
  answer: string;
  notes: string;
}

export const evalCases: EvalCase[] = [
  {
    id: 'c7',
    number: 7,
    title: 'Refund after 45 days for a damaged item?',
    v4: true,
    v5: false,
    question: 'My lamp arrived broken but I bought it 45 days ago. Can I still get a refund?',
    expected:
      'Yes. Damaged items can be refunded within 60 days, outside the usual 30-day window. Cite the damaged-item rule.',
    answer: 'Sorry, refunds are only possible within 30 days of purchase, so this order isn’t eligible.',
    notes:
      'Missed the damaged-item exception on p. 3 of the refund policy. v5’s shorter instructions dropped the line about exceptions.',
  },
  {
    id: 'c12',
    number: 12,
    title: 'Customer charged twice, wants both refunded',
    v4: true,
    v5: true,
    question: 'I was charged twice for order 48213. Can you refund both charges?',
    expected:
      'Refund the duplicate charge in full and explain the original charge stays because the order shipped.',
    answer:
      'I’ve refunded the duplicate $240 charge. The first charge covers your order, which shipped on Oct 22.',
    notes: 'Correct and cites the duplicate-charge rule.',
  },
  {
    id: 'c15',
    number: 15,
    title: 'Can I return a gift without a receipt?',
    v4: false,
    v5: false,
    question: 'Someone gave me a lamp as a gift. Can I return it without a receipt?',
    expected: 'Yes, for store credit, using the order email or gift note to look up the order.',
    answer: 'You’ll need the original receipt to return any item.',
    notes:
      'Both versions miss the gift-return section. The policy chunk is never retrieved — check the knowledge source.',
  },
  {
    id: 'c21',
    number: 21,
    title: 'Cancel a subscription mid-month',
    v4: true,
    v5: true,
    question: 'If I cancel my subscription today, do I get money back for the rest of the month?',
    expected: 'No partial refund; access continues until the end of the billing period.',
    answer: 'You won’t be charged again, and you keep access until the end of this billing period.',
    notes: 'Correct and friendly.',
  },
  {
    id: 'c28',
    number: 28,
    title: 'Refund to a card that has expired',
    v4: true,
    v5: false,
    question: 'My card expired since I ordered. Where will my refund go?',
    expected: 'The bank usually forwards it to the new card; otherwise offer store credit.',
    answer: 'Refunds can only go to an active card. Please add a new card first.',
    notes: 'v5 invents a requirement that isn’t in the policy.',
  },
];

export const evalSets = ['Support refunds', 'Shipping questions', 'Tone & safety'];

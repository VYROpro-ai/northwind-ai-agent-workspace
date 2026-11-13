import type { IconName } from '@/components/icons';
import type { AgentTone } from '@/components/ui';

/* ---------- Agents ---------- */

export type AgentId = 'support' | 'sales' | 'invoice' | 'meeting' | 'analyst';

export interface ChatAgent {
  id: AgentId;
  name: string;
  /** Two-letter monogram used in the agent picker. */
  mono: string;
  description: string;
  /** Solid tile colour in the picker (primitive with white text). */
  tile: string;
  /** Header / message avatar tone. */
  tone: AgentTone;
  /** Letter avatar instead of the agent glyph (Data Analyst). */
  letter?: string;
  paused?: boolean;
  intro: string;
}

export const agents: Record<AgentId, ChatAgent> = {
  support: {
    id: 'support',
    name: 'Support Agent',
    mono: 'SA',
    description: 'Orders, refunds and help-center answers',
    tile: 'bg-[var(--cobalt-600)]',
    tone: 'ai',
    intro: 'Ask about orders, refunds or any help-center policy.',
  },
  sales: {
    id: 'sales',
    name: 'Sales Researcher',
    mono: 'SR',
    description: 'Account briefs and lead research',
    tile: 'bg-[var(--violet-600)]',
    tone: 'ai',
    intro: 'Ask for an account brief or research on a lead.',
  },
  invoice: {
    id: 'invoice',
    name: 'Invoice Bot',
    mono: 'IB',
    description: 'Matches invoices to payments',
    tile: 'bg-[var(--green-600)]',
    tone: 'ok',
    paused: true,
    intro: 'Ask me to match an invoice to a payment.',
  },
  meeting: {
    id: 'meeting',
    name: 'Meeting Brief',
    mono: 'MB',
    description: 'One-page brief before each call',
    tile: 'bg-[var(--amber-700)]',
    tone: 'warn',
    intro: 'Ask for a one-page brief before your next call.',
  },
  analyst: {
    id: 'analyst',
    name: 'Data Analyst',
    mono: 'DA',
    description: 'Charts and answers from your data',
    tile: 'bg-[var(--amber-700)]',
    tone: 'warn',
    letter: 'DA',
    intro: 'Ask a question about your numbers.',
  },
};

/** Agents listed under "Recent" in the picker. */
export const recentAgents: AgentId[] = ['support', 'sales', 'invoice', 'meeting'];

/* ---------- Chat history ---------- */

export type HistoryAvatar = 'S' | 'D' | 'R';

export interface HistoryItem {
  title: string;
  avatar: HistoryAvatar;
  to: string;
}

export interface HistoryGroup {
  label: string;
  items: HistoryItem[];
}

export const historyAvatarTone: Record<HistoryAvatar, string> = {
  S: 'bg-ai-subtle text-ai-text',
  D: 'bg-warn-subtle text-warn-text',
  R: 'bg-brand-subtle text-brand-text',
};

export const chatHistory: HistoryGroup[] = [
  { label: 'Pinned', items: [{ title: 'Refund policy questions', avatar: 'S', to: '/chat/file-analysis' }] },
  {
    label: 'Today',
    items: [
      { title: 'Acme Co. double charge refund', avatar: 'S', to: '/chat/streaming' },
      { title: 'Q3 refund trends by region', avatar: 'D', to: '/chat/reasoning' },
      { title: 'Reply to Harbor Studio', avatar: 'S', to: '/chat' },
    ],
  },
  {
    label: 'Previous 7 days',
    items: [
      { title: 'Shipping delay macro', avatar: 'S', to: '/chat' },
      { title: 'Summarize ticket #9874', avatar: 'S', to: '/chat' },
      { title: 'Leads from the Oct webinar', avatar: 'R', to: '/chat' },
      { title: 'Onboarding email for Pinecrest', avatar: 'S', to: '/chat' },
    ],
  },
  { label: 'Older', items: [{ title: 'Holiday coverage plan', avatar: 'S', to: '/chat' }] },
];

/** Chats that only appear in history while they are open (inserted at the top of "Today"). */
export const extraChats: HistoryItem[] = [
  { title: 'Refund policy for double charges', avatar: 'S', to: '/chat/citations' },
  { title: 'Fix Acme Co. CRM record', avatar: 'S', to: '/chat/tool-calls' },
];

/* ---------- New chat ---------- */

export const starters: { text: string; icon: IconName }[] = [
  { text: 'Where is order #48213 right now?', icon: 'package' },
  { text: 'Can a customer get a refund after 30 days?', icon: 'clock' },
  { text: 'Draft a reply to an upset customer', icon: 'edit' },
  { text: 'Summarize this week’s top ticket themes', icon: 'align-left' },
];

/** Canned follow-up reply used when a message is sent from any chat screen. */
export const cannedReply =
  'Got it. I’m checking that against the help-center policies and your connected tools now — ' +
  'I’ll show my sources and ask before I change anything.';

/* ---------- W4-02 Streaming ---------- */

export const draftEmail = {
  intro: 'Here’s a draft you can send as is or edit:',
  to: 'dana.whitfield@acme.example',
  subject: 'Your refund for order #48213',
  greeting: 'Hi Dana,',
  body:
    'Thanks for flagging the double charge on Oct 22. You were charged $240 twice for order #48213 — ' +
    'that was our mistake, and we’re sorry for the trouble.',
  facts: [
    { label: 'Refund', value: '$240.00', strong: true },
    { label: 'Back to', value: 'Visa ending 6411' },
    { label: 'Arrives', value: 'Within 5 business days' },
  ],
  closing:
    'We’ve also added a note to your account so the same order can’t be billed twice. ' +
    'If anything looks off, just reply to this email.',
  /** Where the "Stopped" state cuts the closing paragraph. */
  stoppedAt: 'We’ve also added a note to your account so the same order can’t be bil',
};

/* ---------- W4-03 Citations ---------- */

export interface Source {
  n: number;
  title: string;
  kind: 'knowledge' | 'web';
  meta?: string;
  tag?: string;
  before?: string;
  highlight?: string;
  after?: string;
  footer: string;
  /** Lead-in and footer used by the inline citation preview, when they differ from the card. */
  previewLead?: string;
  previewFooter?: string;
  unavailable?: boolean;
  to?: string;
}

export const sources: Source[] = [
  {
    n: 1,
    title: 'Refund policy 2026.pdf',
    kind: 'knowledge',
    meta: 'p. 3',
    before: '…section 4.2. ',
    highlight:
      'Customers charged twice for the same order are refunded the duplicate amount in full within 5 business days.',
    after: ' Refunds over $100 need a reviewer…',
    footer: 'Docs drive · Updated Oct 2, 2026',
    to: '/knowledge/documents/refund-policy-2026',
  },
  {
    n: 2,
    title: 'Order #48213 · Acme Co.',
    kind: 'knowledge',
    tag: 'CRM',
    before: 'Oct 22, 9:41 AM — $240.00 · Oct 22, 9:41 AM — ',
    highlight: '$240.00 (flagged duplicate)',
    after: '. Refunds on account: none.',
    footer: 'CRM record · Updated today, 9:02 AM',
    previewLead: 'Charges: ',
    previewFooter: 'Updated today, 9:02 AM',
    to: '/integrations/pipeline-crm',
  },
  {
    n: 4,
    title: 'Billing FAQ (2024).docx',
    kind: 'knowledge',
    footer: 'Source no longer available — removed from Docs drive',
    unavailable: true,
  },
  {
    n: 3,
    title: 'Billing and refunds — Help center',
    kind: 'web',
    before:
      'If you see the same charge twice, contact us and we’ll refund the extra charge to your original payment method.',
    footer: 'help.northwind-labs.example/billing',
  },
];

/* ---------- W4-04 Tool calls ---------- */

export const toolCallPrompt =
  'Why was Acme Co. charged twice? Fix their CRM record so it can’t happen again, and let them know.';

export const toolCallAnswer = {
  streamed:
    'The duplicate came from an automatic payment retry at 9:41 AM on Oct 22 — the first charge had already ' +
    'gone through. I’m adding the billing email and turning off retries for this customer',
  rest:
    '. Done — the record now has billing@acme.example and retries are blocked. I can’t email customers ' +
    'directly, so I’ve left a draft for Dana in the ticket for you to send.',
};

/* ---------- W4-05 Reasoning ---------- */

export const reasoningSteps = [
  {
    title: 'Understand the question',
    time: '0.4 s',
    summary: 'Compare West refunds for Oct 14–20 against the week before.',
  },
  {
    title: 'Search knowledge',
    time: '1.9 s',
    summary: 'Pulled refund records and the carrier incident log for both weeks.',
  },
  {
    title: 'Compare results',
    time: '2.6 s',
    summary: 'Grouped refunds by reason. Late delivery grew 6×; other reasons stayed flat.',
  },
  {
    title: 'Draft answer',
    time: '1.1 s',
    summary: 'Lead with the size of the jump, then the main cause and what else changed.',
  },
];

/* ---------- W4-06 Plan & confirm ---------- */

export interface PlanStep {
  title: string;
  tool: string;
  icon: IconName;
  risks?: { label: string; tone: 'warn' | 'neutral'; icon: IconName }[];
  /** Show the risk pills on their own row under the tool line. */
  risksBelow?: boolean;
  subject?: string;
}

export const planSteps: PlanStep[] = [
  { title: 'Confirm the duplicate on order #48213', tool: 'CRM · Search · read only', icon: 'search' },
  {
    title: 'Refund $240.00 to Visa ending 6411',
    tool: 'Payments · Create refund',
    risksBelow: true,
    icon: 'credit-card',
    risks: [
      { label: 'Spends money', tone: 'warn', icon: 'alert-triangle' },
      { label: 'Leo Martins approves · refunds over $100', tone: 'neutral', icon: 'approval' },
    ],
  },
  {
    title: 'Email Dana Whitfield a confirmation',
    tool: 'Mail app · Send email',
    icon: 'mail',
    risks: [{ label: 'Sends email to 1 customer', tone: 'warn', icon: 'alert-triangle' }],
    subject: 'Your refund for order #48213',
  },
  { title: 'Add a note to ticket #9921 and close it', tool: 'Support desk · Update ticket', icon: 'edit' },
];

/* ---------- W4-07 File analysis ---------- */

export const refundRows = [
  { name: 'Late delivery', short: 'Late', jul: 3100, sep: 8900, change: '+187%', top: true },
  { name: 'Damaged item', short: 'Damaged', jul: 4800, sep: 6200, change: '+29%' },
  { name: 'Wrong size', short: 'Size', jul: 5400, sep: 5900, change: '+9%' },
  { name: 'Other', short: 'Other', jul: 5100, sep: 6300, change: '+24%' },
];

export type AttachmentState = 'uploading' | 'ready' | 'error';

export interface Attachment {
  id: string;
  kind: string;
  name: string;
  sub: string;
  state: AttachmentState;
  progress?: number;
}

export const initialAttachments: Attachment[] = [
  {
    id: 'a1',
    kind: 'PDF',
    name: 'warranty_scan.pdf',
    sub: 'Uploading · 4.2 MB',
    state: 'uploading',
    progress: 60,
  },
  { id: 'a2', kind: 'ZIP', name: 'support_logs.zip', sub: 'Can’t read .zip files', state: 'error' },
  { id: 'a3', kind: 'CSV', name: 'card_export.csv', sub: 'Blocked: contains card numbers', state: 'error' },
];

/* ---------- W4-08 Model comparison ---------- */

export type ModelId = 'a' | 'b' | 'c';

export const models: Record<ModelId, { name: string; short: string }> = {
  a: { name: 'Model A · Fast', short: 'Model A Fast' },
  b: { name: 'Model B · Balanced', short: 'Model B Balanced' },
  c: { name: 'Model C · Deep', short: 'Model C Deep' },
};

export const comparePrompt =
  'A customer says their package shows delivered but they never got it. What should they do?';

export interface CompareColumn {
  model: ModelId;
  latency: string;
  tokens: string;
  cost: string;
  paras: string[];
  /** Still writing when the screen opens. */
  streaming?: boolean;
}

export const compareColumns: CompareColumn[] = [
  {
    model: 'a',
    latency: '0.9 s',
    tokens: '182 tokens',
    cost: '$0.0004',
    paras: [
      'Sorry about that. First, check around your door, mailroom and with neighbours.',
      'If it’s still missing after 24 hours, reply here and we’ll open a lost-package claim.',
    ],
  },
  {
    model: 'b',
    latency: '2.3 s',
    tokens: '296 tokens',
    cost: '$0.0031',
    paras: [
      'I’m sorry your package hasn’t turned up. Carriers sometimes mark parcels delivered a few hours early, so please give it until tomorrow evening.',
      'Meanwhile, check your mailbox, porch and building mailroom, and ask neighbours.',
      'If it’s still missing, reply with your order number and I’ll start a claim. Most claims are resolved with a replacement or refund within 3 business days.',
    ],
  },
  {
    model: 'c',
    latency: '3.1 s',
    tokens: '240 tokens',
    cost: '$0.0098',
    streaming: true,
    paras: [
      'I’m sorry, that’s frustrating. Here’s what usually solves it:',
      '1. Wait until the end of the next day. Carriers often scan “delivered” before the drop-off.',
      '2. Check hidden spots: behind planters, side doors, the building office.',
      '3. Still nothing? Reply with your order number and I’ll open a claim for a replacement or refund.',
    ],
  },
];

/* ---------- W4-09 Prompt library ---------- */

export interface SavedPrompt {
  id: string;
  title: string;
  /** Text with {{variables}}. */
  body: string;
  uses: number;
  author: 'priya' | 'leo' | 'daniel';
  tag: 'Refunds' | 'Shipping' | 'Tone' | 'Escalation';
  mine?: boolean;
}

export const promptTags = ['All', 'Refunds', 'Shipping', 'Tone', 'Escalation'] as const;
export type PromptTag = (typeof promptTags)[number];

export const savedPrompts: SavedPrompt[] = [
  {
    id: 'refund-confirmation',
    title: 'Refund confirmation',
    body: 'Write a short, warm email to {{customer_name}} confirming the refund for order {{order_number}}.',
    uses: 128,
    author: 'priya',
    tag: 'Refunds',
  },
  {
    id: 'shipping-delay',
    title: 'Shipping delay apology',
    body: 'Apologise for the delay on {{order_number}}, give the new date and offer 10% off.',
    uses: 64,
    author: 'leo',
    tag: 'Shipping',
  },
  {
    id: 'escalate',
    title: 'Escalate to a person',
    body: 'Summarize this chat for the human team and tag {{priority}}.',
    uses: 31,
    author: 'daniel',
    tag: 'Escalation',
  },
  {
    id: 'calm-tone',
    title: 'Calm an upset customer',
    body: 'Rewrite my reply to {{customer_name}} so it sounds calm, specific and kind.',
    uses: 22,
    author: 'priya',
    tag: 'Tone',
    mine: true,
  },
];

export const promptCounts = { mine: 6, team: 14 };

/* ---------- W4-10 Voice ---------- */

export const voiceTranscript = {
  you: 'My order says delivered but there’s nothing at my door.',
  agent:
    'I’m sorry about that. Carriers sometimes mark parcels delivered a little early, so it may still arrive today. ' +
    'If it doesn’t turn up by tomorrow evening, I can open a claim for you',
};

export const voices = ['Juniper', 'Cove', 'Ember', 'Sol'];
export const languages = ['English (US)', 'English (UK)', 'Español', 'Français', 'Deutsch'];

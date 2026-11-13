import type { IconName } from '@/components/icons';
import { people } from '@/data/people';

/** Copy for the brand pane on the left of every auth screen. */
export type AuthScreen = 'signin' | 'signup' | 'sso' | 'verify' | 'reset' | 'workspace' | 'invite';

export const visualCopy: Record<AuthScreen, { eyebrow: string; title: string; sub: string }> = {
  signin: {
    eyebrow: 'Welcome back to Northwind',
    title: 'Your agents kept working while you were away',
    sub: 'Pick up approvals, runs and chats right where you left them.',
  },
  signup: {
    eyebrow: 'Free for up to 3 people',
    title: 'Put AI agents to work, with people in control',
    sub: 'Build agents, connect your tools and approve every risky action before it happens.',
  },
  sso: {
    eyebrow: 'Single sign-on',
    title: 'One login for your whole company',
    sub: 'Use your identity provider. Access follows the roles your admin sets.',
  },
  verify: {
    eyebrow: 'Almost there',
    title: 'Check your inbox to keep things secure',
    sub: 'We verify every work email before anyone can run agents on your data.',
  },
  reset: {
    eyebrow: 'Account security',
    title: 'Back in two minutes',
    sub: 'Reset links expire in 30 minutes and every reset is written to the audit log.',
  },
  workspace: {
    eyebrow: 'Step 1 of 3',
    title: 'Set up a home for your agents',
    sub: 'Your workspace holds agents, workflows, knowledge and the people who approve them.',
  },
  invite: {
    eyebrow: 'Step 2 of 3',
    title: 'Agents work better with a team',
    sub: 'Invite builders to create agents and reviewers to approve what they do.',
  },
};

/** Fictional customer marks in the "Trusted by teams at" strip (24 px stroke paths). */
export const trustedBy: { name: string; d: string }[] = [
  { name: 'Harbor Studio', d: 'M4 14c3-4 13-4 16 0M4 18c3-4 13-4 16 0' },
  { name: 'Pinecrest', d: 'M12 3l6 9h-4l4 7H6l4-7H6z' },
  { name: 'Lumen Freight', d: 'M4 12h16M12 4l8 8-8 8' },
  { name: 'Oakline Health', d: 'M12 5v14M5 12h14' },
  { name: 'Brightfold', d: 'M4 6h16l-8 12z' },
  { name: 'Acme Co.', d: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z' },
];

export const signedInUser = people.maya;

/* ---------- W1-06 Create workspace ---------- */

export const teamSizes = ['Just me', '2–10', '11–50', '51–200', '200+'] as const;
export type TeamSize = (typeof teamSizes)[number];

export const useCases: { label: string; icon: IconName }[] = [
  { label: 'Support', icon: 'headset-mic' },
  { label: 'Sales', icon: 'chart-growth' },
  { label: 'Operations', icon: 'gear' },
  { label: 'Engineering', icon: 'terminal' },
  { label: 'Research', icon: 'flask' },
  { label: 'Other', icon: 'apps-add' },
];

/** Workspace URLs that are already in use — typing one shows the "taken" state. */
export const takenSlugs = ['acme', 'acme-co', 'northwind', 'northwind-app', 'helpbase'];

/* ---------- W1-07 Invite team ---------- */

export const inviteRoles = ['Admin', 'Builder', 'Reviewer', 'Member'] as const;
export type InviteRole = (typeof inviteRoles)[number];

export interface Invite {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: InviteRole;
}

export const seatLimit = 5;

export const initialInvites: Invite[] = [
  {
    id: 'i1',
    email: 'daniel.okafor@northwindlabs.com',
    name: people.daniel.name,
    avatar: people.daniel.avatar,
    role: 'Admin',
  },
  {
    id: 'i2',
    email: 'priya.nair@northwindlabs.com',
    name: people.priya.name,
    avatar: people.priya.avatar,
    role: 'Builder',
  },
  {
    id: 'i3',
    email: 'leo.martins@northwindlabs.com',
    name: people.leo.name,
    avatar: people.leo.avatar,
    role: 'Reviewer',
  },
  {
    id: 'i4',
    email: 'sofia.rossi@northwindlabs.com',
    name: people.sofia.name,
    avatar: people.sofia.avatar,
    role: 'Member',
  },
  { id: 'i5', email: 'omar@northwind', role: 'Member' },
];

export const inviteLink = 'northwind.app/join/northwind-labs/7Hc2';

/* ---------- W1-08 Choose a starting template ---------- */

export type TemplateCategory = 'Support' | 'Sales' | 'Operations' | 'Engineering' | 'Research';
export type TemplateTone = 'ai' | 'brand' | 'ok' | 'warn' | 'info' | 'neutral';

export interface TemplateNeed {
  name: string;
  icon: IconName;
  note: string;
  /** Not connected yet — shown as a warning row with "Connect later". */
  missing?: boolean;
}

export interface StarterTemplate {
  id: string;
  name: string;
  desc: string;
  icon: IconName;
  tone: TemplateTone;
  setup: string;
  usedBy: string;
  rating?: string;
  popular?: boolean;
  categories: TemplateCategory[];
  does: string[];
  sample: { ask: string; answer: string };
  needs: TemplateNeed[];
}

export const templateFilters = ['All', 'Support', 'Sales', 'Operations', 'Engineering', 'Research'] as const;
export type TemplateFilter = (typeof templateFilters)[number];

export const templates: StarterTemplate[] = [
  {
    id: 'support-agent',
    name: 'Support agent',
    desc: 'Answers billing and order questions from your help docs',
    icon: 'chat',
    tone: 'ai',
    setup: '3 min',
    usedBy: '1.2K teams',
    rating: '4.8',
    popular: true,
    categories: ['Support'],
    does: [
      'Answers billing, order and refund questions',
      'Cites your help docs in every answer',
      'Asks before refunds or emails go out',
    ],
    sample: {
      ask: 'Where is my order #48213?',
      answer: 'It shipped Oct 23 and arrives Oct 27. Here’s the tracking link',
    },
    needs: [
      { name: 'Support desk', icon: 'integration', note: 'Not connected yet', missing: true },
      { name: 'Help docs', icon: 'knowledge', note: 'Upload or connect a Docs drive' },
    ],
  },
  {
    id: 'hr-helpdesk',
    name: 'HR helpdesk',
    desc: 'Answers employee policy and leave questions',
    icon: 'users',
    tone: 'ok',
    setup: '2 min',
    usedBy: '640 teams',
    rating: '4.7',
    categories: ['Support', 'Operations'],
    does: [
      'Answers leave, benefits and policy questions',
      'Quotes the exact section of your handbook',
      'Hands sensitive cases to a person on the HR team',
    ],
    sample: {
      ask: 'How many leave days do I have?',
      answer: 'You have 14 days left this year. Carry-over rules are in the handbook',
    },
    needs: [{ name: 'HR wiki', icon: 'knowledge', note: 'Connect your wiki or upload the handbook' }],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting notes',
    desc: 'Turns call transcripts into notes and follow-ups',
    icon: 'file-text',
    tone: 'info',
    setup: '2 min',
    usedBy: '2.4K teams',
    rating: '4.9',
    categories: ['Support', 'Operations'],
    does: [
      'Summarizes calls into decisions and next steps',
      'Assigns follow-ups to the right person',
      'Shares notes only after you review them',
    ],
    sample: {
      ask: 'Summarize my 2 PM call',
      answer: 'Acme Co. agreed to the Pro plan. Two follow-ups are assigned to you',
    },
    needs: [
      { name: 'Calendar', icon: 'calendar', note: 'Not connected yet', missing: true },
      { name: 'Docs drive', icon: 'folder', note: 'Where notes are saved' },
    ],
  },
  {
    id: 'blank-agent',
    name: 'Blank agent',
    desc: 'Start from scratch with your own instructions',
    icon: 'plus',
    tone: 'neutral',
    setup: 'Any time',
    usedBy: 'Full control',
    categories: ['Support', 'Sales', 'Operations', 'Engineering', 'Research'],
    does: [
      'Write your own instructions',
      'Pick the tools and knowledge it can use',
      'Set which actions need approval',
    ],
    sample: {
      ask: 'What can you help with?',
      answer: 'Anything you describe in my instructions. Add tools to let me take actions',
    },
    needs: [],
  },
  {
    id: 'sales-researcher',
    name: 'Sales researcher',
    desc: 'Researches leads and drafts first outreach',
    icon: 'trend-up',
    tone: 'brand',
    setup: '4 min',
    usedBy: '860 teams',
    rating: '4.6',
    categories: ['Sales', 'Research'],
    does: [
      'Researches companies and contacts before calls',
      'Drafts first outreach in your tone',
      'Logs notes to your CRM after you approve',
    ],
    sample: {
      ask: 'Research Pinecrest before my call',
      answer: 'Pinecrest grew to 220 people this year and just opened a Denver office',
    },
    needs: [
      { name: 'CRM', icon: 'database', note: 'Not connected yet', missing: true },
      { name: 'Web search', icon: 'globe', note: 'Included with every plan' },
    ],
  },
  {
    id: 'data-analyst',
    name: 'Data analyst',
    desc: 'Answers questions about spreadsheets with charts',
    icon: 'analytics',
    tone: 'info',
    setup: '2 min',
    usedBy: '1.1K teams',
    rating: '4.7',
    categories: ['Operations', 'Research'],
    does: [
      'Answers questions about your spreadsheets',
      'Builds charts you can share',
      'Shows the formula behind every number',
    ],
    sample: {
      ask: 'Chart Q3 refunds by region',
      answer: 'Refunds fell 12% in Q3. EMEA had the biggest drop. Chart attached',
    },
    needs: [{ name: 'Files', icon: 'file', note: 'Upload a spreadsheet or connect a drive' }],
  },
  {
    id: 'code-reviewer',
    name: 'Code reviewer',
    desc: 'Reviews pull requests against your guidelines',
    icon: 'code',
    tone: 'neutral',
    setup: '4 min',
    usedBy: '530 teams',
    rating: '4.5',
    categories: ['Engineering'],
    does: [
      'Reviews pull requests against your guidelines',
      'Flags security and performance issues',
      'Posts comments only after a builder approves',
    ],
    sample: {
      ask: 'Review PR #312 for security',
      answer: 'Found 2 issues: an unescaped query and a missing auth check',
    },
    needs: [{ name: 'Code host', icon: 'branch', note: 'Not connected yet', missing: true }],
  },
  {
    id: 'invoice-processor',
    name: 'Invoice processor',
    desc: 'Reads invoices and prepares payments for approval',
    icon: 'receipt',
    tone: 'warn',
    setup: '5 min',
    usedBy: '410 teams',
    rating: '4.8',
    popular: true,
    categories: ['Operations'],
    does: [
      'Reads invoices from your inbox',
      'Matches each invoice to a purchase order',
      'Prepares payments and waits for approval',
    ],
    sample: {
      ask: 'Match this invoice to a PO',
      answer: 'Matched to PO-2291 from Lumen Freight. The amounts agree',
    },
    needs: [
      { name: 'Finance', icon: 'credit-card', note: 'Not connected yet', missing: true },
      { name: 'Mail app', icon: 'mail', note: 'Reads invoices sent to billing@' },
    ],
  },
];

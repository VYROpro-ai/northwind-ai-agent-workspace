/* Mock data for the Account epic (W12-01 → W12-03). */

/* ---------- W12-01 · Profile ---------- */

/** 17 × 17 authenticator QR placeholder from the design (1 = dark module). */
export const qrRows = [
  '11110010010010111',
  '11101001001001111',
  '11100000000000111',
  '10010010010010010',
  '01001001001001001',
  '00000000000000000',
  '10010010010010010',
  '01001001001001001',
  '00000000000000000',
  '10010010010010010',
  '01001001001001001',
  '00000000000000000',
  '10010010010010010',
  '01001001001001001',
  '11100000000000000',
  '11110010010010010',
  '11101001001001001',
];

export const backupCodes = ['7KQ2-9MXD', 'P4WT-3HNA', 'Z8RB-61LC', 'D2FY-0VQE', 'M6JS-4TUK', 'H9NE-7ZPW'];

/* ---------- W12-02 · Preferences ---------- */

export const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'ja', label: '日本語' },
];

export const timeZones = [
  { value: 'America/Chicago', label: 'America/Chicago (UTC−5)' },
  { value: 'America/New_York', label: 'America/New_York (UTC−4)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (UTC+5)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
];

export const dateFormats = [
  { value: 'mdy', label: 'Oct 26, 2026' },
  { value: 'dmy', label: '26/10/2026' },
  { value: 'iso', label: '2026-10-26' },
] as const;

export const startPages = [
  { value: '/', label: 'Home' },
  { value: '/chat', label: 'Chat' },
  { value: '/agents', label: 'Agents' },
  { value: '/runs', label: 'Runs' },
];

export const defaultAgents = [
  { value: 'support', label: 'Support Agent' },
  { value: 'sales', label: 'Sales Researcher' },
  { value: 'invoice', label: 'Invoice processor' },
  { value: 'notes', label: 'Meeting notes' },
];

/* ---------- W12-03 · Notification settings ---------- */

export type Channel = 'inApp' | 'email' | 'push' | 'chat';

export const channels: { key: Channel; label: string }[] = [
  { key: 'inApp', label: 'In-app' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Mobile push' },
  { key: 'chat', label: 'Chat app' },
];

export interface NotificationEvent {
  id: string;
  title: string;
  hint: string;
  /** Warning shown when email is switched off for this event. */
  emailOffWarning?: string;
  defaults: Record<Exclude<Channel, 'push'>, boolean>;
}

export const notificationEvents: NotificationEvent[] = [
  {
    id: 'approval-requested',
    title: 'Approval requested',
    hint: 'When an agent waits for you',
    emailOffWarning: 'Email is off. You may miss approvals assigned to you.',
    defaults: { inApp: true, email: false, chat: true },
  },
  {
    id: 'approval-decided',
    title: 'Approval decided',
    hint: 'For requests you started',
    defaults: { inApp: true, email: false, chat: false },
  },
  {
    id: 'run-failed',
    title: 'Run failed',
    hint: 'Agents and workflows you own',
    defaults: { inApp: true, email: true, chat: true },
  },
  {
    id: 'mentions',
    title: 'Mentions',
    hint: 'Someone @mentions you',
    defaults: { inApp: true, email: true, chat: true },
  },
  {
    id: 'agent-published',
    title: 'Agent published',
    hint: 'New versions of agents you use',
    defaults: { inApp: true, email: false, chat: false },
  },
  {
    id: 'weekly-summary',
    title: 'Weekly summary',
    hint: 'Mondays at 9:00 AM',
    defaults: { inApp: false, email: true, chat: false },
  },
  {
    id: 'limit-warnings',
    title: 'Limit warnings',
    hint: 'Credits, seats and spend cap',
    defaults: { inApp: true, email: true, chat: false },
  },
];

const times = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'];
const mornings = ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM'];

export const quietFrom = times.map((t) => ({ value: t, label: t }));
export const quietTo = mornings.map((t) => ({ value: t, label: t }));
export const quietDays = [
  { value: 'every', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
];

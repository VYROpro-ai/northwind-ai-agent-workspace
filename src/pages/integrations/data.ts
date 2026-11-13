import { people, type Person } from '@/data/people';

/* ------------------------------------------------------------------ W8-01 Directory */

export type AppId =
  | 'helpbase'
  | 'shopdesk'
  | 'pipeline-crm'
  | 'mailroom'
  | 'chatline'
  | 'docs-drive'
  | 'ledgerly'
  | 'daybook'
  | 'warehouse-db';

export type AppStatus = 'connected' | 'reconnect' | 'available' | 'plan';

export interface IntegrationApp {
  id: AppId;
  name: string;
  category: string;
  actions: number;
  status: AppStatus;
  /** Extra line under the card, e.g. "3 agents affected". */
  note?: string;
}

export const apps: IntegrationApp[] = [
  { id: 'helpbase', name: 'Helpbase', category: 'Support', actions: 14, status: 'connected' },
  { id: 'shopdesk', name: 'Shopdesk', category: 'Support', actions: 12, status: 'connected' },
  {
    id: 'pipeline-crm',
    name: 'Pipeline CRM',
    category: 'CRM',
    actions: 18,
    status: 'reconnect',
    note: '3 agents affected',
  },
  { id: 'mailroom', name: 'Mailroom', category: 'Communication', actions: 6, status: 'available' },
  { id: 'chatline', name: 'Chatline', category: 'Communication', actions: 9, status: 'connected' },
  { id: 'docs-drive', name: 'Docs drive', category: 'Docs', actions: 7, status: 'connected' },
  { id: 'ledgerly', name: 'Ledgerly', category: 'Finance', actions: 11, status: 'plan' },
  { id: 'daybook', name: 'Daybook', category: 'Calendar', actions: 5, status: 'available' },
  { id: 'warehouse-db', name: 'Warehouse DB', category: 'Data', actions: 4, status: 'connected' },
];

/** Size of the full catalogue; the grid shows the featured apps. */
export const catalogueSize = 64;

/* ------------------------------------------------------------------ W8-02 Detail */

export type ActionRisk = 'Read' | 'Write' | 'Deletes data' | 'Spends money';

export interface AppAction {
  name: string;
  description: string;
  risk: ActionRisk;
  enabled: boolean;
}

export const pipelineActions: AppAction[] = [
  {
    name: 'contacts.search',
    description: 'Find a contact by name, email or company',
    risk: 'Read',
    enabled: true,
  },
  { name: 'contacts.get', description: 'Read a contact and its deal history', risk: 'Read', enabled: true },
  { name: 'notes.create', description: 'Add a note to a contact or deal', risk: 'Write', enabled: true },
  {
    name: 'deals.update_stage',
    description: 'Move a deal to another pipeline stage',
    risk: 'Write',
    enabled: true,
  },
  { name: 'contacts.delete', description: 'Delete a contact for good', risk: 'Deletes data', enabled: false },
  {
    name: 'invoices.create',
    description: 'Create and send an invoice',
    risk: 'Spends money',
    enabled: false,
  },
];

export const moreActions = 12;

export const pipelineData = [
  'Contacts: names, emails, phone numbers',
  'Deals, stages and amounts',
  'Notes and activity history',
];

export interface UsedBy {
  name: string;
  detail: string;
  tone: 'ai' | 'brand' | 'warn' | 'info';
  to: string;
}

export const pipelineUsedBy: UsedBy[] = [
  { name: 'Support Agent', detail: '1,204 calls · 7 d', tone: 'ai', to: '/agents/support-agent' },
  { name: 'Sales Researcher', detail: '388 calls · 7 d', tone: 'brand', to: '/agents' },
  { name: 'Lead enrichment', detail: 'Workflow · 298 runs', tone: 'warn', to: '/workflows' },
  { name: 'Ticket triage & reply', detail: 'Workflow · Log to CRM', tone: 'info', to: '/workflows' },
];

/* ------------------------------------------------------------------ W8-03 Consent */

export const consentScopes = [
  {
    icon: 'eye',
    tone: 'info',
    title: 'See contacts, deals and notes',
    detail: 'Names, emails, phone numbers and deal amounts',
  },
  {
    icon: 'edit',
    tone: 'warn',
    title: 'Add notes and update deal stages',
    detail: 'Only when an agent or workflow asks, with your approval rules',
  },
  {
    icon: 'trash',
    tone: 'danger',
    title: 'Delete contacts',
    detail: 'Off by default. You can turn it on per agent.',
  },
] as const;

/* ------------------------------------------------------------------ W8-04 API keys */

export type KeyScope = 'Read' | 'Write' | 'Admin';
export type KeyStatus = 'active' | 'disabled' | 'revoked';

export interface ApiKey {
  id: string;
  name: string;
  /** Masked key — the full value is only shown once, at creation. */
  masked: string;
  scope: KeyScope;
  owner: Person;
  created: string;
  lastUsed: string;
  expires: string;
  expiresSoon?: boolean;
  status: KeyStatus;
}

export const apiKeys: ApiKey[] = [
  {
    id: 'k1',
    name: 'Production backend',
    masked: 'sk-live-••••4f9a',
    scope: 'Write',
    owner: people.daniel,
    created: 'Aug 2',
    lastUsed: '2 min ago',
    expires: 'Aug 2, 2027',
    status: 'active',
  },
  {
    id: 'k2',
    name: 'Help center chat',
    masked: 'sk-live-••••91c2',
    scope: 'Read',
    owner: people.priya,
    created: 'Sep 18',
    lastUsed: '1 h ago',
    expires: 'In 7 days',
    expiresSoon: true,
    status: 'active',
  },
  {
    id: 'k3',
    name: 'Data export job',
    masked: 'sk-live-••••0d7e',
    scope: 'Read',
    owner: people.daniel,
    created: 'Jun 30',
    lastUsed: '94 days ago',
    expires: 'Never',
    status: 'active',
  },
  {
    id: 'k4',
    name: 'Admin scripts',
    masked: 'sk-live-••••b3a8',
    scope: 'Admin',
    owner: people.maya,
    created: 'May 4',
    lastUsed: 'Yesterday',
    expires: 'May 4, 2027',
    status: 'active',
  },
  {
    id: 'k5',
    name: 'Old website widget',
    masked: 'sk-live-••••77e1',
    scope: 'Read',
    owner: people.priya,
    created: 'Mar 9',
    lastUsed: 'Today, 10:02 AM',
    expires: 'Mar 9, 2027',
    status: 'disabled',
  },
  {
    id: 'k6',
    name: 'Staging tests',
    masked: 'sk-test-••••c514',
    scope: 'Write',
    owner: people.daniel,
    created: 'Feb 1',
    lastUsed: 'Apr 12',
    expires: '—',
    status: 'revoked',
  },
];

export const keyExpiryOptions = [
  { value: '30d', label: '30 d', expires: 'Nov 28, 2026' },
  { value: '90d', label: '90 d', expires: 'Jan 27, 2027' },
  { value: '1y', label: '1 year', expires: 'Oct 29, 2027' },
  { value: 'never', label: 'Never', expires: 'Never' },
] as const;

export type KeyExpiry = (typeof keyExpiryOptions)[number]['value'];

/* ------------------------------------------------------------------ W8-05 Webhooks */

export const webhookEvents = [
  'run.completed',
  'run.failed',
  'approval.requested',
  'approval.decided',
  'agent.published',
] as const;

export type WebhookEvent = (typeof webhookEvents)[number];

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEvent[];
  status: 'active' | 'disabled';
  success: string;
}

export const webhookEndpoints: WebhookEndpoint[] = [
  {
    id: 'w1',
    url: 'https://api.northwindlabs.com/northwind',
    events: ['run.completed', 'run.failed', 'agent.published'],
    status: 'active',
    success: '99.8%',
  },
  {
    id: 'w2',
    url: 'https://ops.northwindlabs.com/alerts',
    events: ['run.failed', 'approval.requested'],
    status: 'active',
    success: '97.1%',
  },
  {
    id: 'w3',
    url: 'https://hooks.legacy-erp.example/in',
    events: ['approval.decided'],
    status: 'disabled',
    success: '0%',
  },
];

export interface Delivery {
  id: string;
  event: WebhookEvent;
  code: number;
  ms: number;
  sent: string;
}

export const deliveries: Delivery[] = [
  { id: 'd1', event: 'run.completed', code: 200, ms: 142, sent: '9:42:14 AM' },
  { id: 'd2', event: 'run.failed', code: 200, ms: 188, sent: '9:42:14 AM' },
  { id: 'd3', event: 'run.completed', code: 500, ms: 3004, sent: '9:31:02 AM' },
  { id: 'd4', event: 'agent.published', code: 200, ms: 96, sent: '9:12:40 AM' },
  { id: 'd5', event: 'run.completed', code: 200, ms: 131, sent: '9:08:55 AM' },
];

/* ------------------------------------------------------------------ W8-06 Custom tool */

export type FieldType = 'Text' | 'Number' | 'Boolean' | 'Date';

export interface ToolField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description: string;
}

export const toolFields: ToolField[] = [
  { id: 'f1', name: 'sku', type: 'Text', required: true, description: 'Product code, e.g. LMP-204' },
  {
    id: 'f2',
    name: 'warehouse',
    type: 'Text',
    required: false,
    description: 'Reno or Austin. Leave empty for all.',
  },
  { id: 'f3', name: 'sku', type: 'Text', required: false, description: 'Duplicate' },
];

export const toolRiskLevels = [
  { value: 'read', label: 'Read only', hint: 'Runs without approval', tone: 'ok' },
  { value: 'write', label: 'Writes data', hint: 'Follows approval rules', tone: 'warn' },
  { value: 'critical', label: 'Critical', hint: 'Always asks for approval', tone: 'danger' },
] as const;

export const stockResponse = {
  sku: 'LMP-204',
  name: 'Arc desk lamp',
  warehouse: 'Reno',
  in_stock: 42,
  next_restock: '2026-11-04',
};

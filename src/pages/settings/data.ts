import { people, roleLabels, type Person, type Role } from '@/data/people';
import type { Tone } from '@/components/ui';

/* ------------------------------------------------------------------ */
/* W10-01 · Members                                                    */
/* ------------------------------------------------------------------ */

export type MemberStatus = 'active' | 'suspended';

export interface Member {
  person: Person;
  role: Role;
  teams: string[];
  status: MemberStatus;
  lastActive: string;
  twoFactor: boolean;
  /** Agents and workflows this person owns — transferred on removal. */
  owns?: { agents: number; workflows: number };
}

export const members: Member[] = [
  {
    person: people.maya,
    role: 'owner',
    teams: ['Leadership'],
    status: 'active',
    lastActive: 'Now',
    twoFactor: true,
  },
  {
    person: people.daniel,
    role: 'admin',
    teams: ['Sales', 'IT'],
    status: 'active',
    lastActive: '5 min ago',
    twoFactor: true,
  },
  {
    person: people.priya,
    role: 'builder',
    teams: ['Support'],
    status: 'active',
    lastActive: '2 min ago',
    twoFactor: true,
    owns: { agents: 4, workflows: 3 },
  },
  {
    person: people.leo,
    role: 'reviewer',
    teams: ['Support'],
    status: 'active',
    lastActive: '14 min ago',
    twoFactor: true,
  },
  {
    person: people.sofia,
    role: 'member',
    teams: ['Support'],
    status: 'active',
    lastActive: '1 min ago',
    twoFactor: false,
  },
  {
    person: people.omar,
    role: 'viewer',
    teams: ['Finance'],
    status: 'active',
    lastActive: 'Yesterday',
    twoFactor: false,
  },
  {
    person: people.jae,
    role: 'member',
    teams: ['Marketing'],
    status: 'suspended',
    lastActive: 'Oct 2',
    twoFactor: false,
    owns: { agents: 1, workflows: 2 },
  },
];

/** Roles that can be assigned from the members table (Owner is transferred, not assigned). */
export const assignableRoles: Role[] = ['admin', 'builder', 'reviewer', 'member', 'viewer'];

export const roleOptions = assignableRoles.map((r) => ({ value: r, label: roleLabels[r] }));

export const seats = { used: 24, total: 25, plan: 'Pro', extraSeatPrice: 24 };

export interface PendingInvite {
  email: string;
  role: Role;
  sent: string;
  expired?: boolean;
}

export const pendingInvites: PendingInvite[] = [
  { email: 'alex@northwindlabs.com', role: 'member', sent: '9 days ago', expired: true },
  { email: 'nina@northwindlabs.com', role: 'builder', sent: '2 days ago' },
  { email: 'sam@northwindlabs.com', role: 'reviewer', sent: 'Yesterday' },
];

export const teams = [
  { name: 'Support', members: 9, agents: 3 },
  { name: 'Sales', members: 5, agents: 2 },
  { name: 'Finance', members: 3, agents: 1 },
  { name: 'Marketing', members: 3, agents: 1 },
  { name: 'IT', members: 2, agents: 0 },
  { name: 'Leadership', members: 2, agents: 0 },
];

export const teamOptions = teams.map((t) => ({ value: t.name, label: t.name }));

/** Seeded chips for the W10-03 invite state. */
export const inviteSeed = [
  'ana@northwindlabs.com',
  'ben@northwindlabs.com',
  'chris@northwind',
  'priya@northwindlabs.com',
];

/* ------------------------------------------------------------------ */
/* W10-02 · Roles & permissions                                        */
/* ------------------------------------------------------------------ */

export const defaultRoleColumns: Role[] = ['owner', 'admin', 'builder', 'reviewer', 'member', 'viewer'];

/** `true` allowed · `false` not allowed · `null` not applicable. */
export type Grant = boolean | null;

export interface Permission {
  id: string;
  label: string;
  grants: Record<Role, Grant>;
  /** Custom "Support lead" role value. */
  custom: boolean;
  /** People affected if the custom grant changes. */
  affected?: number;
}

export interface PermissionGroup {
  label: string;
  permissions: Permission[];
}

const g = (owner: Grant, admin: Grant, builder: Grant, reviewer: Grant, member: Grant, viewer: Grant) => ({
  owner,
  admin,
  builder,
  reviewer,
  member,
  viewer,
});

export const permissionGroups: PermissionGroup[] = [
  {
    label: 'Agents',
    permissions: [
      {
        id: 'use-agents',
        label: 'Use agents in chat',
        grants: g(true, true, true, true, true, false),
        custom: true,
      },
      {
        id: 'edit-agents',
        label: 'Create and edit agents',
        grants: g(true, true, true, false, false, false),
        custom: false,
      },
      {
        id: 'publish-agents',
        label: 'Publish agents',
        grants: g(true, true, true, false, false, false),
        custom: true,
      },
    ],
  },
  {
    label: 'Runs & approvals',
    permissions: [
      {
        id: 'view-runs',
        label: 'View runs and traces',
        grants: g(true, true, true, true, false, true),
        custom: true,
      },
      {
        id: 'approve',
        label: 'Approve or reject requests',
        grants: g(true, true, false, true, false, false),
        custom: true,
      },
      {
        id: 'approve-refunds',
        label: 'Approve refunds',
        grants: g(true, true, false, true, false, false),
        custom: false,
        affected: 2,
      },
    ],
  },
  {
    label: 'Knowledge & integrations',
    permissions: [
      {
        id: 'sources',
        label: 'Upload and connect sources',
        grants: g(true, true, true, false, false, false),
        custom: false,
      },
      {
        id: 'apps',
        label: 'Connect apps and API keys',
        grants: g(true, true, false, false, false, false),
        custom: false,
      },
    ],
  },
  {
    label: 'Admin & billing',
    permissions: [
      {
        id: 'members',
        label: 'Manage members and roles',
        grants: g(true, true, false, false, false, false),
        custom: false,
      },
      {
        id: 'guardrails',
        label: 'Edit guardrails',
        grants: g(true, true, false, false, false, false),
        custom: false,
      },
      {
        id: 'billing',
        label: 'Billing and invoices',
        grants: g(true, false, false, false, false, null),
        custom: false,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* W10-04 · Audit log                                                  */
/* ------------------------------------------------------------------ */

export type AuditActor =
  | { kind: 'person'; person: Person }
  | { kind: 'agent'; name: string; onBehalfOf: string }
  | { kind: 'key'; name: string };

export interface AuditEntry {
  id: string;
  time: string;
  date: 'today' | 'yesterday';
  actor: AuditActor;
  action: string;
  target: string;
  ip?: string;
  location?: string;
  before?: Record<string, string | number>;
  after?: Record<string, string | number>;
}

export const auditEntries: AuditEntry[] = [
  {
    id: 'evt_1',
    time: 'Oct 26, 09:58:12',
    date: 'today',
    actor: { kind: 'person', person: people.daniel },
    action: 'policy.updated',
    target: 'Refund guardrail',
    ip: '203.0.113.24',
    location: 'Karachi, PK',
    before: { action: 'require_approval', refund_over: 500 },
    after: { action: 'require_approval', refund_over: 100 },
  },
  {
    id: 'evt_2',
    time: 'Oct 26, 09:47:30',
    date: 'today',
    actor: { kind: 'person', person: people.leo },
    action: 'approval.approved',
    target: 'Reply to Harbor Studio',
    ip: '198.51.100.7',
    location: 'Lisbon, PT',
  },
  {
    id: 'evt_3',
    time: 'Oct 26, 09:42:12',
    date: 'today',
    actor: { kind: 'agent', name: 'Support Agent', onBehalfOf: 'Sofia' },
    action: 'approval.requested',
    target: 'Refund $240 to Acme Co.',
  },
  {
    id: 'evt_4',
    time: 'Oct 26, 09:31:05',
    date: 'today',
    actor: { kind: 'person', person: people.maya },
    action: 'data.revealed',
    target: 'Card ending 4417 · run_4835',
    ip: '203.0.113.9',
    location: 'Austin, US',
  },
  {
    id: 'evt_5',
    time: 'Oct 26, 09:12:44',
    date: 'today',
    actor: { kind: 'key', name: 'Production backend' },
    action: 'agent.invoked',
    target: 'Support Agent',
    ip: '192.0.2.55',
    location: 'Frankfurt, DE',
  },
  {
    id: 'evt_6',
    time: 'Oct 26, 08:55:19',
    date: 'today',
    actor: { kind: 'person', person: people.priya },
    action: 'agent.published',
    target: 'Support Agent v4',
    ip: '198.51.100.31',
    location: 'Pune, IN',
  },
  {
    id: 'evt_7',
    time: 'Oct 26, 08:02:48',
    date: 'today',
    actor: { kind: 'person', person: people.daniel },
    action: 'apikey.disabled',
    target: 'Old website widget',
    ip: '203.0.113.24',
    location: 'Karachi, PK',
  },
  {
    id: 'evt_8',
    time: 'Oct 25, 18:20:03',
    date: 'yesterday',
    actor: { kind: 'person', person: people.maya },
    action: 'member.suspended',
    target: 'Jae Kim',
    ip: '203.0.113.9',
    location: 'Austin, US',
  },
];

export const auditActorName = (actor: AuditActor) =>
  actor.kind === 'person' ? actor.person.name : actor.name;

/* ------------------------------------------------------------------ */
/* W10-05 · Security                                                   */
/* ------------------------------------------------------------------ */

export interface Session {
  id: string;
  device: string;
  where: string;
  when: string;
  current?: boolean;
}

export const sessions: Session[] = [
  { id: 's1', device: 'Chrome on macOS', where: 'Karachi, PK', when: 'Active now', current: true },
  { id: 's2', device: 'Safari on iPhone', where: 'Karachi, PK', when: '2 h ago' },
  { id: 's3', device: 'Edge on Windows', where: 'Austin, US', when: 'Yesterday' },
];

/* ------------------------------------------------------------------ */
/* W10-06 · Data & privacy                                             */
/* ------------------------------------------------------------------ */

export type Retention = '30d' | '90d' | '1y' | 'forever';

export const retentionOptions: { value: Retention; label: string }[] = [
  { value: '30d', label: '30 d' },
  { value: '90d', label: '90 d' },
  { value: '1y', label: '1 year' },
  { value: 'forever', label: 'Forever' },
];

export interface RetentionRule {
  id: 'chats' | 'runs' | 'files' | 'audit';
  label: string;
  description?: string;
  value: Retention;
  /** Options above the plan limit. */
  locked?: Retention[];
}

export const retentionRules: RetentionRule[] = [
  { id: 'chats', label: 'Chats', value: '90d' },
  { id: 'runs', label: 'Runs and traces', value: '90d' },
  {
    id: 'files',
    label: 'Uploaded files',
    description: 'Files in Knowledge are kept until you delete them',
    value: 'forever',
  },
  {
    id: 'audit',
    label: 'Audit log',
    description: 'Up to 90 days on Pro',
    value: '90d',
    locked: ['1y', 'forever'],
  },
];

export type PiiKind = 'email' | 'phone' | 'card' | 'nationalId';

export const piiRules: { id: PiiKind; label: string; on: boolean }[] = [
  { id: 'email', label: 'Email addresses', on: true },
  { id: 'phone', label: 'Phone numbers', on: true },
  { id: 'card', label: 'Card numbers', on: true },
  { id: 'nationalId', label: 'National ID numbers', on: false },
];

export const workspaceName = 'Northwind Labs';

/* ------------------------------------------------------------------ */
/* W10-07 · General                                                    */
/* ------------------------------------------------------------------ */

export const timeZones = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (UTC+5)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
  { value: 'America/New_York', label: 'America/New_York (UTC−5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC−8)' },
];

export const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

export const models = [
  { value: 'model-a', label: 'Model A · Fast' },
  { value: 'model-b', label: 'Model B · Balanced' },
  { value: 'model-c', label: 'Model C · Deep reasoning' },
];

export const weekStarts = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'saturday', label: 'Saturday' },
];

/* ------------------------------------------------------------------ */
/* W10-08 · Guardrails                                                 */
/* ------------------------------------------------------------------ */

export type PolicyAction = 'approval' | 'block' | 'warn' | 'log';

export const policyActions: Record<PolicyAction, { label: string; tone: Tone }> = {
  approval: { label: 'Require approval', tone: 'warn' },
  block: { label: 'Block', tone: 'danger' },
  warn: { label: 'Warn', tone: 'info' },
  log: { label: 'Log only', tone: 'neutral' },
};

export interface Policy {
  id: string;
  name: string;
  type: string;
  scope: string;
  action: PolicyAction;
  matches: number;
  on: boolean;
  /** The rule in plain words, shown in the editor. */
  rule: string;
}

export const policies: Policy[] = [
  {
    id: 'refund',
    rule: 'Refunds over $100 need a reviewer before the agent sends them.',
    name: 'Refund guardrail',
    type: 'Action limit',
    scope: 'Support Agent',
    action: 'approval',
    matches: 126,
    on: true,
  },
  {
    id: 'cards',
    rule: 'Never show or send full card numbers. Mask all but the last 4 digits.',
    name: 'Card numbers',
    type: 'Sensitive data',
    scope: 'All agents',
    action: 'block',
    matches: 18,
    on: true,
  },
  {
    id: 'legal',
    rule: 'Don’t give legal or medical advice. Point people to a professional instead.',
    name: 'Legal and medical advice',
    type: 'Blocked topic',
    scope: 'All agents',
    action: 'block',
    matches: 32,
    on: true,
  },
  {
    id: 'email',
    rule: 'Agents can only email addresses at northwindlabs.com, acme.example and helpbase.example.',
    name: 'Outgoing email domains',
    type: 'Allowed domains',
    scope: 'All agents',
    action: 'block',
    matches: 3,
    on: true,
  },
  {
    id: 'spend',
    rule: 'Warn the owner when an agent spends more than $50 in a day.',
    name: 'Daily spend per agent',
    type: 'Spend limit',
    scope: 'All agents',
    action: 'warn',
    matches: 1,
    on: true,
  },
  {
    id: 'voice',
    rule: 'Replies stay friendly, plain and short. Log anything that sounds off-brand.',
    name: 'Brand voice',
    type: 'Tone and brand',
    scope: 'Support Agent',
    action: 'log',
    matches: 210,
    on: false,
  },
];

export const recentMatches: { kind: 'Approval' | 'Blocked'; text: string; run: string; to: string }[] = [
  { kind: 'Approval', text: 'Refund $240 to Acme Co.', run: 'run_4835', to: '/runs/run_4835' },
  { kind: 'Blocked', text: 'Reply contained a card number', run: 'run_4826', to: '/runs' },
  { kind: 'Blocked', text: 'Email to gmail.example not allowed', run: 'run_4811', to: '/runs' },
];

export const approverOptions = [
  { value: 'support-leads', label: 'Support leads' },
  { value: 'finance', label: 'Finance team' },
  { value: 'admins', label: 'Admins' },
];

export const actionOptions = (Object.keys(policyActions) as PolicyAction[]).map((a) => ({
  value: a,
  label: policyActions[a].label,
}));

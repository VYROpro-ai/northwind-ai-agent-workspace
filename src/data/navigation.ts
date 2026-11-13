import type { IconName } from '@/components/icons';
import type { Role } from './people';

export type NavKey =
  | 'Home'
  | 'Chat'
  | 'Agents'
  | 'Workflows'
  | 'Runs'
  | 'Approvals'
  | 'Knowledge'
  | 'Integrations'
  | 'Analytics'
  | 'Settings'
  | 'Team'
  | 'Help';

export interface NavItem {
  key: NavKey;
  label: string;
  icon: IconName;
  to: string;
  badge?: number;
}

export const mainNav: NavItem[] = [
  { key: 'Home', label: 'Home', icon: 'home', to: '/' },
  { key: 'Chat', label: 'Chat', icon: 'chat', to: '/chat' },
  { key: 'Agents', label: 'Agents', icon: 'nav-agents', to: '/agents' },
  { key: 'Workflows', label: 'Workflows', icon: 'workflow', to: '/workflows' },
  { key: 'Runs', label: 'Runs', icon: 'run', to: '/runs', badge: 12 },
  { key: 'Approvals', label: 'Approvals', icon: 'approval', to: '/approvals', badge: 4 },
  { key: 'Knowledge', label: 'Knowledge', icon: 'knowledge', to: '/knowledge' },
  { key: 'Integrations', label: 'Integrations', icon: 'integration', to: '/integrations', badge: 1 },
  { key: 'Analytics', label: 'Analytics', icon: 'analytics', to: '/analytics' },
];

export const secondaryNav: NavItem[] = [
  { key: 'Settings', label: 'Settings', icon: 'gear', to: '/settings/general' },
  { key: 'Team', label: 'Team members', icon: 'users', to: '/settings/members', badge: 2 },
  { key: 'Help', label: 'Help center', icon: 'help', to: '/search' },
];

/** Which main sections each role can see (mirrors the kit's role matrix). */
export const navByRole: Record<Role, NavKey[]> = {
  owner: [
    'Home',
    'Chat',
    'Agents',
    'Workflows',
    'Runs',
    'Approvals',
    'Knowledge',
    'Integrations',
    'Analytics',
  ],
  admin: [
    'Home',
    'Chat',
    'Agents',
    'Workflows',
    'Runs',
    'Approvals',
    'Knowledge',
    'Integrations',
    'Analytics',
  ],
  builder: ['Home', 'Chat', 'Agents', 'Workflows', 'Runs', 'Knowledge', 'Integrations', 'Analytics'],
  reviewer: ['Home', 'Chat', 'Agents', 'Runs', 'Approvals', 'Analytics'],
  member: ['Home', 'Chat', 'Agents'],
  viewer: ['Home', 'Runs', 'Analytics'],
};

export interface SettingsLink {
  label: string;
  to: string;
  /** Extra paths that should also mark this link as current. */
  match?: string[];
}

export const settingsGroups: {
  key: 'workspace' | 'billing' | 'account';
  label: string;
  icon: IconName;
  links: SettingsLink[];
}[] = [
  {
    key: 'workspace',
    label: 'Workspace',
    icon: 'building',
    links: [
      { label: 'General', to: '/settings/general' },
      { label: 'Members', to: '/settings/members' },
      { label: 'Roles', to: '/settings/roles' },
      { label: 'Security', to: '/settings/security' },
      { label: 'Data & privacy', to: '/settings/privacy' },
      { label: 'Guardrails', to: '/settings/guardrails' },
      { label: 'Audit log', to: '/settings/audit-log' },
    ],
  },
  {
    key: 'billing',
    label: 'Billing',
    icon: 'credit-card',
    links: [
      { label: 'Plan', to: '/settings/billing', match: ['/settings/plans'] },
      { label: 'Invoices', to: '/settings/invoices' },
      { label: 'Payment', to: '/settings/payment' },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    icon: 'user',
    links: [
      { label: 'Profile', to: '/settings/profile' },
      { label: 'Preferences', to: '/settings/preferences' },
      { label: 'Notifications', to: '/settings/notifications' },
    ],
  },
];

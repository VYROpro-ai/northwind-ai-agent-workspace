import type { IconName } from '@/components/icons';
import type { RunStatus } from '@/components/ui';
import type { ToolCallState, ReasoningStep } from '@/components/ai';

/* ---------------------------------------------------------------------------
 * Navigation
 * ------------------------------------------------------------------------- */

export interface DsSection {
  id: string;
  label: string;
  icon: IconName;
}

export interface DsSectionGroup {
  title: string;
  sections: DsSection[];
}

export const sectionGroups: DsSectionGroup[] = [
  {
    title: 'Foundations',
    sections: [
      { id: 'colors', label: 'Color', icon: 'sliders' },
      { id: 'typography', label: 'Typography', icon: 'file-text' },
      { id: 'spacing', label: 'Spacing & radius', icon: 'grid' },
      { id: 'elevation', label: 'Elevation', icon: 'layers' },
      { id: 'icons', label: 'Icons', icon: 'star' },
    ],
  },
  {
    title: 'Components',
    sections: [
      { id: 'buttons', label: 'Buttons', icon: 'zap' },
      { id: 'badges', label: 'Badges & avatars', icon: 'tag' },
      { id: 'inputs', label: 'Inputs', icon: 'edit' },
      { id: 'controls', label: 'Controls', icon: 'sliders' },
      { id: 'navigation', label: 'Navigation', icon: 'menu' },
      { id: 'overlays', label: 'Overlays', icon: 'maximize' },
      { id: 'feedback', label: 'Feedback', icon: 'info' },
      { id: 'data', label: 'Data display', icon: 'list' },
      { id: 'ai', label: 'AI', icon: 'sparkle' },
      { id: 'charts', label: 'Charts', icon: 'analytics' },
    ],
  },
];

export const allSections = sectionGroups.flatMap((g) => g.sections);

/* ---------------------------------------------------------------------------
 * Color
 * ------------------------------------------------------------------------- */

export const rampSteps = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const;

export interface Ramp {
  name: string;
  label: string;
  role: string;
  /** Index of the first step that carries white text at 4.5:1. */
  firstWhite: number;
  /** Steps that exist for this ramp; defaults to the full 50–950 scale. */
  steps?: readonly string[];
}

export const ramps: Ramp[] = [
  { name: 'slate', label: 'Slate', role: 'Neutral · text, surfaces, borders', firstWhite: 5 },
  { name: 'cobalt', label: 'Cobalt', role: 'Brand · primary actions, links, focus', firstWhite: 5 },
  { name: 'violet', label: 'Violet', role: 'AI accent · anything an agent writes', firstWhite: 6 },
  { name: 'green', label: 'Green', role: 'Success · succeeded, approved, healthy', firstWhite: 7 },
  { name: 'amber', label: 'Amber', role: 'Warning · waiting, near limit, stale', firstWhite: 7 },
  { name: 'red', label: 'Red', role: 'Danger · failed, blocked, destructive', firstWhite: 6 },
  { name: 'sky', label: 'Sky', role: 'Info · neutral notices, queued', firstWhite: 7 },
  { name: 'orange', label: 'Orange', role: 'Accent · counters, live dots', firstWhite: 0, steps: ['500'] },
];

export interface SemanticToken {
  /** CSS custom property without the leading dashes. */
  name: string;
  utility: string;
  description: string;
}

export interface SemanticGroup {
  title: string;
  tokens: SemanticToken[];
}

export const semanticGroups: SemanticGroup[] = [
  {
    title: 'Backgrounds',
    tokens: [
      { name: 'canvas', utility: 'bg-canvas', description: 'App background behind every page' },
      { name: 'page', utility: 'bg-page', description: 'Flat page background on dashboards' },
      { name: 'surface', utility: 'bg-surface', description: 'Cards, tables, sidebars' },
      { name: 'raised', utility: 'bg-raised', description: 'Menus, popovers, toasts' },
      { name: 'sunken', utility: 'bg-sunken', description: 'Wells, table headers, code inputs' },
      { name: 'subtle', utility: 'bg-subtle', description: 'Hover rows, neutral pills, tracks' },
      { name: 'panel', utility: 'bg-panel', description: 'Side panels next to the canvas' },
      { name: 'inverse', utility: 'bg-inverse', description: 'Selected pills, tooltips, dark CTAs' },
      { name: 'on-inverse', utility: 'text-on-inverse', description: 'Text on inverse fills' },
    ],
  },
  {
    title: 'Borders',
    tokens: [
      { name: 'border', utility: 'border-border', description: 'Default 1 px divider and card edge' },
      { name: 'border-strong', utility: 'border-border-strong', description: 'Inputs, secondary buttons' },
      { name: 'focus', utility: 'border-focus', description: 'Focused input border and outline' },
      {
        name: 'focus-ring',
        utility: 'shadow-[0_0_0_3px_var(--focus-ring)]',
        description: '3 px halo around focused fields',
      },
    ],
  },
  {
    title: 'Text & icons',
    tokens: [
      { name: 'fg', utility: 'text-fg', description: 'Primary text, headings' },
      { name: 'fg-2', utility: 'text-fg-2', description: 'Secondary text, body copy in cards' },
      { name: 'fg-3', utility: 'text-fg-3', description: 'Tertiary text, captions, meta' },
      { name: 'fg-disabled', utility: 'text-fg-disabled', description: 'Disabled labels and placeholders' },
      { name: 'icon', utility: 'text-icon', description: 'Default icon colour' },
      { name: 'icon-muted', utility: 'text-icon-muted', description: 'Decorative or inactive icons' },
      { name: 'link', utility: 'text-link', description: 'Inline links' },
    ],
  },
  {
    title: 'Brand',
    tokens: [
      { name: 'brand', utility: 'bg-brand', description: 'Primary buttons, selection, progress' },
      { name: 'brand-hover', utility: 'hover:bg-brand-hover', description: 'Primary hover' },
      { name: 'brand-press', utility: 'active:bg-brand-press', description: 'Primary pressed' },
      { name: 'brand-subtle', utility: 'bg-brand-subtle', description: 'Selected rows, brand pills' },
      { name: 'brand-text', utility: 'text-brand-text', description: 'Text on brand-subtle' },
      { name: 'brand-border', utility: 'border-brand-border', description: 'Edge of brand pills' },
    ],
  },
  {
    title: 'AI',
    tokens: [
      { name: 'ai', utility: 'bg-ai', description: 'AI buttons, typing dots — agent output only' },
      { name: 'ai-hover', utility: 'hover:bg-ai-hover', description: 'AI button hover' },
      { name: 'ai-press', utility: 'active:bg-ai-press', description: 'AI button pressed' },
      { name: 'ai-subtle', utility: 'bg-ai-subtle', description: 'Reasoning blocks, AI badges' },
      { name: 'ai-text', utility: 'text-ai-text', description: 'Text on ai-subtle' },
      { name: 'ai-border', utility: 'border-ai-border', description: 'Edge of AI surfaces' },
      { name: 'ai-caret', utility: 'bg-ai-caret', description: 'Streaming caret' },
    ],
  },
  {
    title: 'Status',
    tokens: [
      { name: 'ok', utility: 'bg-ok · text-ok', description: 'Success fill, dots and icons' },
      { name: 'ok-subtle', utility: 'bg-ok-subtle', description: 'Success pill and alert background' },
      { name: 'ok-text', utility: 'text-ok-text', description: 'Success label' },
      { name: 'ok-border', utility: 'border-ok-border', description: 'Success pill edge' },
      { name: 'warn', utility: 'bg-warn · text-warn', description: 'Warning fill — waiting, near limit' },
      { name: 'warn-subtle', utility: 'bg-warn-subtle', description: 'Warning pill and alert background' },
      { name: 'warn-text', utility: 'text-warn-text', description: 'Warning label' },
      { name: 'warn-border', utility: 'border-warn-border', description: 'Warning pill edge' },
      { name: 'danger', utility: 'bg-danger · text-danger', description: 'Destructive buttons, failures' },
      { name: 'danger-subtle', utility: 'bg-danger-subtle', description: 'Error pill and alert background' },
      { name: 'danger-text', utility: 'text-danger-text', description: 'Error label and field message' },
      { name: 'danger-border', utility: 'border-danger-border', description: 'Error pill edge' },
      { name: 'info', utility: 'bg-info · text-info', description: 'Neutral notices, queued' },
      { name: 'info-subtle', utility: 'bg-info-subtle', description: 'Info pill and alert background' },
      { name: 'info-text', utility: 'text-info-text', description: 'Info label' },
      { name: 'info-border', utility: 'border-info-border', description: 'Info pill edge' },
      { name: 'accent', utility: 'bg-accent', description: 'Counters, live dots, credit badges' },
    ],
  },
  {
    title: 'Data & code',
    tokens: [
      { name: 'chart-1', utility: "color='var(--chart-1)'", description: 'Primary series' },
      { name: 'chart-2', utility: "color='var(--chart-2)'", description: 'Second series' },
      { name: 'chart-3', utility: "color='var(--chart-3)'", description: 'Third series' },
      { name: 'chart-4', utility: "color='var(--chart-4)'", description: 'Fourth series' },
      { name: 'chart-grid', utility: "stroke='var(--chart-grid)'", description: 'Grid lines' },
      { name: 'code', utility: 'bg-code', description: 'Code block background' },
      { name: 'code-fg', utility: 'text-code-fg', description: 'Code text' },
      { name: 'scrim', utility: 'bg-scrim', description: 'Backdrop behind modals and drawers' },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * Typography
 * ------------------------------------------------------------------------- */

export interface TypeStyle {
  name: string;
  utility: string;
  metrics: string;
  className: string;
  sample: string;
  /** Optional emphasised lead-in rendered in medium weight. */
  strong?: string;
}

export const typeScale: TypeStyle[] = [
  {
    name: 'Display',
    utility: 'text-display',
    metrics: '48 / 56 · 600 · −2.5%',
    className: 'text-display font-semibold',
    sample: 'AI agents your team can trust',
  },
  {
    name: 'H1',
    utility: 'text-h1',
    metrics: '32 / 40 · 600 · −2%',
    className: 'text-h1 font-semibold',
    sample: 'Good morning, Maya',
  },
  {
    name: 'H2',
    utility: 'text-h2',
    metrics: '24 / 32 · 600 · −1.5%',
    className: 'text-h2 font-semibold',
    sample: 'Needs your attention',
  },
  {
    name: 'H3',
    utility: 'text-h3',
    metrics: '20 / 28 · 600 · −1%',
    className: 'text-h3 font-semibold',
    sample: 'Send refund of $240 to Acme Co.',
  },
  {
    name: 'H4',
    utility: 'text-h4',
    metrics: '16 / 24 · 600 · −0.5%',
    className: 'text-h4 font-semibold',
    sample: 'Top agents this week',
  },
  {
    name: 'Body L',
    utility: 'text-body-l',
    metrics: '16 / 24 · 400 · 0',
    className: 'text-body-l',
    sample:
      "Acme Co. qualifies for a refund of $240 under the 30-day return policy. I'll draft the email for Leo to approve.",
  },
  {
    name: 'Body M',
    utility: 'text-body-m · font-medium',
    metrics: '14 / 20 · 400 / 500 · 0',
    className: 'text-body-m',
    strong: 'Priya edited this 2 min ago.',
    sample: ' Reload to see changes.',
  },
  {
    name: '13',
    utility: 'text-13',
    metrics: '13 / 18 · 400 / 500 · 0',
    className: 'text-13',
    sample: 'Secondary buttons, segmented controls and dense lists',
  },
  {
    name: 'Body S',
    utility: 'text-body-s',
    metrics: '12 / 16 · 400 / 500 · 0',
    className: 'text-body-s text-fg-2',
    sample: 'Used 3 tools · 1.8 s · 2,410 tokens · $0.04',
  },
  {
    name: 'Caption',
    utility: 'text-caption',
    metrics: '11 / 14 · 500 · +1%',
    className: 'text-caption font-medium text-fg-2',
    sample: 'Last synced Oct 25, 2026 · 9:14 AM PKT',
  },
  {
    name: 'Mono',
    utility: 'text-mono font-mono',
    metrics: '13 / 20 · 400 · 0',
    className: 'font-mono text-mono',
    sample: 'run_8f2a91c4 · approval.requested · sk-live-••••4f9a',
  },
];

/* ---------------------------------------------------------------------------
 * Spacing, radius, elevation
 * ------------------------------------------------------------------------- */

export const spacing: { px: number; utility: string; use: string }[] = [
  { px: 0, utility: 'gap-0', use: 'Collapsed, no gap' },
  { px: 2, utility: 'gap-0.5', use: 'Icon to badge nudge' },
  { px: 4, utility: 'gap-1', use: 'Icon to label' },
  { px: 8, utility: 'gap-2', use: 'Inside chips, pills' },
  { px: 12, utility: 'gap-3', use: 'Form label to field' },
  { px: 16, utility: 'gap-4', use: 'Card padding (compact)' },
  { px: 20, utility: 'gap-5', use: 'List row padding' },
  { px: 24, utility: 'gap-6', use: 'Card padding, grid gutter' },
  { px: 32, utility: 'gap-8', use: 'Between sections in a card' },
  { px: 40, utility: 'gap-10', use: 'Page header to content' },
  { px: 48, utility: 'gap-12', use: 'Between page sections' },
  { px: 64, utility: 'gap-16', use: 'Marketing section gap' },
  { px: 80, utility: 'gap-20', use: 'Marketing hero padding' },
];

export const radii: { utility: string; px: string; className: string; use: string }[] = [
  { utility: 'rounded-none', px: '0px', className: 'rounded-none', use: 'Tables, full-bleed panels' },
  { utility: 'rounded-xs', px: '4px', className: 'rounded-xs', use: 'Badges, tags, checkboxes' },
  { utility: 'rounded-sm', px: '6px', className: 'rounded-sm', use: 'Buttons S, chips, tooltips' },
  { utility: 'rounded-md', px: '8px', className: 'rounded-md', use: 'Buttons, inputs, menus' },
  { utility: 'rounded-lg', px: '12px', className: 'rounded-lg', use: 'Cards, popovers, tool call cards' },
  { utility: 'rounded-xl', px: '16px', className: 'rounded-xl', use: 'Modals, drawers, bottom sheets' },
  { utility: 'rounded-2xl', px: '20px', className: 'rounded-2xl', use: 'Dashboard cards, composer' },
  { utility: 'rounded-3xl', px: '28px', className: 'rounded-3xl', use: 'Hero panels, auth visuals' },
  {
    utility: 'rounded-full',
    px: '9999px',
    className: 'rounded-full',
    use: 'Pills, avatars, toggles, voice orb',
  },
];

export interface ElevationLevel {
  name: string;
  utility: string;
  /** CSS custom property holding the shadow, if any. */
  token?: string;
  className: string;
  use: string;
}

export const elevations: ElevationLevel[] = [
  {
    name: 'Flat',
    utility: 'border only',
    className: 'border border-border bg-surface',
    use: 'Cards in a grid, table containers, sidebars',
  },
  {
    name: 'Raised',
    utility: 'shadow-raised',
    token: '--shadow-raised',
    className: 'border border-border bg-raised shadow-raised',
    use: 'Workflow nodes, stat cards, the composer',
  },
  {
    name: 'Overlay',
    utility: 'shadow-overlay',
    token: '--shadow-overlay',
    className: 'border border-border bg-raised shadow-overlay',
    use: 'Menus, popovers, citation hover cards, toasts',
  },
  {
    name: 'Modal',
    utility: 'shadow-modal',
    token: '--shadow-modal',
    className: 'border border-border bg-raised shadow-modal',
    use: 'Modals, drawers, command palette, bottom sheets',
  },
  {
    name: 'Inverse',
    utility: 'shadow-inverse',
    token: '--shadow-inverse',
    className: 'bg-inverse text-on-inverse shadow-inverse',
    use: 'Selected pills, the dark segmented thumb',
  },
];

/* ---------------------------------------------------------------------------
 * Component gallery demo data
 * ------------------------------------------------------------------------- */

export const runStatuses: RunStatus[] = ['queued', 'running', 'waiting', 'succeeded', 'failed', 'cancelled'];

export interface DemoRun {
  id: string;
  agent: string;
  task: string;
  status: RunStatus;
  duration: string;
  cost: string;
}

export const demoRuns: DemoRun[] = [
  {
    id: 'run_4835',
    agent: 'Support Agent',
    task: 'Refund request · Acme Co.',
    status: 'waiting',
    duration: '14 min',
    cost: '$0.04',
  },
  {
    id: 'run_4834',
    agent: 'Billing Agent',
    task: 'Invoice #48213 lookup',
    status: 'running',
    duration: '12 s',
    cost: '$0.01',
  },
  {
    id: 'run_4833',
    agent: 'Support Agent',
    task: 'Update CRM record',
    status: 'failed',
    duration: '3.1 s',
    cost: '$0.02',
  },
  {
    id: 'run_4832',
    agent: 'Research Agent',
    task: 'Summarise Q3 churn notes',
    status: 'succeeded',
    duration: '4.2 s',
    cost: '$0.06',
  },
  {
    id: 'run_4831',
    agent: 'Ops Agent',
    task: 'Nightly stock sync',
    status: 'queued',
    duration: '—',
    cost: '—',
  },
  {
    id: 'run_4830',
    agent: 'Billing Agent',
    task: 'Send dunning email',
    status: 'cancelled',
    duration: '0.4 s',
    cost: '$0.00',
  },
];

export interface DemoToolCall {
  state: ToolCallState;
  name: string;
  detail: string;
  icon: IconName;
  duration?: string;
}

export const demoToolCalls: DemoToolCall[] = [
  {
    state: 'running',
    name: 'Search CRM',
    detail: 'Looking up “Acme Co.”',
    icon: 'search',
    duration: '1.2 s',
  },
  { state: 'succeeded', name: 'Search CRM', detail: 'Found 1 customer', icon: 'database', duration: '0.8 s' },
  {
    state: 'failed',
    name: 'Update CRM record',
    detail: "Missing field 'email'",
    icon: 'edit',
    duration: '0.3 s',
  },
  {
    state: 'blocked',
    name: 'Send email to 42 customers',
    detail: 'Blocked by policy · No external email',
    icon: 'mail',
  },
  { state: 'approval', name: 'Issue refund · $240', detail: 'Waiting for Leo', icon: 'receipt' },
  {
    state: 'timeout',
    name: 'Fetch invoice',
    detail: 'Timed out after 30 s',
    icon: 'file-text',
    duration: '30 s',
  },
  {
    state: 'reconnect',
    name: 'Pipeline CRM',
    detail: 'Token expired — reconnect to continue',
    icon: 'integration',
  },
];

export const demoReasoning: ReasoningStep[] = [
  { title: 'Read the refund policy', detail: 'Refund policy 2026.pdf · section 3.2', state: 'done' },
  { title: 'Check the order history', detail: 'Order #48213 · delivered Oct 2', state: 'done' },
  { title: 'Search knowledge', detail: 'Matching “30-day return”', state: 'active' },
  { title: 'Draft the reply for approval', state: 'pending' },
];

export const chartDays = [
  'Oct 13',
  'Oct 14',
  'Oct 15',
  'Oct 16',
  'Oct 17',
  'Oct 18',
  'Oct 19',
  'Oct 20',
  'Oct 21',
  'Oct 22',
  'Oct 23',
  'Oct 24',
  'Oct 25',
  'Oct 26',
];

export const lineSeries = [
  {
    name: 'Succeeded',
    color: 'var(--chart-1)',
    area: true,
    data: [412, 438, 455, 430, 472, 498, 486, 512, 540, 528, 561, 584, 570, 602],
  },
  {
    name: 'Needed approval',
    color: 'var(--chart-2)',
    data: [96, 104, 98, 112, 120, 116, 124, 131, 128, 140, 136, 142, 150, 146],
  },
  {
    name: 'Failed',
    color: 'var(--chart-3)',
    dashed: true,
    data: [32, 28, 35, 30, 26, 29, 24, 27, 22, 25, 21, 23, 19, 20],
  },
];

export const barLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const barSegments = [
  { name: 'Automated', color: 'var(--ok)' },
  { name: 'With approval', color: 'var(--chart-1)' },
  { name: 'Escalated', color: 'var(--chart-2)' },
];
export const barValues = [
  [180, 210, 196, 240, 228, 120, 96],
  [64, 72, 70, 86, 80, 38, 30],
  [18, 22, 16, 28, 24, 10, 8],
];

export const barListItems = [
  { label: 'Support Agent', value: 1284, hint: '42%' },
  { label: 'Billing Agent', value: 806, hint: '26%' },
  { label: 'Research Agent', value: 512, hint: '17%' },
  { label: 'Ops Agent', value: 448, hint: '15%' },
];

export const donutSlices = [
  { name: 'Model calls', value: 58, color: 'var(--chart-1)' },
  { name: 'Retrieval', value: 21, color: 'var(--chart-2)' },
  { name: 'Tools', value: 13, color: 'var(--chart-3)' },
  { name: 'Voice', value: 8, color: 'var(--chart-4)' },
];

export const sparkData = [12, 14, 13, 17, 16, 19, 18, 22, 21, 24, 26, 25, 29];
export const sparkDown = [30, 28, 29, 26, 27, 24, 22, 23, 20, 19, 18, 18, 16];

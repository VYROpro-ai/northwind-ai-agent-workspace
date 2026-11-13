import type { IconName } from '@/components/icons';
import type { TileTone } from '@/components/ui/Tiles';
import { people, type Person } from '@/data/people';

export type { TileTone };

export type SourceKind = 'website' | 'upload' | 'wiki' | 'drive' | 'database' | 'helpcenter' | 'inbox';

export const sourceKinds: Record<SourceKind, { label: string; icon: IconName; tone: TileTone }> = {
  website: { label: 'Website', icon: 'globe', tone: 'info' },
  upload: { label: 'Upload', icon: 'file', tone: 'neutral' },
  wiki: { label: 'Wiki', icon: 'knowledge', tone: 'ai' },
  drive: { label: 'Docs drive', icon: 'drive', tone: 'warn' },
  database: { label: 'Database', icon: 'database', tone: 'ok' },
  helpcenter: { label: 'Help center', icon: 'info', tone: 'brand' },
  inbox: { label: 'Shared inbox', icon: 'inbox', tone: 'neutral' },
};

/* ------------------------------------------------------------------ W7-01 Sources */

export type SourceStatus = 'indexed' | 'indexing' | 'failed' | 'paused';

/** Agents that can cite a source — shown as tiny lettered chips. */
export type AgentChipId = 'SA' | 'DA' | 'SR';

export const agentChips: Record<AgentChipId, { name: string; className: string }> = {
  SA: { name: 'Support Agent', className: 'bg-brand' },
  DA: { name: 'Data Analyst', className: 'bg-[var(--amber-700)]' },
  SR: { name: 'Sales Researcher', className: 'bg-ai' },
};

export interface KnowledgeSource {
  id: string;
  name: string;
  detail: string;
  kind: SourceKind;
  collection: string;
  docs: string;
  docCount: number;
  status: SourceStatus;
  progress?: number;
  usedBy: AgentChipId[];
  lastSynced: string;
  owner: Person;
  /** Route to the document viewer, when the source has one. */
  to?: string;
}

export const sources: KnowledgeSource[] = [
  {
    id: 'help-center',
    name: 'Help center',
    detail: 'help.northwindlabs.com',
    kind: 'website',
    collection: 'Support',
    docs: '142',
    docCount: 142,
    status: 'indexed',
    usedBy: ['SA'],
    lastSynced: '2 h ago',
    owner: people.priya,
  },
  {
    id: 'refund-billing',
    name: 'Refund & billing policies',
    detail: 'Support collection',
    kind: 'upload',
    collection: 'Support',
    docs: '18',
    docCount: 18,
    status: 'indexed',
    usedBy: ['SA', 'DA'],
    lastSynced: 'Oct 21',
    owner: people.priya,
    to: '/knowledge/documents/refund-policy-2026',
  },
  {
    id: 'product-catalog',
    name: 'Product catalog fall 2026.csv',
    detail: 'Uploaded just now',
    kind: 'upload',
    collection: 'Sales',
    docs: '1',
    docCount: 1,
    status: 'indexing',
    progress: 65,
    usedBy: ['SA'],
    lastSynced: 'Now',
    owner: people.priya,
  },
  {
    id: 'team-wiki',
    name: 'Team wiki · Support',
    detail: '326 pages, 4 spaces',
    kind: 'wiki',
    collection: 'Support',
    docs: '326',
    docCount: 326,
    status: 'indexed',
    usedBy: ['SA', 'SR'],
    lastSynced: '15 min ago',
    owner: people.daniel,
  },
  {
    id: 'sales-playbooks',
    name: 'Sales playbooks',
    detail: 'Failing for 3 days · access revoked',
    kind: 'drive',
    collection: 'Sales',
    docs: '88',
    docCount: 88,
    status: 'failed',
    usedBy: ['SR'],
    lastSynced: 'Oct 23',
    owner: people.daniel,
  },
  {
    id: 'orders-db',
    name: 'Orders database',
    detail: 'orders, shipments · read-only',
    kind: 'database',
    collection: 'Operations',
    docs: '2 tables',
    docCount: 1,
    status: 'paused',
    usedBy: ['SA'],
    lastSynced: 'Oct 25',
    owner: people.maya,
  },
  {
    id: 'old-onboarding',
    name: 'Old onboarding docs',
    detail: 'Archive collection',
    kind: 'upload',
    collection: 'Archive',
    docs: '12',
    docCount: 12,
    status: 'indexed',
    usedBy: [],
    lastSynced: 'Sep 2',
    owner: people.priya,
  },
];

export const collections = ['All sources', 'Support', 'Sales', 'Operations', 'Archive'];

export const knowledgeStats = {
  documents: 588,
  sourceCount: 7,
  totalSize: '2.4 GB',
  storageUsed: 2.4,
  storageLimit: 10,
  lastSync: '15 min ago',
  lastSyncSource: 'Team wiki · Support',
};

/* ------------------------------------------------------------------ W7-02 Upload */

export type UploadStatus = 'uploading' | 'duplicate' | 'failed' | 'paused' | 'uploaded';

export interface UploadItem {
  id: string;
  name: string;
  /** Size in bytes. */
  size: number;
  status: UploadStatus;
  progress: number;
  error?: string;
  /** False for errors a retry can't fix (unsupported type, too large). */
  retryable?: boolean;
}

export const uploadCollections = ['Support / Policies', 'Support / Macros', 'Sales / Playbooks', 'Archive'];

export const acceptedExtensions = ['pdf', 'docx', 'xlsx', 'csv', 'md', 'txt', 'html'];

export const initialUploads: UploadItem[] = [
  { id: 'u1', name: 'Warranty terms 2026.pdf', size: 2_100_000, status: 'uploading', progress: 72 },
  {
    id: 'u2',
    name: 'Returns FAQ.docx',
    size: 184_000,
    status: 'duplicate',
    progress: 0,
    error: 'Same name and size as a file in this collection',
  },
  {
    id: 'u3',
    name: 'Vendor contract (signed).pdf',
    size: 1_400_000,
    status: 'failed',
    progress: 0,
    error: 'Can’t open password-protected files',
  },
  { id: 'u4', name: 'Shipping zones.xlsx', size: 312_000, status: 'paused', progress: 40 },
  { id: 'u5', name: 'Escalation guide.md', size: 12_000, status: 'uploaded', progress: 100 },
];

/** Files from this batch that already finished and are collapsed into "+ N more uploaded". */
export const collapsedUploads = { count: 15, bytes: 34_592_000 };

/* ------------------------------------------------------------------ W7-03 Connect */

export const connectorKinds: { kind: SourceKind; description: string }[] = [
  { kind: 'drive', description: 'Folders and files' },
  { kind: 'wiki', description: 'Spaces and pages' },
  { kind: 'website', description: 'Public pages' },
  { kind: 'helpcenter', description: 'Articles' },
  { kind: 'database', description: 'Tables, read-only' },
  { kind: 'inbox', description: 'Past email threads' },
];

export const connectorLabels: Partial<Record<SourceKind, string>> = { website: 'Website crawler' };

export interface FolderNode {
  id: string;
  name: string;
  count: number;
  children?: FolderNode[];
}

export const folderTree: FolderNode = {
  id: 'root',
  name: 'Northwind Labs',
  count: 12_400,
  children: [
    {
      id: 'sales',
      name: 'Sales',
      count: 3_210,
      children: [
        { id: 'playbooks', name: 'Playbooks', count: 1_840 },
        { id: 'proposals', name: 'Proposals', count: 1_370 },
      ],
    },
    {
      id: 'support',
      name: 'Support',
      count: 4_980,
      children: [
        { id: 'macros', name: 'Macros', count: 312 },
        { id: 'escalations', name: 'Escalations', count: 96 },
      ],
    },
    {
      id: 'finance',
      name: 'Finance',
      count: 2_870,
      children: [
        { id: 'invoices', name: 'Invoices', count: 2_100 },
        { id: 'reports', name: 'Reports', count: 770 },
      ],
    },
    {
      id: 'personal',
      name: 'Personal',
      count: 1_340,
      children: [{ id: 'drafts', name: 'Drafts', count: 1_340 }],
    },
  ],
};

export const initialFolderSelection = [
  'sales',
  'playbooks',
  'proposals',
  'support',
  'macros',
  'escalations',
  'finance',
  'invoices',
  'reports',
];
export const initialExpanded = ['root', 'support'];
export const planDocLimit = 10_000;

/* ------------------------------------------------------------------ W7-04 Indexing */

export const indexingJob = {
  title: 'Indexing Product catalog fall 2026 and 3 more',
  startedBy: 'Started 9:38 AM by Priya Nair',
  progress: 65,
  done: 1_326,
  total: 2_040,
  eta: 'About 6 min left',
  stats: [
    { label: 'Indexed', value: '1,312' },
    { label: 'Failed', value: '14' },
    { label: 'Chunks created', value: '48,206' },
    { label: 'Credits used', value: '$1.84' },
  ],
};

export type FailReason = 'Empty file' | 'Unsupported format' | 'Too large' | 'Access denied' | 'Timeout';

export const failReasonTone: Record<FailReason, 'warn' | 'neutral' | 'danger'> = {
  'Empty file': 'warn',
  'Unsupported format': 'neutral',
  'Too large': 'warn',
  'Access denied': 'danger',
  Timeout: 'warn',
};

export interface FailedDoc {
  id: string;
  name: string;
  ext: string;
  source: string;
  reason: FailReason;
  time: string;
  /** Which actions make sense for this failure. */
  actions: ('open' | 'remove' | 'retry')[];
}

export const failedDocs: FailedDoc[] = [
  {
    id: 'f1',
    name: 'Warranty terms (scanned).pdf',
    ext: 'PDF',
    source: 'Refund & billing policies',
    reason: 'Empty file',
    time: '9:48 AM',
    actions: ['open', 'remove'],
  },
  {
    id: 'f2',
    name: 'Q3 board deck.key',
    ext: 'KEY',
    source: 'Sales playbooks',
    reason: 'Unsupported format',
    time: '9:47 AM',
    actions: ['remove'],
  },
  {
    id: 'f3',
    name: 'Full product manual.pdf',
    ext: 'PDF',
    source: 'Help center',
    reason: 'Too large',
    time: '9:43 AM',
    actions: ['open', 'remove'],
  },
  {
    id: 'f4',
    name: 'Pricing exceptions 2026',
    ext: 'DOC',
    source: 'Team wiki · Support',
    reason: 'Access denied',
    time: '9:43 AM',
    actions: ['retry'],
  },
  {
    id: 'f5',
    name: 'help.northwindlabs.com/status',
    ext: 'HTML',
    source: 'Help center',
    reason: 'Timeout',
    time: '9:49 AM',
    actions: ['retry'],
  },
];

/** Total failures in the job; only the first rows are listed. */
export const failedTotal = 14;

/* ------------------------------------------------------------------ W7-05 Document viewer */

export interface DocChunk {
  id: number;
  preview: string;
  tokens: number;
  /** Full text, used for copy. */
  text: string;
  tag?: string;
  excluded?: boolean;
}

export const documentMeta = {
  name: 'Refund policy 2026.pdf',
  collection: 'Refund & billing policies',
  meta: 'Uploaded by Priya Nair · updated Oct 21 · 4 pages',
  tags: ['Refunds', 'Policy'],
  usage: 'Used in 214 answers this week',
  chunkCount: 24,
  avgTokens: '~410 tokens each',
};

export const documentChunks: DocChunk[] = [
  {
    id: 5,
    preview: '2. When you can get a refund. 2.1 Most items…',
    tokens: 398,
    text: '2. When you can get a refund. 2.1 Most items can be returned for a full refund within 30 days of delivery, as long as they are unused and in the original packaging.',
  },
  {
    id: 6,
    preview: '2.2 Duplicate charges are always refunded in full…',
    tokens: 412,
    text: '2.2 Duplicate charges are always refunded in full to the original payment method, regardless of the 30-day window. Refunds for duplicate charges do not need the item to be returned.',
  },
  {
    id: 7,
    preview: '2.3 Damaged or faulty items can be refunded…',
    tokens: 376,
    text: '2.3 Damaged or faulty items can be refunded or replaced within 60 days of delivery. Ask the customer for a photo of the damage.',
  },
  {
    id: 8,
    preview: 'Case · Window · Refund to — Standard 30 days…',
    tokens: 96,
    tag: 'Table',
    text: 'Case · Window · Refund to — Standard · 30 days · Original card; Damaged · 60 days · Original card',
  },
  {
    id: 9,
    preview: '2.4 Gift purchases are refunded as store credit…',
    tokens: 288,
    text: '2.4 Gift purchases are refunded as store credit to the person who received the gift.',
  },
  {
    id: 10,
    preview: 'Northwind Labs · Refund policy · page footer',
    tokens: 22,
    excluded: true,
    text: 'Northwind Labs · Refund policy · page footer',
  },
  {
    id: 11,
    preview: 'Stamp: “Approved by finance” (scan)',
    tokens: 18,
    tag: 'Image text (OCR)',
    text: 'Stamp: “Approved by finance”',
  },
];

export const refundTable = {
  head: ['Case', 'Window', 'Refund to'],
  rows: [
    ['Standard', '30 days', 'Original card'],
    ['Damaged', '60 days', 'Original card'],
  ],
};

/* ------------------------------------------------------------------ W7-06 Retrieval test */

export interface RetrievalChunk {
  id: string;
  text: string;
  source: string;
  /** Score for the default query, as in the design. */
  defaultScore: number;
  /** Phrases highlighted for the default query. */
  defaultMarks: string[];
  usedInAnswer?: boolean;
}

export const defaultQuery = 'Can a customer get a refund for a double charge after 30 days?';

export const retrievalScopes = ['Support Agent’s sources', 'Sales Researcher’s sources', 'All sources'];

export const retrievalCorpus: RetrievalChunk[] = [
  {
    id: 'r1',
    text: '2.2 Duplicate charges are always refunded in full to the original payment method, regardless of the 30-day window.',
    source: 'Refund policy 2026.pdf · chunk 6',
    defaultScore: 0.91,
    defaultMarks: ['Duplicate charges', 'refunded', '30-day'],
    usedInAnswer: true,
  },
  {
    id: 'r2',
    text: 'Refunds usually reach the customer’s card in 3–5 business days after approval.',
    source: 'Help center · Refund timing',
    defaultScore: 0.84,
    defaultMarks: ['Refunds', 'customer'],
    usedInAnswer: true,
  },
  {
    id: 'r3',
    text: '2.1 Most items can be returned for a full refund within 30 days of delivery…',
    source: 'Refund policy 2026.pdf · chunk 5',
    defaultScore: 0.71,
    defaultMarks: ['refund', '30 days'],
  },
  {
    id: 'r4',
    text: 'If you see two charges, one may be a pending authorisation that drops off within 48 hours.',
    source: 'Help center · Billing FAQ',
    defaultScore: 0.62,
    defaultMarks: ['charges'],
  },
  {
    id: 'r5',
    text: 'Escalate billing disputes over $500 to finance before replying.',
    source: 'Team wiki · Escalations',
    defaultScore: 0.48,
    defaultMarks: [],
  },
  {
    id: 'r6',
    text: '2.3 Damaged or faulty items can be refunded or replaced within 60 days of delivery. Ask the customer for a photo of the damage.',
    source: 'Refund policy 2026.pdf · chunk 7',
    defaultScore: 0.44,
    defaultMarks: [],
  },
  {
    id: 'r7',
    text: '2.4 Gift purchases are refunded as store credit to the person who received the gift.',
    source: 'Refund policy 2026.pdf · chunk 9',
    defaultScore: 0.41,
    defaultMarks: [],
  },
  {
    id: 'r8',
    text: 'Standard orders ship within 2 business days from our Reno and Austin warehouses.',
    source: 'Help center · Shipping times',
    defaultScore: 0.22,
    defaultMarks: [],
  },
  {
    id: 'r9',
    text: 'Orders over $150 qualify for free express shipping in the continental US.',
    source: 'Help center · Shipping costs',
    defaultScore: 0.18,
    defaultMarks: [],
  },
];

export const minRelevance = 0.6;

/* ------------------------------------------------------------------ W7-07 Sync settings */

export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';

export type SyncState =
  | { kind: 'synced'; label: string }
  | { kind: 'syncing'; progress: number }
  | { kind: 'failed'; label: string }
  | { kind: 'uploaded'; label: string };

export interface SyncSource {
  id: string;
  name: string;
  kind: SourceKind;
  frequency: SyncFrequency;
  state: SyncState;
  next: string;
  action: 'sync' | 'reconnect';
}

export const syncSources: SyncSource[] = [
  {
    id: 'help-center',
    name: 'Help center',
    kind: 'website',
    frequency: 'daily',
    state: { kind: 'synced', label: 'Synced · 2 h ago' },
    next: 'Tonight, 2:00 AM',
    action: 'sync',
  },
  {
    id: 'team-wiki',
    name: 'Team wiki · Support',
    kind: 'wiki',
    frequency: 'hourly',
    state: { kind: 'syncing', progress: 40 },
    next: '—',
    action: 'sync',
  },
  {
    id: 'sales-playbooks',
    name: 'Sales playbooks',
    kind: 'drive',
    frequency: 'daily',
    state: { kind: 'failed', label: 'Failed · Oct 23' },
    next: 'Paused',
    action: 'reconnect',
  },
  {
    id: 'orders-db',
    name: 'Orders database',
    kind: 'database',
    frequency: 'hourly',
    state: { kind: 'synced', label: 'Synced · Oct 25' },
    next: 'Paused by plan',
    action: 'sync',
  },
  {
    id: 'refund-billing',
    name: 'Refund & billing policies',
    kind: 'upload',
    frequency: 'manual',
    state: { kind: 'uploaded', label: 'Uploaded Oct 21' },
    next: 'Only when you upload',
    action: 'sync',
  },
];

export const nextSyncLabel: Record<SyncFrequency, string> = {
  realtime: 'Continuous',
  hourly: 'In 42 min',
  daily: 'Tonight, 2:00 AM',
  weekly: 'Mon, 2:00 AM',
  manual: 'Only when you sync',
};

export const syncCredits = { used: 6.2, allowance: 25 };

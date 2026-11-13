import type { Tone } from '@/components/ui';
import type { IconName } from '@/components/icons';

/* ------------------------------------------------------------------ */
/* Plans                                                                */
/* ------------------------------------------------------------------ */

export type PlanId = 'free' | 'pro' | 'business' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

/** Yearly billing discount. */
export const yearlyDiscount = 0.2;

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price per seat in USD; null = custom pricing. */
  seatPrice: number | null;
  priceNote: string;
  headline: string;
  credits: string;
  features: string[];
  badge?: { label: string; tone: Tone };
}

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    seatPrice: 0,
    priceNote: 'forever',
    headline: 'Up to 3 seats',
    credits: '$5 in credits',
    features: ['Chat with agents', '2 agents', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    seatPrice: 29,
    priceNote: 'per seat / month',
    headline: '25 seats',
    credits: '$50 credits per seat',
    features: ['Unlimited agents', 'Approvals and evals', 'Workflows', 'Audit log · 90 days'],
  },
  {
    id: 'business',
    name: 'Business',
    seatPrice: 59,
    priceNote: 'per seat / month',
    headline: 'Unlimited seats',
    credits: '$80 credits per seat',
    features: ['SSO and SCIM', 'Custom roles', 'Audit log · 1 year', 'Real-time sync'],
    badge: { label: 'Most popular', tone: 'ai' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    seatPrice: null,
    priceNote: '',
    headline: 'Volume pricing',
    credits: 'Committed credits',
    features: ['Private deployment', 'Data residency', 'Dedicated support'],
  },
];

export const workspaceSeats = 25;

export const planOrder: PlanId[] = ['free', 'pro', 'business', 'enterprise'];

/** What a downgrade to Free would switch off for Northwind Labs. */
export const downgradeImpact = [
  '24 members, Free allows 3. Remove 21 first.',
  '5 workflows would pause',
  '4 of 6 agents would be archived',
  'Approvals and evals turn off',
];

/** `true` = included, `false` = not included, string = limit. */
type Cell = boolean | string;

export const comparison: { group: string; rows: { feature: string; values: [Cell, Cell, Cell, Cell] }[] }[] =
  [
    {
      group: 'Agents & chat',
      rows: [
        { feature: 'Agents', values: ['2', 'Unlimited', 'Unlimited', 'Unlimited'] },
        { feature: 'Approvals', values: [false, true, true, true] },
        { feature: 'Evaluations', values: [false, true, true, true] },
      ],
    },
    {
      group: 'Workflows & knowledge',
      rows: [
        { feature: 'Workflows', values: [false, true, true, true] },
        { feature: 'Knowledge storage', values: ['1 GB', '10 GB', '100 GB', 'Custom'] },
        { feature: 'Real-time sync', values: [false, false, true, true] },
      ],
    },
    {
      group: 'Security & admin',
      rows: [
        { feature: 'SSO and SCIM', values: [false, false, true, true] },
        { feature: 'Custom roles', values: [false, false, true, true] },
        { feature: 'Audit log', values: [false, '90 days', '1 year', 'Custom'] },
      ],
    },
  ];

/* ------------------------------------------------------------------ */
/* Plan & usage                                                         */
/* ------------------------------------------------------------------ */

export interface UsageMeter {
  label: string;
  used: string;
  limit: string;
  percent: number;
  tone: 'brand' | 'warn' | 'ok';
  hint?: string;
}

export const usageMeters: UsageMeter[] = [
  {
    label: 'Credits',
    used: '$1,062',
    limit: '$1,250',
    percent: 85,
    tone: 'warn',
    hint: '$188 left · $50 per seat',
  },
  { label: 'Seats', used: '24', limit: '25', percent: 96, tone: 'brand' },
  { label: 'Knowledge storage', used: '2.4 GB', limit: '10 GB', percent: 24, tone: 'brand' },
  {
    label: 'Runs',
    used: '12,480',
    limit: 'unlimited',
    percent: 100,
    tone: 'ok',
    hint: 'No run limit on Pro',
  },
];

export const alertThresholds = [50, 80, 100] as const;

/* ------------------------------------------------------------------ */
/* Invoices                                                             */
/* ------------------------------------------------------------------ */

export type InvoiceStatus = 'paid' | 'due' | 'failed' | 'refunded';

export interface Invoice {
  id: string;
  date: string;
  period: string;
  note?: string;
  amount: number;
  status: InvoiceStatus;
}

export const invoices: Invoice[] = [
  { id: 'NWL-2026-10', date: 'Oct 12', period: 'Oct 12 – Nov 11 · 25 seats', amount: 725, status: 'paid' },
  { id: 'NWL-2026-09C', date: 'Oct 3', period: 'Extra credits · $200', amount: 200, status: 'due' },
  {
    id: 'NWL-2026-09',
    date: 'Sep 12',
    period: 'Sep 12 – Oct 11 · 24 seats',
    note: 'Card declined: insufficient funds · retried 3 times',
    amount: 696,
    status: 'failed',
  },
  { id: 'NWL-2026-08', date: 'Aug 12', period: 'Aug 12 – Sep 11 · 22 seats', amount: 638, status: 'paid' },
  { id: 'NWL-2026-07R', date: 'Jul 30', period: 'Refund · 2 unused seats', amount: -58, status: 'refunded' },
  { id: 'NWL-2026-07', date: 'Jul 12', period: 'Jul 12 – Aug 11 · 22 seats', amount: 638, status: 'paid' },
];

export const invoiceStatus: Record<InvoiceStatus, { label: string; tone: Tone; icon?: IconName }> = {
  paid: { label: 'Paid', tone: 'ok' },
  due: { label: 'Due', tone: 'warn' },
  failed: { label: 'Failed', tone: 'danger', icon: 'close' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};

export const billingDetails = {
  company: 'Northwind Labs Inc.',
  email: 'finance@northwindlabs.com',
  address: '410 Harbor Street, Suite 12, Austin, TX 78701, US',
  taxId: 'US EIN 84-2913377',
};

/* ------------------------------------------------------------------ */
/* Payment                                                              */
/* ------------------------------------------------------------------ */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'card';

export interface SavedCard {
  id: string;
  brand: CardBrand;
  /** Only the last four digits are ever kept. */
  last4: string;
  expires: string;
  expiringSoon?: boolean;
}

export const savedCards: SavedCard[] = [
  { id: 'card-visa', brand: 'visa', last4: '6411', expires: '08/28' },
  { id: 'card-mc', brand: 'mastercard', last4: '2290', expires: '11/26', expiringSoon: true },
];

export const defaultCardId = 'card-visa';

export const brandLabels: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  card: 'Card',
};

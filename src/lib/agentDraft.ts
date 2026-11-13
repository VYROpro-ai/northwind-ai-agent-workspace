/** Minimal shared draft for the create-agent wizard (sessionStorage-backed). */

export interface AgentDraft {
  name: string;
  description: string;
  instructions: string;
  model: string;
  temperature: number;
  tags: string[];
  icon: string;
  tone: string;
}

export const DRAFT_KEY = 'nw-agent-draft';

export const DEFAULT_INSTRUCTIONS =
  'You are the support agent. You help customers with billing, orders and refunds.\n\n' +
  'Tone: Warm and brief. Use the customer’s name. Keep replies under 120 words.\n\n' +
  'MUST DO\n' +
  '• Cite the help doc for every policy you mention.\n' +
  '• Offer a refund only within 30 days of purchase, and cite the refund policy.\n' +
  '• Ask for approval before any refund over $100.\n\n' +
  'MUST NEVER DO\n' +
  '• Share another customer’s details. • Promise delivery dates the tracker doesn’t show.\n\n' +
  'Output format: Short paragraphs. End with one clear next step for the customer.';

export const defaultDraft: AgentDraft = {
  name: 'Support Agent',
  description: 'Answers billing, order and refund questions from the help docs.',
  instructions: DEFAULT_INSTRUCTIONS,
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  tags: ['support', 'billing'],
  icon: 'chat',
  tone: 'ai',
};

export function readDraft(): AgentDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...defaultDraft, tags: [...defaultDraft.tags] };
    return { ...defaultDraft, ...(JSON.parse(raw) as Partial<AgentDraft>) };
  } catch {
    return { ...defaultDraft, tags: [...defaultDraft.tags] };
  }
}

export function writeDraft(patch: Partial<AgentDraft>): AgentDraft {
  const next = { ...readDraft(), ...patch };
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — draft is best-effort */
  }
  return next;
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

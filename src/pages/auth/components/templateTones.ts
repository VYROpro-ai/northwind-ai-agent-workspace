import type { TemplateTone } from '../data';

/** Solid icon tile per template tone (white glyph on top) — template cards. */
export const toneTile: Record<TemplateTone, string> = {
  ai: 'bg-ai-text shadow-[0_8px_16px_-8px_var(--ai-text)]',
  brand: 'bg-brand-text shadow-[0_8px_16px_-8px_var(--brand-text)]',
  ok: 'bg-ok-text shadow-[0_8px_16px_-8px_var(--ok-text)]',
  warn: 'bg-warn-text shadow-[0_8px_16px_-8px_var(--warn-text)]',
  info: 'bg-info-text shadow-[0_8px_16px_-8px_var(--info-text)]',
  neutral: 'bg-fg-2 shadow-[0_8px_16px_-8px_var(--fg-2)]',
};

/** Soft tile per template tone — the preview panel header. */
export const toneSoft: Record<TemplateTone, string> = {
  ai: 'bg-ai-subtle text-ai-text',
  brand: 'bg-brand-subtle text-brand-text',
  ok: 'bg-ok-subtle text-ok-text',
  warn: 'bg-warn-subtle text-warn-text',
  info: 'bg-info-subtle text-info-text',
  neutral: 'bg-subtle text-fg-2',
};

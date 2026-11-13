import { defaultQuery, minRelevance, retrievalCorpus, type RetrievalChunk } from './data';

export interface RankedChunk extends RetrievalChunk {
  score: number;
  /** Pattern for the words to highlight. */
  highlight: RegExp | null;
}

const stopWords = new Set(
  'a an the can could for after before get to of is are was in on at and or what how do does did i my we our with when if it be you your will from about there any this that need'.split(
    ' ',
  ),
);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Crude stemmer — enough to match "refund" with "refunded" / "Refunds". */
const stem = (term: string) => (term.length > 4 ? term.replace(/(ing|ed|es|s)$/, '') : term);

export function queryTerms(query: string) {
  return (query.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((t) => t.length > 1 && !stopWords.has(t))
    .map(stem);
}

/**
 * Mock retriever: scores each chunk by the share of query terms it contains, with the
 * design's scores kept for the default query. Returns chunks best-first.
 */
export function rankChunks(query: string): RankedChunk[] {
  if (query.trim() === defaultQuery) {
    return retrievalCorpus
      .map((chunk) => ({
        ...chunk,
        score: chunk.defaultScore,
        highlight: chunk.defaultMarks.length
          ? new RegExp(`(${chunk.defaultMarks.map(escape).join('|')})`, 'g')
          : null,
      }))
      .sort((a, b) => b.score - a.score);
  }

  const terms = queryTerms(query);
  return (
    retrievalCorpus
      .map((chunk) => {
        const words = chunk.text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
        const matched = terms.filter((t) => words.some((w) => w.startsWith(t)));
        const share = terms.length ? matched.length / terms.length : 0;
        const score = Math.min(
          0.97,
          Math.round((0.2 + 0.72 * share + chunk.defaultScore * 0.06) * 100) / 100,
        );
        const highlight = matched.length
          ? new RegExp(`\\b(${matched.map(escape).join('|')})[\\w’'-]*`, 'gi')
          : null;
        return { ...chunk, score, highlight };
      })
      .sort((a, b) => b.score - a.score)
      // The two best relevant chunks are the ones the answer cites.
      .map((chunk, i) => ({ ...chunk, usedInAnswer: i < 2 && chunk.score >= minRelevance }))
  );
}

/** Splits text into plain and highlighted parts for rendering with <mark>. */
export function splitHighlights(text: string, pattern: RegExp | null) {
  if (!pattern) return [{ text, hit: false }];
  const parts: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: text.slice(last, index), hit: false });
    parts.push({ text: match[0], hit: true });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });
  return parts;
}

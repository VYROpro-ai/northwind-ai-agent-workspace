import { useMemo, useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Badge, Button, Card, Input, Skeleton, Slider } from '@/components/ui';
import { CitationChip } from '@/components/ai';
import { KnowledgeShell } from './components/KnowledgeShell';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { defaultQuery, minRelevance, retrievalScopes } from './data';
import { rankChunks, splitHighlights, type RankedChunk } from './retrieval';

function ScoreBar({ score }: { score: number }) {
  const low = score < minRelevance;
  return (
    <div className="flex w-[92px] shrink-0 flex-col items-end gap-1">
      <span className="font-mono text-13 font-semibold text-fg tabular">{score.toFixed(2)}</span>
      <div className="h-1 w-full overflow-hidden rounded-full bg-subtle">
        <div
          className={cn('h-full rounded-full', low ? 'bg-warn' : 'bg-brand')}
          style={{ width: `${score * 100}%` }}
        />
      </div>
    </div>
  );
}

function ResultRow({ rank, chunk, active }: { rank: number; chunk: RankedChunk; active: boolean }) {
  const low = chunk.score < minRelevance;
  return (
    <li
      id={`result-${rank}`}
      className={cn(
        'flex gap-3.5 border-t border-border px-4 py-3.5 transition-colors',
        low && 'opacity-60',
        active && 'bg-brand-subtle',
      )}
    >
      <span className="w-4 shrink-0 pt-0.5 text-body-s text-fg-3 tabular">{rank}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-13 leading-5 text-fg">
          {splitHighlights(chunk.text, chunk.highlight).map((part, i) =>
            part.hit ? (
              <mark key={i} className="rounded-[3px] bg-warn-subtle px-0.5 text-inherit">
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-s font-medium text-link">{chunk.source}</span>
          {chunk.usedInAnswer && (
            <Badge
              tone="ai"
              icon="check-sm"
              bordered={false}
              className="h-5 border-transparent px-2 text-body-s"
            >
              Used in answer
            </Badge>
          )}
        </div>
      </div>
      <ScoreBar score={chunk.score} />
    </li>
  );
}

/** W7-06 · Retrieval test — run a query against the knowledge base and preview the agent's answer. */
export default function RetrievalTest() {
  const [draft, setDraft] = useState(defaultQuery);
  const [query, setQuery] = useState(defaultQuery);
  const [scope, setScope] = useState(retrievalScopes[0]);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);

  const ranked = useMemo(() => rankChunks(query), [query]);
  const results = ranked.slice(0, count);
  const cited = results.filter((r) => r.usedInAnswer);

  const run = (e?: FormEvent) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    setLoading(true);
    setActiveCitation(null);
    window.setTimeout(() => {
      setQuery(draft.trim());
      setLoading(false);
    }, 600);
  };

  const cite = (n: number) => {
    setActiveCitation(n);
    document.getElementById(`result-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <KnowledgeShell tab="/knowledge/retrieval-test" current="Retrieval test">
      <Card padding="none" className="flex flex-col gap-3 rounded-[18px] p-4">
        <form onSubmit={run} className="flex flex-wrap items-center gap-2.5" role="search">
          <Input
            size="lg"
            leftIcon="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Test query"
            placeholder="Ask what a customer might ask…"
            containerClassName="min-w-0 flex-1 basis-72"
            className="rounded-[10px] text-[15px]"
          />
          <Button type="submit" size="lg" loading={loading} className="h-11 px-3.5 text-13">
            Search
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="Scope" value={scope} options={retrievalScopes} onChange={setScope} />
          <span className="text-13 font-medium text-fg-2" id="results-count">
            Results
          </span>
          <div className="w-[140px]">
            <Slider value={count} min={1} max={11} step={1} onChange={setCount} label="Number of results" />
          </div>
          <span className="text-13 font-semibold text-fg tabular">{count}</span>
          <span className="ml-auto text-body-s text-fg-3">Min. relevance {minRelevance.toFixed(2)}</span>
        </div>
      </Card>

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <Card padding="none" className="w-full min-w-0 overflow-hidden rounded-[18px] xl:flex-[1.3]">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <h2 className="flex-1 text-body-m font-semibold text-fg" aria-live="polite">
              {results.length} results
            </h2>
            <span className="text-body-s text-fg-3">2 hidden from docs you can’t open</span>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3 border-t border-border p-4" aria-busy>
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <ol>
              {results.map((chunk, i) => (
                <ResultRow key={chunk.id} rank={i + 1} chunk={chunk} active={activeCitation === i + 1} />
              ))}
            </ol>
          )}
        </Card>

        <Card
          padding="none"
          className="flex w-full min-w-0 flex-col gap-3 rounded-[18px] border-ai-border p-4 xl:flex-1"
        >
          <div className="flex items-center gap-2">
            <Icon name="ai-generate" size={16} strokeWidth={2} className="text-ai-text" />
            <h2 className="text-body-m font-semibold text-fg">Answer the agent would give</h2>
          </div>
          {loading ? (
            <div className="flex flex-col gap-2" aria-busy>
              <Skeleton className="h-4" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : query === defaultQuery ? (
            <p className="text-body-m leading-[22px] text-fg">
              Yes. Duplicate charges are always refunded in full, even after 30 days{' '}
              <CitationChip n={1} active={activeCitation === 1} onClick={() => cite(1)} />. The refund goes
              back to the original card and usually arrives in 3–5 business days{' '}
              <CitationChip n={2} active={activeCitation === 2} onClick={() => cite(2)} />.
            </p>
          ) : cited.length ? (
            <p className="text-body-m leading-[22px] text-fg">
              {cited.map((c, i) => (
                <span key={c.id}>
                  {c.text.replace(/^[\d.]+\s/, '').replace(/…$/, '.')}{' '}
                  <CitationChip
                    n={i + 1}
                    active={activeCitation === i + 1}
                    onClick={() => cite(i + 1)}
                  />{' '}
                </span>
              ))}
            </p>
          ) : (
            <p className="text-body-m leading-[22px] text-fg-2">
              Nothing in these sources is relevant enough to answer. The agent would say it doesn’t know and
              offer to hand the conversation to a person.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-body-s text-fg-3">
            <span className="flex-1">Support Agent · v4 · Model B</span>
            <span className="font-mono tabular">1.8 s · $0.003</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon="refresh"
            className="self-start"
            onClick={() => run()}
          >
            Regenerate
          </Button>
        </Card>
      </div>
    </KnowledgeShell>
  );
}

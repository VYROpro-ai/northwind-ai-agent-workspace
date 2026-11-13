import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, Checkbox, Progress, Slider, Switch, useToast } from '@/components/ui';
import { knowledgeSources, type KnowledgeSource } from './data';
import { WizardStep } from './components/WizardLayout';

const statusText: Record<KnowledgeSource['status'], string> = {
  indexed: 'text-ok-text',
  indexing: 'text-brand-text',
  failed: 'text-danger-text',
};

/** W3-06 · Create agent — 4. Knowledge */
export default function CreateKnowledge() {
  const toast = useToast();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [sources, setSources] = useState(knowledgeSources);
  const [dragging, setDragging] = useState(false);
  const [cite, setCite] = useState(true);
  const [results, setResults] = useState(5);
  const [strict, setStrict] = useState(false);

  // Advance the indexing job so the screen feels live.
  const indexing = sources.some((s) => s.status === 'indexing');
  useEffect(() => {
    if (!indexing) return;
    const id = window.setInterval(() => {
      setSources((list) =>
        list.map((s) => {
          if (s.status !== 'indexing') return s;
          const progress = Math.min(100, (s.progress ?? 0) + 5);
          return progress >= 100 ? { ...s, status: 'indexed', progress: undefined } : { ...s, progress };
        }),
      );
    }, 1500);
    return () => window.clearInterval(id);
  }, [indexing]);

  const selected = sources.filter((s) => s.selected).length;
  const allSelected = selected === sources.length;
  const toggle = (id: string) =>
    setSources((list) => list.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
  const toggleAll = () => setSources((list) => list.map((s) => ({ ...s, selected: !allSelected })));

  const retry = (source: KnowledgeSource) => {
    setSources((list) =>
      list.map((s) =>
        s.id === source.id
          ? { ...s, status: 'indexing', progress: 10, selected: true, sub: 'Retrying with text recognition' }
          : s,
      ),
    );
    toast({
      tone: 'info',
      title: `Retrying ${source.name}`,
      description: 'Running text recognition first.',
    });
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const added: KnowledgeSource[] = Array.from(files).map((f, i) => ({
      id: `${f.name}-${Date.now()}-${i}`,
      kind: f.name.toLowerCase().endsWith('.csv')
        ? 'CSV'
        : f.name.toLowerCase().endsWith('.pdf')
          ? 'PDF'
          : 'DOC',
      name: f.name,
      sub: 'Uploaded just now',
      size: f.size > 1e6 ? `${(f.size / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1e3))} KB`,
      status: 'indexing',
      progress: 5,
      selected: true,
    }));
    setSources((list) => [...list, ...added]);
    toast({
      title: `${added.length} ${added.length === 1 ? 'file' : 'files'} added`,
      description: 'Indexing has started.',
    });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <WizardStep
      step={4}
      title="Knowledge"
      description="Pick the sources your agent can search. It cites them in every answer."
      chatNote="Using 3 indexed sources · 1 still indexing"
      rhythm="mid"
      top={24}
      footerExtra={
        <Button
          variant="ghost"
          size="lg"
          className="h-10 px-4 text-body-m"
          onClick={() => navigate('/agents/new/publish')}
        >
          Skip for now
        </Button>
      }
    >
      <div className="overflow-hidden rounded-[18px] border border-border bg-surface">
        <div className="flex items-center gap-2.5 border-b border-border bg-sunken px-3.5 py-2.5 text-body-s text-fg-3">
          <Checkbox
            aria-label="Select all sources"
            checked={selected > 0}
            indeterminate={selected > 0 && !allSelected}
            onChange={toggleAll}
            className="[&>span]:mt-0"
          />
          <span className="flex-1 font-medium">
            {selected} of {sources.length} sources selected
          </span>
          <span className="hidden w-[90px] sm:block">Size</span>
          <span className="w-[100px] sm:w-[130px]">Status</span>
        </div>
        <ul>
          {sources.map((s, i) => (
            <li
              key={s.id}
              className={cn(
                'flex items-center gap-2.5 px-3.5 py-2.5 text-13',
                i > 0 && 'border-t border-border',
              )}
            >
              <Checkbox
                aria-label={`Use ${s.name}`}
                checked={s.selected}
                disabled={s.status === 'failed'}
                onChange={() => toggle(s.id)}
                className="[&>span]:mt-0"
              />
              <span
                aria-hidden
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-subtle font-mono text-[9px] font-medium text-fg-2"
              >
                {s.kind}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{s.name}</span>
                <span className={cn('text-body-s', s.status === 'failed' ? 'text-danger-text' : 'text-fg-3')}>
                  {s.sub}
                </span>
              </div>
              <span className="hidden w-[90px] text-body-s text-fg-3 sm:block">{s.size}</span>
              <div className="flex w-[100px] flex-col gap-1 sm:w-[130px]">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-body-s font-medium',
                    statusText[s.status],
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" aria-hidden />
                  {s.status === 'indexed' && 'Indexed'}
                  {s.status === 'indexing' && `Indexing ${s.progress ?? 0}%`}
                  {s.status === 'failed' && 'Failed'}
                </span>
                {s.status === 'indexing' && (
                  <Progress
                    value={s.progress ?? 0}
                    size="sm"
                    label={`Indexing ${s.name}`}
                    className="max-w-[110px]"
                  />
                )}
                {s.status === 'failed' && (
                  <Button variant="link" className="self-start text-body-s" onClick={() => retry(s)}>
                    Retry
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex min-h-14 flex-wrap items-center justify-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed px-4 py-3 text-center text-13 text-fg-2 transition-colors',
          dragging ? 'border-brand bg-brand-subtle' : 'border-border-strong',
        )}
      >
        <Icon name="upload" size={16} />
        <span>
          Drop files here, or{' '}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="font-medium text-link hover:underline"
          >
            browse
          </button>{' '}
          · PDF, DOCX, CSV, MD up to 50 MB
        </span>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept=".pdf,.docx,.csv,.md"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <section
        aria-labelledby="retrieval-title"
        className="flex flex-col gap-3 rounded-[18px] border border-border bg-surface px-4 py-3.5"
      >
        <h2 id="retrieval-title" className="text-body-m font-semibold">
          Retrieval settings
        </h2>
        <Switch
          label={<span className="text-13">Always cite sources</span>}
          description="Each answer links to the passage it used"
          checked={cite}
          onChange={(e) => setCite(e.target.checked)}
          className="items-center"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-48 flex-1">
            <p id="results-label" className="text-13 font-medium">
              Results per answer
            </p>
            <p className="text-body-s text-fg-3">More results give fuller answers but cost more</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[180px]">
              <Slider
                label="Results per answer"
                value={results}
                min={1}
                max={10}
                step={1}
                onChange={setResults}
              />
            </div>
            <span className="w-5 text-right font-mono text-13 tabular">{results}</span>
          </div>
        </div>
        <Switch
          label={<span className="text-13">Answer only from knowledge</span>}
          description="If nothing matches, the agent says it doesn’t know"
          checked={strict}
          onChange={(e) => setStrict(e.target.checked)}
          className="items-center"
        />
      </section>
    </WizardStep>
  );
}

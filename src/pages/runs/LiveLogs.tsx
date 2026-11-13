import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import { Button, Dropdown, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/lib/hooks';
import { RunsTabs } from './components/RunsTabs';
import { initialLogs, logSources, streamPool, type LogLevel, type LogLine } from './data';

const MAX_LINES = 1000;
const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

/** Level styling on the always-dark terminal surface (primitives, identical in both themes). */
const levelStyle: Record<LogLevel, { label: string; dot: string; text: string }> = {
  DEBUG: { label: 'Debug', dot: 'bg-[var(--slate-400)]', text: 'text-[var(--slate-400)]' },
  INFO: { label: 'Info', dot: 'bg-[var(--sky-300)]', text: 'text-[var(--sky-300)]' },
  WARN: { label: 'Warn', dot: 'bg-[var(--amber-300)]', text: 'text-[var(--amber-300)]' },
  ERROR: { label: 'Error', dot: 'bg-[var(--red-300)]', text: 'text-[var(--red-300)]' },
};

const seed: LogLine[] = initialLogs.map((line, i) => ({ ...line, id: i }));

/** Adds `ms` to an `HH:MM:SS.mmm` timestamp. */
function addMs(time: string, ms: number) {
  const [h, m, rest] = time.split(':');
  const total = ((Number(h) * 60 + Number(m)) * 60 + Number(rest)) * 1000 + ms;
  const pad = (n: number, w = 2) => String(Math.floor(n)).padStart(w, '0');
  return `${pad(total / 3_600_000)}:${pad((total / 60_000) % 60)}:${pad((total / 1000) % 60)}.${pad(total % 1000, 3)}`;
}

function toText(lines: LogLine[]) {
  return lines.map((l) => `${l.time}  ${l.level.padEnd(5)}  ${l.source.padEnd(24)}  ${l.message}`).join('\n');
}

/** W6-07 · Live logs */
export default function LiveLogs() {
  const toast = useToast();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [lines, setLines] = useState<LogLine[]>(seed);
  const [paused, setPaused] = useState(false);
  const [enabled, setEnabled] = useState<Set<LogLevel>>(() => new Set<LogLevel>(['INFO', 'WARN', 'ERROR']));
  const [source, setSource] = useState(logSources[0]);
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const tick = useRef(0);

  // Simulated stream: a new line every ~1.2 s (slower when the user prefers reduced motion).
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => {
        const n = tick.current++;
        const template = streamPool[n % streamPool.length];
        setLines((current) => {
          const time = addMs(current[0]?.time ?? '09:42:14.218', 180 + ((n * 97) % 420));
          return [{ ...template, time, id: seed.length + n }, ...current].slice(0, MAX_LINES);
        });
      },
      reducedMotion ? 3000 : 1200,
    );
    return () => window.clearInterval(id);
  }, [paused, reducedMotion]);

  // Newest lines are on top: keep the view pinned there while following.
  useEffect(() => {
    if (following && scroller.current) scroller.current.scrollTop = 0;
  }, [lines, following]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lines.filter(
      (l) =>
        enabled.has(l.level) &&
        (source === logSources[0] || l.source === source) &&
        (!q || `${l.source} ${l.message}`.toLowerCase().includes(q)),
    );
  }, [lines, enabled, source, query]);

  const hidden = levels.filter((l) => !enabled.has(l)).map((l) => levelStyle[l].label);

  const toggleLevel = (level: LogLevel) =>
    setEnabled((s) => {
      const next = new Set(s);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });

  const jumpToLatest = () => {
    setFollowing(true);
    scroller.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const download = (all: boolean) => {
    const blob = new Blob([toText(all ? lines : visible)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = all ? 'northwind-live-log-full.txt' : 'northwind-live-log.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Log downloaded',
      description: `${(all ? lines : visible).length} lines saved as a text file.`,
    });
  };

  return (
    <AppShell active="Runs" role="builder" crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'Live logs' }]}>
      <PageHeader
        title="Live logs"
        description="Streaming from 6 agents and 7 workflows"
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon="download"
            className="h-[34px] px-3.5"
            onClick={() => download(false)}
          >
            Download
          </Button>
        }
      />
      <RunsTabs />

      <section
        aria-label="Log stream"
        className="flex h-[max(480px,calc(100dvh-241px))] flex-col overflow-hidden rounded-2xl border border-[var(--slate-800)] bg-code font-mono text-body-s"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--slate-800)] px-3 py-2.5">
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
            className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[var(--slate-50)] px-2.5 font-sans text-body-s font-medium text-[var(--slate-950)] hover:bg-[var(--slate-200)]"
          >
            <Icon name={paused ? 'play' : 'pause'} size={12} strokeWidth={2.4} />
            {paused ? 'Resume' : 'Pause'}
          </button>
          <span
            role="status"
            className={cn(
              'mx-1.5 inline-flex items-center gap-1.5 font-sans',
              paused ? 'text-[var(--slate-400)]' : 'text-[var(--green-300)]',
            )}
          >
            <span
              className={cn(
                'size-[7px] rounded-full',
                paused
                  ? 'bg-[var(--slate-500)]'
                  : 'animate-pulse-soft bg-[var(--green-500)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--green-500)_25%,transparent)]',
              )}
            />
            {paused ? 'Paused' : 'Live · 38 lines/s'}
          </span>
          <span className="hidden h-[18px] w-px bg-[var(--slate-800)] sm:block" aria-hidden />
          <div role="group" aria-label="Log levels" className="flex flex-wrap gap-2">
            {levels.map((level) => {
              const on = enabled.has(level);
              const s = levelStyle[level];
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleLevel(level)}
                  className={cn(
                    'inline-flex h-7 items-center gap-1.5 rounded-sm border px-2.5 font-sans font-medium transition-colors',
                    on
                      ? 'border-white/18 bg-white/10 text-[var(--slate-50)]'
                      : 'border-white/8 text-[var(--slate-400)] hover:text-[var(--slate-300)]',
                  )}
                >
                  <span className={cn('size-[7px] rounded-full', s.dot)} />
                  {s.label}
                </button>
              );
            })}
          </div>
          <Dropdown
            width={220}
            trigger={(props) => (
              <button
                type="button"
                {...props}
                aria-label={`Source: ${source}`}
                className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-white/8 px-2.5 font-sans text-[var(--slate-300)] hover:border-white/18"
              >
                {source}
                <Icon name="chevron-down" size={12} strokeWidth={2} className="text-[var(--slate-400)]" />
              </button>
            )}
            items={logSources.map((s) => ({
              label: s,
              icon: s === source ? 'check' : undefined,
              onSelect: () => setSource(s),
            }))}
          />
          <span className="flex-1" />
          <label className="flex h-7 w-full items-center gap-2 rounded-sm border border-white/12 px-2.5 font-sans text-[var(--slate-400)] focus-within:border-white/30 sm:w-[220px]">
            <Icon name="search" size={12} strokeWidth={2} />
            <span className="sr-only">Search logs</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search logs"
              className="min-w-0 flex-1 bg-transparent text-[var(--slate-200)] outline-none placeholder:text-[var(--slate-400)]"
            />
          </label>
        </div>

        <div
          ref={scroller}
          role="log"
          aria-live="off"
          aria-label="Log lines, newest first"
          tabIndex={0}
          onScroll={(e) => setFollowing(e.currentTarget.scrollTop < 8)}
          className="min-h-0 flex-1 scrollbar-thin overflow-auto py-2"
        >
          <div className="w-max min-w-full">
            {visible.map((line) => (
              <div
                key={line.id}
                className={cn(
                  'grid grid-cols-[104px_56px_190px_minmax(0,1fr)] gap-3.5 px-4 py-[3px] leading-5',
                  line.level === 'ERROR' && 'bg-[var(--red-500)]/10',
                  line.id >= seed.length && !reducedMotion && 'animate-fade-in',
                )}
              >
                <span className="text-[var(--slate-400)]">{line.time}</span>
                <span className={cn('font-semibold', levelStyle[line.level].text)}>{line.level}</span>
                <span className="truncate text-[var(--slate-300)]">{line.source}</span>
                <span className="whitespace-nowrap text-[var(--slate-200)]">{line.message}</span>
              </div>
            ))}
            {visible.length === 0 && (
              <p className="px-4 py-10 text-center font-sans text-[var(--slate-400)]">
                No lines match these filters.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--slate-800)] py-2 pr-3 pl-4 font-sans text-[var(--slate-400)]">
          <span>
            Showing last {MAX_LINES.toLocaleString('en-US')} lines
            {hidden.length > 0 && ` · ${hidden.join(', ')} hidden`}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => download(true)}
            className="font-medium text-[var(--cobalt-300)] hover:underline"
          >
            Download full log
          </button>
          <button
            type="button"
            onClick={jumpToLatest}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-white/18 px-2.5 font-medium text-[var(--slate-50)] hover:bg-white/10"
          >
            Jump to latest
            <Icon name="arrow-up" size={12} strokeWidth={2} />
          </button>
        </div>
      </section>
    </AppShell>
  );
}

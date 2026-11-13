import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { useTheme } from '@/lib/theme';
import { Icon, type IconName } from '@/components/icons';
import { Modal } from '@/components/ui/Overlay';
import { screens } from '@/routes/screens';

type Tone = 'ai' | 'brand' | 'neutral';

interface Command {
  id: string;
  title: string;
  meta?: string;
  /** Extra words that match the search but are not shown. */
  keywords?: string;
  icon: IconName;
  tone: Tone;
  shortcut?: string;
  to?: string;
  /** Runs instead of navigating (e.g. "Switch theme"). */
  run?: 'toggle-theme';
}

interface Group {
  label: string;
  items: Command[];
}

const tiles: Record<Tone, string> = {
  ai: 'bg-ai-subtle text-ai-text',
  brand: 'bg-brand-subtle text-brand-text',
  neutral: 'bg-subtle text-fg-2',
};

const searchable: Group[] = [
  {
    label: 'Agents',
    items: [
      {
        id: 'ag-refund',
        title: 'Refund helper',
        meta: 'template · Support',
        icon: 'nav-agents',
        tone: 'ai',
        to: '/agents/templates',
      },
      {
        id: 'ag-support',
        title: 'Support Agent',
        meta: 'answers refund questions',
        keywords: 'billing orders',
        icon: 'nav-agents',
        tone: 'ai',
        to: '/agents/support-agent',
      },
      {
        id: 'ag-sales',
        title: 'Sales Researcher',
        meta: 'enriches leads in CRM',
        icon: 'nav-agents',
        tone: 'ai',
        to: '/agents',
      },
      {
        id: 'ag-invoice',
        title: 'Invoice processor',
        meta: 'reads and files invoices',
        icon: 'nav-agents',
        tone: 'ai',
        to: '/agents',
      },
    ],
  },
  {
    label: 'Workflows',
    items: [
      {
        id: 'wf-refund',
        title: 'Refund over $100 → approval',
        meta: 'Active',
        icon: 'workflow',
        tone: 'brand',
        to: '/workflows/editor',
      },
      {
        id: 'wf-triage',
        title: 'Support ticket triage',
        meta: 'Active',
        icon: 'workflow',
        tone: 'brand',
        to: '/workflows/editor',
      },
    ],
  },
  {
    label: 'Runs',
    items: [
      {
        id: 'run-4835',
        title: 'run_4835',
        meta: 'waiting for Leo',
        keywords: 'refund acme support agent',
        icon: 'run',
        tone: 'neutral',
        to: '/runs/run_4835',
      },
      {
        id: 'run-4833',
        title: 'run_4833',
        meta: 'failed · Sales Researcher',
        keywords: 'crm pinecrest',
        icon: 'run',
        tone: 'neutral',
        to: '/runs/run_4833',
      },
    ],
  },
  {
    label: 'Docs',
    items: [
      {
        id: 'doc-refund',
        title: 'Refund policy 2026.pdf',
        meta: 'Knowledge',
        icon: 'file',
        tone: 'neutral',
        to: '/knowledge/documents/refund-policy-2026',
      },
    ],
  },
];

const recent: Group = {
  label: 'Recent',
  items: [searchable[0].items[1], searchable[2].items[0], searchable[3].items[0]],
};

const actions: Group = {
  label: 'Actions',
  items: [
    {
      id: 'act-agent',
      title: 'Create agent',
      icon: 'plus',
      tone: 'neutral',
      shortcut: 'C A',
      to: '/agents/new/basics',
    },
    {
      id: 'act-theme',
      title: 'Switch theme',
      keywords: 'dark light mode',
      icon: 'moon',
      tone: 'neutral',
      shortcut: 'T',
      run: 'toggle-theme',
    },
    {
      id: 'act-invite',
      title: 'Invite member',
      keywords: 'team',
      icon: 'plus',
      tone: 'neutral',
      to: '/settings/members/invite',
    },
  ],
};

/** Every screen in the template, for "Jump to" results. */
const jumpTo: Command[] = screens
  .filter((s) => !s.path.includes(':'))
  .map((s) => ({
    id: `screen-${s.id}`,
    title: s.title,
    meta: s.id,
    keywords: s.path,
    icon: 'arrow-right',
    tone: 'neutral',
    to: s.path,
  }));

const matches = (c: Command, q: string) =>
  `${c.title} ${c.meta ?? ''} ${c.keywords ?? ''}`.toLowerCase().includes(q);

function useResults(query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { groups: [recent, actions], askAi: false };
    const groups: Group[] = [];
    const runId = /^run_\d+$/.test(q) ? q : null;
    if (runId) {
      const known = screens.some((s) => s.path === `/runs/${runId}`);
      groups.push({
        label: 'Go to run',
        items: [
          {
            id: `go-${runId}`,
            title: runId,
            meta: known ? 'open run' : 'search runs',
            icon: 'run',
            tone: 'neutral',
            to: known ? `/runs/${runId}` : '/runs',
          },
        ],
      });
    }
    for (const g of searchable) {
      const items = g.items.filter((c) => matches(c, q));
      if (items.length) groups.push({ label: g.label, items: items.slice(0, 4) });
    }
    // Screens are a fallback: only suggested when the query finds little else.
    const hits = groups.reduce((n, g) => n + g.items.length, 0);
    const pages = hits < 3 ? jumpTo.filter((c) => matches(c, q)).slice(0, 5) : [];
    if (pages.length) groups.push({ label: 'Jump to', items: pages });
    const matchingActions = actions.items.filter((c) => matches(c, q));
    groups.push({ label: 'Actions', items: matchingActions.length ? matchingActions : actions.items });
    return { groups, askAi: true };
  }, [query]);
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { toggle } = useTheme();
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  // The /search route (W12-04) is shareable: `/search?q=ref` opens the palette with that query.
  const [query, setQuery] = useState(() =>
    location.pathname === '/search' ? (new URLSearchParams(location.search).get('q') ?? '') : '',
  );
  const [active, setActive] = useState(0);
  const { groups, askAi } = useResults(query);

  const askCommand: Command = {
    id: 'ask-ai',
    title: 'Ask AI',
    meta: `about “${query.trim()}” · sends to Support Agent`,
    icon: 'ai-generate',
    tone: 'ai',
    to: '/chat',
  };
  const flat = [...groups.flatMap((g) => g.items), ...(askAi ? [askCommand] : [])];
  const current = Math.min(active, flat.length - 1);
  const optionId = (i: number) => `${listId}-${i}`;

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [current]);

  const select = (c: Command | undefined) => {
    if (!c) return;
    onClose();
    if (c.run === 'toggle-theme') toggle();
    else if (c.to) navigate(c.to);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setActive((current + delta + flat.length) % flat.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select((e.metaKey || e.ctrlKey) && askAi ? askCommand : flat[current]);
    }
  };

  const renderItem = (c: Command, ai = false) => {
    const i = flat.findIndex((x) => x.id === c.id);
    const on = i === current;
    return (
      <div
        key={c.id}
        id={optionId(i)}
        role="option"
        aria-selected={on}
        data-index={i}
        onMouseMove={() => setActive(i)}
        onClick={() => select(c)}
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2',
          ai ? 'rounded-[10px] bg-ai-subtle py-2.5 text-ai-text' : on && 'bg-subtle',
          ai && on && 'ring-1 ring-ai-border',
        )}
      >
        {ai ? (
          <Icon name={c.icon} size={16} strokeWidth={2} />
        ) : (
          <span
            className={cn(
              'inline-flex size-7 shrink-0 items-center justify-center rounded-[7px]',
              tiles[c.tone],
            )}
          >
            <Icon name={c.icon} size={14} strokeWidth={1.9} />
          </span>
        )}
        <span className={cn('min-w-0 flex-1 truncate text-13', ai ? 'font-normal' : 'font-medium')}>
          {ai ? <b className="font-semibold">{c.title}</b> : c.title}
          {c.meta && <span className={cn('font-normal', !ai && 'text-fg-3')}> · {c.meta}</span>}
        </span>
        {ai ? (
          <span className="font-mono text-caption">⌘ ↵</span>
        ) : c.shortcut ? (
          <span className="font-mono text-caption text-fg-3">{c.shortcut}</span>
        ) : (
          on && <Icon name="chevron-right" size={13} strokeWidth={2} className="text-fg-3" />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <Icon name="search" size={18} strokeWidth={2} className="text-fg-3" />
        <input
          data-autofocus
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={flat.length ? optionId(current) : undefined}
          aria-label="Search or jump to"
          placeholder="Search agents, runs, docs or type a command…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-body-l text-fg caret-brand outline-none placeholder:text-fg-3 focus-visible:outline-none"
        />
        <button
          type="button"
          onClick={onClose}
          className="rounded-xs border border-border px-1.5 py-0.5 font-mono text-caption text-fg-3 hover:text-fg"
        >
          Esc
        </button>
      </div>

      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Results"
        className="max-h-[min(544px,calc(100dvh-200px))] scrollbar-thin overflow-y-auto p-1.5"
      >
        {groups.map((g) => (
          <div key={g.label} role="group" aria-label={g.label}>
            <p className="px-3 pt-2.5 pb-1 text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">
              {g.label}
            </p>
            {g.items.map((c) => renderItem(c))}
          </div>
        ))}
        {askAi && <div className="mt-1.5">{renderItem(askCommand, true)}</div>}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-body-s text-fg-3">
        {[
          ['↑ ↓', 'to move'],
          ['↵', 'to open'],
          ['Esc', 'to close'],
        ].map(([key, label]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <kbd className="rounded-xs border border-border bg-surface px-1.5 font-mono text-caption">
              {key}
            </kbd>
            {label}
          </span>
        ))}
        <span className="ml-auto hidden sm:inline">Tip: paste a run ID to jump to it</span>
      </div>
    </>
  );
}

/** Global ⌘K command palette (W12-04): type to filter, ↑/↓ to move, Enter to open, ⌘Enter to ask AI. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      bare
      label="Command palette"
      size="lg"
      className="sm:mt-[72px] sm:max-w-[640px] sm:self-start"
    >
      <PaletteBody onClose={onClose} />
    </Modal>
  );
}

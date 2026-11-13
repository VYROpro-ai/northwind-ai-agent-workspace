import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Icon } from '@/components/icons';
import { Badge, Button, Dropdown, EmptyState, Input, useToast } from '@/components/ui';
import { templateApps, templateCategories, templates, workspaceTemplates, type AgentTemplate } from './data';
import { AgentIcon } from './components/AgentIcon';

type SortKey = 'Most used' | 'Top rated' | 'Name';

const sorters: Record<SortKey, (a: AgentTemplate, b: AgentTemplate) => number> = {
  'Most used': (a, b) => b.teams - a.teams,
  'Top rated': (a, b) => Number(b.rating) - Number(a.rating),
  Name: (a, b) => a.name.localeCompare(b.name),
};

function AppMarks({ tools }: { tools: string[] }) {
  return (
    <span className="flex shrink-0 items-center pl-1.5">
      {tools.map((t) => {
        const app = templateApps[t.split('.')[0]];
        return (
          <span
            key={t}
            title={app.name}
            className={cn(
              '-ml-1.5 inline-flex size-6 items-center justify-center rounded-full border-2 border-surface text-[9px] font-bold text-white',
              app.tint,
            )}
          >
            {app.mono}
          </span>
        );
      })}
    </span>
  );
}

function TemplateCard({ t, onUse }: { t: AgentTemplate; onUse: () => void }) {
  return (
    <article className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-surface px-5 pt-5 pb-4 shadow-[0_1px_2px_rgb(13_16_24/0.04)]">
      <div className="flex items-center gap-3">
        <AgentIcon icon={t.icon} tone={t.tone} size={44} shape="circle" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="flex items-center gap-2 text-h4 leading-[22px] font-semibold tracking-[-0.01em]">
            <span className="min-w-0 truncate">{t.name}</span>
            {t.pro && (
              <Badge
                tone="ai"
                size="sm"
                icon="lock"
                bordered={false}
                className="h-[18px] shrink-0 gap-[3px] border-transparent px-1.5 text-[10px] font-semibold [&_svg]:size-[9px]"
              >
                Pro
              </Badge>
            )}
          </h3>
          <span className="text-body-s text-fg-3">{t.category}</span>
        </div>
        <AppMarks tools={t.tools} />
      </div>
      <p className="min-h-10 text-13 leading-5 text-fg-2">{t.description}</p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Tools">
        {t.tools.map((x) => (
          <li
            key={x}
            className="h-6 rounded-full bg-subtle px-[9px] font-mono text-caption leading-6 text-fg-2"
          >
            {x}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-2.5 border-t border-border pt-3.5 text-body-s text-fg-3">
        <span className="inline-flex items-center gap-1 font-semibold text-fg">
          <Icon
            name="star"
            size={12}
            strokeWidth={1.5}
            fill="currentColor"
            className="text-warn"
            label="Rating"
          />
          {t.rating}
        </span>
        <span className="min-w-0 flex-1 truncate">{t.used}</span>
        <Button
          variant="inverse"
          size="sm"
          className="shadow-none"
          onClick={onUse}
          aria-label={`Use template: ${t.name}`}
        >
          Use template
        </Button>
      </div>
    </article>
  );
}

/** W3-10 · Templates gallery */
export default function Templates() {
  const navigate = useNavigate();
  const toast = useToast();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  // `null` keeps the curated order from data.ts until the user picks a sort.
  const [sort, setSort] = useState<SortKey | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates
      .filter((t) => category === 'All' || t.category === category)
      .filter((t) => !q || `${t.name} ${t.description} ${t.tools.join(' ')}`.toLowerCase().includes(q))
      .sort(sort ? sorters[sort] : () => 0);
  }, [category, query, sort]);

  const use = (name: string) => {
    toast({
      tone: 'info',
      title: `Starting from “${name}”`,
      description: 'Instructions and tools are pre-filled.',
    });
    navigate('/agents/new/basics');
  };

  return (
    <AppShell
      active="Agents"
      role="builder"
      crumbs={[{ label: 'Agents', to: '/agents' }, { label: 'Templates' }]}
      mainClassName="gap-5 lg:pt-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 font-semibold tracking-[-0.015em]">Agent templates</h1>
          <p className="text-body-m text-fg-2">Start from a proven setup, then make it yours.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Input
            pill
            leftIcon="search"
            aria-label="Search templates"
            placeholder="Search 48 templates"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            containerClassName="min-w-0 flex-1 sm:w-[280px] sm:flex-none"
            className="h-[38px] border-border text-13"
          />
          <Dropdown
            align="end"
            width={180}
            trigger={(props) => (
              <button
                type="button"
                className="inline-flex h-[38px] items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-13 hover:bg-subtle"
                {...props}
              >
                <span className="text-fg-3">Sort</span>
                {sort ?? 'Most used'}
                <Icon name="chevron-down" size={14} strokeWidth={2} className="text-icon" />
              </button>
            )}
            items={(Object.keys(sorters) as SortKey[]).map((key) => ({
              label: key,
              icon: key === (sort ?? 'Most used') ? ('check' as const) : undefined,
              onSelect: () => setSort(key),
            }))}
          />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Category"
        className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {templateCategories.map((k) => {
          const on = k.name === category;
          return (
            <button
              key={k.name}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setCategory(k.name)}
              className={cn(
                'inline-flex h-[38px] shrink-0 items-center gap-2 rounded-full border pr-2 pl-4 text-13 font-medium transition-colors',
                on
                  ? 'border-inverse bg-inverse text-on-inverse shadow-inverse'
                  : 'border-border bg-surface text-fg hover:bg-subtle',
              )}
            >
              {k.name}
              <span
                className={cn(
                  'h-[22px] min-w-6 rounded-full px-[7px] text-center text-caption leading-[22px] font-semibold',
                  on ? 'bg-on-inverse/20 text-on-inverse' : 'bg-subtle text-fg-2',
                )}
              >
                {k.count}
              </span>
            </button>
          );
        })}
      </div>

      {list.length ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => (
            <TemplateCard key={t.name} t={t} onUse={() => use(t.name)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="No templates found"
          description="Try another category or search term."
          className="rounded-[20px] border border-dashed border-border-strong"
        />
      )}

      <section aria-labelledby="workspace-templates" className="mt-1 flex flex-col gap-3">
        <div className="flex items-baseline gap-2.5">
          <h2 id="workspace-templates" className="text-h4 font-semibold">
            Workspace templates
          </h2>
          <span className="text-body-s text-fg-3">Shared by your team</span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workspaceTemplates.map((w) => (
            <button
              key={w.name}
              type="button"
              onClick={() => use(w.name)}
              className="flex items-center gap-3 rounded-[18px] border border-border bg-surface px-4 py-3.5 text-left transition-shadow hover:shadow-raised"
            >
              <span
                aria-hidden
                className={cn(
                  'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-body-s font-semibold text-white',
                  w.tint,
                )}
              >
                {w.mono}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-13 font-semibold">{w.name}</span>
                <span className="text-body-s text-fg-3">{w.meta}</span>
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              toast({
                tone: 'neutral',
                title: 'Save an agent as template',
                description: 'Open an agent and choose ··· → Save as template.',
              })
            }
            className="flex min-h-[66px] items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-border-strong px-4 py-3.5 text-13 text-fg-2 transition-colors hover:bg-subtle hover:text-fg"
          >
            + Save an agent as template
          </button>
        </div>
      </section>
    </AppShell>
  );
}

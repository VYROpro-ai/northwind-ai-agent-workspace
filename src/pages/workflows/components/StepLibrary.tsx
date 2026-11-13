import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { IconButton, Input } from '@/components/ui';
import { stepLibrary } from '../data';

/** W5-02 left rail · searchable list of step types, collapsible to an icon rail. */
export function StepLibrary() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const q = query.trim().toLowerCase();
  const groups = stepLibrary
    .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0);

  if (collapsed) {
    return (
      <aside
        aria-label="Node library"
        className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface py-3 lg:flex"
      >
        <IconButton
          icon="chevrons-left"
          label="Expand library"
          variant="ghost"
          size="sm"
          className="rotate-180"
          onClick={() => setCollapsed(false)}
        />
        {stepLibrary.flatMap((g) =>
          g.items.map((i) => (
            <button
              key={i.label}
              type="button"
              title={i.label}
              aria-label={`Add ${i.label}`}
              onClick={() => navigate('/workflows/editor/add-node')}
              className="rounded-md p-1 hover:bg-subtle"
            >
              <span
                className={cn('inline-flex size-[26px] items-center justify-center rounded-[7px]', i.tint)}
              >
                <Icon name={i.icon} size={14} strokeWidth={1.9} />
              </span>
            </button>
          )),
        )}
      </aside>
    );
  }

  return (
    <aside
      aria-label="Node library"
      className="hidden w-[249px] shrink-0 flex-col border-r border-border bg-surface lg:flex"
    >
      <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2.5">
        <h2 className="text-13 font-semibold text-fg">Steps</h2>
        <IconButton
          icon="chevrons-left"
          label="Collapse library"
          variant="ghost"
          size="xs"
          className="-my-1.5 -mr-1.5"
          onClick={() => setCollapsed(true)}
        />
      </div>
      <div className="px-3 pb-2">
        <Input
          size="sm"
          leftIcon="search"
          placeholder="Search steps"
          aria-label="Search steps"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-border bg-sunken text-body-s"
        />
      </div>
      <div className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-0.5 overflow-y-auto px-2 pb-3">
        {groups.map((g) => (
          <section key={g.group} aria-label={g.group} className="flex flex-col gap-0.5">
            <h3 className="px-1.5 pt-2.5 pb-1 text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">
              {g.group}
            </h3>
            {g.items.map((i) => (
              <button
                key={i.label}
                type="button"
                draggable
                onClick={() => navigate('/workflows/editor/add-node')}
                className="group flex h-9 items-center gap-2.5 rounded-md px-1.5 text-left text-13 text-fg transition-colors hover:bg-subtle"
              >
                <span
                  className={cn(
                    'inline-flex size-[26px] shrink-0 items-center justify-center rounded-[7px]',
                    i.tint,
                  )}
                >
                  <Icon name={i.icon} size={14} strokeWidth={1.9} />
                </span>
                <span className="flex-1">{i.label}</span>
                <Icon name="grip" size={12} className="text-fg-disabled group-hover:text-fg-3" />
              </button>
            ))}
          </section>
        ))}
        {groups.length === 0 && (
          <p className="px-1.5 py-4 text-body-s text-fg-3">No steps match “{query}”.</p>
        )}
      </div>
    </aside>
  );
}

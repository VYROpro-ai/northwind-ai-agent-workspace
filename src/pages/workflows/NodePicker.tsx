import { useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape } from '@/lib/hooks';
import { Icon } from '@/components/icons';
import { Input, useToast } from '@/components/ui';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowEditorLayout } from './components/WorkflowEditorLayout';
import { pickerCategories, pickerGroups, type PickerCategory } from './data';

/** W5-03 · Node picker — “Add a step” popover opened from a “+” on the canvas. */
export default function NodePicker() {
  return (
    <WorkflowEditorLayout>
      <WorkflowCanvas mode="edit">
        <StepPicker />
      </WorkflowCanvas>
    </WorkflowEditorLayout>
  );
}

function StepPicker() {
  const navigate = useNavigate();
  const toast = useToast();
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PickerCategory>('All');
  const [active, setActive] = useState(0);
  const close = () => navigate('/workflows/editor');
  useEscape(close);
  useClickOutside(ref, close);

  const q = query.trim().toLowerCase();
  const groups = pickerGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          (category === 'All' || i.category === category) &&
          (i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
      ),
    }))
    .filter((g) => g.items.length > 0);
  const flat = groups.flatMap((g) => g.items);
  const current = Math.min(active, Math.max(flat.length - 1, 0));

  const add = (label: string) => {
    toast({ title: `${label} step added`, description: 'Inserted after Classify ticket.' });
    close();
  };
  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((current + step + flat.length) % Math.max(flat.length, 1));
    } else if (e.key === 'Enter' && flat[current]) {
      e.preventDefault();
      add(flat[current].label);
    }
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Add a step"
      className={cn(
        'absolute inset-x-3 bottom-3 z-[4] flex max-h-[calc(100%-24px)] animate-pop-in flex-col overflow-hidden rounded-[14px] border border-border bg-raised shadow-overlay',
        'sm:inset-x-auto sm:top-[150px] sm:bottom-auto sm:left-[calc(50%+24px)] sm:max-h-[calc(100%-166px)] sm:w-[342px]',
      )}
    >
      <div className="px-3 pt-3 pb-2">
        <Input
          autoFocus
          leftIcon="search"
          placeholder="Search steps and apps"
          aria-label="Search steps and apps"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onSearchKey}
          className="text-13"
        />
      </div>
      <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-1 px-3 pb-2.5">
        {pickerCategories.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={category === c}
            onClick={() => {
              setCategory(c);
              setActive(0);
            }}
            className={cn(
              'h-6 rounded-full px-2 text-body-s font-medium transition-colors',
              category === c ? 'bg-brand-subtle text-brand-text' : 'bg-subtle text-fg-2 hover:text-fg',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto border-t border-border p-1.5">
        {groups.map((g) => (
          <section key={g.group} aria-label={g.group}>
            <h3 className="px-2 pt-2 pb-1 text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">
              {g.group}
            </h3>
            <ul>
              {g.items.map((i) => (
                <li
                  key={i.label}
                  onMouseEnter={() => setActive(flat.indexOf(i))}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md p-2 transition-colors',
                    flat[current] === i && 'bg-subtle',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => add(i.label)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-offset-4"
                  >
                    <span
                      className={cn(
                        'inline-flex size-[30px] shrink-0 items-center justify-center rounded-md',
                        i.tint,
                      )}
                    >
                      <Icon name={i.icon} size={15} strokeWidth={1.9} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-13 font-medium text-fg">{i.label}</span>
                      <span className="truncate text-body-s text-fg-3">{i.description}</span>
                    </span>
                  </button>
                  {i.connect && (
                    <Link
                      to="/integrations"
                      className="inline-flex h-[22px] shrink-0 items-center rounded-full border border-brand-border bg-brand-subtle px-2 text-caption font-semibold text-brand-text hover:bg-brand-border/40"
                    >
                      Connect
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="px-2 py-6 text-center text-body-s text-fg-3">No steps match your search.</p>
        )}
      </div>
    </div>
  );
}

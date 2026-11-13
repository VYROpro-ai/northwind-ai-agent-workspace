import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Avatar, Button, Drawer, Field, IconButton, Input, Tabs, useToast } from '@/components/ui';
import { people } from '@/data/people';
import { promptCounts, promptTags, savedPrompts, type PromptTag, type SavedPrompt } from '../data';

const variablePattern = /\{\{(\w+)\}\}/g;

function variablesOf(prompt: SavedPrompt) {
  return Array.from(prompt.body.matchAll(variablePattern), (m) => m[1]);
}

/** Prompt body with `{{variables}}` drawn as mono brand chips. */
function PromptBody({ body }: { body: string }) {
  const parts = body.split(/(\{\{\w+\}\})/g);
  return (
    <p className="text-13 leading-[21px] text-fg-2">
      {parts.map((part, i) =>
        part.startsWith('{{') ? (
          <code
            key={i}
            className="mx-0.5 rounded-xs bg-brand-subtle px-1 font-mono text-[11px] text-brand-text"
          >
            {part}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

/** "Fill in before inserting" form for the selected prompt's variables. */
function FillVariables({
  prompt,
  onCancel,
  onInsert,
}: {
  prompt: SavedPrompt;
  onCancel: () => void;
  onInsert: (text: string) => void;
}) {
  const vars = variablesOf(prompt);
  const [values, setValues] = useState<Record<string, string>>({ customer_name: 'Dana Whitfield' });
  const [touched, setTouched] = useState<Record<string, boolean>>({ order_number: true });
  const missing = vars.filter((v) => !values[v]?.trim());

  return (
    <form
      className="flex flex-col gap-3 rounded-[18px] border border-border bg-sunken p-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (missing.length) {
          setTouched(Object.fromEntries(vars.map((v) => [v, true])));
          return;
        }
        onInsert(prompt.body.replace(variablePattern, (_, name: string) => values[name].trim()));
      }}
    >
      <p className="text-13 font-semibold text-fg">Fill in before inserting</p>
      {vars.map((v) => {
        const error = touched[v] && !values[v]?.trim();
        return (
          <Field
            key={v}
            label={<span className="font-mono text-body-s font-normal text-fg-2">{v}</span>}
            error={error ? 'Fill this in to insert the prompt' : undefined}
          >
            {(id, describedBy) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                pill
                className="h-[34px] text-13"
                invalid={Boolean(error)}
                placeholder={
                  v === 'order_number' ? 'e.g. 48213' : v === 'priority' ? 'e.g. P1' : 'e.g. Dana Whitfield'
                }
                value={values[v] ?? ''}
                onChange={(e) => setValues((s) => ({ ...s, [v]: e.target.value }))}
                onBlur={() => setTouched((s) => ({ ...s, [v]: true }))}
              />
            )}
          </Field>
        );
      })}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={missing.length > 0}>
          Insert prompt
        </Button>
      </div>
    </form>
  );
}

/** W4-09 · Prompt library drawer opened from the composer on New chat. */
export function PromptLibraryDrawer({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}) {
  const [tab, setTab] = useState<'mine' | 'team'>('team');
  const [tag, setTag] = useState<PromptTag>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>('refund-confirmation');
  const toast = useToast();

  const q = query.trim().toLowerCase();
  const list = savedPrompts.filter(
    (p) =>
      (tab === 'mine' ? p.mine : !p.mine) &&
      (tag === 'All' || p.tag === tag) &&
      (p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)),
  );
  const current = list.find((p) => p.id === selected);

  return (
    <Drawer open={open} onClose={onClose} width={480} label="Prompt library">
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <h2 className="flex-1 text-h4 font-semibold text-fg">Prompt library</h2>
          <Button
            leftIcon="plus"
            size="sm"
            onClick={() =>
              toast({
                title: 'New prompt',
                description: 'Prompt editor opens here in the full product.',
                tone: 'info',
              })
            }
          >
            New prompt
          </Button>
          <IconButton icon="close" label="Close prompt library" variant="ghost" size="sm" onClick={onClose} />
        </div>
        <Tabs
          label="Prompt owner"
          value={tab}
          onChange={setTab}
          className="px-5"
          items={[
            { value: 'mine', label: 'My prompts', count: promptCounts.mine },
            { value: 'team', label: 'Team prompts', count: promptCounts.team },
          ]}
        />
        <div className="flex flex-col gap-3 px-5 pt-3.5">
          <Input
            pill
            leftIcon="search"
            placeholder="Search prompts"
            aria-label="Search prompts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tag">
            {promptTags.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tag === t}
                onClick={() => setTag(t)}
                className={cn(
                  'h-7 rounded-full border px-2.5 text-body-s font-medium transition-colors',
                  tag === t
                    ? 'border-brand-border bg-brand-subtle text-brand-text'
                    : 'border-border text-fg-2 hover:bg-subtle hover:text-fg',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <ul className="flex flex-col gap-2.5 px-5 pt-3.5 pb-5">
          {list.map((p) => {
            const on = p.id === selected;
            const author = people[p.author];
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(on ? null : p.id)}
                  className={cn(
                    'flex w-full flex-col gap-2 rounded-[18px] border p-3.5 text-left transition-colors',
                    on
                      ? 'border-brand bg-brand-subtle shadow-[inset_0_0_0_0.5px_var(--brand)]'
                      : 'border-border hover:bg-subtle',
                  )}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="flex-1 text-body-m font-semibold text-fg">{p.title}</span>
                    <span className="text-body-s text-fg-3">Used {p.uses} times</span>
                  </span>
                  <PromptBody body={p.body} />
                  <span className="flex items-center gap-1.5 text-body-s text-fg-3">
                    <Avatar name={author.name} src={author.avatar} size="xs" />
                    {author.name}
                    <span aria-hidden>·</span>
                    {p.tag}
                  </span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && (
            <li className="py-8 text-center text-13 text-fg-3">No prompts match your filters.</li>
          )}
          {current && variablesOf(current).length > 0 && (
            <li>
              <FillVariables
                key={current.id}
                prompt={current}
                onCancel={() => setSelected(null)}
                onInsert={(text) => {
                  onInsert(text);
                  toast({ title: `Inserted “${current.title}”` });
                }}
              />
            </li>
          )}
        </ul>
      </div>
    </Drawer>
  );
}

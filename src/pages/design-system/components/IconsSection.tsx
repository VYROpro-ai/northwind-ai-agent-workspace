import { useMemo, useState } from 'react';
import { Icon, icons, type IconName } from '@/components/icons';
import { EmptyState, Input, Segmented, useToast } from '@/components/ui';
import { DsSectionBlock, SectionHeader } from './Specimen';

const iconNames = Object.keys(icons) as IconName[];
type IconSize = '16' | '20' | '24';

/** Foundations 05 — every icon in the set, searchable, click to copy its name. */
export function IconsSection() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [size, setSize] = useState<IconSize>('20');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? iconNames.filter((n) => n.includes(q)) : iconNames;
  }, [query]);

  const copy = async (name: IconName) => {
    try {
      await navigator.clipboard.writeText(name);
      toast({ title: `Copied “${name}”`, description: `<Icon name="${name}" />`, tone: 'ok' });
    } catch {
      toast({ title: 'Clipboard unavailable', description: name, tone: 'warn' });
    }
  };

  return (
    <DsSectionBlock id="icons">
      <SectionHeader
        id="icons"
        eyebrow="Foundations · 05"
        title="Icons"
        description="Outline icons on a 24 px grid with a 1.75 px stroke and round joins. Colour always comes from currentColor — set it with text-icon or a status token."
        meta={`${iconNames.length} icons · 16 · 20 · 24 px`}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          leftIcon="search"
          pill
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons"
          aria-label="Search icons"
          containerClassName="w-full sm:w-80"
        />
        <div className="flex items-center gap-3">
          <span className="text-body-s text-fg-3" aria-live="polite">
            {filtered.length} of {iconNames.length}
          </span>
          <Segmented
            label="Preview size"
            size="sm"
            value={size}
            onChange={setSize}
            options={[
              { value: '16', label: '16' },
              { value: '20', label: '20' },
              { value: '24', label: '24' },
            ]}
          />
        </div>
      </div>
      {filtered.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
          {filtered.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => copy(name)}
                title={`Copy “${name}”`}
                className="group flex h-[92px] w-full flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-2 text-icon transition-colors hover:border-border-strong hover:bg-sunken hover:text-fg"
              >
                <Icon name={name} size={Number(size)} />
                <span className="w-full truncate text-center font-mono text-caption text-fg-3 group-hover:text-fg-2">
                  {name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface">
          <EmptyState
            icon="search"
            title="No icons match"
            description={`Nothing is named like “${query}”. Try a shorter term such as “run” or “chat”.`}
          />
        </div>
      )}
    </DsSectionBlock>
  );
}

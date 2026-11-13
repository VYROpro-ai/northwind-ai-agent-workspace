import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Dropdown } from '@/components/ui';

/** Pill filter button with a single-select menu. `null` means "any". */
export function FilterMenu({
  label,
  options,
  value,
  onChange,
  align = 'start',
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  align?: 'start' | 'end';
}) {
  return (
    <Dropdown
      align={align}
      width={200}
      trigger={(props) => (
        <button
          type="button"
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-full border pr-2 pl-3 text-13 font-medium whitespace-nowrap transition-colors',
            value
              ? 'border-brand-border bg-brand-subtle text-brand-text'
              : 'border-border-strong bg-surface text-fg hover:bg-subtle',
          )}
          {...props}
        >
          {value ? `${label}: ${value}` : label}
          <Icon
            name="chevron-down"
            size={14}
            strokeWidth={2}
            className={value ? 'text-brand-text' : 'text-icon'}
          />
        </button>
      )}
      items={[
        {
          label: `Any ${label.toLowerCase()}`,
          icon: value === null ? 'check' : undefined,
          onSelect: () => onChange(null),
        },
        ...options.map((o, i) => ({
          label: o,
          icon: value === o ? ('check' as const) : undefined,
          separator: i === 0,
          onSelect: () => onChange(o),
        })),
      ]}
    />
  );
}

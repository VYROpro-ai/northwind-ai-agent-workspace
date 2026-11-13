import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { Dropdown } from './Menu';

export interface FilterOption<T extends string = string> {
  value: T;
  label?: string;
  count?: number;
}

export interface FilterSelectProps<T extends string> {
  /** Muted prefix inside the pill, e.g. "Status". Omit to show the value alone. */
  label?: string;
  value: T;
  options: readonly (T | FilterOption<T>)[];
  onChange: (value: T) => void;
  icon?: IconName;
  /** Count badge shown after the value. */
  count?: number;
  align?: 'start' | 'end';
  className?: string;
}

/**
 * Pill filter trigger — "Label  Value  (count) ⌄" — that opens a single-select menu.
 * Used for status, agent, type, category and range filters across the app.
 */
export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
  count,
  align = 'start',
  className,
}: FilterSelectProps<T>) {
  const items = options.map((o): FilterOption<T> => (typeof o === 'string' ? { value: o as T } : o));
  const current = items.find((o) => o.value === value);
  const shown = current?.label ?? value;
  return (
    <Dropdown
      align={align}
      width={240}
      items={items.map((o) => ({
        label: (
          <span className="flex items-center justify-between gap-3">
            {o.label ?? o.value}
            {o.count !== undefined && <span className="text-body-s text-fg-3 tabular">{o.count}</span>}
          </span>
        ),
        icon: o.value === value ? 'check' : undefined,
        onSelect: () => onChange(o.value),
      }))}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className={cn(
            'inline-flex h-[34px] max-w-full items-center gap-1.5 rounded-full border border-border bg-surface pr-2.5 pl-3 text-13 whitespace-nowrap transition-colors hover:border-border-strong',
            className,
          )}
        >
          {icon && <Icon name={icon} size={14} strokeWidth={1.9} className="text-fg-3" />}
          {label && <span className="text-fg-3">{label}</span>}{' '}
          <span className="truncate font-medium text-fg">{shown}</span>
          {count !== undefined && (
            <span className="h-5 rounded-full bg-subtle px-1.5 text-caption leading-5 font-semibold text-fg-2 tabular">
              {count}
            </span>
          )}
          <Icon name="chevron-down" size={14} strokeWidth={2} className="ml-auto text-fg-3" />
        </button>
      )}
    />
  );
}

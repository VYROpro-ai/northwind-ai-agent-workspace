import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';

export interface PrefixSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Muted inline prefix, e.g. "Role", "TZ", "Act". */
  prefix: string;
  options: { value: string; label: string }[];
  /** Accessible name when no visible <label> points at the select. */
  label?: string;
  /** Pill (filters, invite modal) or 8 px radius (form fields). */
  pill?: boolean;
  containerClassName?: string;
}

/** Native select with a muted inline prefix — the compact pickers used across the settings designs. */
export function PrefixSelect({
  prefix,
  options,
  label,
  pill,
  className,
  containerClassName,
  disabled,
  ...props
}: PrefixSelectProps) {
  return (
    <div
      className={cn(
        'relative flex h-[34px] min-w-0 items-center gap-1.5 border bg-surface text-13 transition-[border-color,box-shadow]',
        'focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
        pill ? 'rounded-full border-border' : 'rounded-md border-border-strong',
        disabled && 'bg-sunken opacity-60',
        containerClassName,
      )}
    >
      <span aria-hidden className="shrink-0 pl-3 text-fg-3">
        {prefix}
      </span>
      <select
        aria-label={label}
        disabled={disabled}
        className={cn(
          'h-full min-w-0 flex-1 cursor-pointer appearance-none truncate bg-transparent pr-8 text-fg outline-none',
          'focus-visible:outline-none disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        size={14}
        strokeWidth={2}
        className="pointer-events-none absolute right-3 text-fg-3"
      />
    </div>
  );
}

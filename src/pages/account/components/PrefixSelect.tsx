import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';

export interface PrefixSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Muted inline prefix, e.g. "Lang", "TZ", "From". */
  prefix: string;
  options: { value: string; label: string }[];
  /** Accessible name of the field. */
  label: string;
}

/** Pill select with a muted inline prefix — the compact setting pickers in the account designs. */
export function PrefixSelect({ prefix, options, label, className, disabled, ...props }: PrefixSelectProps) {
  return (
    <label
      className={cn(
        'relative inline-flex h-[34px] w-full shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface text-13 transition-[border-color,box-shadow] focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)] sm:w-[200px]',
        disabled && 'bg-sunken opacity-60',
        className,
      )}
    >
      <span aria-hidden className="shrink-0 pl-3 text-fg-3">
        {prefix}
      </span>
      <select
        aria-label={label}
        disabled={disabled}
        className="h-full min-w-0 flex-1 cursor-pointer appearance-none truncate rounded-r-full bg-transparent pr-8 text-fg outline-none focus-visible:outline-none disabled:cursor-not-allowed"
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
        className="pointer-events-none absolute right-2.5 text-fg-3"
      />
    </label>
  );
}

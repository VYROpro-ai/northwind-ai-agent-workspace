import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';

export interface TabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: IconName;
  count?: number | string;
  /** When set, the tab renders as a router link. */
  to?: string;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value?: T;
  onChange?: (value: T) => void;
  /** underline = classic tabs under a header; pill = rounded track (settings nav). */
  variant?: 'underline' | 'pill';
  className?: string;
  label?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
  label,
}: TabsProps<T>) {
  const base =
    variant === 'underline'
      ? 'relative inline-flex h-10 items-center gap-1.5 text-13 font-medium whitespace-nowrap transition-colors'
      : 'inline-flex h-[34px] items-center gap-[7px] rounded-full px-3.5 text-13 font-medium whitespace-nowrap transition-colors';
  const on =
    variant === 'underline'
      ? 'font-semibold text-fg after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand'
      : 'bg-inverse text-on-inverse shadow-inverse';
  const off = variant === 'underline' ? 'text-fg-3 hover:text-fg' : 'text-fg-2 hover:text-fg';

  const content = (item: TabItem<T>) => (
    <>
      {item.icon && <Icon name={item.icon} size={14} strokeWidth={2} />}
      {item.label}
      {item.count !== undefined && <span className="font-normal text-fg-3 tabular">{item.count}</span>}
    </>
  );

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'scrollbar-none flex max-w-full items-center overflow-x-auto',
        variant === 'underline'
          ? 'gap-[22px] border-b border-border'
          : 'gap-0.5 rounded-full bg-sunken p-[3px]',
        className,
      )}
    >
      {items.map((item) =>
        item.to ? (
          <NavLink
            key={item.value}
            to={item.to}
            end
            role="tab"
            className={({ isActive }) => cn(base, isActive ? on : off)}
          >
            {content(item)}
          </NavLink>
        ) : (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={item.value === value}
            onClick={() => onChange?.(item.value)}
            className={cn(base, item.value === value ? on : off)}
          >
            {content(item)}
          </button>
        ),
      )}
    </div>
  );
}

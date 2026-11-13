import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { IconButton } from './IconButton';

/**
 * Table primitives. Wrap in <TableContainer> — it scrolls horizontally on small
 * screens so wide data tables never break the page layout.
 */
export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-full scrollbar-thin overflow-x-auto', className)} {...props} />;
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-left text-body-m', className)} {...props} />;
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('text-body-s font-normal text-fg-3', className)} {...props} />;
}

export function TBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TR({
  className,
  selected,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }) {
  return (
    <tr
      aria-selected={selected || undefined}
      className={cn(
        'border-b border-border transition-colors last:border-0',
        selected && 'bg-brand-subtle/60',
        className,
      )}
      {...props}
    />
  );
}

export function TH({
  className,
  sorted,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { sorted?: 'asc' | 'desc' }) {
  return (
    <th
      scope="col"
      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
      className={cn(
        'h-10 px-3 font-[inherit] whitespace-nowrap first:pl-5 last:pr-5',
        sorted && 'font-medium text-fg',
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {props.children}
        {sorted && <Icon name={sorted === 'asc' ? 'arrow-up' : 'arrow-down'} size={12} strokeWidth={2.25} />}
      </span>
    </th>
  );
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('h-14 px-3 align-middle first:pl-5 last:pr-5', className)} {...props} />;
}

export function Pagination({
  page,
  pageCount,
  onChange,
  summary,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  summary?: React.ReactNode;
}) {
  const pages = Array.from(new Set([1, 2, 3, page, pageCount].filter((p) => p >= 1 && p <= pageCount))).sort(
    (a, b) => a - b,
  );
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
      <p className="text-body-m text-fg-2">{summary}</p>
      <div className="flex items-center gap-1">
        <IconButton
          icon="chevron-left"
          label="Previous page"
          size="sm"
          shape="square"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        />
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-fg-3">…</span>}
            <button
              type="button"
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
              className={cn(
                'h-8 min-w-8 rounded-md px-2 text-body-m tabular transition-colors',
                p === page ? 'bg-brand-subtle font-medium text-brand-text' : 'text-fg-2 hover:bg-subtle',
              )}
            >
              {p}
            </button>
          </span>
        ))}
        <IconButton
          icon="chevron-right"
          label="Next page"
          size="sm"
          shape="square"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        />
      </div>
    </nav>
  );
}

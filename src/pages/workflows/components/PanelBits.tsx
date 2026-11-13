import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';

/** `{{variable}}` token inside a templated message. `missing` flags a field that no longer exists. */
export function VarToken({ name, missing }: { name: string; missing?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1 rounded-[5px] px-[7px] align-[1px] font-mono text-caption leading-none',
        missing
          ? 'border border-danger-border bg-danger-subtle text-danger-text'
          : 'bg-brand-subtle text-brand-text',
      )}
    >
      {missing ? (
        <>
          <Icon name="wf-warn-mark" size={11} strokeWidth={2.6} />
          Missing: {name}
        </>
      ) : (
        `{{${name}}}`
      )}
    </span>
  );
}

/** Rounded segmented track used inside panels (8 px radius, white thumb). */
export function PanelSegmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex self-start rounded-md bg-subtle p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm px-2.5 text-body-s font-medium whitespace-nowrap transition-colors',
            size === 'sm' ? 'h-[26px]' : 'h-7',
            o.value === value
              ? 'bg-surface text-fg shadow-raised dark:bg-border-strong'
              : 'text-fg-3 hover:text-fg',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Read-only monospace block with a 1 px border (inputs / outputs). */
export function MonoBlock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md border border-border px-3 py-2.5 font-mono text-caption leading-[18px] text-fg-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Dark code panel (sample JSON, stack traces). */
export function CodePanel({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <pre
      aria-label={label}
      className="scrollbar-thin overflow-x-auto rounded-md bg-code px-3 py-2.5 font-mono text-caption leading-[18px] whitespace-pre text-code-fg"
    >
      {children}
    </pre>
  );
}

/** Compact inline note (12 px) — e.g. “Branches are checked from top to bottom”. */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-md bg-info-subtle px-3 py-2.5 text-body-s leading-[17px] text-info-text">
      <Icon name="info" size={14} strokeWidth={2} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

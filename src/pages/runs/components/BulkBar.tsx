import type { ReactNode } from 'react';

/** Dark selection bar shown above a list while rows are selected. */
export function BulkBar({
  title,
  hint,
  children,
}: {
  title: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex animate-fade-in flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] bg-inverse py-2 pr-2 pl-4 text-13 text-on-inverse"
    >
      <b className="font-semibold">{title}</b>
      {hint && <span className="opacity-70">{hint}</span>}
      <span className="flex-1" />
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/** Translucent pill button used inside the bulk bar. */
export function BulkButton({
  children,
  onClick,
  tone = 'default',
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'brand' | 'quiet';
}) {
  const tones = {
    default: 'bg-on-inverse/15 hover:bg-on-inverse/25',
    brand: 'bg-brand text-white hover:bg-brand-hover',
    quiet: 'opacity-70 hover:opacity-100',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[30px] rounded-full px-3 text-13 font-medium transition-colors ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

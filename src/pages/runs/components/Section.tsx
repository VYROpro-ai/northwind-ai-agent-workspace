import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Surface card (as a `<section>`) with the kit's 15 px title and an optional right-hand aside. */
export function Section({
  title,
  aside,
  children,
  className,
}: {
  title?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn('flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-surface p-4', className)}
    >
      {(title || aside) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          {title && <h2 className="text-[15px] leading-[22px] font-semibold text-fg">{title}</h2>}
          {aside && <div className="flex items-center gap-2">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

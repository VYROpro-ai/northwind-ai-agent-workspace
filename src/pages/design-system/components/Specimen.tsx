import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Section intro in the style of the kit's design boards: mono eyebrow, title, lead, meta. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  meta,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
      <div className="min-w-0">
        <p className="font-mono text-body-s text-fg-3">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-1.5 text-h2 font-semibold text-fg sm:text-h1">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-body-m text-fg-2">{description}</p>
      </div>
      {meta && <p className="shrink-0 font-mono text-body-s text-fg-3">{meta}</p>}
    </header>
  );
}

/** A page section wired to the side navigation. */
export function DsSectionBlock({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} data-ds-section className="scroll-mt-32 lg:scroll-mt-24">
      {children}
    </section>
  );
}

/** Card that frames one component group, with its import path in the footer. */
export function Specimen({
  title,
  meta,
  importPath,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  meta?: ReactNode;
  importPath?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface',
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5">
        <h3 className="text-h4 font-semibold text-fg">{title}</h3>
        {meta && <span className="font-mono text-body-s text-fg-3">{meta}</span>}
      </div>
      <div className={cn('flex-1 p-5', bodyClassName)}>{children}</div>
      {importPath && (
        <div
          tabIndex={0}
          className="scrollbar-none overflow-x-auto border-t border-border bg-sunken px-5 py-2.5"
        >
          <code className="font-mono text-body-s whitespace-nowrap text-fg-2">{importPath}</code>
        </div>
      )}
    </div>
  );
}

/** Small caption above a row of examples, e.g. "Sizes" or "Disabled". */
export function VariantLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mb-2.5 text-caption font-medium text-fg-3', className)}>{children}</p>;
}

/** Wrapping row of examples. */
export function ExampleRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>;
}

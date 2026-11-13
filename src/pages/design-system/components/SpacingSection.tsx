import { cn } from '@/lib/cn';
import { radii, spacing } from '../data';
import { DsSectionBlock, SectionHeader, Specimen } from './Specimen';

/** Foundations 03 — 4-pt spacing scale and radius steps. */
export function SpacingSection() {
  return (
    <DsSectionBlock id="spacing">
      <SectionHeader
        id="spacing"
        eyebrow="Foundations · 03"
        title="Spacing & radius"
        description="A 4-point scale for every gap and padding, and a short list of radius steps. Both map one-to-one to Tailwind utilities, so density stays consistent across screens."
        meta="4-pt scale · 9 radius steps"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Specimen title="Spacing" meta="p-* · gap-* · m-*" bodyClassName="px-5 pt-3 pb-2">
          <ul>
            {spacing.map((s) => (
              <li
                key={s.px}
                className="grid grid-cols-[64px_44px_minmax(0,1fr)] items-center gap-3 border-b border-border py-2.5 last:border-0 sm:grid-cols-[72px_48px_minmax(0,1fr)]"
              >
                <code className="font-mono text-body-s text-fg">{s.utility}</code>
                <span className="font-mono text-body-s text-fg-3">{s.px}px</span>
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className="h-3.5 shrink-0 rounded-[2px] bg-brand/80"
                    style={{ width: `min(${Math.max(s.px * 3, 2)}px, 50%)` }}
                  />
                  <span className="truncate text-body-s text-fg-2">{s.use}</span>
                </span>
              </li>
            ))}
          </ul>
        </Specimen>
        <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2">
          {radii.map((r) => (
            <li
              key={r.utility}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <span
                aria-hidden
                className={cn('size-16 shrink-0 border border-brand bg-brand-subtle', r.className)}
              />
              <span className="min-w-0">
                <code className="block font-mono text-13 text-fg">{r.utility}</code>
                <span className="block font-mono text-body-s text-fg-3">{r.px}</span>
                <span className="mt-0.5 block text-body-s text-fg-2">{r.use}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DsSectionBlock>
  );
}

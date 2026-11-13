import { cn } from '@/lib/cn';
import { tok } from '@/lib/syntax';
import { typeScale } from '../data';
import { DsSectionBlock, SectionHeader } from './Specimen';

/** Foundations 02 — families and the type scale. */
export function TypographySection() {
  return (
    <DsSectionBlock id="typography">
      <SectionHeader
        id="typography"
        eyebrow="Foundations · 02"
        title="Typography"
        description="One sans family for the interface and one mono family for code, run IDs and logs. Every text style is a Tailwind utility that sets size, line height and tracking together."
        meta={`${typeScale.length} text styles · SIL Open Font License`}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between gap-6 overflow-hidden rounded-xl border border-border bg-sunken p-6 sm:p-8">
          <div className="min-w-0">
            <p className="text-body-s font-medium text-fg-2">Interface · font-sans</p>
            <p className="mt-1 text-[28px] leading-9 font-semibold tracking-[-0.02em] text-fg">Geist</p>
            <p className="mt-1 text-body-m text-fg-2">Regular 400 · Medium 500 · Semibold 600 · Bold 700</p>
            <p className="mt-4 text-body-m break-all text-fg">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz 0123456789 $%&@
            </p>
          </div>
          <span
            aria-hidden
            className="hidden text-[88px] leading-none font-semibold tracking-[-0.04em] text-fg sm:block"
          >
            Ag
          </span>
        </div>
        <div className="flex items-center justify-between gap-6 overflow-hidden rounded-xl border border-code-border bg-code p-6 sm:p-8">
          <div className="min-w-0">
            <p className="text-body-s font-medium text-[var(--slate-400)]">Code, IDs, logs · font-mono</p>
            <p className="mt-1 font-mono text-[28px] leading-9 text-white">Geist Mono</p>
            <p className="mt-1 text-body-m text-[var(--slate-400)]">
              Regular 400 · Medium 500 · Semibold 600
            </p>
            <p className="mt-4 font-mono text-body-s break-words text-code-fg">
              {'{ '}
              <span className={tok.key}>"status"</span>: <span className={tok.str}>"succeeded"</span>,{' '}
              <span className={tok.key}>"latency"</span>: <span className={tok.num}>1.8</span>,{' '}
              <span className={tok.key}>"cost"</span>: <span className={tok.num}>0.04</span>
              {' }'}
            </p>
          </div>
          <span aria-hidden className={cn('hidden font-mono text-[80px] leading-none sm:block', tok.kw)}>
            {'{}'}
          </span>
        </div>
      </div>

      <ul className="mt-8 border-t border-border">
        {typeScale.map((t) => (
          <li
            key={t.name}
            className="grid grid-cols-1 gap-2 border-b border-border py-5 md:grid-cols-[200px_minmax(0,1fr)] md:items-center md:gap-6 xl:grid-cols-[180px_180px_minmax(0,1fr)]"
          >
            <div>
              <p className="text-body-m font-semibold text-fg">{t.name}</p>
              <code className="font-mono text-body-s text-fg-3">{t.utility}</code>
              <p className="mt-0.5 font-mono text-body-s text-fg-3 xl:hidden">{t.metrics}</p>
            </div>
            <p className="hidden font-mono text-body-s text-fg-3 xl:block">{t.metrics}</p>
            <p className={cn('min-w-0 break-words text-fg', t.className)}>
              {t.strong && <span className="font-medium">{t.strong}</span>}
              {t.sample}
            </p>
          </li>
        ))}
      </ul>
    </DsSectionBlock>
  );
}

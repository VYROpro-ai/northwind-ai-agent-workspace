import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/lib/theme';
import { TableContainer, useToast } from '@/components/ui';
import { rampSteps, ramps, semanticGroups, type Ramp } from '../data';
import { describeToken, readComputedVars, resolveToken, useTokenSheet, type ThemeName } from '../tokens';
import { DsSectionBlock, SectionHeader, Specimen } from './Specimen';

const primitiveVars = ramps.flatMap((r) => (r.steps ?? rampSteps).map((step) => `--${r.name}-${step}`));
const semanticCount = semanticGroups.reduce((n, g) => n + g.tokens.length, 0);

/** Foundations 01 — primitive ramps and the semantic token table. */
export function ColorSection() {
  const { theme } = useTheme();
  return (
    <DsSectionBlock id="colors">
      <SectionHeader
        id="colors"
        eyebrow="Foundations · 01"
        title="Color"
        description="Raw scales, 50–950, feed a semantic layer that carries Light and Dark. Screens only use semantic tokens through Tailwind utilities — never primitives or hex values."
        meta={`${primitiveVars.length} primitives · ${semanticCount} semantic`}
      />
      <div className="flex flex-col gap-6">
        {/* Re-read computed values whenever the theme flips. */}
        <PrimitiveRamps key={theme} />
        <SemanticTable />
      </div>
    </DsSectionBlock>
  );
}

function PrimitiveRamps() {
  const [values] = useState(() => readComputedVars(primitiveVars));
  const toast = useToast();

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(`var(${token})`);
      toast({ title: `Copied var(${token})`, tone: 'ok' });
    } catch {
      toast({ title: 'Clipboard unavailable', description: `var(${token})`, tone: 'warn' });
    }
  };

  return (
    <Specimen
      title="Primitives"
      meta="--{ramp}-{step}"
      importPath="Referenced only by semantic tokens · one-off highlights use bg-[var(--amber-100)] dark:bg-[var(--amber-900)]"
    >
      <div className="flex flex-col gap-5">
        {ramps.map((ramp) => (
          <RampRow key={ramp.name} ramp={ramp} values={values} onCopy={copy} />
        ))}
      </div>
      <p className="mt-5 border-t border-border pt-4 text-body-s text-fg-3">
        White label on a swatch = that step passes 4.5:1 with white text. Click a swatch to copy its variable.
      </p>
    </Specimen>
  );
}

function RampRow({
  ramp,
  values,
  onCopy,
}: {
  ramp: Ramp;
  values: Record<string, string>;
  onCopy: (token: string) => void;
}) {
  const steps = ramp.steps ?? rampSteps;
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[168px_minmax(0,1fr)] xl:items-center">
      <div>
        <p className="text-body-m font-semibold text-fg">{ramp.label}</p>
        <p className="text-body-s text-fg-3">{ramp.role}</p>
        <p className="mt-0.5 font-mono text-caption text-fg-3">
          --{ramp.name}-{steps.length > 1 ? `{${steps[0]}…${steps[steps.length - 1]}}` : steps[0]}
        </p>
      </div>
      <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-11">
        {steps.map((step) => {
          const index = rampSteps.indexOf(step as (typeof rampSteps)[number]);
          const token = `--${ramp.name}-${step}`;
          const light = index < ramp.firstWhite;
          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => onCopy(token)}
                title={`var(${token})`}
                aria-label={`${step} ${values[token] || ''} — copy var(${token})`}
                className={cn(
                  'flex h-[72px] w-full flex-col justify-between rounded-md p-2 text-left transition-transform hover:-translate-y-0.5',
                  light ? 'text-[var(--slate-950)]' : 'text-white',
                  index === 0 && 'ring-1 ring-border ring-inset',
                )}
                style={{ background: `var(${token})` }}
              >
                <span className="text-body-s font-semibold">{step}</span>
                <span className="truncate font-mono text-[10px] leading-3 uppercase">{values[token]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SemanticTable() {
  const sheet = useTokenSheet();
  const { theme } = useTheme();
  return (
    <Specimen
      title="Semantic tokens"
      meta={`${semanticCount} tokens · 2 modes · current: ${theme}`}
      importPath="className='bg-surface text-fg-2 border-border' · style={{ color: 'var(--chart-1)' }}"
      bodyClassName="p-0 pt-4"
    >
      <TableContainer>
        <table className="w-full min-w-[760px] border-collapse text-left text-body-m">
          <thead className="text-body-s">
            <tr className="border-y border-border">
              <th scope="col" className="h-10 bg-sunken px-5 font-normal text-fg-3">
                Token
              </th>
              <th scope="col" className="h-10 bg-sunken px-3 font-normal text-fg-3">
                Utility
              </th>
              <th
                scope="col"
                className="h-10 w-[190px] bg-[var(--white)] px-4 font-normal text-[var(--slate-500)]"
              >
                Light
              </th>
              <th
                scope="col"
                className="h-10 w-[190px] bg-[var(--slate-950)] px-4 font-normal text-[var(--slate-400)]"
              >
                Dark
              </th>
            </tr>
          </thead>
          {semanticGroups.map((group) => (
            <tbody key={group.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={2}
                  className="px-5 pt-5 pb-2 text-caption font-semibold tracking-wide text-fg uppercase"
                >
                  {group.title}
                </th>
                <td className="bg-[var(--white)]" />
                <td className="bg-[var(--slate-950)]" />
              </tr>
              {group.tokens.map((t) => (
                <tr key={t.name} className="align-top">
                  <th scope="row" className="px-5 py-2 font-normal">
                    <code className="font-mono text-13 text-fg">--{t.name}</code>
                    <span className="mt-0.5 block text-body-s text-fg-3">{t.description}</span>
                  </th>
                  <td className="px-3 py-2">
                    <code className="font-mono text-body-s break-all text-fg-2">{t.utility}</code>
                  </td>
                  <ModeCell name={t.name} theme="light" sheet={sheet} />
                  <ModeCell name={t.name} theme="dark" sheet={sheet} />
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </TableContainer>
    </Specimen>
  );
}

function ModeCell({
  name,
  theme,
  sheet,
}: {
  name: string;
  theme: ThemeName;
  sheet: ReturnType<typeof useTokenSheet>;
}) {
  const token = `--${name}`;
  const value = resolveToken(sheet, token, theme);
  const label = describeToken(sheet, token, theme);
  const dark = theme === 'dark';
  return (
    <td
      className={cn(
        'px-4 py-2',
        dark ? 'bg-[var(--slate-950)] text-[var(--slate-300)]' : 'bg-[var(--white)] text-[var(--slate-600)]',
      )}
    >
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            'size-[18px] shrink-0 rounded-xs ring-1 ring-inset',
            dark ? 'ring-[var(--slate-700)]' : 'ring-[var(--slate-200)]',
          )}
          style={{ background: value || `var(${token})` }}
        />
        <span className="truncate font-mono text-body-s" title={label}>
          {label || 'live'}
        </span>
      </span>
    </td>
  );
}

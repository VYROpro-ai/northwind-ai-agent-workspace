import { cn } from '@/lib/cn';
import { elevations } from '../data';
import { describeToken, lightScopeStyle, useTokenSheet, type ThemeName, type TokenSheet } from '../tokens';
import { DsSectionBlock, SectionHeader } from './Specimen';

/** Foundations 04 — the four elevation levels plus the inverse pill shadow, in both modes. */
export function ElevationSection() {
  const sheet = useTokenSheet();
  return (
    <DsSectionBlock id="elevation">
      <SectionHeader
        id="elevation"
        eyebrow="Foundations · 04"
        title="Elevation"
        description="In Light, elevation is shadow. In Dark, shadows barely read, so each level also steps up to a lighter surface and keeps its border. Both panels below render live from the tokens."
        meta="shadow-raised · overlay · modal · inverse"
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ElevationPanel theme="light" sheet={sheet} />
        <ElevationPanel theme="dark" sheet={sheet} />
      </div>
    </DsSectionBlock>
  );
}

function ElevationPanel({ theme, sheet }: { theme: ThemeName; sheet: TokenSheet }) {
  const dark = theme === 'dark';
  return (
    <div
      className={cn('rounded-2xl border border-border bg-canvas p-5 text-fg sm:p-7', dark && 'dark')}
      style={dark ? undefined : lightScopeStyle(sheet)}
    >
      <p className="mb-5 text-caption font-semibold tracking-wide text-fg-2 uppercase">{theme}</p>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {elevations.map((level) => {
          const inverse = level.utility === 'shadow-inverse';
          return (
            <li
              key={level.name}
              className={cn(
                'flex min-h-36 flex-col justify-between gap-6 rounded-xl p-5',
                level.className,
                inverse && 'sm:col-span-2 sm:min-h-0',
              )}
            >
              <div>
                <p className={cn('text-h4 font-semibold', !inverse && 'text-fg')}>{level.name}</p>
                <p
                  className={cn(
                    'mt-1 font-mono text-body-s break-words',
                    inverse ? 'opacity-70' : 'text-fg-3',
                  )}
                >
                  {level.utility}
                  {level.token && ` · ${describeToken(sheet, level.token, theme) || 'live'}`}
                </p>
              </div>
              <p className={cn('text-body-s', inverse ? 'opacity-80' : 'text-fg-2')}>{level.use}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

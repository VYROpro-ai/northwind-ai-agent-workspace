import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { sectionGroups, allSections } from '../data';

/** Sticky left-hand table of contents (lg and up). */
export function SectionSidebar({ active }: { active: string }) {
  return (
    <nav aria-label="Design system sections" className="sticky top-24 flex flex-col gap-6">
      {sectionGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 font-mono text-caption text-fg-3 uppercase">{group.title}</p>
          <ul className="flex flex-col gap-0.5">
            {group.sections.map((s) => {
              const on = s.id === active;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={on ? 'location' : undefined}
                    className={cn(
                      'flex h-8 items-center gap-2.5 rounded-full px-3 text-13 font-medium transition-colors',
                      on
                        ? 'bg-inverse text-on-inverse shadow-inverse'
                        : 'text-fg-2 hover:bg-subtle hover:text-fg',
                    )}
                  >
                    <Icon name={s.icon} size={14} strokeWidth={2} />
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Horizontal scroller shown under the header below lg. Keeps the active chip in view. */
export function SectionBar({ active }: { active: string }) {
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = track.current;
    const chip = el?.querySelector<HTMLElement>('[aria-current]');
    if (!el || !chip) return;
    el.scrollTo({ left: chip.offsetLeft - el.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <nav aria-label="Design system sections">
      <ul ref={track} className="relative scrollbar-none flex gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {allSections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={on ? 'location' : undefined}
                className={cn(
                  'inline-flex h-8 items-center rounded-full px-3 text-13 font-medium whitespace-nowrap transition-colors',
                  on ? 'bg-inverse text-on-inverse' : 'text-fg-2 hover:bg-subtle hover:text-fg',
                )}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

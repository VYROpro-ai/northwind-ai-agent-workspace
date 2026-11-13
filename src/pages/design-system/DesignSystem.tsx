import { Link } from 'react-router';
import { useDocumentTitle } from '@/lib/hooks';
import { Icon } from '@/components/icons';
import { NorthwindLogo } from '@/components/brand/Logo';
import { ThemeSwitch } from '@/components/app/ThemeSwitch';
import { allSections } from './data';
import { useActiveSection } from './useActiveSection';
import { SectionBar, SectionSidebar } from './components/SectionNav';
import { ColorSection } from './components/ColorSection';
import { TypographySection } from './components/TypographySection';
import { SpacingSection } from './components/SpacingSection';
import { ElevationSection } from './components/ElevationSection';
import { IconsSection } from './components/IconsSection';
import { ActionsGallery } from './components/gallery/ActionsGallery';
import { BadgesGallery } from './components/gallery/BadgesGallery';
import { InputsGallery } from './components/gallery/InputsGallery';
import { ControlsGallery } from './components/gallery/ControlsGallery';
import { NavigationGallery } from './components/gallery/NavigationGallery';
import { OverlaysGallery } from './components/gallery/OverlaysGallery';
import { FeedbackGallery } from './components/gallery/FeedbackGallery';
import { DataGallery } from './components/gallery/DataGallery';
import { AiGallery } from './components/gallery/AiGallery';
import { ChartsGallery } from './components/gallery/ChartsGallery';

const sectionIds = allSections.map((s) => s.id);

const facts = [
  { label: 'Version', value: '1.0' },
  { label: 'Updated', value: 'Oct 25, 2026' },
  { label: 'Modes', value: 'Light · Dark' },
];

/** DS · Living design system — foundations from the kit plus a live component gallery. */
export default function DesignSystem() {
  useDocumentTitle('Design system');
  const active = useActiveSection(sectionIds);

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <NorthwindLogo />
          <span className="hidden rounded-full border border-border px-2.5 py-0.5 font-mono text-caption text-fg-2 md:inline">
            AI Agent Workspace UI Kit
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/screens"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-13 font-medium text-fg hover:bg-subtle sm:px-4"
            >
              <Icon name="grid" size={15} />
              <span className="hidden sm:inline">All screens</span>
              <span className="sm:hidden">Screens</span>
            </Link>
            <ThemeSwitch />
          </div>
        </div>
        <div className="border-t border-border lg:hidden">
          <SectionBar active={active} />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 pt-8 pb-24 sm:px-6 lg:grid-cols-[208px_minmax(0,1fr)] lg:px-8 lg:pt-12 xl:gap-14">
        <aside className="hidden lg:block">
          <SectionSidebar active={active} />
        </aside>

        <main className="flex min-w-0 flex-col gap-20">
          <div className="flex flex-col gap-6 border-b border-border pb-10 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-body-s text-fg-3">Northwind · Design system</p>
              <h1 className="mt-2 text-h1 font-semibold text-fg sm:text-display">Foundations & components</h1>
              <p className="mt-3 text-body-l text-fg-2">
                The tokens every screen is built from, and every shared component in its main states. Semantic
                tokens switch Light and Dark by mode only; one violet family marks everything an agent writes.
                Toggle the theme in the header to check both.
              </p>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="font-mono text-body-s text-fg-3">{f.label}</dt>
                  <dd className="mt-0.5 text-body-m font-medium text-fg">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ColorSection />
          <TypographySection />
          <SpacingSection />
          <ElevationSection />
          <IconsSection />
          <ActionsGallery />
          <BadgesGallery />
          <InputsGallery />
          <ControlsGallery />
          <NavigationGallery />
          <OverlaysGallery />
          <FeedbackGallery />
          <DataGallery />
          <AiGallery />
          <ChartsGallery />
        </main>
      </div>
    </div>
  );
}

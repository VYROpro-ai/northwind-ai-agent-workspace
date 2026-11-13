import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useDocumentTitle } from '@/lib/hooks';
import { Icon } from '@/components/icons';
import { Input } from '@/components/ui/Field';
import { NorthwindLogo } from '@/components/brand/Logo';
import { ThemeSwitch } from '@/components/app/ThemeSwitch';
import { epicTitles, screens } from '@/routes/screens';

/** Index of every screen in the template — handy for reviewing and for buyers. */
export default function ScreensIndex() {
  useDocumentTitle('All screens');
  const [query, setQuery] = useState('');
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = screens.filter((s) => !q || `${s.id} ${s.title} ${s.path}`.toLowerCase().includes(q));
    return Object.keys(epicTitles)
      .map((epic) => ({ epic, items: list.filter((s) => s.epic === epic) }))
      .filter((g) => g.items.length);
  }, [query]);

  return (
    <div className="min-h-dvh bg-wash-page">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <NorthwindLogo />
          <span className="hidden text-body-m text-fg-3 sm:inline">
            AI Agent Workspace · {screens.length} screens
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/design-system"
              className="hidden h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-13 font-medium text-fg hover:bg-subtle sm:inline-flex"
            >
              <Icon name="layers" size={15} />
              Design system
            </Link>
            <ThemeSwitch />
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-h1 font-semibold text-fg">All screens</h1>
            <p className="mt-1 text-body-m text-fg-2">
              Every frame from the kit, wired to a route. Toggle the theme to preview dark mode.
            </p>
          </div>
          <Input
            leftIcon="search"
            pill
            placeholder="Filter by name, ID or path"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            containerClassName="w-full sm:w-80"
            aria-label="Filter screens"
          />
        </div>
        {groups.map((g) => (
          <section key={g.epic} aria-labelledby={`epic-${g.epic}`}>
            <h2 id={`epic-${g.epic}`} className="mb-3 text-h4 font-semibold text-fg">
              {epicTitles[g.epic]} <span className="font-normal text-fg-3">{g.items.length}</span>
            </h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((s) => (
                <li key={s.id}>
                  <Link
                    to={s.path}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:shadow-raised"
                  >
                    <span className="w-14 shrink-0 font-mono text-body-s text-fg-3">{s.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-m font-medium text-fg">{s.title}</span>
                      <span className="block truncate font-mono text-caption text-fg-3">{s.path}</span>
                    </span>
                    <Icon
                      name="arrow-right"
                      size={16}
                      className="text-fg-3 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

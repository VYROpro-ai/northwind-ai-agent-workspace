import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { NorthwindLogo } from '@/components/brand/Logo';
import { useToast } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/lib/hooks';
import { SetupSteps } from './components/SetupSteps';
import { TemplateCard } from './components/TemplateCard';
import { TemplatePreview } from './components/TemplatePreview';
import { templateFilters, templates, type StarterTemplate, type TemplateFilter } from './data';

function sectionsFor(filter: TemplateFilter): { title: string; items: StarterTemplate[] }[] {
  if (filter === 'All') return [{ title: 'All templates', items: templates }];
  const recommended = templates.filter((t) => t.categories.includes(filter));
  const more = templates.filter((t) => !t.categories.includes(filter));
  return [
    { title: `Recommended for ${filter}`, items: recommended },
    { title: 'More templates', items: more },
  ].filter((s) => s.items.length);
}

/** W1-08 · Choose a starting template */
export default function ChooseTemplate() {
  useDocumentTitle('Choose a starting template');
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState<TemplateFilter>('Support');
  const [selectedId, setSelectedId] = useState<string | null>('support-agent');
  const selected = templates.find((t) => t.id === selectedId);

  const applyTemplate = (template: StarterTemplate) => {
    toast({
      title:
        template.id === 'blank-agent' ? 'Blank agent created' : `${template.name} added to Northwind Labs`,
      description: 'Your workspace is ready.',
      tone: 'ok',
    });
    navigate('/welcome');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas xl:h-dvh xl:overflow-hidden">
      <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-b border-border bg-surface px-4 py-3 sm:px-8">
        <NorthwindLogo />
        <SetupSteps
          current={3}
          className="order-last w-full justify-center sm:order-none sm:mx-auto sm:w-auto"
        />
        <Link
          to="/welcome"
          className="ml-auto text-body-m font-medium text-fg-2 transition-colors hover:text-fg sm:ml-0"
        >
          Skip, start blank
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <main className="flex min-w-0 flex-1 flex-col gap-[18px] px-4 py-7 sm:px-10 xl:overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[24px] leading-8 font-semibold tracking-[-0.02em] text-fg sm:text-[28px] sm:leading-9">
              Start with a ready-made agent
            </h1>
            <p className="text-body-m text-fg-2">
              See it work in minutes, then make it yours. You can build from scratch any time.
            </p>
          </div>

          <div role="tablist" aria-label="Use case" className="flex flex-wrap gap-2">
            {templateFilters.map((label) => {
              const on = label === filter;
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilter(label)}
                  className={cn(
                    'h-8 rounded-full border px-3.5 text-13 font-medium transition-colors',
                    on
                      ? 'border-inverse bg-inverse text-on-inverse'
                      : 'border-border bg-surface text-fg-2 hover:bg-subtle hover:text-fg',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" aria-label={`${filter} templates`} className="flex flex-col gap-[18px]">
            {sectionsFor(filter).map((section) => (
              <section key={section.title} className="flex flex-col gap-3">
                <h2 className="text-body-s font-semibold tracking-[0.02em] text-fg-3 uppercase">
                  {section.title}
                </h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-4">
                  {section.items.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      selected={template.id === selectedId}
                      onSelect={() => setSelectedId(template.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>

        {selected && (
          <div className="w-full xl:w-[400px] xl:max-w-[440px] xl:shrink-0">
            <TemplatePreview
              key={selected.id}
              template={selected}
              onClose={() => setSelectedId(null)}
              onUse={() => applyTemplate(selected)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

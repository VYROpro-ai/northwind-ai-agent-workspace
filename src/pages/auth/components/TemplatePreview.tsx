import { CitationChip } from '@/components/ai/AiParts';
import { Icon } from '@/components/icons';
import { Button, IconButton, useToast } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { StarterTemplate } from '../data';
import { toneSoft } from './templateTones';

/** Right-hand preview of the selected starter template with the "Use template" action. */
export function TemplatePreview({
  template,
  onClose,
  onUse,
}: {
  template: StarterTemplate;
  onClose: () => void;
  onUse: () => void;
}) {
  const toast = useToast();
  const meta = [
    template.id === 'blank-agent' ? null : `Used by ${template.usedBy}`,
    `${template.setup} setup`,
    template.rating ? `★ ${template.rating}` : null,
  ].filter(Boolean);

  return (
    <aside
      aria-label="Template preview"
      className="flex flex-col border-t border-border bg-surface shadow-modal xl:sticky xl:top-0 xl:h-full xl:border-t-0 xl:border-l"
    >
      <div className="flex items-start gap-3.5 border-b border-border px-5 pt-5 pb-[18px]">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-surface shadow-[0_6px_16px_-6px_rgb(13_16_24/0.28),0_0_0_1px_var(--border)]">
          <span
            className={cn(
              'flex size-[42px] items-center justify-center rounded-[18px]',
              toneSoft[template.tone],
            )}
          >
            <Icon name={template.icon} size={22} strokeWidth={1.9} />
          </span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
          <h2 className="text-[18px] leading-6 font-semibold text-fg">{template.name}</h2>
          <p className="text-body-s text-fg-2">{meta.join(' · ')}</p>
        </div>
        <IconButton icon="close" label="Close preview" variant="ghost" size="sm" onClick={onClose} />
      </div>

      <div className="flex flex-1 scrollbar-thin flex-col gap-5 overflow-y-auto p-5">
        <section className="flex flex-col gap-2">
          <h3 className="text-13 font-semibold text-fg">What it does</h3>
          <ul className="flex list-disc flex-col gap-1 pl-[18px] text-13 leading-5 text-fg-2">
            {template.does.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-13 font-semibold text-fg">Sample chat</h3>
          <div className="flex flex-col gap-2 rounded-[10px] border border-border bg-sunken p-3 text-13">
            <p className="max-w-[80%] self-end rounded-[12px_12px_4px_12px] bg-subtle px-3 py-2 text-fg">
              {template.sample.ask}
            </p>
            <p className="max-w-[88%] self-start rounded-[12px_12px_12px_4px] border border-border bg-surface px-3 py-2 text-fg">
              {template.sample.answer}
              <CitationChip n={1} />
            </p>
          </div>
        </section>

        {template.needs.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-13 font-semibold text-fg">Needs</h3>
            {template.needs.map((need) => (
              <div
                key={need.name}
                className={cn(
                  'flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5',
                  need.missing ? 'border-warn-border bg-warn-subtle' : 'border-border',
                )}
              >
                <Icon name={need.icon} size={16} className={need.missing ? 'text-warn-text' : 'text-icon'} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-13 font-medium text-fg">{need.name}</span>
                  <span className={cn('text-body-s', need.missing ? 'text-warn-text' : 'text-fg-3')}>
                    {need.note}
                  </span>
                </div>
                {need.missing && (
                  <button
                    type="button"
                    className="text-body-s font-medium text-link underline underline-offset-2"
                    onClick={() =>
                      toast({
                        title: `${need.name} saved for later`,
                        description: 'Connect it from Integrations.',
                      })
                    }
                  >
                    Connect later
                  </button>
                )}
              </div>
            ))}
          </section>
        )}
      </div>

      <div className="flex gap-2 border-t border-border px-5 py-4">
        <Button size="lg" fullWidth className="text-[15px]" onClick={onUse}>
          {template.id === 'blank-agent' ? 'Start blank' : 'Use template'}
        </Button>
      </div>
    </aside>
  );
}

import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { StarterTemplate } from '../data';
import { toneTile } from './templateTones';

/** Selectable starter-template card on the onboarding template picker. */
export function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: StarterTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex min-h-[196px] flex-col gap-3.5 rounded-2xl bg-surface p-5 text-left text-fg transition-[border-color,box-shadow]',
        selected
          ? 'border-[1.5px] border-brand shadow-[0_0_0_4px_var(--brand-subtle)]'
          : 'border border-border shadow-[0_1px_2px_rgb(13_16_24/0.04)] hover:border-border-strong',
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-[14px] text-white',
            toneTile[template.tone],
          )}
        >
          <Icon name={template.icon} size={20} strokeWidth={2} />
        </span>
        {selected && (
          <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white">
            <Icon name="check" size={12} strokeWidth={3} label="Selected" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[16px] leading-[22px] font-semibold tracking-[-0.01em]">{template.name}</span>
        <span className="text-13 leading-5 text-fg-2">{template.desc}</span>
      </div>
      <div className="mt-auto flex items-center gap-2 text-body-s text-fg-3">
        <span>{template.setup} setup</span>
        {template.popular && (
          <>
            <span aria-hidden>·</span>
            <span className="font-semibold text-warn-text">Popular</span>
          </>
        )}
      </div>
    </button>
  );
}

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';

interface ToggleBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
}

/** On/off switch. Uses a real checkbox with role="switch" for accessibility. */
export function Switch({ label, description, className, disabled, ...props }: ToggleBaseProps) {
  const id = useId();
  const control = (
    <span className="relative inline-flex shrink-0">
      <input id={id} type="checkbox" role="switch" disabled={disabled} className="peer sr-only" {...props} />
      <span
        aria-hidden
        className={cn(
          'h-5 w-9 rounded-full bg-border-strong transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
          'peer-disabled:opacity-50',
        )}
      />
      <span
        aria-hidden
        className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-raised transition-transform peer-checked:translate-x-4"
      />
    </span>
  );
  if (!label) return <label className={cn('inline-flex', className)}>{control}</label>;
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start justify-between gap-4', className)}>
      <span className="min-w-0">
        <span className="block text-body-m font-medium text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-body-s text-fg-3">{description}</span>}
      </span>
      {control}
    </label>
  );
}

export function Checkbox({
  label,
  description,
  indeterminate,
  className,
  ...props
}: ToggleBaseProps & { indeterminate?: boolean }) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-start gap-2.5',
        props.disabled && 'cursor-not-allowed',
        className,
      )}
    >
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          // The native `indeterminate` property is what assistive tech announces as "mixed".
          ref={(el) => {
            if (el) el.indeterminate = Boolean(indeterminate);
          }}
          className="peer size-4 cursor-[inherit] appearance-none rounded-xs border border-border-strong bg-surface transition-colors checked:border-brand checked:bg-brand indeterminate:border-brand indeterminate:bg-brand disabled:bg-sunken"
          {...props}
        />
        <Icon
          name={indeterminate ? 'minus' : 'check'}
          size={12}
          strokeWidth={3}
          className="pointer-events-none absolute top-0.5 left-0.5 text-white opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100"
        />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && (
            <span className={cn('block text-body-m text-fg', props.disabled && 'text-fg-disabled')}>
              {label}
            </span>
          )}
          {description && <span className="block text-body-s text-fg-3">{description}</span>}
        </span>
      )}
    </label>
  );
}

export function Radio({ label, description, className, ...props }: ToggleBaseProps) {
  return (
    <label className={cn('inline-flex cursor-pointer items-start gap-2.5', className)}>
      <input
        type="radio"
        className="mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-border-strong bg-surface transition-[border] checked:border-[5px] checked:border-brand"
        {...props}
      />
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-body-m text-fg">{label}</span>}
          {description && <span className="block text-body-s text-fg-3">{description}</span>}
        </span>
      )}
    </label>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

/** Toggle group — time ranges, view switches. Pill track with a raised selected segment. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'track',
  className,
  label,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  /** track = grey track with white thumb; inverse = black selected pill (dashboard style). */
  variant?: 'track' | 'inverse';
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full p-[3px]',
        variant === 'track' ? 'bg-subtle' : 'border border-border bg-surface',
        className,
      )}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors disabled:opacity-50',
              size === 'sm' ? 'h-7 px-2.5 text-body-s' : 'h-8 px-3 text-13',
              on
                ? variant === 'track'
                  ? 'bg-surface text-fg shadow-raised'
                  : 'bg-inverse text-on-inverse'
                : 'text-fg-2 hover:text-fg',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Range slider with the kit's track styling. */
export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0.1,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-surface [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:shadow-raised"
      style={{ background: `linear-gradient(to right, var(--brand) ${pct}%, var(--subtle) ${pct}%)` }}
    />
  );
}

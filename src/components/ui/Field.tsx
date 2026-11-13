import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';

const control =
  'w-full rounded-md border border-border-strong bg-surface text-body-m text-fg placeholder:text-fg-3 transition-[border-color,box-shadow] outline-none ' +
  'focus:border-focus focus:shadow-[0_0_0_3px_var(--focus-ring)] focus-visible:outline-none ' +
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken disabled:text-fg-disabled ' +
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_18%,transparent)]';

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Right side of the label row — e.g. "Forgot password?" or a counter. */
  labelAside?: ReactNode;
  className?: string;
  children: (id: string, describedBy?: string) => ReactNode;
}

/** Label + control + hint/error wrapper. Wires up ids and aria attributes. */
export function Field({ label, hint, error, required, labelAside, className, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const hasMessage = Boolean(error || hint);
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || labelAside) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={id} className="text-body-m font-medium text-fg">
              {label}
              {required && <span className="ml-0.5 text-danger">*</span>}
            </label>
          )}
          {labelAside}
        </div>
      )}
      {children(id, hasMessage ? messageId : undefined)}
      {error ? (
        <p id={messageId} className="flex items-center gap-1.5 text-body-s text-danger-text">
          <Icon name="alert-circle" size={13} strokeWidth={2} />
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-body-s text-fg-3">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: IconName;
  /** Content inside the right edge, e.g. a ⌘K hint or a reveal button. */
  rightSlot?: ReactNode;
  invalid?: boolean;
  /** Pill-shaped input (search fields in the app shell). */
  pill?: boolean;
  containerClassName?: string;
}

const inputSizes = { sm: 'h-8', md: 'h-9', lg: 'h-11' };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', leftIcon, rightSlot, invalid, pill, className, containerClassName, ...props },
  ref,
) {
  if (!leftIcon && !rightSlot) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(control, inputSizes[size], pill ? 'rounded-full px-4' : 'px-3', className)}
        {...props}
      />
    );
  }
  return (
    <div className={cn('relative flex items-center', containerClassName)}>
      {leftIcon && (
        <Icon
          name={leftIcon}
          size={16}
          className="pointer-events-none absolute left-3 text-fg-3"
          strokeWidth={2}
        />
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          control,
          inputSizes[size],
          pill ? 'rounded-full' : '',
          leftIcon ? 'pl-9' : pill ? 'pl-4' : 'pl-3',
          rightSlot ? 'pr-12' : 'pr-3',
          className,
        )}
        {...props}
      />
      {rightSlot && <div className="absolute right-1.5 flex items-center gap-1">{rightSlot}</div>}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(control, 'resize-y px-3 py-2.5 leading-5', className)}
      {...props}
    />
  );
});

export interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: { value: string; label: string }[];
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  pill?: boolean;
}

/** Native select with the kit's styling — accessible and mobile friendly by default. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, size = 'md', invalid, pill, className, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          control,
          inputSizes[size],
          'appearance-none pr-9 pl-3',
          pill && 'rounded-full pl-4',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        size={15}
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-3"
      />
    </div>
  );
});

/** Keyboard key hint, e.g. <Kbd>⌘K</Kbd>. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 items-center rounded-full border border-border bg-surface px-2 font-sans text-caption font-medium text-fg-2',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

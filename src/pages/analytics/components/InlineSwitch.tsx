import { useId, type ReactNode } from 'react';
import { Switch } from '@/components/ui';
import { cn } from '@/lib/cn';

/** Switch with its label on the right ("◉ Compare to previous period"), as the analytics toolbars show it. */
export function InlineSwitch({
  checked,
  onChange,
  children,
  disabled,
  className,
  labelClassName,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}) {
  const id = useId();
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Switch
        checked={checked}
        disabled={disabled}
        aria-labelledby={id}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        id={id}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'cursor-pointer text-13 text-fg-2 select-none',
          disabled && 'cursor-not-allowed opacity-60',
          labelClassName,
        )}
      >
        {children}
      </span>
    </div>
  );
}

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required accessible name — icon-only buttons must be labelled. */
  label: string;
  variant?: 'outline' | 'ghost' | 'solid' | 'inverse';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  /** Shows a small accent dot (e.g. unread notifications). */
  dot?: boolean;
}

const variants = {
  outline: 'border border-border bg-surface text-fg hover:bg-subtle',
  ghost: 'text-icon hover:bg-subtle hover:text-fg',
  solid: 'bg-subtle text-fg hover:bg-border',
  inverse: 'bg-inverse text-on-inverse hover:opacity-90',
};
const sizes = { xs: 'size-7', sm: 'size-8', md: 'size-9', lg: 'size-11' };
const iconSizes = { xs: 14, sm: 15, md: 17, lg: 19 };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    label,
    variant = 'outline',
    size = 'md',
    shape = 'circle',
    dot,
    className,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center transition-colors duration-150 disabled:opacity-50',
        shape === 'circle' ? 'rounded-full' : 'rounded-md',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={iconSizes[size]} strokeWidth={2} />
      {dot && (
        <span className="absolute top-2 right-2 size-[7px] rounded-full bg-accent ring-2 ring-surface" />
      )}
    </button>
  );
});

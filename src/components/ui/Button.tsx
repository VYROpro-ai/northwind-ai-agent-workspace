import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai' | 'inverse' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pill (fully rounded) — used for most app-shell actions. Defaults to true. */
  pill?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-hover active:bg-brand-press shadow-[0_6px_14px_-6px_rgb(38_73_214/0.6)]',
  secondary:
    'bg-surface text-fg border border-border-strong hover:bg-subtle active:shadow-[inset_0_1px_2px_rgb(13_16_24/0.2)]',
  ghost: 'bg-transparent text-fg-2 hover:bg-subtle hover:text-fg',
  danger: 'bg-danger text-white hover:bg-danger-hover active:bg-danger-press',
  ai: 'bg-ai text-white hover:bg-ai-hover active:bg-ai-press',
  inverse: 'bg-inverse text-on-inverse hover:opacity-90 shadow-inverse',
  link: 'bg-transparent text-link hover:underline underline-offset-2 px-0 h-auto',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 gap-1 px-2.5 text-body-s font-medium',
  sm: 'h-8 gap-1.5 px-3 text-13 font-medium',
  md: 'h-9 gap-2 px-4 text-body-m font-medium',
  lg: 'h-11 gap-2 px-5 text-body-l font-medium',
};

const iconSizes: Record<ButtonSize, number> = { xs: 13, sm: 14, md: 16, lg: 18 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    pill = true,
    leftIcon,
    rightIcon,
    loading = false,
    fullWidth,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  const iconSize = iconSizes[size];
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors duration-150 select-none',
        'disabled:pointer-events-none disabled:border-transparent disabled:bg-subtle disabled:text-fg-disabled disabled:shadow-none',
        pill ? 'rounded-full' : 'rounded-md',
        variants[variant],
        variant !== 'link' && sizes[size],
        variant === 'link' && 'gap-1 text-body-m font-medium',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={iconSize} />
      ) : (
        leftIcon && <Icon name={leftIcon} size={iconSize} strokeWidth={2} />
      )}
      {children}
      {rightIcon && !loading && <Icon name={rightIcon} size={iconSize - 2} strokeWidth={2} />}
    </button>
  );
});

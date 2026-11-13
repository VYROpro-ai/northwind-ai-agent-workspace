import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-border-strong bg-surface text-fg hover:bg-subtle',
  ghost: 'text-fg-2 hover:bg-subtle hover:text-fg',
  ai: 'bg-ai text-white hover:bg-ai-hover',
};

const sizes = { sm: 'h-[30px] px-3', md: 'h-[34px] px-3.5', lg: 'h-10 px-3.5' };

/** Router link styled like the kit's pill buttons — for actions that navigate. */
export function ButtonLink({
  to,
  children,
  variant = 'secondary',
  size = 'sm',
  icon,
  className,
}: {
  to: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: IconName;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full text-13 font-medium whitespace-nowrap transition-colors',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {icon && <Icon name={icon} size={14} strokeWidth={2} />}
      {children}
    </Link>
  );
}

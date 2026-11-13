import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Page title + supporting line at the top of an auth form. */
export function AuthHeading({
  title,
  children,
  size = 'lg',
}: {
  title: ReactNode;
  children?: ReactNode;
  /** lg = 32/40 (auth), md = 28/36 (onboarding). */
  size?: 'lg' | 'md';
}) {
  return (
    <div className={cn('flex flex-col', size === 'lg' ? 'gap-2' : 'gap-1.5')}>
      <h1
        className={cn(
          'font-semibold tracking-[-0.02em] text-fg',
          size === 'lg'
            ? 'text-[28px] leading-9 sm:text-h1'
            : 'text-[24px] leading-8 sm:text-[28px] sm:leading-9',
        )}
      >
        {title}
      </h1>
      {children && <p className="text-body-m text-fg-2">{children}</p>}
    </div>
  );
}

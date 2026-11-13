import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';

/** Northwind product mark: shield-check on a brand tile. */
export function NorthwindMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md bg-brand text-white',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name="logo" size={Math.round(size * 0.56)} strokeWidth={2} />
    </span>
  );
}

export function NorthwindLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <NorthwindMark />
      <span className="text-[18px] leading-6 font-semibold tracking-[-0.01em] text-fg">Northwind</span>
    </span>
  );
}

/**
 * Workspace logo (fictional "Northwind Labs"). Rendered as a CSS mask so it
 * follows the current text colour in light and dark mode.
 */
export function WorkspaceLogo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Northwind Labs"
      className={cn('inline-block h-6 w-[152px] bg-fg', className)}
      style={{
        maskImage: `url(${import.meta.env.BASE_URL}images/brand/northwind-logo.svg)`,
        WebkitMaskImage: `url(${import.meta.env.BASE_URL}images/brand/northwind-logo.svg)`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskPosition: 'left center',
      }}
    />
  );
}

/** Round "N" workspace monogram used in the compact chat rail. */
export function WorkspaceMonogram({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-inverse text-on-inverse"
      style={{ width: size, height: size }}
      aria-label="Northwind Labs"
      role="img"
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M3 17V3h3.2l7 9V3H17v14h-3.1l-7.1-9.1V17z" />
      </svg>
    </span>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { AppId } from '../data';

/**
 * Fictional app marks from the kit. Brand colours are fixed (they don't flip in dark mode),
 * so they use the palette primitives rather than semantic tokens.
 */
const logos: Record<AppId, { tile: string; mark: ReactNode }> = {
  helpbase: {
    tile: 'bg-[linear-gradient(140deg,var(--green-500),var(--green-700))]',
    mark: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="4" />
        <path
          d="M6.3 6.3l2.6 2.6M17.7 6.3l-2.6 2.6M6.3 17.7l2.6-2.6M17.7 17.7l-2.6-2.6"
          stroke="var(--green-700)"
          strokeWidth="2.2"
        />
      </>
    ),
  },
  shopdesk: {
    tile: 'bg-[linear-gradient(140deg,var(--cobalt-500),var(--cobalt-700))]',
    mark: (
      <>
        <path d="M5 8.5h14l-1.2 11a1.6 1.6 0 0 1-1.6 1.5H7.8a1.6 1.6 0 0 1-1.6-1.5z" fill="currentColor" />
        <path
          d="M9 9V7a3 3 0 0 1 6 0v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 13.5a3 3 0 0 0 6 0"
          fill="none"
          stroke="var(--cobalt-700)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ),
  },
  'pipeline-crm': {
    tile: 'bg-[linear-gradient(140deg,var(--amber-400),var(--amber-600))]',
    mark: (
      <>
        <rect x="3.5" y="5" width="17" height="3.6" rx="1.8" fill="currentColor" />
        <rect x="6.5" y="10.2" width="11" height="3.6" rx="1.8" fill="currentColor" fillOpacity="0.8" />
        <rect x="9.5" y="15.4" width="5" height="3.6" rx="1.8" fill="currentColor" fillOpacity="0.6" />
      </>
    ),
  },
  mailroom: {
    tile: 'bg-[linear-gradient(140deg,var(--violet-500),var(--violet-700))]',
    mark: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="3" fill="currentColor" />
        <path
          d="M4.5 8l7.5 5.5L19.5 8"
          fill="none"
          stroke="var(--violet-700)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  chatline: {
    tile: 'bg-[linear-gradient(140deg,var(--sky-400),var(--sky-600))]',
    mark: (
      <>
        <path
          d="M4 6.5A3.5 3.5 0 0 1 7.5 3h6A3.5 3.5 0 0 1 17 6.5v3A3.5 3.5 0 0 1 13.5 13H9l-3.5 3v-3.3A3.5 3.5 0 0 1 4 9.5z"
          fill="currentColor"
        />
        <path
          d="M19 9.2a3 3 0 0 1 1.5 2.6v2.7a3 3 0 0 1-1.3 2.5V20l-3-2.5h-3.4a3 3 0 0 1-2.4-1.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.75"
        />
      </>
    ),
  },
  'docs-drive': {
    tile: 'bg-[linear-gradient(140deg,var(--slate-500),var(--slate-700))]',
    mark: (
      <>
        <path
          d="M3 7a2 2 0 0 1 2-2h4.2l2 2.2H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          fill="currentColor"
          fillOpacity="0.55"
        />
        <path
          d="M3 10.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          fill="currentColor"
        />
      </>
    ),
  },
  ledgerly: {
    tile: 'bg-[linear-gradient(140deg,var(--slate-800),var(--slate-950))]',
    mark: (
      <>
        <rect x="5" y="4" width="4" height="16" rx="2" fill="currentColor" />
        <rect x="11" y="10" width="4" height="10" rx="2" fill="currentColor" fillOpacity="0.75" />
        <rect x="17" y="14" width="3" height="6" rx="1.5" fill="var(--orange-500)" />
      </>
    ),
  },
  daybook: {
    tile: 'bg-[linear-gradient(140deg,var(--red-500),var(--red-700))]',
    mark: (
      <>
        <rect x="4" y="5.5" width="16" height="15" rx="3" fill="currentColor" />
        <rect x="4" y="5.5" width="16" height="4.5" rx="2" fill="currentColor" fillOpacity="0.6" />
        <path d="M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="15" r="2.3" fill="var(--red-700)" />
      </>
    ),
  },
  'warehouse-db': {
    tile: 'bg-[linear-gradient(140deg,var(--green-600),var(--green-800))]',
    mark: (
      <>
        <ellipse cx="12" cy="6" rx="7.5" ry="2.8" fill="currentColor" />
        <path
          d="M4.5 9.5c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v3.3c0 1.6-3.4 2.8-7.5 2.8s-7.5-1.2-7.5-2.8z"
          fill="currentColor"
          fillOpacity="0.8"
        />
        <path
          d="M4.5 16c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v1.5c0 1.6-3.4 2.8-7.5 2.8s-7.5-1.2-7.5-2.8z"
          fill="currentColor"
          fillOpacity="0.6"
        />
      </>
    ),
  },
};

/** Rounded gradient tile with the app's mark. Sizes: 40 (cards), 48 (consent), 52 (detail). */
export function AppLogo({
  app,
  size = 40,
  radius = Math.round(size * 0.25),
  className,
}: {
  app: AppId;
  size?: number;
  radius?: number;
  className?: string;
}) {
  const logo = logos[app];
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]',
        logo.tile,
        className,
      )}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg width={Math.round(size * 0.63)} height={Math.round(size * 0.63)} viewBox="0 0 24 24">
        {logo.mark}
      </svg>
    </span>
  );
}

import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { trustedBy, visualCopy, type AuthScreen } from '../data';

/** Soft cobalt blobs behind the brand pane. Primitives with explicit dark variants. */
const blobs = [
  'left-[-18%] top-[-12%] h-3/5 w-4/5 blur-[70px] opacity-90 bg-[var(--cobalt-400)] dark:bg-[var(--cobalt-700)]',
  'right-[-25%] top-[22%] h-[55%] w-[85%] blur-[80px] opacity-85 bg-[var(--cobalt-700)] dark:bg-[var(--slate-950)]',
  'left-[5%] bottom-[-20%] h-1/2 w-[90%] blur-[90px] opacity-80 bg-[var(--cobalt-500)] dark:bg-[var(--cobalt-600)]',
];

/** Brand pane shown on the left of auth & onboarding screens (Part · Auth visual). */
export function AuthVisual({ screen, className }: { screen: AuthScreen; className?: string }) {
  const copy = visualCopy[screen];
  return (
    <div
      className={cn(
        'relative isolate flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl px-11 pt-12 pb-10 text-white',
        'bg-[var(--cobalt-600)] dark:bg-[var(--cobalt-950)]',
        className,
      )}
    >
      {blobs.map((blob) => (
        <span key={blob} aria-hidden className={cn('absolute -z-10 rounded-full', blob)} />
      ))}
      <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-white/6 to-white/0 to-40%" />

      <div className="flex max-w-[440px] flex-col gap-3.5">
        <p className="text-body-m font-medium text-white/78">{copy.eyebrow}</p>
        <p className="text-[40px] leading-[46px] font-semibold tracking-[-0.03em]">{copy.title}</p>
        <p className="text-body-l text-white/78">{copy.sub}</p>
      </div>

      <div className="flex flex-1 items-center justify-center py-10" aria-hidden>
        <div className="flex w-[372px] max-w-full flex-col gap-2.5 rounded-[18px] border border-white/22 bg-white/12 p-4 shadow-[0_24px_60px_-20px_rgb(4_10_40/0.5)] backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[9px] bg-white/20">
              <Icon name="bot" size={16} strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-body-m font-semibold">Refund $240 to Acme Co.</span>
              <span className="text-body-s text-white/72">Support Agent · waiting for approval</span>
            </div>
          </div>
          <div className="flex gap-2 text-13">
            <span className="h-8 flex-1 rounded-md bg-white/16 text-center leading-8 font-medium">
              Reject
            </span>
            <span className="h-8 flex-1 rounded-md bg-white text-center leading-8 font-semibold text-[var(--cobalt-700)]">
              Approve
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-[18px]">
        <p className="text-13 text-white/72">Trusted by teams at</p>
        <div className="w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_14%,black_86%,transparent)]">
          <ul className="-ml-[60px] flex w-max justify-center gap-9">
            {trustedBy.map((brand) => (
              <li
                key={brand.name}
                className="inline-flex flex-none items-center gap-2 text-[17px] font-semibold tracking-[-0.02em] text-white/82"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d={brand.d} />
                </svg>
                {brand.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

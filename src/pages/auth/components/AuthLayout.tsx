import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { NorthwindLogo } from '@/components/brand/Logo';
import { useToast } from '@/components/ui';
import { useDocumentTitle } from '@/lib/hooks';
import type { AuthScreen } from '../data';
import { AuthVisual } from './AuthVisual';

export interface AuthLayoutProps {
  /** Which copy the brand pane shows. */
  screen: AuthScreen;
  /** Document title. */
  title: string;
  /** Right side of the top bar — e.g. the onboarding step indicator. */
  headerAside?: ReactNode;
  /** Legal footer — the onboarding steps leave it out. */
  footer?: boolean;
  children: ReactNode;
}

/**
 * Split auth card: brand pane on the left (44%), form column on the right with
 * logo, centred content and a legal footer. The brand pane hides below `lg`
 * so the form comes first on phones.
 */
export function AuthLayout({ screen, title, headerAside, footer = true, children }: AuthLayoutProps) {
  useDocumentTitle(title);
  return (
    <div className="flex min-h-dvh bg-page p-2 sm:p-6">
      <div className="flex min-w-0 flex-1 gap-3 rounded-3xl border border-border bg-surface p-3 shadow-[0_12px_40px_-16px_rgb(13_16_24/0.18)]">
        <aside aria-label="About Northwind" className="hidden min-w-0 shrink-0 basis-[44%] lg:block">
          <AuthVisual screen={screen} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col px-2 pt-2 pb-2 sm:px-10 sm:pt-5 sm:pb-4">
          <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <NorthwindLogo />
            {headerAside}
          </header>
          <main className="flex flex-1 items-center justify-center py-8">{children}</main>
          {footer && <AuthFooter />}
        </div>
      </div>
    </div>
  );
}

function AuthFooter() {
  const toast = useToast();
  const legal = (label: string) => () =>
    toast({
      title: `${label} opens on northwind.app`,
      description: 'Legal pages live on the marketing site.',
    });
  const link = 'text-fg-3 transition-colors hover:text-fg';
  return (
    <footer className="flex flex-wrap justify-between gap-x-4 gap-y-2 text-body-s text-fg-3">
      <span>© 2026 Northwind</span>
      <nav aria-label="Legal" className="flex gap-4">
        <button type="button" className={link} onClick={legal('Privacy policy')}>
          Privacy
        </button>
        <button type="button" className={link} onClick={legal('Terms of service')}>
          Terms
        </button>
        <Link to="/maintenance" className={link}>
          Status
        </Link>
      </nav>
    </footer>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { WorkspaceLogo } from '@/components/brand/Logo';
import { Icon, type IconName } from '@/components/icons';
import { Button, useToast } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/lib/hooks';

/** W12-05 · 404 / not found — also rendered by the router's catch-all route. */
export default function NotFound() {
  useDocumentTitle('Page not found');
  const navigate = useNavigate();
  const toast = useToast();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigate('/screens');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);

  const requestAccess = () => {
    setRequested(true);
    toast({
      title: 'Access requested',
      description: 'The Sales team owners will get a notification.',
      tone: 'ok',
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-fg">
      <header className="flex h-14 shrink-0 items-center border-b border-border bg-surface px-6">
        <Link to="/" aria-label="Northwind Labs home" className="rounded-xs">
          <WorkspaceLogo className="h-[26px] w-[164px]" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-[22px] px-4 py-10 sm:px-6">
        <LostAgentIllustration />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[24px] leading-8 font-semibold tracking-[-0.02em] sm:text-[28px] sm:leading-9">
            This page doesn’t exist or was moved
          </h1>
          <p className="text-[15px] leading-[22px] text-fg-2">
            Check the link, or search for what you were looking for.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Button className="h-10 px-3.5 text-13" onClick={() => navigate('/')}>
            Go home
          </Button>
          <Button
            variant="secondary"
            leftIcon="search"
            className="h-10 px-3.5 text-13"
            onClick={() => navigate('/screens')}
          >
            Search
            <span>⌘K</span>
          </Button>
        </div>

        <div className="mt-6 grid w-[760px] max-w-full grid-cols-1 gap-3.5 md:grid-cols-2">
          <ReasonCard
            icon="trash"
            tone="danger"
            title="This agent was deleted"
            body="Daniel Okafor deleted “Lead Scorer” on Oct 20. Its runs are kept for 30 days."
          >
            <Button
              variant="secondary"
              size="xs"
              className="h-[30px] px-3 text-13"
              onClick={() => navigate('/agents')}
            >
              See other agents
            </Button>
          </ReasonCard>
          <ReasonCard
            icon="lock"
            tone="warn"
            title="You don’t have access to this page"
            body="“Sales playbooks” is shared with the Sales team only."
          >
            <Button
              size="xs"
              className="h-[30px] px-3 text-13"
              leftIcon={requested ? 'check' : undefined}
              disabled={requested}
              onClick={requestAccess}
            >
              {requested ? 'Requested' : 'Request access'}
            </Button>
            <Button variant="ghost" size="xs" className="h-[30px] px-3 text-13" onClick={() => navigate('/')}>
              Go home
            </Button>
          </ReasonCard>
        </div>
      </main>
    </div>
  );
}

function ReasonCard({
  icon,
  tone,
  title,
  body,
  children,
}: {
  icon: IconName;
  tone: 'danger' | 'warn';
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 rounded-[18px] border border-border bg-surface p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex size-[30px] shrink-0 items-center justify-center rounded-md',
            tone === 'danger' ? 'bg-danger-subtle text-danger-text' : 'bg-warn-subtle text-warn-text',
          )}
        >
          <Icon name={icon} size={15} strokeWidth={2} />
        </span>
        <h2 className="text-body-m font-semibold">{title}</h2>
      </div>
      <p className="text-13 leading-[19px] text-fg-2">{body}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </section>
  );
}

/** Empty browser window with a sad agent peeking in. Colours follow the theme tokens. */
function LostAgentIllustration() {
  return (
    <svg width="240" height="170" viewBox="0 0 240 170" aria-hidden className="max-w-full">
      <rect
        x="30"
        y="30"
        width="180"
        height="120"
        rx="14"
        strokeWidth="1.5"
        className="fill-surface stroke-border"
      />
      <rect x="30" y="30" width="180" height="26" rx="14" className="fill-subtle" />
      <rect x="30" y="44" width="180" height="12" className="fill-subtle" />
      {[46, 60, 74].map((cx) => (
        <circle key={cx} cx={cx} cy="43" r="4" className="fill-border-strong" />
      ))}
      <rect x="52" y="74" width="90" height="10" rx="5" className="fill-subtle" />
      <rect x="52" y="94" width="130" height="10" rx="5" className="fill-subtle" />
      <rect x="52" y="114" width="70" height="10" rx="5" className="fill-subtle" />
      <g transform="translate(150 92)">
        <rect width="64" height="58" rx="16" strokeWidth="1.5" className="fill-ai-subtle stroke-ai-border" />
        <path
          d="M22 26v4M42 26v4M24 42c4-4 12-4 16 0"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          className="stroke-ai-text"
        />
        <path d="M32 0v-10" strokeWidth="3" strokeLinecap="round" className="stroke-ai-text" />
        <circle cx="32" cy="-14" r="4" className="fill-ai" />
      </g>
      <text x="66" y="22" fontSize="13" fontWeight="600" className="fill-fg-3 font-mono">
        404
      </text>
    </svg>
  );
}

import { useState } from 'react';
import { Link } from 'react-router';
import { Alert, Banner, Button, Divider, EmptyState, Progress, Skeleton, Spinner } from '@/components/ui';
import { DsSectionBlock, ExampleRow, SectionHeader, Specimen, VariantLabel } from '../Specimen';

const progressTones = ['brand', 'ok', 'warn', 'danger', 'ai', 'inverse'] as const;

/** C7 · Feedback — alerts, banners, progress, loading and empty states. */
export function FeedbackGallery() {
  const [dismissed, setDismissed] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

  return (
    <DsSectionBlock id="feedback">
      <SectionHeader
        id="feedback"
        eyebrow="Components · C7"
        title="Feedback"
        description="Alerts sit inside content, banners span the page. Both pair an icon with words; danger alerts announce themselves with role=alert."
        meta="Alert · Banner · Progress · Skeleton · EmptyState · Divider · Spinner"
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Specimen title="Alert" meta="6 tones" importPath="import { Alert } from '@/components/ui'">
          <div className="flex flex-col gap-3">
            <Alert tone="info" title="Sync scheduled">
              Docs drive re-indexes every night at 2:00 AM.
            </Alert>
            <Alert tone="ok" title="Connection healthy">
              Pipeline CRM responded in 180 ms.
            </Alert>
            <Alert
              tone="warn"
              title="Credits at 85%"
              action={
                <Button size="xs" variant="secondary">
                  Top up
                </Button>
              }
            >
              Runs pause when you reach your limit.
            </Alert>
            <Alert tone="danger" title="Webhook failed">
              The endpoint returned 500 three times in a row.
            </Alert>
            <Alert tone="ai" title="Suggested by Support Agent">
              Add “refund over $100” as an approval rule.
            </Alert>
            {dismissed ? (
              <Button variant="link" onClick={() => setDismissed(false)} className="self-start">
                Show dismissed alert
              </Button>
            ) : (
              <Alert tone="neutral" title="Tip" onDismiss={() => setDismissed(true)}>
                Press ⌘K anywhere to jump to an agent or run.
              </Alert>
            )}
          </div>
        </Specimen>

        <div className="flex flex-col gap-4">
          <Specimen title="Banner" meta="full width" importPath="import { Banner } from '@/components/ui'">
            <div className="flex flex-col gap-3">
              <Banner
                tone="warn"
                action={
                  <Link to="/settings/billing" className="text-body-m font-medium text-link hover:underline">
                    Upgrade
                  </Link>
                }
              >
                You’ve used 85% of this month’s credits.
              </Banner>
              <Banner tone="info">Scheduled maintenance Sunday 02:00–02:30 UTC.</Banner>
              {bannerOpen ? (
                <Banner tone="inverse" onDismiss={() => setBannerOpen(false)}>
                  You’re offline. Changes will sync when you reconnect.
                </Banner>
              ) : (
                <Button variant="link" onClick={() => setBannerOpen(true)} className="self-start">
                  Show offline banner
                </Button>
              )}
            </div>
          </Specimen>

          <Specimen
            title="Progress & spinner"
            meta="sm 4 · md 6"
            importPath="import { Progress, Spinner } from '@/components/ui'"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {progressTones.map((tone, i) => (
                <div key={tone} className="flex items-center gap-3">
                  <span className="w-14 text-body-s text-fg-3 capitalize">{tone}</span>
                  <Progress
                    value={32 + i * 12}
                    tone={tone}
                    size={i % 2 ? 'sm' : 'md'}
                    label={`${tone} progress`}
                  />
                </div>
              ))}
            </div>
            <VariantLabel className="mt-5">Spinner · 12 · 16 · 20 · 24</VariantLabel>
            <ExampleRow className="gap-5 text-fg-2">
              <Spinner size={12} />
              <Spinner size={16} />
              <Spinner size={20} className="text-brand" />
              <Spinner size={24} className="text-ai" />
            </ExampleRow>
          </Specimen>
        </div>

        <Specimen title="Skeleton" meta="shimmer" importPath="import { Skeleton } from '@/components/ui'">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          <Skeleton className="mt-5 h-24 w-full rounded-lg" />
          <div className="mt-5 flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </Specimen>

        <Specimen
          title="Empty state & divider"
          importPath="import { EmptyState, Divider } from '@/components/ui'"
        >
          <div className="rounded-lg border border-dashed border-border-strong bg-sunken">
            <EmptyState
              icon="approval"
              title="No approvals waiting"
              description="When an agent asks before acting, the request lands here."
              action={
                <Link
                  to="/approvals"
                  className="inline-flex h-8 items-center rounded-full border border-border-strong bg-surface px-3 text-13 font-medium text-fg hover:bg-subtle"
                >
                  View history
                </Link>
              }
              className="py-8"
            />
          </div>
          <Divider className="my-5" />
          <Divider label="or continue with" />
        </Specimen>
      </div>
    </DsSectionBlock>
  );
}

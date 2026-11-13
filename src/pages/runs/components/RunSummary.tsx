import type { ReactNode } from 'react';
import { Button, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { ButtonLink } from './ButtonLink';

/** Header card of a single run: id, status, source line, actions and six key facts. */
export function RunSummary({
  runId,
  status,
  subtitle,
  stats,
  actions,
}: {
  runId: string;
  status: ReactNode;
  subtitle: ReactNode;
  stats: [string, string, 'mono'?][];
  actions?: ReactNode;
}) {
  const toast = useToast();
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/runs/${runId}`);
    } catch {
      /* clipboard blocked — the toast still confirms the intent */
    }
    toast({ title: 'Link copied', description: `Anyone in Northwind Labs can open ${runId}.` });
  };

  return (
    <section
      aria-labelledby="run-title"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-4 sm:px-[18px]"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-subtle text-brand-text">
          <Icon name="workflow" size={20} strokeWidth={1.8} />
        </span>
        <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 id="run-title" className="font-mono text-[18px] leading-6 font-semibold text-fg">
              {runId}
            </h1>
            {status}
          </div>
          <p className="text-13 text-fg-2">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-[34px] px-3.5" onClick={share}>
            Share
          </Button>
          <ButtonLink to="/workflows/editor" size="md" icon="workflow">
            Open in canvas
          </ButtonLink>
          {actions}
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 border-t border-border pt-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([label, value, mono]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-caption font-medium text-fg-3">{label}</dt>
            <dd
              className={mono ? 'font-mono text-body-s font-medium text-fg' : 'text-13 font-medium text-fg'}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

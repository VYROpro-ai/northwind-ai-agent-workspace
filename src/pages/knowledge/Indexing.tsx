import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Progress,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
} from '@/components/ui';
import { formatNumber } from '@/lib/format';
import { boardCell as cell } from './utils';
import { KnowledgeShell } from './components/KnowledgeShell';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { FileTypeTile } from '@/components/ui/Tiles';
import { UploadModal } from './components/UploadModal';
import { failReasonTone, failedDocs, failedTotal, indexingJob as job, type FailedDoc } from './data';

function JobCard() {
  const toast = useToast();
  const [state, setState] = useState<'running' | 'paused' | 'cancelled'>('running');
  return (
    <Card padding="none" className="flex flex-col gap-4 rounded-[18px] px-5 py-[18px]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-0.5">
          <h2 className="text-[15px] leading-[21px] font-semibold text-fg">{job.title}</h2>
          <p className="text-body-s text-fg-3">
            {job.startedBy}
            {state === 'paused' && ' · Paused'}
            {state === 'cancelled' && ' · Cancelled'}
          </p>
        </div>
        {state !== 'cancelled' && (
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={state === 'paused' ? 'play' : 'pause'}
              onClick={() => setState(state === 'paused' ? 'running' : 'paused')}
            >
              {state === 'paused' ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setState('cancelled');
                toast({
                  title: 'Indexing cancelled',
                  description: `${formatNumber(job.done)} documents were kept.`,
                });
              }}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-5">
        <span className="text-[32px] leading-[38px] font-semibold tracking-[-0.02em] text-fg tabular">
          {job.progress}%
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Progress
            value={job.progress}
            tone={state === 'running' ? 'brand' : 'inverse'}
            label="Indexing progress"
            className="h-2.5"
          />
          <div className="flex flex-wrap items-center justify-between gap-x-4 text-13 text-fg-2">
            <span className="tabular">
              {formatNumber(job.done)} of {formatNumber(job.total)} documents
            </span>
            <span>{state === 'running' ? job.eta : state === 'paused' ? 'Paused' : 'Stopped'}</span>
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 border-t border-border pt-3 md:grid-cols-4">
        {job.stats.map((s) => (
          <div key={s.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-caption font-medium text-fg-3">{s.label}</dt>
            <dd className="truncate text-13 font-medium text-fg tabular">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function FailedRow({
  doc,
  retrying,
  onOpen,
  onRemove,
  onRetry,
}: {
  doc: FailedDoc;
  retrying: boolean;
  onOpen: () => void;
  onRemove: () => void;
  onRetry: () => void;
}) {
  return (
    <TR className="text-13 [&>td]:h-[52px]">
      <TD className={cell}>
        <div className="flex min-w-0 items-center gap-2.5">
          <FileTypeTile ext={doc.ext} size={28} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-fg">{doc.name}</span>
            <span className="truncate text-body-s text-fg-3">{doc.source}</span>
          </div>
        </div>
      </TD>
      <TD className={cell}>
        <Badge
          tone={failReasonTone[doc.reason]}
          bordered={false}
          className="h-[22px] border-transparent px-2 text-body-s"
        >
          {doc.reason}
        </Badge>
      </TD>
      <TD className={cn(cell, 'text-fg-2 tabular')}>{doc.time}</TD>
      <TD className={cell}>
        <div className="flex items-center justify-end gap-1">
          {doc.actions.includes('open') && (
            <Button variant="ghost" size="xs" className="h-7 px-3 text-13" onClick={onOpen}>
              Open
            </Button>
          )}
          {doc.actions.includes('remove') && (
            <Button variant="ghost" size="xs" className="h-7 px-3 text-13" onClick={onRemove}>
              Remove
            </Button>
          )}
          {doc.actions.includes('retry') && (
            <Button
              variant="secondary"
              size="xs"
              className="h-7 px-3 text-13"
              loading={retrying}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
        </div>
      </TD>
    </TR>
  );
}

/** W7-04 · Indexing progress & errors. */
export default function Indexing() {
  const toast = useToast();
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [docs, setDocs] = useState(failedDocs);
  const [reason, setReason] = useState('All');
  const [retrying, setRetrying] = useState<string[]>([]);

  const remaining = failedTotal - (failedDocs.length - docs.length);
  const reasons = ['All', ...new Set(failedDocs.map((d) => d.reason))];
  const visible = docs.filter((d) => reason === 'All' || d.reason === reason);

  const retry = (ids: string[]) => {
    setRetrying((list) => [...list, ...ids]);
    window.setTimeout(() => {
      setDocs((list) => list.filter((d) => !ids.includes(d.id)));
      setRetrying((list) => list.filter((id) => !ids.includes(id)));
      toast({
        title: ids.length > 1 ? `${ids.length} documents re-queued` : 'Document re-queued',
        tone: 'ok',
      });
    }, 900);
  };

  const remove = (doc: FailedDoc) => {
    setDocs((list) => list.filter((d) => d.id !== doc.id));
    toast({
      title: `Removed ${doc.name}`,
      action: { label: 'Undo', onClick: () => setDocs((list) => [...list, doc]) },
    });
  };

  return (
    <KnowledgeShell
      tab="/knowledge/indexing"
      current="Indexing"
      actions={
        <Button size="sm" leftIcon="upload" onClick={() => setUploadOpen(true)}>
          Upload files
        </Button>
      }
    >
      <JobCard />

      <InlineNotice
        tone="warn"
        icon="pause"
        title="Indexing paused for Orders database."
        actions={
          <Button
            variant="secondary"
            size="xs"
            className="h-7 px-3 text-13"
            onClick={() => navigate('/settings/plans')}
          >
            Upgrade
          </Button>
        }
      >
        You’ve used your monthly indexing allowance on the Pro plan.
      </InlineNotice>

      <section aria-labelledby="failed-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="failed-heading" className="text-[15px] leading-[22px] font-semibold text-fg">
            {remaining} documents couldn’t be indexed
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect label="Reason" value={reason} options={reasons} onChange={setReason} align="end" />
            <Button
              variant="secondary"
              size="sm"
              leftIcon="refresh"
              disabled={!docs.length}
              onClick={() => retry(docs.map((d) => d.id))}
            >
              Retry all
            </Button>
          </div>
        </div>

        <Card padding="none" className="overflow-hidden rounded-[18px]">
          {visible.length ? (
            <TableContainer>
              <Table className="min-w-[680px] table-fixed">
                <THead className="border-b border-border bg-sunken font-medium">
                  <tr>
                    <TH className={cn(cell, 'h-9')}>Document</TH>
                    <TH className={cn(cell, 'h-9 w-[160px]')}>Reason</TH>
                    <TH className={cn(cell, 'h-9 w-[90px]')}>Time</TH>
                    <TH className={cn(cell, 'h-9 w-[221px]')}>
                      <span className="sr-only">Actions</span>
                    </TH>
                  </tr>
                </THead>
                <TBody>
                  {visible.map((doc) => (
                    <FailedRow
                      key={doc.id}
                      doc={doc}
                      retrying={retrying.includes(doc.id)}
                      onOpen={() =>
                        toast({ title: `Opening ${doc.name}`, description: `From ${doc.source}` })
                      }
                      onRemove={() => remove(doc)}
                      onRetry={() => retry([doc.id])}
                    />
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState
              icon="check-circle"
              title="Nothing left to fix"
              description="Every listed document was re-queued or removed."
            />
          )}
        </Card>
        <p className="text-body-s text-fg-3">
          Most common reason: Timeout (6). Website pages that load slowly are retried automatically 3 times.
        </p>
      </section>

      {uploadOpen && <UploadModal open onClose={() => setUploadOpen(false)} />}
    </KnowledgeShell>
  );
}

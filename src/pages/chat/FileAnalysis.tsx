import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { UserMessage } from '@/components/ai';
import { useToast } from '@/components/ui';
import { ChatComposer } from './components/ChatComposer';
import { StandardHeader } from './components/ChatHeader';
import { ChatLayout, ChatThread, ComposerDock, PanelHeader } from './components/ChatLayout';
import { AgentTurn, ThreadMessages } from './components/ChatMessages';
import { RefundBars, RefundTable } from './components/RefundBreakdown';
import { agents, initialAttachments, refundRows, type Attachment } from './data';
import { useChatThread, useSidePanel } from './hooks';

const TITLE = 'Refund policy questions';

function downloadCsv() {
  const lines = [
    'reason,jul,sep,change',
    ...refundRows.map((r) => `${r.name},${r.jul},${r.sep},${r.change}`),
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'refunds_by_reason_jul_sep.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/** File type tile: "CSV", "PDF"… */
function FileKind({
  kind,
  tone = 'neutral',
  size = 'md',
}: {
  kind: string;
  tone?: 'ok' | 'neutral' | 'danger';
  size?: 'sm' | 'md';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-mono font-semibold',
        size === 'md' ? 'size-8 rounded-[7px] text-[9px]' : 'size-7 rounded-sm text-[8px]',
        tone === 'ok' && 'bg-ok-subtle text-ok-text',
        tone === 'neutral' && 'bg-subtle text-fg-2',
        tone === 'danger' && 'bg-danger-text text-surface',
      )}
    >
      {kind}
    </span>
  );
}

/** Attachment chip in the composer: uploading progress, ready, or an error reason. */
function AttachmentChip({ file, onRemove }: { file: Attachment; onRemove: () => void }) {
  const error = file.state === 'error';
  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 rounded-md border px-2 py-1.5 sm:w-[220px]',
        error ? 'border-danger-border bg-danger-subtle' : 'border-border bg-surface',
      )}
    >
      <FileKind kind={file.kind} tone={error ? 'danger' : 'neutral'} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate text-body-s font-medium text-fg">{file.name}</span>
        {file.state === 'uploading' && (
          <div
            role="progressbar"
            aria-label={`Uploading ${file.name}`}
            aria-valuenow={file.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-[3px] overflow-hidden rounded-full bg-subtle"
          >
            <div className="h-full bg-brand transition-[width]" style={{ width: `${file.progress ?? 0}%` }} />
          </div>
        )}
        <span className={cn('truncate text-caption', error ? 'text-danger-text' : 'text-fg-3')}>
          {file.state === 'ready' && (
            <Icon name="check-sm" size={10} strokeWidth={2.5} className="mr-1 inline text-ok-text" />
          )}
          {file.sub}
        </span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="rounded-sm p-0.5 text-fg-3 hover:bg-subtle hover:text-fg"
      >
        <Icon name="close" size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

function FilePanel({ onClose }: { onClose: () => void }) {
  const details = [
    ['Size', '1.8 MB'],
    ['Rows', '4,212'],
    ['Columns', '9'],
    ['Uploaded', 'Today, 2:41 PM by Sofia Rossi'],
    ['Kept for', '30 days, then deleted'],
  ];
  return (
    <>
      <PanelHeader title="Refunds by reason" onClose={onClose} />
      <div className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-5 overflow-y-auto p-5">
        <div className="flex items-center gap-2.5 rounded-[10px] border border-border p-2 pr-3">
          <FileKind kind="CSV" tone="ok" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-13 font-medium text-fg">q3_refunds.csv</span>
            <span className="text-body-s text-fg-3">1.8 MB · 4,212 rows</span>
          </div>
        </div>
        <RefundBars />
        <RefundTable />
        <section aria-labelledby="file-details" className="flex flex-col gap-2">
          <h3 id="file-details" className="text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">
            File details
          </h3>
          <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-y-2 text-13">
            {details.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-fg-3">{k}</dt>
                <dd className="text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}

/** W4-07 · File attachment & analysis — a chart and table from an uploaded CSV, plus attachment states. */
export default function FileAnalysis() {
  const agent = agents.support;
  const toast = useToast();
  const [panelOpen, setPanelOpen] = useSidePanel(false);
  const [files, setFiles] = useState<Attachment[]>(initialAttachments);
  const nextId = useRef(1);
  const { messages, thinking, send } = useChatThread();
  const uploading = files.some((f) => f.state === 'uploading');

  // Fake upload progress for any chip still uploading.
  useEffect(() => {
    if (!uploading) return;
    const id = window.setInterval(() => {
      setFiles((list) =>
        list.map((f) => {
          if (f.state !== 'uploading') return f;
          const progress = Math.min(100, (f.progress ?? 0) + 8);
          return progress < 100
            ? { ...f, progress }
            : { ...f, progress, state: 'ready', sub: `${f.sub.replace('Uploading · ', '')} · Ready` };
        }),
      );
    }, 400);
    return () => window.clearInterval(id);
  }, [uploading]);

  const addFiles = (picked: File[]) => {
    setFiles((list) => [
      ...list,
      ...picked.map((f): Attachment => {
        const kind = (f.name.split('.').pop() ?? 'file').slice(0, 4).toUpperCase();
        const mb = `${Math.max(0.1, f.size / 1_000_000).toFixed(1)} MB`;
        return kind === 'ZIP'
          ? {
              id: `new-${nextId.current++}`,
              kind,
              name: f.name,
              sub: 'Can’t read .zip files',
              state: 'error',
            }
          : {
              id: `new-${nextId.current++}`,
              kind,
              name: f.name,
              sub: `Uploading · ${mb}`,
              state: 'uploading',
              progress: 0,
            };
      }),
    ]);
  };

  const scanning = files.some((f) => f.name === 'warranty_scan.pdf');

  return (
    <ChatLayout
      title={TITLE}
      activeChat={TITLE}
      header={<StandardHeader title={TITLE} model={null} share={false} />}
      panel={<FilePanel onClose={() => setPanelOpen(false)} />}
      panelOpen={panelOpen}
      onPanelClose={() => setPanelOpen(false)}
      panelLabel="File details"
    >
      <ChatThread scrollKey={messages.length + (thinking ? 1 : 0) || undefined} innerClassName="gap-5 pt-5">
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-surface py-2 pr-3 pl-2">
            <FileKind kind="CSV" tone="ok" />
            <div className="flex flex-col">
              <span className="text-13 font-medium text-fg">q3_refunds.csv</span>
              <span className="text-body-s text-fg-3">1.8 MB · 4,212 rows</span>
            </div>
          </div>
          <UserMessage className="w-full">Which refund reasons grew the most this quarter?</UserMessage>
        </div>

        <AgentTurn agent={agent} hideHeader>
          <p>
            Refunds grew <b className="font-semibold">48%</b> from July to September, from $18,400 to $27,300.{' '}
            <b className="font-semibold">Late delivery</b> drove most of it, nearly tripling.
          </p>
          <section
            aria-labelledby="refund-card"
            className="overflow-hidden rounded-[18px] border border-border bg-surface"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border px-3.5 py-2.5">
              <h2 id="refund-card" className="min-w-48 flex-1 text-13 font-semibold text-fg">
                Refunds by reason, Jul vs Sep
              </h2>
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="text-body-s font-medium text-link hover:underline"
              >
                Open in panel
              </button>
              <span aria-hidden className="h-3.5 w-px bg-border" />
              <button
                type="button"
                onClick={() => {
                  downloadCsv();
                  toast({ title: 'CSV downloaded', description: 'refunds_by_reason_jul_sep.csv' });
                }}
                className="inline-flex items-center gap-1 text-body-s font-medium text-link hover:underline"
              >
                <Icon name="download" size={12} strokeWidth={2} />
                Download CSV
              </button>
            </div>
            <div className="flex flex-wrap gap-5 p-3.5">
              <RefundBars className="flex-[1_1_260px]" />
              <RefundTable className="flex-[1_1_260px]" />
            </div>
          </section>
        </AgentTurn>
        <ThreadMessages agent={agent} messages={messages} thinking={thinking} />
      </ChatThread>

      <ComposerDock>
        <ChatComposer
          placeholder="Ask about your files…"
          layout="inline"
          tools={['attach']}
          strongBorder
          onSend={send}
          onAttach={addFiles}
          notice={
            scanning && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-md bg-info-subtle px-3 py-2 text-body-s text-info-text"
              >
                <Icon name="info" size={14} strokeWidth={2} className="shrink-0" />
                warranty_scan.pdf has no text layer. Reading text from images, this may take longer.
              </p>
            )
          }
          attachments={
            files.length > 0 &&
            files.map((f) => (
              <AttachmentChip
                key={f.id}
                file={f}
                onRemove={() => setFiles((list) => list.filter((x) => x.id !== f.id))}
              />
            ))
          }
        />
      </ComposerDock>
    </ChatLayout>
  );
}

import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Badge, Button, Card, Modal, useToast } from '@/components/ui';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { FileTypeTile } from '@/components/ui/Tiles';
import { documentChunks, documentMeta as doc, refundTable, type DocChunk } from './data';

/** A block of the page preview that maps to one chunk; highlighted when that chunk is selected. */
function PreviewBlock({ chunk, active, children }: { chunk: number; active: boolean; children: ReactNode }) {
  return (
    <div
      id={`chunk-${chunk}`}
      data-active={active || undefined}
      className={cn(
        'scroll-mt-24 rounded-sm text-13 leading-[21px] text-fg transition-colors',
        active && 'bg-ai-subtle px-2 py-1.5 shadow-[inset_3px_0_0_var(--ai)]',
      )}
    >
      {children}
    </div>
  );
}

function PagePreview({ selected }: { selected: number }) {
  const para = (id: number) => documentChunks.find((c) => c.id === id)?.text ?? '';
  return (
    <Card padding="none" className="flex min-w-0 flex-1 flex-col gap-3 rounded-[18px] px-5 py-6 sm:px-7">
      <span className="text-caption font-semibold text-fg-3">Page 2 of 4</span>
      <h2 className="text-[18px] leading-[26px] font-semibold text-fg">2. When you can get a refund</h2>
      <PreviewBlock chunk={5} active={selected === 5}>
        <p>{para(5).replace('2. When you can get a refund. ', '')}</p>
      </PreviewBlock>
      <PreviewBlock chunk={6} active={selected === 6}>
        <p>{para(6)}</p>
      </PreviewBlock>
      <PreviewBlock chunk={7} active={selected === 7}>
        <p>{para(7)}</p>
      </PreviewBlock>
      <PreviewBlock chunk={8} active={selected === 8}>
        <div className="overflow-x-auto rounded-md border border-border text-body-s">
          <table className="w-full min-w-[320px] text-left">
            <thead className="bg-sunken font-semibold">
              <tr>
                {refundTable.head.map((h) => (
                  <th key={h} scope="col" className="px-2.5 py-1.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refundTable.rows.map((row) => (
                <tr key={row[0]} className="border-t border-border">
                  {row.map((cell) => (
                    <td key={cell} className="px-2.5 py-1.5">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PreviewBlock>
      <PreviewBlock chunk={9} active={selected === 9}>
        <p>{para(9)}</p>
      </PreviewBlock>
    </Card>
  );
}

function ChunkRow({ chunk, active, onSelect }: { chunk: DocChunk; active: boolean; onSelect: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className={cn(
          'flex w-full items-start gap-2.5 border-t border-border px-3 py-2.5 text-left transition-colors hover:bg-subtle',
          active && 'bg-brand-subtle shadow-[inset_3px_0_0_var(--brand)] hover:bg-brand-subtle',
          chunk.excluded && 'opacity-50',
        )}
      >
        <span className="w-[22px] shrink-0 text-caption text-fg-3 tabular">#{chunk.id}</span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={cn('truncate text-13 text-fg', chunk.excluded && 'line-through')}>
            {chunk.preview}
          </span>
          <span className="text-caption text-fg-3 tabular">
            {chunk.tokens} tokens{chunk.excluded && ' · Excluded'}
          </span>
        </span>
        {chunk.tag && (
          <Badge
            tone="info"
            bordered={false}
            className="h-[18px] self-center border-transparent px-2 text-body-s"
          >
            {chunk.tag}
          </Badge>
        )}
      </button>
    </li>
  );
}

/** W7-05 · Document viewer with chunk list; selecting a chunk highlights it in the page preview. */
export default function DocumentViewer() {
  const toast = useToast();
  const navigate = useNavigate();
  const [chunks, setChunks] = useState(documentChunks);
  const [selected, setSelected] = useState(6);
  const [removedNotice, setRemovedNotice] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  const current = chunks.find((c) => c.id === selected);

  const select = (id: number) => {
    setSelected(id);
    document.getElementById(`chunk-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const toggleExcluded = () => {
    if (!current) return;
    setChunks((list) => list.map((c) => (c.id === current.id ? { ...c, excluded: !c.excluded } : c)));
    toast({
      title: current.excluded
        ? `Chunk ${current.id} included again`
        : `Chunk ${current.id} excluded from answers`,
    });
  };

  const copy = async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.text);
      toast({ title: `Chunk ${current.id} copied`, tone: 'ok' });
    } catch {
      toast({ title: 'Couldn’t copy to the clipboard', tone: 'danger' });
    }
  };

  const reindex = () => {
    setReindexing(true);
    window.setTimeout(() => {
      setReindexing(false);
      toast({
        title: 'Re-indexed Refund policy 2026.pdf',
        description: '24 chunks · no changes',
        tone: 'ok',
      });
    }, 1200);
  };

  return (
    <AppShell
      active="Knowledge"
      role="builder"
      crumbs={[{ label: 'Knowledge', to: '/knowledge' }, { label: doc.name }]}
    >
      <div className="flex flex-wrap items-center gap-2 text-13">
        <nav aria-label="Document location" className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Link to="/knowledge" className="font-medium text-link hover:underline">
            Knowledge
          </Link>
          <span className="text-fg-3" aria-hidden>
            /
          </span>
          <Link to="/knowledge" className="font-medium text-link hover:underline">
            {doc.collection}
          </Link>
          <span className="text-fg-3" aria-hidden>
            /
          </span>
          <span className="text-fg-2" aria-current="page">
            {doc.name}
          </span>
        </nav>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast({ title: 'Tag editing', description: 'Refunds, Policy' })}
        >
          Edit tags
        </Button>
        <Button variant="secondary" size="sm" leftIcon="sync" loading={reindexing} onClick={reindex}>
          Re-index
        </Button>
      </div>

      {removedNotice && (
        <InlineNotice
          tone="info"
          actions={
            <>
              <Button
                variant="ghost"
                size="xs"
                className="h-7 px-3 text-13"
                onClick={() => setRemovedNotice(false)}
              >
                Keep
              </Button>
              <Button
                variant="secondary"
                size="xs"
                className="h-7 px-3 text-13"
                onClick={() => setConfirmDelete(true)}
              >
                Delete here
              </Button>
            </>
          }
        >
          This file was removed from Docs drive on Oct 25. Delete it here too?
        </InlineNotice>
      )}

      <Card padding="none" className="flex flex-wrap items-center gap-2.5 rounded-[18px] px-4 py-3.5">
        <FileTypeTile ext="PDF" size={36} />
        <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
          <h1 className="text-h4 font-semibold text-fg">{doc.name}</h1>
          <p className="text-body-s text-fg-3">{doc.meta}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {doc.tags.map((tag) => (
            <Badge
              key={tag}
              tone="neutral"
              bordered={false}
              className="h-[22px] border-transparent px-2 text-body-s"
            >
              {tag}
            </Badge>
          ))}
          <span className="ml-1 text-body-s font-medium text-fg-2">{doc.usage}</span>
        </div>
      </Card>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <PagePreview selected={selected} />
        <Card padding="none" className="w-full shrink-0 overflow-hidden rounded-[18px] xl:w-[360px]">
          <div className="flex items-center px-3 pt-3 pb-2.5">
            <h2 className="flex-1 text-13 font-semibold text-fg">{doc.chunkCount} chunks</h2>
            <span className="text-body-s text-fg-3">{doc.avgTokens}</span>
          </div>
          <ul aria-label="Chunks on this page">
            {chunks.map((chunk) => (
              <ChunkRow
                key={chunk.id}
                chunk={chunk}
                active={chunk.id === selected}
                onSelect={() => select(chunk.id)}
              />
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2.5">
            <Button variant="secondary" size="sm" onClick={toggleExcluded} disabled={!current}>
              {current?.excluded ? 'Include' : 'Exclude'} chunk {selected}
            </Button>
            <Button variant="ghost" size="sm" leftIcon="copy" onClick={copy}>
              Copy
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        size="sm"
        title="Delete this document?"
        description="Agents stop citing Refund policy 2026.pdf right away. This can’t be undone."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                toast({ title: 'Refund policy 2026.pdf deleted', tone: 'ok' });
                navigate('/knowledge');
              }}
            >
              Delete document
            </Button>
          </>
        }
      />
    </AppShell>
  );
}

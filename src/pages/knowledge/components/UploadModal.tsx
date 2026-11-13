import { useEffect, useRef, useState, type DragEvent } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Badge, Button, IconButton, Modal, Progress, Switch, useToast } from '@/components/ui';
import {
  acceptedExtensions,
  collapsedUploads,
  initialUploads,
  uploadCollections,
  type UploadItem,
} from '../data';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { FileTypeTile } from '@/components/ui/Tiles';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { extensionOf, formatBytes } from '../utils';
import { boardModal } from './boardModal';

const MAX_BYTES = 50_000_000;

let nextUploadId = 1;

function toUploadItem(file: File, existing: UploadItem[]): UploadItem {
  const id = `picked-${nextUploadId++}`;
  const ext = extensionOf(file.name).toLowerCase();
  const base = { id, name: file.name, size: file.size, progress: 0 };
  if (!acceptedExtensions.includes(ext)) {
    return { ...base, status: 'failed', error: `.${ext} files aren’t supported`, retryable: false };
  }
  if (file.size > MAX_BYTES) {
    return { ...base, status: 'failed', error: 'Larger than 50 MB', retryable: false };
  }
  if (existing.some((item) => item.name === file.name)) {
    return { ...base, status: 'duplicate', error: 'Same name as a file in this upload' };
  }
  return { ...base, status: 'uploading' };
}

const rowPill = 'h-5 gap-[5px] border-transparent px-2 text-body-s';
const rowButton = 'h-[26px] px-3 text-13';

/** Status pill + inline actions for one upload row. */
function UploadRow({
  item,
  onChange,
  onRemove,
}: {
  item: UploadItem;
  onChange: (patch: Partial<UploadItem>) => void;
  onRemove: () => void;
}) {
  const resume = () => onChange({ status: 'uploading', error: undefined });
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border py-2.5">
      <FileTypeTile ext={extensionOf(item.name)} />
      <div className="flex min-w-0 flex-1 basis-40 flex-col">
        <span className="truncate text-13 font-medium text-fg">{item.name}</span>
        {item.error ? (
          <span className="text-body-s text-danger-text">{item.error}</span>
        ) : (
          <span className="text-body-s text-fg-3">{formatBytes(item.size)}</span>
        )}
        {(item.status === 'uploading' || item.status === 'paused') && (
          <Progress
            size="sm"
            value={item.progress}
            label={`${item.name} upload progress`}
            className={cn('mt-1', item.status === 'paused' && '[&>div]:bg-border-strong')}
          />
        )}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {item.status === 'uploading' && (
          <Badge tone="brand" bordered={false} size="sm" className={rowPill}>
            Uploading {Math.round(item.progress)}%
          </Badge>
        )}
        {item.status === 'uploaded' && (
          <Badge tone="ok" icon="check-sm" bordered={false} size="sm" className={rowPill}>
            Uploaded
          </Badge>
        )}
        {item.status === 'failed' && (
          <Badge tone="danger" icon="close" bordered={false} size="sm" className={rowPill}>
            Failed
          </Badge>
        )}
        {item.status === 'paused' && (
          <>
            <Badge tone="neutral" icon="pause" bordered={false} size="sm" className={rowPill}>
              Paused
            </Badge>
            <Button variant="secondary" size="xs" className={rowButton} onClick={resume}>
              Resume
            </Button>
          </>
        )}
        {item.status === 'duplicate' && (
          <>
            <Badge tone="warn" bordered={false} size="sm" className={cn(rowPill, 'mr-1')}>
              Duplicate
            </Badge>
            <Button variant="secondary" size="xs" className={rowButton} onClick={resume}>
              Replace
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className={cn(rowButton, 'text-fg-2')}
              onClick={() =>
                onChange({ status: 'uploading', error: undefined, name: keepBothName(item.name) })
              }
            >
              Keep both
            </Button>
            <Button variant="ghost" size="xs" className={cn(rowButton, 'text-fg-2')} onClick={onRemove}>
              Skip
            </Button>
          </>
        )}
        <IconButton icon="close" label={`Remove ${item.name}`} variant="ghost" size="xs" onClick={onRemove} />
      </div>
    </li>
  );
}

function keepBothName(name: string) {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? `${name.slice(0, dot)} (2)${name.slice(dot)}` : `${name} (2)`;
}

/** W7-02 · Upload files modal — drop zone, per-file progress, duplicate and error handling. */
export function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [collection, setCollection] = useState(uploadCollections[0]);
  const [items, setItems] = useState<UploadItem[]>(initialUploads);
  const [dragging, setDragging] = useState(false);
  const [ocr, setOcr] = useState(true);
  const [autoTag, setAutoTag] = useState(false);

  const uploading = open && items.some((item) => item.status === 'uploading');

  // Fake upload progress for rows in the "uploading" state.
  useEffect(() => {
    if (!uploading) return;
    const timer = window.setInterval(() => {
      setItems((list) =>
        list.map((item) => {
          if (item.status !== 'uploading') return item;
          const progress = Math.min(100, item.progress + 6 + Math.random() * 10);
          return progress >= 100 ? { ...item, progress: 100, status: 'uploaded' } : { ...item, progress };
        }),
      );
    }, 450);
    return () => window.clearInterval(timer);
  }, [uploading]);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    // Copy now: a FileList is live, and the input is cleared before the state updater runs.
    const picked = Array.from(files);
    setItems((list) => {
      const next = [...list];
      picked.forEach((file) => next.unshift(toUploadItem(file, next)));
      return next;
    });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const update = (id: string, patch: Partial<UploadItem>) =>
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const remove = (id: string) => setItems((list) => list.filter((item) => item.id !== id));

  const failed = items.filter((item) => item.status === 'failed' || item.status === 'duplicate').length;
  const total = items.length + collapsedUploads.count;
  const bytes = items.reduce((sum, item) => sum + item.size, collapsedUploads.bytes);

  const retryFailed = () =>
    setItems((list) =>
      list.map((item) =>
        item.status === 'failed' && item.retryable !== false
          ? { ...item, status: 'uploading', progress: 0, error: undefined }
          : item,
      ),
    );

  const done = () => {
    toast({
      title: `${total - failed} files added to ${collection}`,
      description: 'Indexing starts in a moment.',
      tone: 'ok',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      className={cn('max-w-[620px]', boardModal)}
      title="Upload files"
      description="Add documents to a collection. Agents can use them once indexed."
      footer={
        <>
          <span className="mr-auto text-body-s text-fg-3 tabular">
            {total} files · {formatBytes(bytes)}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={done}>
            Done
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-body-s font-semibold text-fg-2">Add to</span>
          <FilterSelect
            label="Collection"
            value={collection}
            options={uploadCollections}
            onChange={setCollection}
            className="w-[260px]"
          />
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-brand bg-brand-subtle p-[22px] text-center transition-[box-shadow,background-color]',
            dragging && 'border-solid shadow-[0_0_0_4px_var(--focus-ring)]',
          )}
        >
          <Icon
            name="upload"
            size={22}
            strokeWidth={2}
            className={cn('text-brand-text', dragging && 'animate-bounce')}
          />
          <p className="text-body-m font-semibold text-fg">
            {dragging ? (
              'Drop to upload'
            ) : (
              <>
                Drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-link underline-offset-2 hover:underline"
                >
                  browse
                </button>
              </>
            )}
          </p>
          <p className="text-body-s text-fg-2">
            PDF, DOCX, XLSX, CSV, MD, TXT, HTML · up to 50 MB each · 100 files at a time
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose files to upload"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {failed > 0 && (
          <InlineNotice
            tone="warn"
            title={`${total - failed} uploaded, ${failed} failed.`}
            actions={
              <Button variant="secondary" size="xs" className="h-7 px-3 text-13" onClick={retryFailed}>
                Retry failed
              </Button>
            }
          >
            Fix the failed files below or skip them.
          </InlineNotice>
        )}

        <div>
          <ul aria-label="Files in this upload">
            {items.map((item) => (
              <UploadRow
                key={item.id}
                item={item}
                onChange={(patch) => update(item.id, patch)}
                onRemove={() => remove(item.id)}
              />
            ))}
          </ul>
          <p className="border-t border-border pt-2 text-body-s text-fg-3">
            + {collapsedUploads.count} more uploaded
          </p>
        </div>

        <div className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-sunken px-3.5 py-3">
          <Switch
            label={<span className="text-13">Extract text from images (OCR)</span>}
            description="Slower, but reads scanned PDFs and screenshots"
            checked={ocr}
            onChange={(e) => setOcr(e.target.checked)}
          />
          <Switch
            label={<span className="text-13">Auto-tag with AI</span>}
            description="Adds topic tags like Refunds, Shipping"
            checked={autoTag}
            onChange={(e) => setAutoTag(e.target.checked)}
          />
        </div>
      </div>
    </Modal>
  );
}

import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Input,
  Progress,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui';
import { formatNumber } from '@/lib/format';
import { KnowledgeShell } from './components/KnowledgeShell';
import { boardCell as cell } from './utils';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { IconTile } from '@/components/ui/Tiles';
import { AgentChips, SourceStatusBadge } from './components/SourceParts';
import { UploadModal } from './components/UploadModal';
import { ConnectSourceModal } from './components/ConnectSourceModal';
import {
  collections,
  knowledgeStats as stats,
  sourceKinds,
  sources,
  type KnowledgeSource,
  type SourceStatus,
} from './data';

type SourcesModal = 'upload' | 'connect';

const statusLabels: Record<SourceStatus, string> = {
  indexed: 'Indexed',
  indexing: 'Indexing',
  failed: 'Failed',
  paused: 'Paused',
};

function StatCard({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <Card padding="none" className="flex min-w-0 flex-col gap-1 rounded-[18px] px-4 py-3.5">
      <span className="text-body-s font-medium text-fg-2">{label}</span>
      <span className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-fg tabular">{value}</span>
      {hint && <span className="text-body-s font-medium text-fg-3">{hint}</span>}
      {children}
    </Card>
  );
}

function SourceRow({ source, onReconnect }: { source: KnowledgeSource; onReconnect: () => void }) {
  const kind = sourceKinds[source.kind];
  const failed = source.status === 'failed';
  return (
    <TR className={cn('text-13', failed && 'bg-danger-subtle')}>
      <TD className={cn(cell, 'h-[55px]')}>
        <div className="flex min-w-0 items-center gap-2.5">
          <IconTile icon={kind.icon} tone={kind.tone} />
          <div className="flex min-w-0 flex-col">
            {source.to ? (
              <Link to={source.to} className="truncate font-semibold text-fg hover:text-link">
                {source.name}
              </Link>
            ) : (
              <span className="truncate font-semibold text-fg">{source.name}</span>
            )}
            <span className="truncate text-body-s text-fg-3">{source.detail}</span>
          </div>
        </div>
      </TD>
      <TD className={cn(cell, 'truncate text-fg-2')}>{kind.label}</TD>
      <TD className={cn(cell, 'text-right whitespace-nowrap text-fg tabular')}>{source.docs}</TD>
      <TD className={cell}>
        <div className="flex items-center gap-1.5">
          <SourceStatusBadge status={source.status} progress={source.progress} />
          {failed && (
            <Button variant="secondary" size="xs" onClick={onReconnect}>
              Reconnect
            </Button>
          )}
        </div>
      </TD>
      <TD className={cell}>
        <AgentChips ids={source.usedBy} />
      </TD>
      <TD className={cn(cell, 'truncate tabular', failed ? 'text-danger-text' : 'text-fg-2')}>
        {source.lastSynced}
      </TD>
      <TD className={cell}>
        <Avatar name={source.owner.name} src={source.owner.avatar} size="sm" />
      </TD>
    </TR>
  );
}

/** W7-01 · Knowledge sources list. `initialModal` renders the W7-02 / W7-03 state routes. */
export default function Sources({ initialModal }: { initialModal?: SourcesModal }) {
  const [modal, setModal] = useState<SourcesModal | null>(initialModal ?? null);
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState(collections[0]);
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');

  const typeOptions = ['All', ...new Set(sources.map((s) => sourceKinds[s.kind].label))];
  const statusOptions = ['All', ...Object.values(statusLabels)];
  const collectionOptions = collections.map((c) => ({
    value: c,
    count:
      c === collections[0]
        ? stats.documents
        : sources.filter((s) => s.collection === c).reduce((n, s) => n + s.docCount, 0),
  }));

  const q = query.trim().toLowerCase();
  const rows = sources.filter(
    (s) =>
      (!q || `${s.name} ${s.detail}`.toLowerCase().includes(q)) &&
      (collection === collections[0] || s.collection === collection) &&
      (type === 'All' || sourceKinds[s.kind].label === type) &&
      (status === 'All' || statusLabels[s.status] === status),
  );

  const clearFilters = () => {
    setQuery('');
    setCollection(collections[0]);
    setType('All');
    setStatus('All');
  };

  return (
    <KnowledgeShell
      tab="/knowledge"
      current="Sources"
      actions={
        <>
          <Button variant="secondary" size="sm" leftIcon="plus" onClick={() => setModal('connect')}>
            Connect a source
          </Button>
          <Button size="sm" leftIcon="upload" onClick={() => setModal('upload')}>
            Upload files
          </Button>
        </>
      }
    >
      <section
        aria-label="Knowledge summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Documents" value={stats.documents} hint={`across ${stats.sourceCount} sources`} />
        <StatCard label="Total size" value={stats.totalSize} />
        <StatCard
          label="Storage"
          value={
            <>
              {stats.storageUsed} GB{' '}
              <span className="text-body-m font-medium text-fg-3">of {stats.storageLimit} GB</span>
            </>
          }
        >
          <Progress
            value={(stats.storageUsed / stats.storageLimit) * 100}
            label="Storage used"
            className="mt-0.5"
          />
        </StatCard>
        <StatCard label="Last sync" value={stats.lastSync} hint={stats.lastSyncSource} />
      </section>

      <section aria-label="Sources" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            pill
            size="sm"
            leftIcon="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sources"
            aria-label="Search sources"
            containerClassName="w-full sm:w-[260px]"
            className="h-[34px] border-border text-13"
          />
          <FilterSelect
            label="Collection"
            icon="folder"
            value={collection}
            options={collectionOptions}
            count={collectionOptions.find((c) => c.value === collection)?.count}
            onChange={setCollection}
          />
          <FilterSelect label="Type" value={type} options={typeOptions} onChange={setType} />
          <FilterSelect label="Status" value={status} options={statusOptions} onChange={setStatus} />
          <span className="ml-auto hidden text-body-s text-fg-3 lg:inline">
            Drag files between collections
          </span>
        </div>

        <Card padding="none" className="overflow-hidden rounded-[18px]">
          {rows.length ? (
            <TableContainer>
              <Table className="min-w-[880px] table-fixed">
                <THead className="border-b border-border bg-sunken font-medium">
                  <tr>
                    <TH className={cn(cell, 'h-9')}>Source</TH>
                    <TH className={cn(cell, 'h-9 w-[94px]')}>Type</TH>
                    <TH className={cn(cell, 'h-9 w-[62px] text-right [&>span]:justify-end')}>Docs</TH>
                    <TH className={cn(cell, 'h-9 w-[178px]')}>Status</TH>
                    <TH className={cn(cell, 'h-9 w-[90px]')}>Used by</TH>
                    <TH className={cn(cell, 'h-9 w-[94px]')}>Last synced</TH>
                    <TH className={cn(cell, 'h-9 w-[45px]')}>
                      <span className="sr-only">Owner</span>
                    </TH>
                  </tr>
                </THead>
                <TBody>
                  {rows.map((source) => (
                    <SourceRow key={source.id} source={source} onReconnect={() => setModal('connect')} />
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState
              icon="search"
              title="No sources match"
              description={`Nothing in ${formatNumber(sources.length)} sources matches these filters.`}
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          )}
        </Card>
      </section>

      {modal === 'upload' && <UploadModal open onClose={() => setModal(null)} />}
      {modal === 'connect' && <ConnectSourceModal open onClose={() => setModal(null)} />}
    </KnowledgeShell>
  );
}

import { cn } from '@/lib/cn';
import { Badge, Progress } from '@/components/ui';
import { agentChips, type AgentChipId, type SourceStatus } from '../data';

/** Overlapping lettered agent chips ("SA", "SR") for the "Used by" column. */
export function AgentChips({ ids }: { ids: AgentChipId[] }) {
  if (!ids.length) {
    return (
      <span className="inline-flex h-[22px] items-center rounded-full border border-dashed border-border-strong px-2 text-body-s whitespace-nowrap text-fg-3">
        Not used
      </span>
    );
  }
  return (
    <span className="flex">
      {ids.map((id, i) => (
        <span
          key={id}
          title={agentChips[id].name}
          aria-label={agentChips[id].name}
          role="img"
          className={cn(
            'inline-flex size-[26px] items-center justify-center rounded-[8px] border-2 border-surface text-[9px] font-semibold text-white',
            agentChips[id].className,
            i > 0 && '-ml-1.5',
          )}
        >
          {id}
        </span>
      ))}
    </span>
  );
}

/** Indexing state pill for a knowledge source. */
export function SourceStatusBadge({ status, progress = 0 }: { status: SourceStatus; progress?: number }) {
  const pill = 'h-[22px] gap-[5px] border-transparent px-2 text-body-s';
  switch (status) {
    case 'indexed':
      return (
        <Badge tone="ok" icon="check-sm" bordered={false} className={pill}>
          Indexed
        </Badge>
      );
    case 'indexing':
      return (
        <span className="flex flex-col gap-1">
          <Badge tone="brand" icon="sync" bordered={false} className={cn(pill, 'self-start')}>
            Indexing {progress}%
          </Badge>
          <Progress value={progress} size="sm" label="Indexing progress" className="h-[3px] w-[100px]" />
        </span>
      );
    case 'failed':
      return (
        <Badge tone="danger" icon="close" bordered={false} className={pill}>
          Failed
        </Badge>
      );
    case 'paused':
      return (
        <Badge tone="neutral" icon="pause" bordered={false} className={pill}>
          Paused
        </Badge>
      );
  }
}

import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, InlineNotice, Modal } from '@/components/ui';
import { dependentWorkflows } from '../data';

/** W3-11 dialog · Delete is blocked by workflows that still use the agent; offers archive instead. */
export function ArchiveDialog({
  open,
  onClose,
  onArchive,
}: {
  open: boolean;
  onClose: () => void;
  onArchive: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Can’t delete Support Agent yet"
      description="3 workflows still use this agent. Remove it from them first, or archive it instead so those workflows pause safely."
      icon={
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-danger-subtle text-danger-text">
          <Icon name="trash" size={18} strokeWidth={2} />
        </span>
      }
      footer={
        <>
          <span className="mr-auto text-13 text-fg-3">Delete is unavailable</span>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onArchive}>Archive instead</Button>
        </>
      }
      className="bg-raised"
    >
      <ul className="overflow-hidden rounded-[10px] border border-border">
        {dependentWorkflows.map((f, i) => (
          <li
            key={f.name}
            className={cn('flex items-center gap-3 px-3 py-2.5', i > 0 && 'border-t border-border')}
          >
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-subtle text-icon">
              <Icon name="workflow-link" size={14} strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-13 font-medium">{f.name}</span>
              <span className="text-body-s text-fg-3">{f.meta}</span>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-body-s font-medium',
                f.active ? 'text-ok-text' : 'text-warn-text',
              )}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {f.active ? 'Active' : 'Paused'}
            </span>
            <Link to="/workflows/editor" className="text-body-s font-medium text-link hover:underline">
              Open<span className="sr-only"> {f.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <InlineNotice className="mt-3.5 items-start p-3 leading-[19px] [&>svg]:mt-px">
        Archiving keeps all 12,400 runs and every version. You can restore it from Agents → Archived any time.
      </InlineNotice>
    </Modal>
  );
}

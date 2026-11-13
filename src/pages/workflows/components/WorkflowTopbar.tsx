import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Avatar, Badge, Button, Dropdown } from '@/components/ui';
import { editorViewers, statusTones, type WorkflowStatus } from '../data';

export interface WorkflowTopbarProps {
  status?: WorkflowStatus;
  /** Version picker label, e.g. "v5 draft" or "Run #4821". */
  version?: string;
  note?: string;
  /** Highlights the Test button while a test run is in progress. */
  testing?: boolean;
  title?: string;
}

const versions = [
  { label: 'v5 draft', to: '/workflows/editor' },
  { label: 'v4 · live', to: '/workflows/editor/diff' },
  { label: 'Compare v4 → v5', to: '/workflows/editor/diff' },
];

/** Workflow editor top bar · 56 px header: back, name, status, version, viewers, Test and Publish. */
export function WorkflowTopbar({
  status = 'Draft',
  version = 'v5 draft',
  note = 'Saved 10 s ago',
  testing = false,
  title = 'Ticket triage & reply',
}: WorkflowTopbarProps) {
  const navigate = useNavigate();
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-2 sm:gap-3 sm:px-4">
      <Link
        to="/workflows"
        aria-label="Back to workflows"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-icon transition-colors hover:bg-subtle hover:text-fg"
      >
        <Icon name="chevron-left" size={18} strokeWidth={2} />
      </Link>
      <h1 className="min-w-0 truncate text-[15px] leading-5 font-semibold text-fg">{title}</h1>
      <Badge tone={statusTones[status]} dot bordered={false} className="h-[22px] border-transparent">
        {status}
      </Badge>
      <Dropdown
        width={200}
        panelRole="menu"
        trigger={(props) => (
          <button
            type="button"
            {...props}
            className="hidden h-7 shrink-0 items-center gap-1 rounded-sm px-2 font-mono text-body-s text-fg-2 hover:bg-subtle md:inline-flex"
          >
            {version}
            <Icon name="chevron-down" size={12} strokeWidth={2} className="text-fg-3" />
          </button>
        )}
      >
        <VersionMenu />
      </Dropdown>
      <span className="hidden truncate text-body-s text-fg-3 lg:inline">{note}</span>
      <span className="flex-1" />
      <div className="hidden items-center sm:flex">
        {editorViewers.map((p, i) => (
          <Avatar
            key={p.name}
            name={p.name}
            src={p.avatar}
            size="sm"
            className={cn('rounded-full border-2 border-surface [&>img]:size-7', i > 0 && '-ml-2')}
          />
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        leftIcon="play"
        onClick={() => navigate('/workflows/editor/test')}
        aria-pressed={testing}
        className={cn(
          'h-[34px] px-3 [&>svg]:fill-current',
          testing && 'border-brand-border bg-brand-subtle text-brand-text hover:bg-brand-subtle',
        )}
      >
        Test
      </Button>
      <Button size="sm" onClick={() => navigate('/workflows/editor/publish')} className="h-[34px] px-3.5">
        Publish
      </Button>
    </header>
  );
}

function VersionMenu() {
  return (
    <ul className="flex flex-col">
      {versions.map((v) => (
        <li key={v.label}>
          <Link
            to={v.to}
            role="menuitem"
            className="flex rounded-md px-2.5 py-2 text-body-m text-fg hover:bg-subtle focus:bg-subtle focus:outline-none"
          >
            {v.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

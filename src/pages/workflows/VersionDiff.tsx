import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Badge, Button, useToast, type Tone } from '@/components/ui';
import { ConfigPanel } from './components/ConfigPanel';
import { PanelSegmented } from './components/PanelBits';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowEditorLayout } from './components/WorkflowEditorLayout';
import { versionChanges, type DiffKind } from './data';

const kinds: Record<DiffKind, { label: string; tone: Tone; swatch: string; edge: string }> = {
  add: { label: 'Added', tone: 'ok', swatch: 'bg-ok', edge: 'shadow-[inset_3px_0_0_var(--ok)]' },
  chg: { label: 'Changed', tone: 'warn', swatch: 'bg-warn', edge: 'shadow-[inset_3px_0_0_var(--warn)]' },
  del: {
    label: 'Removed',
    tone: 'danger',
    swatch: 'bg-danger',
    edge: 'shadow-[inset_3px_0_0_var(--danger)]',
  },
};

/** W5-09 · Version diff */
export default function VersionDiff() {
  const navigate = useNavigate();
  const toast = useToast();
  const [view, setView] = useState<'overlay' | 'list'>('overlay');

  return (
    <WorkflowEditorLayout
      title="Compare v4 → v5 · Ticket triage & reply"
      topbar={{ version: 'v4 → v5', note: 'Comparing versions' }}
      panel={
        <ConfigPanel
          label="Changes"
          header={
            <div className="flex items-center gap-2.5 px-[18px] pt-4 pb-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="text-[15px] leading-5 font-semibold text-fg">Changes</h2>
                <p className="text-body-s text-fg-3">v4 (live) → v5 (draft) · 3 steps changed</p>
              </div>
              <PanelSegmented
                size="sm"
                label="Diff view"
                value={view}
                onChange={setView}
                options={[
                  { value: 'overlay', label: 'Overlay' },
                  { value: 'list', label: 'List' },
                ]}
              />
            </div>
          }
          footer={
            <>
              <p className="flex-1 text-body-s text-fg-3">Leo Martins · edited 1 h ago</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  toast({
                    title: 'v4 restored as a new draft',
                    description: 'Your v5 changes are kept in history.',
                  });
                  navigate('/workflows/editor');
                }}
              >
                Restore v4 as new draft
              </Button>
            </>
          }
        >
          <ul aria-label="Legend" className="flex flex-wrap gap-3 text-body-s text-fg-2">
            {(Object.keys(kinds) as DiffKind[]).map((k) => (
              <li key={k} className="inline-flex items-center gap-1.5">
                <span className={cn('size-2.5 rounded-[3px]', kinds[k].swatch)} aria-hidden />
                {kinds[k].label} {versionChanges.filter((c) => c.kind === k).length}
              </li>
            ))}
          </ul>
          <ul className={cn('flex flex-col', view === 'overlay' ? 'gap-4' : 'gap-2')}>
            {versionChanges.map((c) => {
              const k = kinds[c.kind];
              return (
                <li
                  key={c.step}
                  className={cn('flex flex-col gap-2 rounded-[10px] border border-border p-3', k.edge)}
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={k.tone}
                      size="sm"
                      bordered={false}
                      className="border-transparent font-semibold"
                    >
                      {k.label}
                    </Badge>
                    <h3 className="text-13 font-semibold text-fg">{c.step}</h3>
                  </div>
                  {view === 'overlay' && (
                    <div className="flex flex-col gap-[3px]">
                      {c.lines.map((l) => (
                        <code
                          key={l.text}
                          className={cn(
                            'rounded-xs px-1.5 py-0.5 font-mono text-caption leading-[17px]',
                            l.sign === '+'
                              ? 'bg-ok-subtle text-ok-text'
                              : 'bg-danger-subtle text-danger-text',
                          )}
                        >
                          <span className="sr-only">{l.sign === '+' ? 'Added: ' : 'Removed: '}</span>
                          {l.sign} {l.text}
                        </code>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </ConfigPanel>
      }
    >
      <WorkflowCanvas mode="diff" />
    </WorkflowEditorLayout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Icon } from '@/components/icons';
import { Badge, Button, Card, Checkbox, Segmented, useToast } from '@/components/ui';
import { instructionsDiff, SUPPORT_AGENT_PATH, versions, type DiffLine } from './data';
import { AgentHeader } from './components/AgentHeader';

type DiffView = 'unified' | 'split';

const lineStyle: Record<DiffLine['kind'], string> = {
  context: 'text-fg-2',
  removed: 'bg-danger-subtle text-danger-text',
  added: 'bg-ok-subtle text-ok-text',
};
const sign: Record<DiffLine['kind'], string> = { context: ' ', removed: '−', added: '+' };

function DiffRows({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="py-1.5 font-mono text-body-s leading-5">
      {lines.map((d, i) => (
        <div key={i} className={cn('flex', lineStyle[d.kind])}>
          <span className="w-10 shrink-0 pr-2.5 text-right text-fg-3">{d.n}</span>
          <span className="w-4 shrink-0" aria-hidden>
            {sign[d.kind]}
          </span>
          {d.kind !== 'context' && (
            <span className="sr-only">{d.kind === 'added' ? 'Added: ' : 'Removed: '}</span>
          )}
          <span className="flex-1 pr-3.5 whitespace-pre-wrap">{d.text}</span>
        </div>
      ))}
    </div>
  );
}

/** W3-09 · Version history */
export default function VersionHistory() {
  const navigate = useNavigate();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>(['v4', 'v3']);
  const [view, setView] = useState<DiffView>('unified');

  const toggle = (id: string) =>
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list.slice(-1), id]));

  // Order the pair oldest → newest using the list order (newest first).
  const pair = versions.filter((v) => selected.includes(v.id)).map((v) => v.id);
  const [newer, older] = pair;
  const comparing = pair.length === 2;

  return (
    <AppShell
      active="Agents"
      role="builder"
      bare
      crumbs={[{ label: 'Agents', to: '/agents' }, { label: 'Support Agent' }]}
    >
      <AgentHeader
        tab="Versions"
        onShare={() => navigate(`${SUPPORT_AGENT_PATH}/sharing`)}
        onArchive={() => navigate(`${SUPPORT_AGENT_PATH}/archive`)}
      />

      <div className="flex flex-col items-start gap-6 px-4 pt-6 pb-8 sm:px-6 lg:flex-row lg:px-8">
        <section
          aria-labelledby="versions-title"
          className="flex w-full flex-col gap-2.5 lg:w-[280px] lg:shrink-0"
        >
          <div className="flex items-center justify-between">
            <h2 id="versions-title" className="text-h4 font-semibold">
              Versions
            </h2>
            <span className="text-body-s text-fg-3">Select 2 to compare</span>
          </div>
          <Card padding="none" className="overflow-hidden">
            <ul>
              {versions.map((v, i) => {
                const on = selected.includes(v.id);
                return (
                  <li
                    key={v.id}
                    className={cn(
                      'flex',
                      i > 0 && 'border-t border-border',
                      on && 'bg-brand-subtle shadow-[inset_3px_0_0_var(--brand)]',
                    )}
                  >
                    <Checkbox
                      checked={on}
                      onChange={() => toggle(v.id)}
                      className="flex w-full gap-3 px-3.5 py-3"
                      label={
                        <span className="flex flex-col gap-[3px]">
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-13 font-semibold">{v.id}</span>
                            {v.tag && (
                              <Badge
                                tone={v.tag === 'Live' ? 'ok' : 'neutral'}
                                size="sm"
                                dot
                                bordered={false}
                                className="border-transparent px-[7px]"
                              >
                                {v.tag}
                              </Badge>
                            )}
                          </span>
                          <span className="text-13">{v.note}</span>
                        </span>
                      }
                      description={v.meta}
                    />
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="compare-title" className="flex w-full min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id="compare-title" className="text-h4 font-semibold">
              {comparing ? (
                <>
                  Compare <span className="font-mono">{older}</span> →{' '}
                  <span className="font-mono">{newer}</span>
                </>
              ) : (
                'Compare versions'
              )}
            </h2>
            {comparing && (
              <span className="text-body-s text-fg-3">3 changes · instructions, tools, model</span>
            )}
            <span className="flex-1" />
            <Segmented
              size="sm"
              label="Diff layout"
              value={view}
              onChange={setView}
              options={[
                { value: 'unified', label: 'Unified' },
                { value: 'split', label: 'Side by side' },
              ]}
            />
          </div>

          {!comparing ? (
            <Card className="flex flex-col items-center gap-2 py-12 text-center">
              <Icon name="history" size={22} className="text-icon" />
              <p className="text-body-m font-medium">Pick two versions to see what changed</p>
              <p className="text-body-s text-fg-3">{selected.length} of 2 selected</p>
            </Card>
          ) : (
            <>
              <Card padding="none" className="overflow-hidden">
                <h3 className="border-b border-border bg-sunken px-3.5 py-2.5 text-13 font-semibold">
                  Instructions
                </h3>
                {view === 'unified' ? (
                  <DiffRows lines={instructionsDiff} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-border">
                    <div>
                      <p className="border-b border-border px-3.5 py-1.5 font-mono text-caption text-fg-3">
                        {older}
                      </p>
                      <DiffRows lines={instructionsDiff.filter((d) => d.kind !== 'added')} />
                    </div>
                    <div className="border-t border-border md:border-t-0">
                      <p className="border-b border-border px-3.5 py-1.5 font-mono text-caption text-fg-3">
                        {newer}
                      </p>
                      <DiffRows lines={instructionsDiff.filter((d) => d.kind !== 'removed')} />
                    </div>
                  </div>
                )}
              </Card>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3">
                <Card padding="sm" className="flex flex-col gap-2 p-3.5">
                  <h3 className="text-13 font-semibold">Tools</h3>
                  <p className="flex flex-wrap items-center gap-2 text-13">
                    <span className="font-mono text-ok-text">+ tickets.tag</span>
                    <span className="text-fg-3">Auto-run</span>
                  </p>
                  <p className="flex flex-wrap items-center gap-2 text-13">
                    <span className="font-mono">orders.refund</span>
                    <del className="text-fg-3">Auto-run</del>
                    <Icon name="arrow-right" size={13} className="text-fg-3" />
                    <span className="font-medium text-warn-text">Ask first</span>
                  </p>
                </Card>
                <Card padding="sm" className="flex flex-col gap-2 p-3.5">
                  <h3 className="text-13 font-semibold">Model</h3>
                  <p className="flex flex-wrap items-center gap-2 text-13">
                    <del className="text-fg-3">Model A · Fast</del>
                    <Icon name="arrow-right" size={13} className="text-fg-3" />
                    <span className="font-medium">Model B · Balanced</span>
                  </p>
                  <p className="text-body-s text-fg-3">
                    Resolution rate went from 71% to 84% after this change
                  </p>
                </Card>
              </div>

              <Card padding="sm" className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                <Icon name="history" size={18} className="text-icon" />
                <div className="min-w-48 flex-1">
                  <p className="text-13 font-medium">Restore {older} as a new draft</p>
                  <p className="text-body-s text-fg-3">v4 stays live until you publish the restored draft.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-[34px] px-3.5"
                  onClick={() =>
                    toast({
                      title: `${older} restored as draft v6`,
                      description: 'Review it, then publish when ready.',
                      action: { label: 'Open', onClick: () => navigate('/agents/new/basics') },
                    })
                  }
                >
                  Restore this version
                </Button>
              </Card>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

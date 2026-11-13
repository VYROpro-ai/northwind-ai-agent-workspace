import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { StreamingCaret } from '@/components/ai';
import { Button, Dropdown, Segmented, useToast } from '@/components/ui';
import { ChatComposer } from './components/ChatComposer';
import { ChatLayout } from './components/ChatLayout';
import { compareColumns, comparePrompt, models, type CompareColumn, type ModelId } from './data';
import { useTypewriter } from './hooks';

type Vote = 'better' | 'worse' | null;

const streamingColumn = compareColumns.find((c) => c.streaming) ?? compareColumns[0];
const streamingText = streamingColumn.paras.join('\n');
/** Model C opens three paragraphs in, matching the design. */
const streamingStart = streamingColumn.paras.slice(0, 3).join('\n').length;

function ModelPicker({ value, onChange }: { value: ModelId; onChange: (id: ModelId) => void }) {
  return (
    <Dropdown
      width={200}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2.5 text-13 font-medium text-fg transition-colors hover:bg-subtle"
        >
          {models[value].name}
          <Icon name="chevron-down" size={14} strokeWidth={2} className="text-icon" />
        </button>
      )}
      items={(Object.keys(models) as ModelId[]).map((id) => ({
        label: models[id].name,
        icon: id === value ? 'check' : undefined,
        onSelect: () => onChange(id),
      }))}
    />
  );
}

/** One model's answer: picker, status, text, usage and vote / pick actions. */
function ModelColumn({
  column,
  count,
  stopped,
  picked,
  onPick,
}: {
  column: CompareColumn;
  /** Characters shown so far (all of them unless this column is still streaming). */
  count: number;
  stopped: boolean;
  picked: boolean;
  onPick: () => void;
}) {
  const [model, setModel] = useState(column.model);
  const [vote, setVote] = useState<Vote>(column.model === 'b' ? 'better' : null);
  const full = column.paras.join('\n');
  const done = count >= full.length;
  const writing = !done && !stopped;
  const shown = full.slice(0, count).split('\n');

  const voteButton = (value: Exclude<Vote, null>, label: string) => (
    <button
      type="button"
      aria-pressed={vote === value}
      onClick={() => setVote(vote === value ? null : value)}
      className={cn(
        'inline-flex h-[30px] items-center gap-1.5 rounded-full border px-2.5 text-body-s font-medium transition-colors',
        vote === value
          ? 'border-brand-border bg-brand-subtle text-brand-text'
          : 'border-border-strong bg-surface text-fg-2 hover:bg-subtle',
      )}
    >
      <Icon name={value === 'better' ? 'thumbs-up' : 'thumbs-down'} size={13} strokeWidth={2} />
      {label}
    </button>
  );

  return (
    <section
      aria-label={models[model].name}
      className={cn(
        'flex min-h-[320px] flex-col overflow-hidden rounded-[18px] border bg-surface',
        picked || vote === 'better'
          ? 'border-brand shadow-[inset_0_0_0_0.5px_var(--brand)]'
          : 'border-border',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <ModelPicker value={model} onChange={setModel} />
        <span
          role="status"
          className={cn(
            'inline-flex items-center gap-1.5 text-body-s font-medium',
            writing ? 'text-ai-text' : stopped && !done ? 'text-fg-3' : 'text-ok-text',
          )}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          {writing ? 'Writing' : stopped && !done ? 'Stopped' : 'Done'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-3.5 py-3.5 text-13 leading-5 text-fg">
        {shown.map((p, i) => (
          <p key={i}>
            {p}
            {writing && i === shown.length - 1 && <StreamingCaret />}
          </p>
        ))}
      </div>
      <div className="flex gap-3.5 border-t border-border bg-sunken px-3 py-2 font-mono text-caption leading-4 text-fg-3">
        <span>{column.latency}</span>
        <span>{column.tokens}</span>
        <span>{column.cost}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2.5">
        {voteButton('better', 'Better')}
        {voteButton('worse', 'Worse')}
        <span className="flex-1" />
        <Button
          size="sm"
          disabled={writing}
          onClick={onPick}
          leftIcon={picked ? 'check' : undefined}
          className="h-[30px] px-3 text-body-s"
        >
          {picked ? 'Picked' : 'Pick this one'}
        </Button>
      </div>
    </section>
  );
}

/** W4-08 · Model comparison — the same prompt answered side by side. */
export default function ModelCompare() {
  const toast = useToast();
  const [cols, setCols] = useState<'2' | '3'>('3');
  const [stopped, setStopped] = useState(false);
  const [picked, setPicked] = useState<ModelId | null>(null);
  const visible = compareColumns.slice(0, cols === '2' ? 2 : 3);
  // Only Model C is still streaming when the screen opens.
  const { count: streamed, done } = useTypewriter(streamingText.length, {
    from: streamingStart,
    running: !stopped,
    step: 2,
    interval: 40,
  });
  const stillWriting = cols === '3' && !stopped && !done;

  return (
    <ChatLayout
      title="Compare models"
      role="builder"
      activeChat=""
      header={
        <>
          <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
            <h1 className="shrink-0 text-[15px] leading-5 font-semibold text-fg">Compare models</h1>
            <span className="hidden truncate text-13 text-fg-3 sm:inline">
              for Support Agent · instructions v4
            </span>
          </div>
          <Segmented
            label="Columns"
            size="sm"
            value={cols}
            onChange={setCols}
            options={[
              { value: '2', label: '2 columns' },
              { value: '3', label: '3 columns' },
            ]}
            className="hidden sm:inline-flex"
          />
        </>
      }
    >
      <div className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-4 overflow-y-auto px-3 pt-3.5 pb-4 sm:px-5">
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-body-m text-fg">
          <span className="text-body-s font-semibold tracking-[0.02em] text-fg-3 uppercase">Prompt</span>
          {comparePrompt}
        </p>
        <div
          className={cn(
            'grid flex-1 grid-cols-1 gap-3.5',
            cols === '2' ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3',
          )}
        >
          {visible.map((c) => (
            <ModelColumn
              key={c.model}
              column={c}
              count={c.streaming ? streamed : c.paras.join('\n').length}
              stopped={stopped}
              picked={picked === c.model}
              onPick={() => {
                setPicked(c.model);
                toast({
                  title: `${models[c.model].name} picked`,
                  description: 'Support Agent will use it for new chats after you publish.',
                });
              }}
            />
          ))}
        </div>
      </div>
      <div className="shrink-0 px-3 pb-4 sm:px-5 sm:pb-5">
        <ChatComposer
          placeholder="Ask all models a follow-up…"
          layout="inline"
          tools={[]}
          streaming={stillWriting}
          streamingLabel="Model C is still writing…"
          stopLabel="Stop all"
          onStop={() => setStopped(true)}
          onSend={(text) => {
            toast({ title: 'Sent to all models', description: text });
          }}
        />
      </div>
    </ChatLayout>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape } from '@/lib/hooks';
import { Icon } from '@/components/icons';
import { CitationChip, UserMessage } from '@/components/ai';
import { Button } from '@/components/ui';
import { ChatComposer } from './components/ChatComposer';
import { StandardHeader } from './components/ChatHeader';
import { ChatLayout, ChatThread, ComposerDock, PanelHeader } from './components/ChatLayout';
import { AgentTurn, ReplyActions, ThreadMessages } from './components/ChatMessages';
import { agents, sources, type Source } from './data';
import { useChatThread, useSidePanel } from './hooks';

const TITLE = 'Refund policy for double charges';
const bySource = Object.fromEntries(sources.map((s) => [s.n, s])) as Record<number, Source>;

/** Number tile shared by source cards and the citation popover. */
function SourceNumber({ source, active }: { source: Source; active?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] text-caption font-semibold',
        source.unavailable
          ? 'bg-subtle text-fg-disabled'
          : active
            ? 'bg-brand text-white'
            : source.kind === 'web'
              ? 'bg-info-subtle text-info-text'
              : 'bg-brand-subtle text-brand-text',
      )}
    >
      {source.n}
    </span>
  );
}

function Highlighted({ source }: { source: Source }) {
  return (
    <p className="text-body-s leading-[18px] text-fg-2">
      {source.before}
      {source.highlight && (
        <mark className="rounded-[2px] bg-[var(--amber-100)] px-0.5 text-fg dark:bg-[var(--amber-900)]">
          {source.highlight}
        </mark>
      )}
      {source.after}
    </p>
  );
}

/** One card in the Sources panel; the active citation gets the brand outline. */
function SourceCard({ source, active, onSelect }: { source: Source; active: boolean; onSelect: () => void }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [active]);
  return (
    <li ref={ref}>
      <div
        className={cn(
          'flex flex-col gap-2 rounded-[18px] border p-3 transition-colors',
          active
            ? 'border-brand bg-brand-subtle shadow-[inset_0_0_0_0.5px_var(--brand)]'
            : source.unavailable
              ? 'border-border bg-sunken'
              : 'border-border',
        )}
      >
        <div className="flex items-center gap-2">
          <SourceNumber source={source} active={active} />
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={active}
            className={cn(
              'min-w-0 flex-1 truncate text-left text-13 hover:underline',
              source.unavailable ? 'font-medium text-fg-2' : 'font-semibold text-fg',
            )}
          >
            {source.title}
          </button>
          {source.meta && <span className="text-caption text-fg-3">{source.meta}</span>}
          {source.tag && <span className="text-caption text-fg-3">{source.tag}</span>}
          {source.kind === 'web' && (
            <Icon name="globe" size={14} className="text-info-text" label="Web source" />
          )}
        </div>
        {source.unavailable ? (
          <span className="flex items-start gap-1.5 text-body-s text-fg-2">
            <Icon name="reject" size={12} strokeWidth={2} className="mt-0.5 shrink-0" />
            {source.footer}
          </span>
        ) : (
          <>
            <Highlighted source={source} />
            {source.kind === 'web' ? (
              <span className="font-mono text-caption text-info-text">{source.footer}</span>
            ) : (
              <span className="text-caption text-fg-3">{source.footer}</span>
            )}
          </>
        )}
      </div>
    </li>
  );
}

function SourcesPanel({
  active,
  onSelect,
  onClose,
}: {
  active: number | null;
  onSelect: (n: number) => void;
  onClose: () => void;
}) {
  const knowledge = sources.filter((s) => s.kind === 'knowledge');
  const web = sources.filter((s) => s.kind === 'web');
  return (
    <>
      <PanelHeader title="Sources" count={sources.length} onClose={onClose} />
      <div className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-3 overflow-y-auto p-4">
        {[
          { label: `From knowledge · ${knowledge.length}`, list: knowledge },
          { label: `From the web · ${web.length}`, list: web },
        ].map((group) => (
          <section key={group.label} aria-label={group.label} className="flex flex-col gap-3">
            <h3 className="text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">
              {group.label}
            </h3>
            <ul className="flex flex-col gap-3">
              {group.list.map((s) => (
                <SourceCard key={s.n} source={s} active={active === s.n} onSelect={() => onSelect(s.n)} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

/** Inline citation chip with a preview popover for the active source. */
function Cite({
  n,
  active,
  onToggle,
  onClose,
}: {
  n: number;
  active: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const source = bySource[n];
  const ref = useRef<HTMLSpanElement>(null);
  const showPreview = active && !source.unavailable;
  useClickOutside(ref, onClose, showPreview);
  useEscape(onClose, showPreview);
  return (
    <span ref={ref}>
      <CitationChip n={n} active={active} unavailable={source.unavailable} onClick={onToggle} />
      {showPreview && (
        <span
          role="dialog"
          aria-label={`Source ${n}: ${source.title}`}
          className="absolute top-full left-0 z-20 mt-1 flex w-full max-w-[350px] animate-pop-in flex-col gap-2 rounded-[18px] border border-border bg-raised p-3.5 text-left shadow-overlay md:left-40"
        >
          <span className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-sm bg-brand-subtle text-brand-text">
              <Icon name={source.kind === 'web' ? 'globe' : source.tag ? 'integration' : 'file'} size={14} />
            </span>
            <span className="min-w-0 flex-1 truncate text-13 font-semibold text-fg">{source.title}</span>
            {(source.tag || source.meta) && (
              <span className="rounded-xs bg-subtle px-1.5 py-px text-caption font-medium text-fg-2">
                {source.tag ?? source.meta}
              </span>
            )}
          </span>
          <span className="block text-body-s leading-[18px] text-fg-2">
            {source.previewLead}
            {source.before}
            {source.highlight}
            {source.after}
          </span>
          <span className="flex items-center justify-between text-caption text-fg-3">
            {source.previewFooter ?? source.footer}
            {source.to && (
              <Link to={source.to} className="text-body-s font-medium text-link underline underline-offset-2">
                Open
              </Link>
            )}
          </span>
        </span>
      )}
    </span>
  );
}

/** W4-03 · Answer with citations — chips preview and highlight their source cards. */
export default function Citations() {
  const agent = agents.support;
  const [panelOpen, setPanelOpen] = useSidePanel(true);
  const [active, setActive] = useState<number | null>(2);
  const { messages, thinking, send } = useChatThread();
  const toggle = (n: number) => setActive((a) => (a === n ? null : n));
  const cite = (n: number) => (
    <Cite n={n} active={active === n} onToggle={() => toggle(n)} onClose={() => setActive(null)} />
  );

  return (
    <ChatLayout
      title={TITLE}
      activeChat={TITLE}
      header={
        <StandardHeader
          title={TITLE}
          share={false}
          actions={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="panel-right"
              aria-pressed={panelOpen}
              onClick={() => setPanelOpen(!panelOpen)}
              className={cn(
                panelOpen && 'border-brand-border bg-brand-subtle text-brand-text hover:bg-brand-subtle',
              )}
            >
              Sources
            </Button>
          }
        />
      }
      panel={<SourcesPanel active={active} onSelect={setActive} onClose={() => setPanelOpen(false)} />}
      panelOpen={panelOpen}
      onPanelClose={() => setPanelOpen(false)}
      panelWidth={360}
      panelLabel="Sources"
    >
      <ChatThread scrollKey={messages.length + (thinking ? 1 : 0) || undefined} className="sm:px-6">
        <UserMessage meta="10:02 AM">
          What does our policy say about double charges, and has Acme Co. been refunded for one before?
        </UserMessage>
        <AgentTurn
          agent={agent}
          time="10:02 AM"
          footer={
            <ReplyActions
              copyText="When a customer is charged twice for the same order, we refund the duplicate amount in full."
              extra={
                <button
                  type="button"
                  onClick={() => setPanelOpen(true)}
                  className="inline-flex h-7 items-center gap-2 rounded-full border border-brand-border bg-brand-subtle pr-2.5 pl-1.5 text-body-s font-medium text-brand-text"
                >
                  <span className="flex -space-x-1">
                    <span className="inline-flex size-4 items-center justify-center rounded-full border border-brand-border bg-surface">
                      <Icon name="knowledge" size={9} strokeWidth={2.5} />
                    </span>
                    <span className="inline-flex size-4 items-center justify-center rounded-full border border-brand-border bg-surface text-info-text">
                      <Icon name="globe" size={9} strokeWidth={2.5} />
                    </span>
                  </span>
                  Sources ({sources.length})
                </button>
              }
            />
          }
        >
          <div className="relative flex flex-col gap-2.5">
            <p>
              When a customer is charged twice for the same order, we refund the duplicate amount in full
              within 5 business days{cite(1)}. Refunds over $100 go to a support lead for approval first.
            </p>
            <p>
              Acme Co. has no earlier refunds on record. The only duplicate is order #48213 on Oct 22{cite(2)}
              , which matches the steps on our public billing page{cite(3)}. An older FAQ also mentioned this
              {cite(4)}.
            </p>
          </div>
        </AgentTurn>

        <UserMessage>Does the same rule apply to annual plans paid by invoice?</UserMessage>
        <AgentTurn agent={agent}>
          <div className="flex items-start gap-3 rounded-[18px] border border-border bg-sunken px-3.5 py-3">
            <Icon name="zoom-out" size={18} className="mt-px shrink-0 text-fg-2" />
            <div className="flex flex-1 flex-col gap-2">
              <p className="font-medium">I couldn’t find this in your knowledge sources.</p>
              <p className="text-13 text-fg-2">
                This agent only answers from knowledge, so I won’t guess. You can ask without sources or add a
                document about invoiced plans.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-[30px]"
                  onClick={() =>
                    send('Answer without sources: does the same rule apply to annual plans paid by invoice?')
                  }
                >
                  Ask without sources
                </Button>
                <Link
                  to="/knowledge/upload"
                  className="inline-flex h-[30px] items-center rounded-full px-3 text-13 font-medium text-link hover:underline"
                >
                  Suggest a document
                </Link>
              </div>
            </div>
          </div>
        </AgentTurn>
        <ThreadMessages agent={agent} messages={messages} thinking={thinking} />
      </ChatThread>

      <ComposerDock className="sm:px-6">
        <ChatComposer placeholder={`Ask ${agent.name} anything…`} strongBorder onSend={send} />
      </ComposerDock>
    </ChatLayout>
  );
}

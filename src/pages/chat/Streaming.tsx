import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { CitationChip, StreamingCaret, UserMessage } from '@/components/ai';
import { Button } from '@/components/ui';
import { ChatComposer } from './components/ChatComposer';
import { StandardHeader } from './components/ChatHeader';
import { ChatLayout, ChatThread, ComposerDock } from './components/ChatLayout';
import { AgentTurn, FooterPill, ReplyActions, StreamStatus, ThreadMessages } from './components/ChatMessages';
import { agents, draftEmail } from './data';
import { useChatThread, useElapsed, useTypewriter } from './hooks';

const TITLE = 'Acme Co. double charge refund';
const FACTS_WEIGHT = 40;

/** Streamed segments in order; the facts table counts as one block of `FACTS_WEIGHT` characters. */
const segments = [
  draftEmail.intro,
  draftEmail.greeting,
  draftEmail.body,
  FACTS_WEIGHT,
  draftEmail.closing,
] as const;
/** Stream position where each segment starts. */
const offsets = segments.map((_, i) =>
  segments.slice(0, i).reduce<number>((sum, seg) => sum + weight(seg), 0),
);
const TOTAL = offsets[offsets.length - 1] + weight(segments[segments.length - 1]);
const STOPPED_AT = offsets[4] + draftEmail.stoppedAt.length;

function weight(seg: string | number) {
  return typeof seg === 'number' ? seg : seg.length;
}

/** Visible part of segment `i` at stream position `count`. */
function visible(i: number, count: number) {
  const seg = segments[i];
  const shown = Math.max(0, Math.min(weight(seg), count - offsets[i]));
  return typeof seg === 'number' ? shown > 0 : seg.slice(0, shown);
}

type Phase = 'writing' | 'stopped';

/** W4-02 · Streaming reply — the draft email types in; Stop leaves it in the W4-02s state. */
export default function Streaming({ stopped = false }: { stopped?: boolean }) {
  const agent = agents.support;
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>(stopped ? 'stopped' : 'writing');
  const { count, done, setCount } = useTypewriter(TOTAL, {
    from: stopped ? STOPPED_AT : 0,
    running: phase === 'writing',
    step: 2,
    interval: 30,
  });
  const status = phase === 'writing' && done ? 'done' : phase;
  const [seconds, setSeconds] = useElapsed(status === 'writing', stopped ? 4 : 0);
  const { messages, thinking, send } = useChatThread();

  const lastVisible = segments.reduce((last, _, i) => (count > offsets[i] ? i : last), 0);
  /** Caret while writing, an ellipsis once stopped — only after the last visible segment. */
  const tail = (i: number) => {
    if (i !== lastVisible || status === 'done') return null;
    return status === 'writing' ? <StreamingCaret /> : '…';
  };
  const text = (i: number) => (
    <>
      {visible(i, count)}
      {tail(i)}
    </>
  );

  const regenerate = () => {
    setCount(0);
    setSeconds(0);
    setPhase('writing');
  };

  return (
    <ChatLayout title={TITLE} activeChat={TITLE} header={<StandardHeader title={TITLE} />}>
      <ChatThread scrollKey={count + messages.length + (thinking ? 1 : 0)}>
        <UserMessage meta="9:14 AM">
          Can Acme Co. get a refund for order #48213? They were charged twice on Oct 22.
        </UserMessage>
        <AgentTurn
          agent={agent}
          time="9:14 AM"
          footer={
            <ReplyActions
              copyText="Yes. Order #48213 was charged twice, $240 each."
              extra={<FooterPill onClick={() => navigate('/chat/citations')}>Sources (2)</FooterPill>}
            />
          }
        >
          <p>
            Yes. Order #48213 was charged twice, $240 each. Under the 30-day refund policy
            <CitationChip n={1} onClick={() => navigate('/chat/citations')} /> Acme Co. qualifies for a full
            refund of the duplicate charge
            <CitationChip n={2} onClick={() => navigate('/chat/citations')} />.
          </p>
        </AgentTurn>

        <UserMessage meta="9:15 AM">
          Great — draft a reply email to Dana at Acme confirming the refund.
        </UserMessage>
        <AgentTurn
          agent={agent}
          time={status === 'done' ? '9:15 AM' : undefined}
          status={status !== 'done' && <StreamStatus state={status} seconds={seconds} />}
          footer={
            status === 'stopped' ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-[30px]"
                  onClick={() => setPhase('writing')}
                >
                  Continue writing
                </Button>
                <Button variant="secondary" size="sm" className="h-[30px]" onClick={regenerate}>
                  Regenerate
                </Button>
              </div>
            ) : (
              status === 'done' && (
                <ReplyActions
                  copyText={[draftEmail.greeting, draftEmail.body, draftEmail.closing].join('\n\n')}
                  onRegenerate={regenerate}
                />
              )
            )
          }
        >
          <p aria-live={status === 'writing' ? 'off' : 'polite'}>{text(0)}</p>
          {count > offsets[1] && (
            <div className="overflow-hidden rounded-[18px] border border-border bg-surface">
              <div className="flex flex-col gap-0.5 border-b border-border bg-sunken px-4 py-3">
                <span className="text-body-s text-fg-3">
                  To <span className="text-fg">{draftEmail.to}</span>
                </span>
                <span className="text-body-m font-semibold text-fg">{draftEmail.subject}</span>
              </div>
              <div className="flex flex-col gap-2.5 px-4 py-3.5">
                <p>{text(1)}</p>
                {count > offsets[2] && <p>{text(2)}</p>}
                {visible(3, count) && (
                  <dl
                    className={cn(
                      'grid grid-cols-[96px_minmax(0,1fr)] gap-y-1 rounded-md bg-sunken px-3 py-2.5 text-13 leading-5 sm:grid-cols-[120px_minmax(0,1fr)]',
                      'animate-fade-in',
                    )}
                  >
                    {draftEmail.facts.map((f) => (
                      <div key={f.label} className="contents">
                        <dt className="text-fg-2">{f.label}</dt>
                        <dd className={cn(f.strong && 'font-semibold')}>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {count > offsets[4] && <p>{text(4)}</p>}
              </div>
            </div>
          )}
        </AgentTurn>
        <ThreadMessages agent={agent} messages={messages} thinking={thinking} />
      </ChatThread>

      <ComposerDock>
        <ChatComposer
          placeholder={`Message ${agent.name}…`}
          layout="inline"
          tools={[]}
          labelledSend={status === 'stopped'}
          streaming={status === 'writing'}
          streamingLabel={`${agent.name} is replying…`}
          onStop={() => setPhase('stopped')}
          onSend={send}
          hint={`${agent.name} can make mistakes. Check important details against the sources.`}
        />
      </ComposerDock>
    </ChatLayout>
  );
}

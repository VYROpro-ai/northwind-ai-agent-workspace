import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Badge, Button, EmptyState, Segmented, useToast, type Tone } from '@/components/ui';
import { Icon } from '@/components/icons';
import { AnalyticsLayout } from './components/AnalyticsLayout';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { InlineSwitch } from './components/InlineSwitch';
import { RankBars, rectSegmented } from './components/Panels';
import { feedbackItems, feedbackReasons, type FeedbackItem, type FeedbackReason } from './data';

type Sentiment = 'all' | 'negative' | 'positive';
const agentOptions = ['All', 'Support Agent', 'Data Analyst', 'Sales Researcher'] as const;
const reasonOptions = ['Any', 'Wrong', 'Not helpful', 'Too slow', 'Unsafe', 'Other'] as const;
const statusOptions = ['Any', 'Not reviewed', 'Reviewed'] as const;

const reasonTone: Record<FeedbackReason, Tone> = {
  Wrong: 'danger',
  'Not helpful': 'neutral',
  'Too slow': 'warn',
  Unsafe: 'danger',
  Other: 'neutral',
};

/** W9-04 · User feedback. */
export default function Feedback() {
  const toast = useToast();
  const navigate = useNavigate();
  const [sentiment, setSentiment] = useState<Sentiment>('negative');
  const [agent, setAgent] = useState<(typeof agentOptions)[number]>('All');
  const [reason, setReason] = useState<(typeof reasonOptions)[number]>('Any');
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('Any');
  const [anonymous, setAnonymous] = useState(false);
  const [items, setItems] = useState<FeedbackItem[]>(feedbackItems);
  const [inEvalSet, setInEvalSet] = useState<string[]>([]);

  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (sentiment === 'all' || item.sentiment === sentiment) &&
          (agent === 'All' || item.agent === agent) &&
          (reason === 'Any' || item.reason === reason) &&
          (status === 'Any' || (status === 'Reviewed') === item.reviewed),
      ),
    [items, sentiment, agent, reason, status],
  );

  const markReviewed = (id: string) => {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, reviewed: true } : item)));
    toast({ title: 'Marked as reviewed' });
  };

  const addToEvalSet = (item: FeedbackItem) => {
    setInEvalSet((ids) => [...ids, item.id]);
    toast({
      title: 'Added to eval set',
      description: `${item.agent} · ${item.reason ?? 'Positive'} examples`,
      action: { label: 'Undo', onClick: () => setInEvalSet((ids) => ids.filter((x) => x !== item.id)) },
    });
  };

  return (
    <AnalyticsLayout tab="feedback" role="builder">
      <div className="flex flex-wrap items-center gap-2.5">
        <Segmented
          label="Sentiment"
          size="sm"
          className={rectSegmented}
          value={sentiment}
          onChange={setSentiment}
          options={[
            { value: 'all', label: 'All' },
            { value: 'negative', label: 'Negative' },
            { value: 'positive', label: 'Positive' },
          ]}
        />
        <FilterSelect label="Agent" value={agent} options={agentOptions} onChange={setAgent} />
        <FilterSelect label="Reason" value={reason} options={reasonOptions} onChange={setReason} />
        <FilterSelect label="Status" value={status} options={statusOptions} onChange={setStatus} />
        <span className="hidden flex-1 md:block" />
        <InlineSwitch checked={anonymous} onChange={setAnonymous}>
          Anonymous feedback
        </InlineSwitch>
      </div>

      <div className="flex flex-col items-start gap-4 lg:flex-row">
        <div className="flex w-full flex-col gap-4 lg:w-[340px] lg:shrink-0">
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <h2 className="sr-only">Satisfaction</h2>
            <div className="flex items-center gap-2.5">
              <span className="text-[30px] leading-9 font-semibold text-fg tabular">84%</span>
              <div className="flex flex-col">
                <span className="text-13 text-fg-2">thumbs up</span>
                <span className="text-body-s font-medium text-ok-text">↑ 3 pts · 1,912 ratings</span>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <h3 className="mb-2.5 flex items-center gap-1 text-body-s font-semibold text-fg-3">
                Top reasons for
                <Icon
                  name="thumbs-down"
                  size={13}
                  strokeWidth={2}
                  label="thumbs down"
                  className="text-warn-text"
                />
              </h3>
              <RankBars items={feedbackReasons} color="var(--danger)" label="Top reasons for thumbs down" />
            </div>
          </section>

          <section className="flex flex-col gap-2.5 rounded-2xl border border-ai-border bg-surface p-4">
            <h2 className="flex items-center gap-2 text-body-m font-semibold text-fg">
              <Icon name="sparkle" size={16} strokeWidth={2} className="text-ai-text" />
              This week’s themes
            </h2>
            <p className="text-13 leading-5 text-fg-2">
              Most complaints are about <b className="font-semibold text-fg">refund policy answers (14)</b>,
              mainly the damaged-item exception. 6 more say the Data Analyst is{' '}
              <b className="font-semibold text-fg">too slow</b> on large files.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() => navigate('/agents/support-agent/evaluations')}
            >
              Open the refund eval set
            </Button>
          </section>
        </div>

        <ul className="flex w-full min-w-0 flex-1 flex-col gap-3" aria-label="Feedback">
          {visible.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                {item.reason ? (
                  <Badge tone={reasonTone[item.reason]} bordered={false} className="h-5 border-transparent">
                    {item.reason}
                  </Badge>
                ) : (
                  <Badge tone="ok" icon="thumbs-up" bordered={false} className="h-5 border-transparent">
                    Helpful
                  </Badge>
                )}
                <span className="min-w-0 text-body-s text-fg-3">
                  {anonymous ? 'Anonymous' : item.author} · {item.agent} · {item.when}
                </span>
                <span className="flex-1" />
                {item.reviewed ? (
                  <Badge tone="ok" icon="check" bordered={false} className="h-5 border-transparent">
                    Reviewed
                  </Badge>
                ) : (
                  <Button variant="ghost" size="xs" className="text-13" onClick={() => markReviewed(item.id)}>
                    Mark reviewed
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="xs"
                  className="text-13"
                  leftIcon={inEvalSet.includes(item.id) ? 'check' : undefined}
                  disabled={inEvalSet.includes(item.id)}
                  onClick={() => addToEvalSet(item)}
                >
                  {inEvalSet.includes(item.id) ? 'In eval set' : 'Add to eval set'}
                </Button>
              </div>
              <blockquote className="border-l-[3px] border-border px-3 py-2 text-13 text-fg-2">
                {item.answer}
              </blockquote>
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="min-w-0 text-13 text-fg">{item.comment}</p>
                <span className="flex-1" />
                {item.chatDeleted ? (
                  <span className="text-body-s text-fg-3">Chat deleted</span>
                ) : (
                  <Link to="/chat/citations" className="text-body-s font-medium text-link hover:underline">
                    Open chat
                  </Link>
                )}
              </div>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="rounded-2xl border border-border bg-surface">
              <EmptyState
                icon="filter"
                title="No feedback matches these filters"
                description="Try another reason or status, or show all feedback."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSentiment('all');
                      setAgent('All');
                      setReason('Any');
                      setStatus('Any');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            </li>
          )}
        </ul>
      </div>
    </AnalyticsLayout>
  );
}

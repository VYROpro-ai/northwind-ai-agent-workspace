import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, Dropdown, Input, Progress, useToast } from '@/components/ui';
import { WizardStep } from './components/WizardLayout';
import { writeDraft } from '@/lib/agentDraft';

type Decision = 'pending' | 'accepted' | 'rejected';

const suggestions = [
  { id: 'window', text: '• Offer a refund only within 30 days of purchase, and cite the refund policy.' },
  { id: 'approval', text: '• Ask for approval before any refund over $100.' },
] as const;

type SuggestionId = (typeof suggestions)[number]['id'];

const variables = ['company', 'user_name', 'order_id', 'today'];
const MAX_STARTERS = 4;

function Variable({ name }: { name: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-xs bg-brand-subtle px-1.5 align-[1px] font-mono text-body-s text-brand-text">
      {`{{${name}}}`}
    </span>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="text-body-s font-semibold tracking-[0.02em] text-fg-3 uppercase">{label}</h3>
      {children}
    </div>
  );
}

/** W3-04 · Create agent — 2. Instructions */
export default function CreateInstructions() {
  const toast = useToast();
  const [decisions, setDecisions] = useState<Record<SuggestionId, Decision>>({
    window: 'pending',
    approval: 'pending',
  });
  const [choosing, setChoosing] = useState(false);
  const [starters, setStarters] = useState([
    'Where is my order?',
    'I was charged twice',
    'How do I cancel my plan?',
  ]);

  const pending = suggestions.filter((s) => decisions[s.id] === 'pending').length;

  // Keep the shared wizard draft in sync: the rendered rules above are the instructions.
  useEffect(() => {
    const accepted = suggestions.filter((s) => decisions[s.id] === 'accepted').map((s) => s.text);
    const lines = [
      'You are the support agent for {{company}}. You help customers with billing, orders and refunds.',
      '',
      'Tone: Warm and brief. Use the customer’s name, {{user_name}}. Keep replies under 120 words.',
      '',
      'MUST DO',
      '• Cite the help doc for every policy you mention.',
      ...(decisions.window === 'accepted' ? [] : ['• Offer a refund when the customer asks.']),
      ...accepted,
      '',
      'MUST NEVER DO',
      '• Share another customer’s details. • Promise delivery dates the tracker doesn’t show.',
      '',
      'Output format: Short paragraphs. End with one clear next step for the customer.',
    ];
    writeDraft({ instructions: lines.join('\n') });
  }, [decisions]);
  const decideAll = (decision: Decision) => {
    setDecisions({ window: decision, approval: decision });
    setChoosing(false);
    if (decision === 'accepted')
      toast({ title: 'Suggestions applied', description: 'Refund rules now match your policy.' });
  };
  const decide = (id: SuggestionId, decision: Decision) => setDecisions((d) => ({ ...d, [id]: decision }));

  const improve = () => {
    if (pending) return;
    setDecisions({ window: 'pending', approval: 'pending' });
    toast({ tone: 'info', title: '2 suggested changes', description: 'Review them in the editor.' });
  };

  const original = decisions.window;

  return (
    <WizardStep
      step={2}
      rhythm="dense"
      top={18}
      title="Instructions"
      description="The rules your agent always follows. Be specific about what it must and must never do."
      chatNote="Updated with your last save · 10 s ago"
      actions={
        <div className="flex gap-2">
          <Dropdown
            align="end"
            width={200}
            trigger={(props) => (
              <Button variant="secondary" size="sm" className="h-[34px]" {...props}>
                <span className="font-mono text-body-s text-brand-text">{'{ }'}</span>
                Variable
              </Button>
            )}
            items={variables.map((v) => ({
              label: <span className="font-mono text-13">{`{{${v}}}`}</span>,
              onSelect: () => toast({ tone: 'neutral', title: `Inserted {{${v}}}` }),
            }))}
          />
          <Button variant="ai" size="sm" leftIcon="ai-generate" className="h-[34px]" onClick={improve}>
            Improve with AI
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-[18px] border border-border-strong bg-surface">
        <div className="flex flex-col gap-3 px-4 py-4 text-body-m leading-[22px] sm:px-[18px]">
          <Block label="Role">
            <p>
              You are the support agent for <Variable name="company" />. You help customers with billing,
              orders and refunds.
            </p>
          </Block>
          <Block label="Tone">
            <p>
              Warm and brief. Use the customer’s name, <Variable name="user_name" />. Keep replies under 120
              words.
            </p>
          </Block>
          <Block label="Must do">
            <ul className="flex flex-col gap-1">
              <li>• Cite the help doc for every policy you mention.</li>
              {original !== 'accepted' && (
                <li
                  className={cn(
                    original === 'pending' &&
                      'rounded-xs bg-danger-subtle px-1.5 text-danger-text line-through',
                  )}
                >
                  {original === 'pending' && <span className="sr-only">Suggested removal: </span>}• Offer a
                  refund when the customer asks.
                </li>
              )}
              {suggestions.map((s) =>
                decisions[s.id] === 'rejected' ? null : (
                  <li
                    key={s.id}
                    className={cn(
                      'flex items-start gap-2',
                      decisions[s.id] === 'pending' && 'rounded-xs bg-ok-subtle px-1.5 text-ok-text',
                    )}
                  >
                    <span className="flex-1">
                      {decisions[s.id] === 'pending' && <span className="sr-only">Suggested addition: </span>}
                      {s.text}
                    </span>
                    {choosing && decisions[s.id] === 'pending' && (
                      <span className="flex shrink-0 gap-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => decide(s.id, 'accepted')}
                          className="rounded-full bg-ai px-2 text-body-s font-medium text-white hover:bg-ai-hover"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(s.id, 'rejected')}
                          className="rounded-full px-2 text-body-s font-medium text-fg-2 hover:bg-surface"
                        >
                          Reject
                        </button>
                      </span>
                    )}
                  </li>
                ),
              )}
            </ul>
          </Block>
          {pending > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-ai-border bg-ai-subtle px-2.5 py-2">
              <Icon name="ai-generate" size={14} strokeWidth={2} className="text-ai-text" />
              <span className="min-w-40 flex-1 text-body-s text-ai-text">
                {pending} suggested {pending === 1 ? 'change' : 'changes'} · makes refunds match your policy
              </span>
              <Button variant="ai" size="xs" className="h-[26px]" onClick={() => decideAll('accepted')}>
                Accept all
              </Button>
              <Button
                variant="secondary"
                size="xs"
                aria-pressed={choosing}
                className="h-[26px] border-ai-border"
                onClick={() => setChoosing(!choosing)}
              >
                Choose
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="h-[26px] px-2"
                onClick={() => decideAll('rejected')}
              >
                Reject
              </Button>
            </div>
          )}
          <Block label="Must never do">
            <p>• Share another customer’s details. • Promise delivery dates the tracker doesn’t show.</p>
          </Block>
          <Block label="Output format">
            <p>Short paragraphs. End with one clear next step for the customer.</p>
          </Block>
        </div>
        <div className="flex items-center gap-3 border-t border-border bg-sunken px-4 py-2.5 sm:px-[18px]">
          <Progress value={2} size="sm" label="Instruction tokens used" className="max-w-[200px] flex-1" />
          <span className="font-mono text-body-s text-fg-2">1,820 / 128K tokens</span>
          <span className="flex-1" />
          <span className="hidden text-body-s text-fg-3 sm:inline">Saved 10 s ago</span>
        </div>
      </div>

      <section aria-labelledby="starters-title" className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 id="starters-title" className="text-body-m font-medium">
            Conversation starters
          </h2>
          <span className="text-body-s text-fg-3">
            {starters.length} of {MAX_STARTERS}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {starters.map((s, i) => (
            <Input
              key={i}
              aria-label={`Conversation starter ${i + 1}`}
              value={s}
              placeholder="e.g. Track my parcel"
              onChange={(e) => setStarters(starters.map((x, j) => (j === i ? e.target.value : x)))}
              className="text-13"
            />
          ))}
          {starters.length < MAX_STARTERS && (
            <button
              type="button"
              onClick={() => setStarters([...starters, ''])}
              className="h-9 rounded-md border-[1.5px] border-dashed border-border-strong px-3 text-left text-13 text-fg-3 transition-colors hover:bg-subtle hover:text-fg"
            >
              + Add a starter
            </button>
          )}
        </div>
      </section>
    </WizardStep>
  );
}

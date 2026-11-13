import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, useToast } from '@/components/ui';
import { StepLibrary } from './StepLibrary';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowEditorLayout } from './WorkflowEditorLayout';

export type CanvasState = 'edit' | 'ai' | 'warn';

const AI_PROMPT = 'Add an alert to support leads if confidence < 70%';

/** W5-02 · Workflow canvas — step library, canvas and the “describe a change” AI bar. */
export function CanvasScreen({ state = 'edit' }: { state?: CanvasState }) {
  return (
    <WorkflowEditorLayout left={<StepLibrary />}>
      <WorkflowCanvas
        mode={state}
        presence={state === 'edit'}
        chromeClassName={
          state === 'ai' ? 'bottom-[176px] lg:bottom-[88px]' : 'bottom-[84px] lg:bottom-[88px]'
        }
      >
        {state === 'warn' && <IssuesCard />}
        <AiChangeBar suggesting={state === 'ai'} />
      </WorkflowCanvas>
    </WorkflowEditorLayout>
  );
}

function IssuesCard() {
  return (
    <section
      aria-label="Issues"
      className="absolute top-4 left-4 z-[3] flex w-[330px] max-w-[calc(100%-32px)] flex-col gap-2 rounded-[18px] border border-warn-border bg-surface px-3.5 py-3 shadow-overlay"
    >
      <h2 className="flex items-center gap-2 text-13 font-semibold text-warn-text">
        <Icon name="alert-triangle" size={15} strokeWidth={2} />
        Fix 2 issues to publish
      </h2>
      <ul className="flex flex-col gap-2 text-body-s leading-[17px] text-fg-2">
        <li>
          <b className="font-semibold text-fg">Reply to customer</b> · Message body is required
        </li>
        <li>
          <b className="font-semibold text-fg">Tag ticket</b> · This step will never run. Connect it to an
          earlier step.
        </li>
      </ul>
    </section>
  );
}

function AiChangeBar({ suggesting }: { suggesting: boolean }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [value, setValue] = useState(suggesting ? AI_PROMPT : '');
  // The suggested prompt has already been sent, so the send button only lights up for a new change.
  const ready = value.trim() !== '' && !(suggesting && value === AI_PROMPT);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    navigate('/workflows/editor/ai');
  };

  return (
    <div className="absolute inset-x-3 bottom-3 z-[3] flex flex-col gap-2 sm:bottom-5 lg:inset-x-auto lg:left-1/2 lg:w-[580px] lg:max-w-[calc(100%-340px)] lg:-translate-x-1/2">
      {suggesting && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-2.5 rounded-[18px] border border-ai-border bg-ai-subtle px-3 py-2.5 text-13 text-ai-text sm:flex-nowrap"
        >
          <Icon name="sparkle" size={15} strokeWidth={2} className="shrink-0" />
          <span className="min-w-0 flex-1">
            Adds 1 step after <b className="font-semibold">Classify ticket</b> that alerts support leads when
            confidence is below 70%.
          </span>
          <div className="flex gap-2">
            <Button
              variant="ai"
              size="xs"
              onClick={() => {
                toast({
                  title: 'Step added',
                  description: 'Alert support leads was added after Classify ticket.',
                });
                navigate('/workflows/editor');
              }}
            >
              Accept
            </Button>
            <Button
              variant="secondary"
              size="xs"
              className="border-ai-border"
              onClick={() => {
                toast({ title: 'Suggestion rejected', tone: 'neutral' });
                navigate('/workflows/editor');
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      )}
      <form
        onSubmit={submit}
        className="flex h-12 items-center gap-2.5 rounded-[14px] border border-border-strong bg-surface pr-2 pl-3.5 shadow-overlay focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]"
      >
        <Icon name="sparkle" size={16} strokeWidth={1.9} className="shrink-0 text-ai-text" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Describe a change"
          placeholder="Describe a change… e.g. “Skip approval for refunds under $20”"
          className="h-full min-w-0 flex-1 bg-transparent text-body-m text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
        />
        <button
          type="submit"
          aria-label="Send"
          className={cn(
            'inline-flex size-[34px] shrink-0 items-center justify-center rounded-full transition-colors',
            ready ? 'bg-ai text-white hover:bg-ai-hover' : 'bg-subtle text-fg-3',
          )}
        >
          <Icon name="arrow-up" size={15} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, Field, Input, Textarea, useToast } from '@/components/ui';
import { avatarOptions, colorOptions } from './data';
import { AgentIcon } from './components/AgentIcon';
import { WizardStep } from './components/WizardLayout';
import { readDraft, writeDraft } from '@/lib/agentDraft';

const NAME_MAX = 40;
const DESCRIPTION_MAX = 120;

/** W3-03 · Create agent — 1. Basics */
export default function CreateBasics() {
  const toast = useToast();
  const [prompt, setPrompt] = useState(
    'Answers customer billing and refund questions using our help docs, and asks a support lead before issuing refunds.',
  );
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState(() => readDraft().name);
  const [tags, setTags] = useState(() => readDraft().tags);
  const [tagDraft, setTagDraft] = useState('');
  const [description, setDescription] = useState(() => readDraft().description);
  const [avatar, setAvatar] = useState(avatarOptions[0].label);
  const [color, setColor] = useState(colorOptions[0].label);

  // Keep the shared wizard draft in sync so Test & publish can save the real agent.
  useEffect(() => {
    const option = avatarOptions.find((a) => a.label === avatar) ?? avatarOptions[0];
    writeDraft({ name, description, tags, icon: option.icon, tone: option.tone });
  }, [name, description, tags, avatar]);

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      toast({
        tone: 'info',
        title: 'Draft generated',
        description: 'Instructions filled in and 6 tools suggested.',
      });
    }, 1200);
  };

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = tagDraft.trim().toLowerCase();
    if ((e.key === 'Enter' || e.key === ',') && value) {
      e.preventDefault();
      if (!tags.includes(value)) setTags([...tags, value]);
      setTagDraft('');
    } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <WizardStep
      step={1}
      width={640}
      title="Basics"
      description="Give the agent a name and a clear job so people know when to use it."
      chatNote="Try your agent as you build — uses this draft"
    >
      <section
        aria-labelledby="describe-title"
        className="flex flex-col gap-2.5 rounded-[18px] border border-ai-border bg-ai-subtle px-4 py-3.5"
      >
        <h2 id="describe-title" className="inline-flex items-center gap-2 text-13 font-semibold text-ai-text">
          <Icon name="ai-generate" size={15} strokeWidth={2} />
          Start from a description
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <label htmlFor="agent-prompt" className="sr-only">
            Describe what the agent should do
          </label>
          <Textarea
            id="agent-prompt"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-10 flex-1 resize-none rounded-md border-ai-border text-13"
          />
          <Button
            variant="ai"
            leftIcon="ai-generate"
            loading={generating}
            className="h-10 px-3.5 text-13"
            onClick={generate}
          >
            Generate
          </Button>
        </div>
        <p className="text-body-s text-fg-2">
          Fills in instructions and suggests tools. You can edit everything after.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" hint={`${name.length} / ${NAME_MAX}`}>
          {(id, describedBy) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
            />
          )}
        </Field>
        <Field label="Tags">
          {(id) => (
            <div className="flex h-10 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-1.5 transition-[border-color,box-shadow] focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-[26px] items-center gap-1 rounded-sm bg-subtle pr-1 pl-2 text-body-s"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="rounded-xs p-0.5 text-fg-3 hover:text-fg"
                  >
                    <Icon name="close" size={11} strokeWidth={2.25} />
                  </button>
                </span>
              ))}
              <input
                id={id}
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={onTagKey}
                placeholder="Add tag"
                className="min-w-0 flex-1 bg-transparent pl-1 text-13 text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
              />
            </div>
          )}
        </Field>
      </div>

      <Field
        label="Short description"
        hint={
          <span className="flex justify-between gap-3">
            <span>Shown in the agent picker and library</span>
            <span>
              {description.length} / {DESCRIPTION_MAX}
            </span>
          </span>
        }
      >
        {(id, describedBy) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            rows={2}
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
          />
        )}
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-body-m font-medium text-fg">Avatar &amp; color</legend>
        <div className="flex flex-wrap items-center gap-2">
          {avatarOptions.map((a) => {
            const on = a.label === avatar;
            return (
              <button
                key={a.label}
                type="button"
                aria-label={a.label}
                aria-pressed={on}
                onClick={() => setAvatar(a.label)}
                className={cn(
                  'rounded-[11px] border-2 transition-shadow',
                  on ? 'border-focus shadow-[0_0_0_3px_var(--focus-ring)]' : 'border-transparent',
                )}
              >
                <AgentIcon icon={a.icon} tone={a.tone} size={40} className="rounded-[9px]" />
              </button>
            );
          })}
          <button
            type="button"
            aria-label="Upload image"
            onClick={() =>
              toast({ tone: 'neutral', title: 'Image upload', description: 'PNG or SVG, at least 128 px.' })
            }
            className="inline-flex size-11 items-center justify-center rounded-[11px] border-[1.5px] border-dashed border-border-strong text-icon hover:bg-subtle"
          >
            <Icon name="upload" size={16} />
          </button>
        </div>
        <div role="radiogroup" aria-label="Color" className="mt-1 flex gap-2.5">
          {colorOptions.map((c) => {
            const on = c.label === color;
            return (
              <button
                key={c.label}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={c.label}
                onClick={() => setColor(c.label)}
                className={cn(
                  'size-6 rounded-full ring-offset-2 ring-offset-surface transition-shadow',
                  c.swatch,
                  on && cn('ring-2', c.ring),
                )}
              />
            );
          })}
        </div>
      </fieldset>
    </WizardStep>
  );
}

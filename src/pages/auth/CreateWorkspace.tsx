import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import { Button, Field, Input } from '@/components/ui';
import { cn } from '@/lib/cn';
import { AuthHeading } from './components/AuthHeading';
import { AuthLayout } from './components/AuthLayout';
import { SetupSteps } from './components/SetupSteps';
import { takenSlugs, teamSizes, useCases, type TeamSize } from './data';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

/** Softer clean-up while typing in the URL field — keeps a trailing dash. */
const sanitizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, 40);

const choice = (on: boolean) =>
  cn(
    'border font-medium text-13 transition-colors',
    on
      ? 'border-[1.5px] border-brand bg-brand-subtle text-brand-text'
      : 'border-border-strong bg-surface text-fg hover:bg-subtle',
  );

/** W1-06 · Create workspace */
export default function CreateWorkspace() {
  const navigate = useNavigate();
  const [name, setName] = useState('Northwind Labs');
  const [slug, setSlug] = useState('northwind-labs');
  const [slugEdited, setSlugEdited] = useState(false);
  const [size, setSize] = useState<TeamSize>('11–50');
  const [useCase, setUseCase] = useState('Support');
  const [submitted, setSubmitted] = useState(false);

  const cleanSlug = slug.replace(/-+$/, '');
  const slugState = !cleanSlug ? 'empty' : takenSlugs.includes(cleanSlug) ? 'taken' : 'available';
  const nameError = submitted && !name.trim() ? 'Give your workspace a name' : undefined;

  const onName = (value: string) => {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!name.trim() || slugState !== 'available') return;
    navigate('/onboarding/invite');
  };

  return (
    <AuthLayout
      screen="workspace"
      title="Create your workspace"
      headerAside={<SetupSteps current={1} />}
      footer={false}
    >
      <form noValidate onSubmit={onSubmit} className="flex w-full max-w-[460px] flex-col gap-5">
        <AuthHeading size="md" title="Create your workspace">
          This is where your team’s agents, chats and approvals live.
        </AuthHeading>

        <div className="flex items-end gap-3">
          <LogoPicker />
          <Field label="Workspace name" error={nameError} className="min-w-0 flex-1">
            {(id, describedBy) => (
              <Input
                id={id}
                className="h-10"
                value={name}
                invalid={Boolean(nameError)}
                aria-describedby={describedBy}
                onChange={(e) => onName(e.target.value)}
              />
            )}
          </Field>
        </div>

        <Field label="Workspace URL">
          {(id) => (
            <div className="flex flex-col gap-1.5">
              <div
                className={cn(
                  'flex h-10 items-center overflow-hidden rounded-md border bg-surface transition-[border-color,box-shadow]',
                  'focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
                  slugState === 'taken' ? 'border-danger' : 'border-border-strong focus-within:border-focus',
                )}
              >
                <span className="flex h-full shrink-0 items-center border-r border-border bg-sunken px-2.5 text-body-m text-fg-3">
                  northwind.app/
                </span>
                <input
                  id={id}
                  value={slug}
                  aria-invalid={slugState === 'taken' || undefined}
                  aria-describedby={`${id}-status`}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(sanitizeSlug(e.target.value));
                  }}
                  className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-body-m text-fg outline-none focus-visible:outline-none"
                />
                {slugState === 'available' && (
                  <Icon name="check" size={16} strokeWidth={2.5} className="mr-2.5 shrink-0 text-ok-text" />
                )}
              </div>
              <span
                id={`${id}-status`}
                className={cn(
                  'text-body-s',
                  slugState === 'available' && 'text-ok-text',
                  slugState === 'taken' && 'text-danger-text',
                  slugState === 'empty' && 'text-fg-3',
                )}
              >
                {slugState === 'available' && `${cleanSlug} is available`}
                {slugState === 'taken' && `${cleanSlug} is already taken. Try another.`}
                {slugState === 'empty' && 'Letters, numbers and dashes only'}
              </span>
            </div>
          )}
        </Field>

        <div className="flex flex-col gap-2">
          <span id="team-size" className="text-body-m font-medium text-fg">
            How big is your team?
          </span>
          <div
            role="radiogroup"
            aria-labelledby="team-size"
            className="grid grid-cols-3 gap-2 sm:grid-cols-5"
          >
            {teamSizes.map((label) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={size === label}
                onClick={() => setSize(label)}
                className={cn('h-10 rounded-full', choice(size === label))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span id="use-case" className="text-body-m font-medium text-fg">
            What will you use it for first?
          </span>
          <div role="radiogroup" aria-labelledby="use-case" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {useCases.map(({ label, icon }) => {
              const on = useCase === label;
              return (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setUseCase(label)}
                  className={cn(
                    'flex h-[52px] items-center gap-2.5 rounded-[10px] px-3 text-left',
                    choice(on),
                    'text-fg',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-[7px]',
                      on ? 'bg-surface text-brand-text' : 'bg-subtle text-icon',
                    )}
                  >
                    <Icon name={icon} size={15} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-13 text-fg-3">You can change all of this later.</span>
          <Button type="submit" size="lg" rightIcon="arrow-right" className="text-[15px] leading-5">
            Continue
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

/** 64 px workspace logo with an edit badge. Picking an image previews it in place. */
function LogoPicker() {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();

  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

  return (
    <>
      <button
        type="button"
        aria-label="Change logo"
        onClick={() => input.current?.click()}
        className="relative flex size-16 shrink-0 items-center justify-center rounded-[18px] bg-fg text-surface"
      >
        {preview ? (
          <img src={preview} alt="" className="size-full rounded-[18px] object-cover" />
        ) : (
          <svg width="30" height="25" viewBox="-4 0 194 160" fill="currentColor" aria-hidden>
            <path d="M150.954 6.61475L185.54 6.63974L185.732 150.976L185.501 152.139C182.854 154.541 157.478 153.654 151.986 153.635C140.382 144.421 125.272 130.268 113.822 120.192C87.387 96.5367 60.51 73.3808 33.206 50.7357C32.721 67.0767 33.783 82.3217 34.13 98.5717C34.513 116.537 34.272 134.734 34.235 152.718C22.823 152.757 11.411 152.707 0 152.568L0.0570068 6.79175L31.888 6.82074C42.562 17.5697 60.845 32.9378 72.575 43.3068L151.775 112.967C152.205 101.108 151.358 88.5518 151.232 76.5547L150.954 6.61475Z" />
          </svg>
        )}
        <span className="absolute -right-1 -bottom-1 flex size-[22px] items-center justify-center rounded-full border border-border bg-surface text-icon">
          <Icon name="edit" size={11} strokeWidth={2.2} />
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPreview(URL.createObjectURL(file));
        }}
      />
    </>
  );
}

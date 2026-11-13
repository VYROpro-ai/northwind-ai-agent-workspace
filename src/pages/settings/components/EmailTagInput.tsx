import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { emailState } from './email';

export interface EmailTagInputProps {
  id?: string;
  value: string[];
  onChange: (emails: string[]) => void;
  isMember: (email: string) => boolean;
  placeholder?: string;
  describedBy?: string;
}

/** Tag-style email field: type and press Enter or comma (or paste a list) to turn addresses into chips. */
export function EmailTagInput({
  id,
  value,
  onChange,
  isMember,
  placeholder = 'Add more…',
  describedBy,
}: EmailTagInputProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hasProblem = value.some((e) => emailState(e, isMember) !== 'valid');

  const add = (raw: string) => {
    const next = raw
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && !value.includes(e));
    if (next.length) onChange([...value, ...Array.from(new Set(next))]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === 'Tab') && draft.trim()) {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Enter') {
      e.preventDefault();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (/[\s,;]/.test(text.trim())) {
      e.preventDefault();
      add(draft + text);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        'flex min-h-[94px] w-full cursor-text flex-wrap content-start gap-1.5 rounded-lg border bg-surface p-2 transition-[border-color,box-shadow]',
        'focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
        hasProblem ? 'border-danger' : 'border-border-strong',
      )}
    >
      <ul className="contents" aria-label="Invitees">
        {value.map((email) => {
          const state = emailState(email, isMember);
          const bad = state !== 'valid';
          return (
            <li
              key={email}
              className={cn(
                'inline-flex h-[26px] max-w-full items-center gap-1.5 rounded-full pr-1 pl-2 text-body-s font-medium',
                bad ? 'bg-danger-subtle text-danger-text' : 'bg-subtle text-fg',
              )}
            >
              {bad && <Icon name="alert-triangle" size={13} strokeWidth={2} />}
              <span className="truncate">{email}</span>
              {bad && (
                <span className="sr-only">
                  {state === 'invalid' ? '(not a valid email)' : '(already a member)'}
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove ${email}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((v) => v !== email));
                }}
                className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full opacity-70 hover:bg-surface/60 hover:opacity-100"
              >
                <Icon name="close" size={11} strokeWidth={2.5} />
              </button>
            </li>
          );
        })}
      </ul>
      <input
        ref={inputRef}
        id={id}
        type="email"
        inputMode="email"
        autoComplete="off"
        value={draft}
        placeholder={value.length ? placeholder : 'name@northwindlabs.com, …'}
        aria-describedby={describedBy}
        aria-invalid={hasProblem || undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => draft.trim() && add(draft)}
        className="h-[26px] min-w-[140px] flex-1 bg-transparent px-1.5 text-13 text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
      />
    </div>
  );
}

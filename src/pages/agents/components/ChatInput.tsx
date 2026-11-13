import { useId, useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';

/** Single-line message field with a round send button, used by the agent test chats. */
export function ChatInput({
  placeholder,
  label,
  onSend,
  busy,
  size = 'sm',
  className,
}: {
  placeholder: string;
  /** Accessible label for the text field. */
  label: string;
  onSend: (text: string) => void;
  /** Disables sending while the agent replies. */
  busy?: boolean;
  /** sm = 44 px panel input, md = 48 px full-width composer. */
  size?: 'sm' | 'md';
  className?: string;
}) {
  const id = useId();
  const [text, setText] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    onSend(text.trim());
    setText('');
  };
  const md = size === 'md';
  return (
    <form
      onSubmit={submit}
      className={cn(
        'flex items-center gap-2 border border-border-strong bg-surface transition-[border-color,box-shadow]',
        'focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
        md ? 'h-12 rounded-[18px] pr-2 pl-4' : 'h-11 rounded-[10px] pr-1.5 pl-3',
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none',
          md ? 'text-body-m' : 'text-13',
        )}
      />
      <button
        type="submit"
        aria-label="Send"
        disabled={!text.trim() || busy}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-subtle disabled:text-fg-disabled',
          md ? 'size-[34px]' : 'size-8',
        )}
      >
        <Icon name="arrow-up" size={md ? 16 : 14} strokeWidth={2} />
      </button>
    </form>
  );
}

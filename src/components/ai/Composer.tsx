import { useState, type FormEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';

export interface ComposerProps {
  placeholder?: string;
  /** While streaming, Send becomes Stop. */
  streaming?: boolean;
  onSend?: (text: string) => void;
  onStop?: () => void;
  /** Model selector or other controls on the right of the toolbar. */
  toolbarRight?: ReactNode;
  /** Attachment chips shown above the text area. */
  attachments?: ReactNode;
  hint?: ReactNode;
  className?: string;
  defaultValue?: string;
}

/** Chat composer: text area, attach / prompt / voice tools, send or stop. */
export function Composer({
  placeholder = 'Ask anything…',
  streaming,
  onSend,
  onStop,
  toolbarRight,
  attachments,
  hint,
  className,
  defaultValue = '',
}: ComposerProps) {
  const [text, setText] = useState(defaultValue);
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText('');
  };
  return (
    <div className={className}>
      <form
        onSubmit={submit}
        className={cn(
          'rounded-2xl border border-border bg-surface p-3 shadow-raised transition-[border-color,box-shadow]',
          'focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
        )}
      >
        {attachments && <div className="mb-2 flex flex-wrap gap-2">{attachments}</div>}
        {streaming ? (
          <div className="flex items-center gap-3">
            <p className="flex-1 px-1 text-body-m text-fg-3">{placeholder}</p>
            <button
              type="button"
              onClick={onStop}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-inverse px-4 text-body-m font-medium text-on-inverse"
            >
              <span className="size-2.5 rounded-[2px] bg-current" />
              Stop
            </button>
          </div>
        ) : (
          <>
            <label className="sr-only" htmlFor="composer-input">
              Message
            </label>
            <textarea
              id="composer-input"
              rows={2}
              value={text}
              placeholder={placeholder}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              className="w-full resize-none bg-transparent px-1 text-body-m text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
            />
            <div className="mt-1 flex items-center gap-1">
              <IconButton icon="paperclip" label="Attach a file" variant="ghost" size="sm" />
              <IconButton icon="slash-command" label="Saved prompts" variant="ghost" size="sm" />
              <IconButton icon="mic" label="Voice mode" variant="ghost" size="sm" />
              <div className="ml-auto flex items-center gap-2">
                {toolbarRight}
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!text.trim()}
                  className="inline-flex size-8 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-subtle disabled:text-fg-disabled"
                >
                  <Icon name="arrow-up" size={16} strokeWidth={2.25} />
                </button>
              </div>
            </div>
          </>
        )}
      </form>
      {hint && <p className="mt-2 text-center text-body-s text-fg-3">{hint}</p>}
    </div>
  );
}

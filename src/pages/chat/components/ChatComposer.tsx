import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { useToast } from '@/components/ui';

export type ComposerTool = 'attach' | 'prompts' | 'prompts-label' | 'voice';

export interface ChatComposerProps {
  placeholder: string;
  /** stacked = text above a toolbar; inline = a single row with the send button on the right. */
  layout?: 'stacked' | 'inline';
  /** Tools on the left of the toolbar (stacked) or before the send button (inline). */
  tools?: ComposerTool[];
  /** Tools just before the send button in the stacked layout. */
  trailingTools?: ComposerTool[];
  onSend?: (text: string) => void;
  /** While the agent is replying the input is replaced by a status line and a Stop button. */
  streaming?: boolean;
  streamingLabel?: string;
  stopLabel?: string;
  onStop?: () => void;
  /** "Send" text button instead of the round arrow. */
  labelledSend?: boolean;
  /** Controlled text (optional). */
  value?: string;
  onValueChange?: (value: string) => void;
  onOpenPrompts?: () => void;
  onAttach?: (files: File[]) => void;
  /** Chips shown above the text inside the card. */
  attachments?: ReactNode;
  /** Note shown above the card (e.g. an info banner). */
  notice?: ReactNode;
  hint?: ReactNode;
  /** Stronger border used on the empty New chat screen. */
  strongBorder?: boolean;
  /** Disable sending (e.g. while a file is uploading). */
  sendDisabled?: boolean;
}

const toolButton =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-icon transition-colors hover:bg-subtle hover:text-fg';

/** Chat composer matching the W4 designs: attach, saved prompts, voice, send / stop. */
export function ChatComposer({
  placeholder,
  layout = 'stacked',
  tools = ['attach', 'prompts', 'voice'],
  trailingTools = [],
  onSend,
  streaming,
  streamingLabel,
  stopLabel = 'Stop',
  onStop,
  labelledSend,
  value,
  onValueChange,
  onOpenPrompts,
  onAttach,
  attachments,
  notice,
  hint,
  strongBorder,
  sendDisabled,
}: ChatComposerProps) {
  const [inner, setInner] = useState('');
  const text = value ?? inner;
  const setText = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const canSend = text.trim().length > 0 && !sendDisabled;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend?.(text.trim());
    setText('');
  };

  const openPrompts = () => (onOpenPrompts ? onOpenPrompts() : navigate('/chat/prompts'));

  const renderTool = (tool: ComposerTool) => {
    switch (tool) {
      case 'attach':
        return (
          <button
            key={tool}
            type="button"
            aria-label="Attach files"
            title="Attach files"
            className={toolButton}
            onClick={() => fileInput.current?.click()}
          >
            <Icon name="paperclip" size={18} />
          </button>
        );
      case 'prompts':
        return (
          <button
            key={tool}
            type="button"
            aria-label="Saved prompts"
            title="Saved prompts"
            className={toolButton}
            onClick={openPrompts}
          >
            <Icon name="slash-command" size={18} />
          </button>
        );
      case 'prompts-label':
        return (
          <button
            key={tool}
            type="button"
            onClick={openPrompts}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-13 font-medium text-fg-2 transition-colors hover:bg-subtle hover:text-fg"
          >
            <Icon name="prompt-doc" size={16} className="text-icon" />
            Prompts
          </button>
        );
      case 'voice':
        return (
          <Link key={tool} to="/chat/voice" aria-label="Voice mode" title="Voice mode" className={toolButton}>
            <Icon name="mic" size={18} />
          </Link>
        );
    }
  };

  const sendButton = labelledSend ? (
    <button
      type="submit"
      disabled={!canSend}
      className="inline-flex h-9 shrink-0 items-center rounded-full bg-brand px-3.5 text-body-m font-medium text-white transition-colors hover:bg-brand-hover disabled:bg-subtle disabled:text-fg-disabled"
    >
      Send
    </button>
  ) : (
    <button
      type="submit"
      aria-label="Send message"
      disabled={!canSend}
      className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-subtle disabled:text-fg-disabled"
    >
      <Icon name="arrow-up" size={16} strokeWidth={2} />
    </button>
  );

  const textarea = (
    <>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <textarea
        id={id}
        rows={1}
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value === '/') openPrompts();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        className="field-sizing-content max-h-48 min-h-5 w-full flex-1 resize-none bg-transparent text-body-m text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
      />
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      {notice}
      <form
        onSubmit={submit}
        className={cn(
          'rounded-[14px] border bg-surface shadow-raised transition-[border-color,box-shadow]',
          'focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
          strongBorder ? 'border-border-strong' : 'border-border',
          streaming || layout === 'inline' ? 'py-3 pr-3 pl-4' : 'pt-3 pr-3 pb-2.5 pl-4',
        )}
      >
        {attachments && <div className="mb-2.5 -ml-1 flex flex-wrap gap-2">{attachments}</div>}
        {streaming ? (
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-body-m text-fg-3" aria-live="polite">
              {streamingLabel}
            </p>
            <button
              type="button"
              onClick={onStop}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-inverse px-3.5 text-body-m font-medium text-on-inverse transition-opacity hover:opacity-90"
            >
              <span aria-hidden className="size-2.5 rounded-[2px] bg-current" />
              {stopLabel}
            </button>
          </div>
        ) : layout === 'inline' ? (
          <div className="flex items-center gap-1">
            {textarea}
            {tools.map(renderTool)}
            {sendButton}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {textarea}
            <div className="flex items-center gap-1">
              {tools.map(renderTool)}
              <span className="flex-1" />
              {trailingTools.map(renderTool)}
              {sendButton}
            </div>
          </div>
        )}
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = '';
            if (!files.length) return;
            if (onAttach) onAttach(files);
            else toast({ title: `${files.length === 1 ? files[0].name : `${files.length} files`} attached` });
          }}
        />
      </form>
      {hint && <p className="text-center text-body-s text-fg-3">{hint}</p>}
    </div>
  );
}

/** Mono key chip used in composer hints: "Type / for saved prompts". */
export function HintKey({ children }: { children: ReactNode }) {
  return <kbd className="rounded-xs bg-subtle px-1 font-mono text-fg-2">{children}</kbd>;
}

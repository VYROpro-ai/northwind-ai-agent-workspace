import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Dark code block with language label and copy action. */
export function CodeBlock({
  code,
  language,
  className,
  children,
}: {
  code: string;
  language?: string;
  className?: string;
  /** Optional pre-highlighted content; falls back to `code`. */
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <div className={cn('overflow-hidden rounded-lg border border-code-border bg-code', className)}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-body-s text-[var(--slate-400)]">{language}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-sm bg-white/10 px-2 py-0.5 text-body-s font-medium text-white hover:bg-white/15"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-mono text-code-fg">{children ?? code}</pre>
    </div>
  );
}

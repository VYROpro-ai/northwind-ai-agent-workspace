import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { MASK, type JsonValue } from '../data';
import { isContainer, type Container } from './json';

function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-[var(--amber-300)]/35 text-inherit">
        {text.slice(i, i + query.length)}
      </mark>
      {highlight(text.slice(i + query.length), query)}
    </>
  );
}

/**
 * Read-only JSON tree on the dark code surface, with collapsible objects,
 * masked policy values and search highlighting.
 */
export function JsonView({
  value,
  collapsed,
  onToggle,
  query = '',
  className,
}: {
  value: JsonValue;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
  query?: string;
  className?: string;
}) {
  const q = query.trim();

  const primitive = (v: Exclude<JsonValue, Container>) => {
    if (typeof v === 'string' && v.startsWith(MASK)) {
      return (
        <span className="rounded-[3px] bg-white/12 px-1" title="Masked by policy">
          “{v.slice(MASK.length)}”
        </span>
      );
    }
    return highlight(typeof v === 'string' ? `"${v}"` : String(v), q);
  };

  const toggle = (path: string, open: boolean, name: string) => (
    <button
      type="button"
      aria-expanded={open}
      aria-label={`${open ? 'Collapse' : 'Expand'} ${name}`}
      onClick={() => onToggle(path)}
      className="absolute -ml-[2ch] w-[2ch] text-left text-[var(--slate-400)] hover:text-white"
    >
      {open ? '▾' : '▸'}
    </button>
  );

  const render = (
    key: string | null,
    v: JsonValue,
    path: string,
    depth: number,
    last: boolean,
  ): ReactNode => {
    const label = key !== null ? <>{highlight(`"${key}"`, q)}: </> : null;
    const comma = last ? '' : ',';
    const indent = { paddingLeft: `${depth * 2 + 2}ch` };
    if (!isContainer(v)) {
      return (
        <div key={path} style={indent}>
          {label}
          {primitive(v)}
          {comma}
        </div>
      );
    }
    const [open, close] = Array.isArray(v) ? ['[', ']'] : ['{', '}'];
    const entries = Array.isArray(v) ? v.map((c, i) => [String(i), c] as const) : Object.entries(v);
    const isOpen = !collapsed.has(path);
    if (!isOpen) {
      return (
        <div key={path} style={indent} className="relative">
          {toggle(path, false, key ?? 'root')}
          {label}
          <span className="text-[var(--slate-400)]">
            {open} {entries.length} {entries.length === 1 ? 'key' : 'keys'} {close}
          </span>
          {comma}
        </div>
      );
    }
    return (
      <div key={path}>
        <div style={indent} className="relative">
          {toggle(path, true, key ?? 'root')}
          {label}
          {open}
        </div>
        {entries.map(([k, c], i) =>
          render(Array.isArray(v) ? null : k, c, `${path}.${k}`, depth + 1, i === entries.length - 1),
        )}
        <div style={indent}>
          {close}
          {comma}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'scrollbar-thin overflow-x-auto rounded-md bg-code py-3 pr-3.5 pl-1.5 font-mono text-[11.5px] leading-[19px] whitespace-pre text-code-fg',
        className,
      )}
    >
      {render(null, value, '$', 0, true)}
    </div>
  );
}

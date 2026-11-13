import { cn } from '@/lib/cn';
import { tok } from '@/lib/syntax';

type JsonValue = string | number | boolean | null;

function Value({ value }: { value: JsonValue }) {
  if (typeof value === 'string') return <span className={tok.str}>&quot;{value}&quot;</span>;
  if (typeof value === 'number') return <span className={tok.num}>{value}</span>;
  return <span className={tok.kw}>{String(value)}</span>;
}

/** Read-only, syntax-coloured JSON for a flat object (tool responses, examples). */
export function JsonPanel({ data, className }: { data: Record<string, JsonValue>; className?: string }) {
  const entries = Object.entries(data);
  return (
    <pre
      className={cn(
        'scrollbar-thin overflow-x-auto rounded-md bg-code px-3.5 py-3 font-mono text-[11.5px] leading-[19px] text-code-fg',
        className,
      )}
    >
      <code>
        {'{\n'}
        {entries.map(([key, value], i) => (
          <span key={key}>
            {'  '}
            <span className={tok.key}>&quot;{key}&quot;</span>: <Value value={value} />
            {i < entries.length - 1 ? ',' : ''}
            {'\n'}
          </span>
        ))}
        {'}'}
      </code>
    </pre>
  );
}

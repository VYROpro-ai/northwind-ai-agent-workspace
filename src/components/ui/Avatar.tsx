import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';

const sizes = {
  xs: 'size-5 text-[9px]',
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-body-s',
  lg: 'size-10 text-body-m',
  xl: 'size-14 text-h4',
};

export interface AvatarProps {
  name: string;
  src?: string;
  size?: keyof typeof sizes;
  /** Presence dot. */
  status?: 'online' | 'away' | 'offline';
  className?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const fallbackTones = ['bg-brand', 'bg-ai', 'bg-ok', 'bg-warn', 'bg-info', 'bg-danger'];
function toneFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return fallbackTones[hash % fallbackTones.length];
}

/** Person avatar — always circular. Agents use <AgentAvatar> (rounded square). */
export function Avatar({ name, src, size = 'md', status, className }: AvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size])} decoding="async" />
      ) : (
        <span
          aria-label={name}
          role="img"
          className={cn(
            'inline-flex items-center justify-center rounded-full font-semibold text-white',
            sizes[size],
            toneFor(name),
          )}
        >
          {initials(name)}
        </span>
      )}
      {status && (
        <span
          className={cn(
            'absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-surface',
            status === 'online' && 'bg-ok',
            status === 'away' && 'bg-warn',
            status === 'offline' && 'bg-fg-disabled',
          )}
        />
      )}
    </span>
  );
}

const chipMinWidth = { xs: 'min-w-5', sm: 'min-w-6', md: 'min-w-8', lg: 'min-w-10', xl: 'min-w-14' };

export function AvatarGroup({
  people,
  max = 4,
  size = 'sm',
}: {
  people: { name: string; src?: string }[];
  max?: number;
  size?: AvatarProps['size'];
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((p) => (
        <Avatar key={p.name} {...p} size={size} className="rounded-full ring-2 ring-surface" />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-subtle font-medium text-fg-2 ring-2 ring-surface',
            sizes[size],
            // Grow for two-digit counts so the "+" never clips.
            'w-auto px-1 tracking-tight',
            chipMinWidth[size],
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}

const agentTones = {
  ai: 'bg-ai-subtle text-ai-text',
  brand: 'bg-brand-subtle text-brand-text',
  ok: 'bg-ok-subtle text-ok-text',
  warn: 'bg-warn-subtle text-warn-text',
  info: 'bg-info-subtle text-info-text',
  danger: 'bg-danger-subtle text-danger-text',
} as const;

export type AgentTone = keyof typeof agentTones;

/** Agent avatar — rounded square with the agent glyph or a letter. */
export function AgentAvatar({
  tone = 'ai',
  letter,
  size = 32,
  className,
}: {
  tone?: AgentTone;
  letter?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-semibold',
        agentTones[tone],
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {letter ?? <Icon name="nav-agents" size={Math.round(size * 0.55)} strokeWidth={2} />}
    </span>
  );
}

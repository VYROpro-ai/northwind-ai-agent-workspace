import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';

/** Tinted tile tones shared by source, file-type and connector icons. */
export type TileTone = 'info' | 'neutral' | 'ai' | 'warn' | 'ok' | 'brand' | 'danger';

const toneClasses: Record<TileTone, string> = {
  info: 'bg-info-subtle text-info-text',
  neutral: 'bg-subtle text-fg-2',
  ai: 'bg-ai-subtle text-ai-text',
  warn: 'bg-warn-subtle text-warn-text',
  ok: 'bg-ok-subtle text-ok-text',
  brand: 'bg-brand-subtle text-brand-text',
  danger: 'bg-danger-subtle text-danger-text',
};

/** Small tinted square with a stroke icon — source types, connectors, agents. */
export function IconTile({
  icon,
  tone = 'neutral',
  size = 28,
  iconSize = 14,
  className,
}: {
  icon: IconName;
  tone?: TileTone;
  size?: number;
  iconSize?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[7px]',
        toneClasses[tone],
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name={icon} size={iconSize} strokeWidth={1.9} />
    </span>
  );
}

const extensionTones: Record<string, TileTone> = {
  PDF: 'danger',
  DOC: 'brand',
  DOCX: 'brand',
  XLSX: 'ok',
  CSV: 'ok',
  HTML: 'info',
};

/** Lettered file-type tile (PDF, DOCX, XLSX …). */
export function FileTypeTile({
  ext,
  size = 32,
  className,
}: {
  ext: string;
  size?: number;
  className?: string;
}) {
  const label = ext.toUpperCase().slice(0, 4);
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[7px] text-[9px] font-semibold',
        toneClasses[extensionTones[label] ?? 'neutral'],
        className,
      )}
      style={{ width: size, height: size }}
    >
      {label}
    </span>
  );
}

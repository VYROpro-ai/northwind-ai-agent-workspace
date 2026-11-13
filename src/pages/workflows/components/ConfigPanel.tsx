import { useId, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { IconButton } from '@/components/ui';

export interface ConfigPanelProps {
  /** Accessible name of the panel. */
  label: string;
  header: ReactNode;
  /** Tabs row under the header. */
  tabs?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Right-hand config panel (400 px). Under `lg` it docks as a bottom sheet below the canvas. */
export function ConfigPanel({ label, header, tabs, footer, children }: ConfigPanelProps) {
  return (
    <aside
      aria-label={label}
      className={cn(
        'relative flex max-h-[58dvh] shrink-0 flex-col rounded-t-2xl border-t border-border bg-surface shadow-modal',
        'lg:max-h-none lg:w-[401px] lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none',
      )}
    >
      <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong lg:hidden" />
      {header}
      {tabs}
      <div className="flex min-h-0 flex-1 scrollbar-thin flex-col gap-4 overflow-y-auto px-[18px] py-4">
        {children}
      </div>
      {footer && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border px-[18px] py-3">
          {footer}
        </div>
      )}
    </aside>
  );
}

export interface PanelHeaderProps {
  kind?: string;
  title: string;
  icon?: IconName;
  /** Icon chip tint classes, e.g. `bg-warn-subtle text-warn-text`. */
  tint?: string;
  /** Content before the close button (status pill). */
  aside?: ReactNode;
  /** Where the close button goes. Defaults to the plain editor. */
  closeTo?: string | null;
}

/** Panel header: tinted icon chip, uppercase kind, title and a close button. */
export function PanelHeader({
  kind,
  title,
  icon,
  tint,
  aside,
  closeTo = '/workflows/editor',
}: PanelHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-[18px] pt-4 pb-3">
      {icon && (
        <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-[9px]', tint)}>
          <Icon name={icon} size={18} strokeWidth={1.8} />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {kind && (
          <span className="text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase">{kind}</span>
        )}
        <h2 className="truncate text-[15px] leading-5 font-semibold text-fg">{title}</h2>
      </div>
      {aside}
      {closeTo !== null && (
        <IconButton
          icon="close"
          label="Close panel"
          variant="ghost"
          size="xs"
          onClick={() => navigate(closeTo)}
          className="-mr-1.5 text-fg-3"
        />
      )}
    </div>
  );
}

/** Small label + control wrapper used inside config panels (12 px semibold label). */
export function PanelField({
  label,
  hint,
  error,
  aside,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  aside?: ReactNode;
  children: (id: string, describedBy?: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const msg = `${id}-msg`;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="flex-1 text-body-s font-semibold text-fg-2">
          {label}
        </label>
        {aside}
      </div>
      {children(id, hint || error ? msg : undefined)}
      {error ? (
        <p id={msg} className="text-body-s text-danger-text">
          {error}
        </p>
      ) : (
        hint && (
          <p id={msg} className="text-body-s text-fg-3">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Group heading without a control (for chip grids, read-only blocks). */
export function PanelLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-body-s font-semibold text-fg-2', className)}>{children}</h3>;
}

/** Labelled block inside a panel. */
export function PanelSection({
  label,
  aside,
  children,
  className,
}: {
  label: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-2">
        <PanelLabel className="flex-1">{label}</PanelLabel>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Row of three metric tiles (duration, tokens, cost). */
export function StatTiles({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {items.map((s) => (
        <div key={s.label} className="flex flex-col gap-0.5 rounded-md border border-border bg-sunken p-2.5">
          <dt className="text-caption leading-[13px] text-fg-3">{s.label}</dt>
          <dd className="font-mono text-body-m leading-[17px] font-semibold text-fg">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Tab strip used under panel headers. */
export const panelTabsClass =
  'gap-[18px] px-[18px] [&_[role=tab]]:h-[37px] [&_[role=tab]]:px-0 [&_[role=tab]]:text-13 ' +
  '[&_[aria-selected=true]]:font-semibold';

/** Compact select used inside config panels (13 px, 10 px inset). */
export const panelSelectClass = 'pr-8 pl-2.5 text-13';

/** Small inline text action (“+ Add rule”). */
export function TextAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start text-body-s font-medium text-link hover:underline"
    >
      {children}
    </button>
  );
}

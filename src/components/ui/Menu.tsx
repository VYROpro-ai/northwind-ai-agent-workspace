import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape } from '@/lib/hooks';
import { Icon, type IconName } from '@/components/icons';

export interface MenuItem {
  label: ReactNode;
  icon?: IconName;
  description?: ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  /** Renders a divider before this item. */
  separator?: boolean;
}

export interface DropdownProps {
  /** Render prop for the trigger; spread `props` onto a button. */
  trigger: (props: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'menu' | 'dialog';
  }) => ReactNode;
  items?: MenuItem[];
  /** Custom panel content instead of `items`. */
  children?: ReactNode;
  align?: 'start' | 'end';
  /** Popup role. Defaults to `menu` for `items` and `dialog` for custom content; pass `menu` for custom menu items. */
  panelRole?: 'menu' | 'dialog';
  width?: number;
  className?: string;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Popover menu with click-outside + Escape handling and arrow-key navigation. */
export function Dropdown({
  trigger,
  items,
  children,
  align = 'start',
  panelRole,
  width = 224,
  className,
  open: controlled,
  onOpenChange,
}: DropdownProps) {
  const [internal, setInternal] = useState(false);
  const open = controlled ?? internal;
  const setOpen = (next: boolean) => {
    setInternal(next);
    onOpenChange?.(next);
  };
  const role = panelRole ?? (children ? 'dialog' : 'menu');
  const root = useRef<HTMLDivElement>(null);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const nodes = Array.from(
      root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [],
    );
    const i = nodes.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % nodes.length : (i - 1 + nodes.length) % nodes.length;
    nodes[next]?.focus();
  };

  return (
    <div ref={root} className="relative inline-flex" onKeyDown={onKeyDown}>
      {trigger({
        onClick: () => setOpen(!open),
        'aria-expanded': open,
        'aria-haspopup': role,
      })}
      {open && (
        <div
          // Item lists are menus; custom panels (search, forms) are non-modal dialogs.
          role={role}
          style={{ width }}
          className={cn(
            'absolute top-full z-40 mt-2 max-w-[calc(100vw-32px)] animate-pop-in rounded-lg border border-border bg-raised p-1.5 shadow-overlay',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children ??
            items?.map((item, i) => (
              <div key={i}>
                {item.separator && <div className="my-1.5 h-px bg-border" role="separator" />}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onSelect?.();
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-body-m transition-colors hover:bg-subtle focus:bg-subtle focus:outline-none disabled:opacity-50',
                    item.danger ? 'text-danger-text' : 'text-fg',
                  )}
                >
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      size={16}
                      className={item.danger ? 'text-danger-text' : 'text-icon'}
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.label}</span>
                    {item.description && (
                      <span className="block text-body-s text-fg-3">{item.description}</span>
                    )}
                  </span>
                  {item.shortcut && <span className="font-mono text-caption text-fg-3">{item.shortcut}</span>}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

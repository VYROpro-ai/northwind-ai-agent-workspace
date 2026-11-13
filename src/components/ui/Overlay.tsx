import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { useEscape, useScrollLock } from '@/lib/hooks';
import { IconButton } from './IconButton';

function useFocusTrap(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
    // Focus an element marked `data-autofocus` (e.g. a search field); otherwise the dialog itself, so
    // screen readers announce it and no focus ring flashes on a button when it opens.
    (node.querySelector<HTMLElement>('[data-autofocus]') ?? node).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);
  return ref;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Footer buttons, right-aligned. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Hide the default header (for fully custom modals like the command palette). */
  bare?: boolean;
  /** Leading icon element in the header (e.g. a danger badge). */
  icon?: ReactNode;
  /** Accessible name when there is no visible `title` (e.g. `bare` modals). */
  label?: string;
  className?: string;
  children?: ReactNode;
}

const modalSizes = { sm: 'max-w-[420px]', md: 'max-w-[520px]', lg: 'max-w-[680px]', xl: 'max-w-[880px]' };

/** Accessible dialog: portal, scrim, focus trap, Escape to close, scroll lock. */
export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  bare,
  icon,
  label,
  className,
  children,
}: ModalProps) {
  const titleId = useId();
  const ref = useFocusTrap(open);
  useEscape(onClose, open);
  useScrollLock(open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-scrim" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[calc(100dvh-48px)] w-full animate-pop-in flex-col overflow-hidden rounded-t-2xl border border-border bg-raised shadow-modal outline-none sm:rounded-2xl',
          modalSizes[size],
          className,
        )}
      >
        {!bare && (title || description) && (
          <div className="flex items-start gap-3 px-6 pt-5 pb-3.5">
            {icon}
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={titleId} className="text-[18px] leading-6 font-semibold tracking-[-0.01em] text-fg">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-13 leading-[19px] text-fg-2">{description}</p>}
            </div>
            <IconButton
              icon="close"
              label="Close"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="-mt-1 -mr-2"
            />
          </div>
        )}
        <div className={cn('min-h-0 flex-1 overflow-y-auto', !bare && 'px-6 pb-4')}>{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 px-6 pt-1 pb-5">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left';
  /** Width in px on larger screens. Kit side panels are 400 wide. */
  width?: number;
  /** Accessible name when there is no visible `title` (custom headers). */
  label?: string;
  className?: string;
  children?: ReactNode;
}

/** Side sheet — notifications, detail panels, the mobile navigation. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  side = 'right',
  width = 400,
  label,
  className,
  children,
}: DrawerProps) {
  const titleId = useId();
  const ref = useFocusTrap(open);
  useEscape(onClose, open);
  useScrollLock(open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-scrim" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        style={{ width: `min(${width}px, 100vw)` }}
        className={cn(
          'absolute inset-y-0 flex flex-col border-border bg-surface shadow-modal outline-none',
          side === 'right' ? 'right-0 animate-slide-in-right border-l' : 'left-0 border-r',
          className,
        )}
      >
        {title && (
          <div className="flex items-start gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-h4 font-semibold text-fg">
                {title}
              </h2>
              {description && <p className="mt-0.5 text-body-s text-fg-3">{description}</p>}
            </div>
            <IconButton icon="close" label="Close" variant="ghost" size="sm" onClick={onClose} />
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}

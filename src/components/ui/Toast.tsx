import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';

type ToastTone = 'ok' | 'neutral' | 'info' | 'warn' | 'danger';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  action?: { label: string; onClick: () => void };
  /** Auto-dismiss after ms. Defaults to 4500. */
  duration?: number;
}

interface ToastEntry extends ToastOptions {
  id: number;
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

const dot: Record<ToastTone, string> = {
  ok: 'bg-ok',
  neutral: 'bg-fg-3',
  info: 'bg-brand',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (options: ToastOptions) => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-3), { ...options, id }]);
      window.setTimeout(() => dismiss(id), options.duration ?? 4500);
    },
    [dismiss],
  );
  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="fixed right-4 bottom-4 z-[60] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className="flex animate-pop-in items-start gap-3 rounded-lg border border-border bg-raised p-3.5 shadow-overlay"
            >
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', dot[t.tone ?? 'ok'])} />
              <div className="min-w-0 flex-1">
                <p className="text-body-m font-medium text-fg">{t.title}</p>
                {t.description && <p className="text-body-s text-fg-3">{t.description}</p>}
              </div>
              {t.action && (
                <button
                  type="button"
                  className="self-center text-body-m font-medium text-link hover:underline"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <IconButton
                icon="close"
                label="Dismiss"
                variant="ghost"
                size="xs"
                onClick={() => dismiss(t.id)}
              />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

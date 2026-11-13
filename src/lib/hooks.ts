import { useEffect, useRef, useState, type RefObject } from 'react';

/** Calls `handler` when a pointer-down happens outside the given element. */
export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void, enabled = true) {
  const saved = useRef(handler);
  useEffect(() => {
    saved.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) saved.current();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [ref, enabled]);
}

/** Calls `handler` when Escape is pressed. */
export function useEscape(handler: () => void, enabled = true) {
  const saved = useRef(handler);
  useEffect(() => {
    saved.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') saved.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enabled]);
}

/** Locks body scroll while `locked` is true. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

/** Reactive media query. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Sets the document title for the current page. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Northwind` : 'Northwind — AI Agent Workspace';
  }, [title]);
}

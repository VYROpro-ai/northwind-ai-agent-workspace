import { useEffect, useState } from 'react';

/** Tracks which section is in the upper part of the viewport, for nav highlighting. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '');
  const key = ids.join('|');

  useEffect(() => {
    const nodes = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const first = nodes.find((n) => visible.get(n.id));
        if (first) setActive(first.id);
      },
      { rootMargin: '-96px 0px -55% 0px' },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [key]);

  return active;
}

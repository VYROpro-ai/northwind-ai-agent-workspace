import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge needs to know about our custom theme keys, otherwise it can't
 * tell `text-body-m` (font size) from `text-fg` (colour) and drops one of them.
 */
const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['display', 'h1', 'h2', 'h3', 'h4', 'body-l', 'body-m', 'body-s', '13', 'caption', 'mono'],
      radius: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      shadow: ['raised', 'overlay', 'modal', 'inverse'],
    },
  },
});

/** Compose class names and resolve Tailwind conflicts (last one wins). */
export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}

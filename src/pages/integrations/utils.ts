import type { ToolField } from './data';

/** Names that appear more than once (case-insensitive). */
export function duplicateNames(fields: ToolField[]) {
  const seen = new Map<string, number>();
  fields.forEach((f) => {
    const key = f.name.trim().toLowerCase();
    if (key) seen.set(key, (seen.get(key) ?? 0) + 1);
  });
  return new Set([...seen].filter(([, n]) => n > 1).map(([name]) => name));
}

/**
 * Board tab metrics for the shared <Tabs>: 13 px labels 22 px apart, semibold when active,
 * 18 px count pills that turn brand on the active tab.
 */
export const compactTabs = [
  'gap-[22px] [&>[role=tab]]:h-[38px] [&>[role=tab]]:gap-1 [&>[role=tab]]:px-0 [&>[role=tab]]:text-13',
  '[&>[aria-selected=true]]:font-semibold',
  '[&>[role=tab]>span]:h-[18px] [&>[role=tab]>span]:min-w-[18px] [&>[role=tab]>span]:px-[5px]',
  '[&>[role=tab]>span]:leading-[18px] [&>[role=tab]>span]:font-semibold',
  '[&>[aria-selected=true]>span]:bg-brand-subtle [&>[aria-selected=true]>span]:text-brand-text',
].join(' ');

/** Table cell padding matching the designs' grid tables: 10 px column gap, 16 px row inset. */
export const boardCell = 'px-[5px] first:pl-4 last:pr-4';

/** Board form labels: 12 px semibold, secondary text. `fieldLabels` restyles a shared <Field> label. */
export const labelText = 'text-body-s font-semibold text-fg-2';
export const fieldLabels = '[&_label]:text-body-s [&_label]:font-semibold [&_label]:text-fg-2';

/** Board segmented control on the shared <Segmented>: 8 px track, 6 px squared thumbs (add a height). */
export const boardSegmented =
  'gap-0 rounded-md p-0.5 [&>button]:rounded-sm [&>button]:px-2.5 [&>button]:text-fg-3 ' +
  '[&>button[aria-checked=true]]:text-fg';

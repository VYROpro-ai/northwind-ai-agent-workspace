/** File extension from a file name, upper-cased ("Returns FAQ.docx" → "DOCX"). */
export function extensionOf(name: string) {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : 'FILE';
}

/** Human file size: "2.1 MB", "312 KB". */
export function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
}

/** Table cell padding matching the designs' grid tables: 10 px column gap, 16 px row inset. */
export const boardCell = 'px-[5px] first:pl-4 last:pr-4';

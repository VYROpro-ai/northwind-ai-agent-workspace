/** Board-style form label for billing forms: 12 px semibold, secondary text. */
export function FieldLabel({ children }: { children: string }) {
  return <span className="text-body-s font-semibold text-fg-2">{children}</span>;
}

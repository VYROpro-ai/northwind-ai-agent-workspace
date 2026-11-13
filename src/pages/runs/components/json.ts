import { MASK, type JsonValue } from '../data';

export type Container = JsonValue[] | { [key: string]: JsonValue };

export const isContainer = (v: JsonValue): v is Container => typeof v === 'object' && v !== null;

/** Every expandable path in a value — used for "Collapse all". */
export function containerPaths(value: JsonValue, path = '$'): string[] {
  if (!isContainer(value)) return [];
  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value);
  return [path, ...entries.flatMap(([k, v]) => containerPaths(v, `${path}.${k}`))];
}

/** Replaces masked markers so copied JSON never contains the raw marker. */
export function toPlainJson(value: JsonValue): string {
  return JSON.stringify(
    value,
    (_k, v: unknown) => (typeof v === 'string' && v.startsWith(MASK) ? v.slice(MASK.length) : v),
    2,
  );
}

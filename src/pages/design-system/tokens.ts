import { useState, type CSSProperties } from 'react';

/**
 * Reads the design tokens straight from the loaded stylesheet so the style guide
 * always documents what `globals.css` actually ships — no duplicated colour values.
 *
 * `light` holds every custom property declared on `:root`, `dark` the overrides
 * declared on `.dark`.
 */
export type TokenMap = Record<string, string>;

export interface TokenSheet {
  light: TokenMap;
  dark: TokenMap;
}

export type ThemeName = 'light' | 'dark';

let cache: TokenSheet | null = null;

function collect(rules: CSSRuleList, sheet: TokenSheet) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const selectors = rule.selectorText.split(',').map((s) => s.trim());
      const target = selectors.includes('.dark')
        ? sheet.dark
        : selectors.includes(':root')
          ? sheet.light
          : null;
      if (target) {
        for (const prop of Array.from(rule.style)) {
          if (prop.startsWith('--')) target[prop] = rule.style.getPropertyValue(prop).trim();
        }
      }
    }
    const nested = (rule as Partial<CSSGroupingRule>).cssRules;
    if (nested) collect(nested, sheet);
  }
}

export function readTokenSheet(): TokenSheet {
  if (cache) return cache;
  const sheet: TokenSheet = { light: {}, dark: {} };
  for (const styleSheet of Array.from(document.styleSheets)) {
    try {
      collect(styleSheet.cssRules, sheet);
    } catch {
      /* cross-origin stylesheet — not ours */
    }
  }
  if (Object.keys(sheet.dark).length) cache = sheet;
  return sheet;
}

/** Token sheet, parsed once per page load. */
export function useTokenSheet() {
  const [sheet] = useState(readTokenSheet);
  return sheet;
}

function mapFor(sheet: TokenSheet, theme: ThemeName): TokenMap {
  return theme === 'dark' ? { ...sheet.light, ...sheet.dark } : sheet.light;
}

/** Follows `var()` references until a literal colour / shadow remains. */
export function resolveToken(sheet: TokenSheet, name: string, theme: ThemeName): string {
  const map = mapFor(sheet, theme);
  let value = map[name] ?? '';
  for (let depth = 0; depth < 6 && value.includes('var('); depth++) {
    value = value.replace(/var\((--[\w-]+)\)/g, (_match, ref: string) => map[ref] ?? '');
  }
  return value;
}

/** Short label for a token: the primitive it points at (`slate-600`) or its literal value. */
export function describeToken(sheet: TokenSheet, name: string, theme: ThemeName): string {
  const raw = mapFor(sheet, theme)[name] ?? '';
  const alias = raw.match(/^var\(--([\w-]+)\)$/);
  return alias ? alias[1] : raw;
}

/**
 * Inline style that re-declares the light semantic tokens, so a subtree renders
 * in light mode even while `<html>` carries `.dark`. Pair with `className="dark"`
 * for the opposite case.
 */
export function lightScopeStyle(sheet: TokenSheet): CSSProperties {
  const style: Record<string, string> = { colorScheme: 'light' };
  for (const key of Object.keys(sheet.dark)) {
    if (sheet.light[key]) style[key] = sheet.light[key];
  }
  return style as CSSProperties;
}

/** Reads custom properties as currently computed on `<html>`. */
export function readComputedVars(names: string[]): TokenMap {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(names.map((n) => [n, styles.getPropertyValue(n).trim()]));
}

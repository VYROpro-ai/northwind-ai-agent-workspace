# Theming & design tokens

All visual decisions live in **`src/styles/globals.css`**. Components never use raw hex values.

## Token layers

| Layer | Example | Used by |
|---|---|---|
| Primitives | `--cobalt-600`, `--slate-200`, `--violet-500` | Semantic tokens only |
| Semantic | `--surface`, `--fg-2`, `--brand`, `--ai-subtle`, `--danger-text` | Components & screens (via Tailwind) |

Semantic tokens are declared twice — in `:root` (light) and in `.dark` (dark). The `@theme inline` block maps
them to Tailwind, which generates utilities like `bg-surface`, `text-fg-2`, `border-brand-border`, `shadow-overlay`.

### Semantic families

| Family | Tokens | Purpose |
|---|---|---|
| Background | `canvas` `page` `surface` `raised` `sunken` `subtle` `panel` `inverse` | Page, cards, wells, hovers |
| Border | `border` `border-strong` `focus` | Dividers, inputs, focus rings |
| Text & icon | `fg` `fg-2` `fg-3` `fg-disabled` `icon` `icon-muted` `link` `on-inverse` | Content hierarchy (≥ 4.5:1 on surfaces) |
| Brand | `brand` `brand-hover` `brand-press` `brand-subtle` `brand-text` `brand-border` | Primary actions |
| AI | `ai` `ai-subtle` `ai-text` `ai-border` `ai-caret` | Anything an agent writes — never decoration |
| Status | `ok-*` `warn-*` `danger-*` `info-*` | Pills, banners, inline alerts |
| Data | `chart-1` … `chart-6` `chart-grid` `chart-axis` | Chart series |

Status is always shown with an icon **and** a word, never colour alone.

## Rebranding

1. Pick a new brand scale and replace the `--cobalt-*` primitives — or point `--brand*` at another scale.
2. Check both the `:root` and `.dark` blocks.
3. Update `public/favicon.svg` and `src/components/brand/Logo.tsx`.

## Light / dark / system

`ThemeProvider` (`src/lib/theme.tsx`) stores the preference in `localStorage` (`northwind-theme`) and toggles the
`dark` class on `<html>`. A tiny inline script in `index.html` applies it before first paint, so there is no flash.

```tsx
import { useTheme } from '@/lib/theme';

const { theme, preference, setPreference, toggle } = useTheme();
setPreference('system');
```

Use the `dark:` variant only for the rare one-off colour without a semantic token:
`bg-[var(--amber-100)] dark:bg-[var(--amber-900)]`.

## Typography

Geist (UI) and Geist Mono (code, IDs, logs) are self-hosted in `public/fonts`.

| Utility | Size / line height |
|---|---|
| `text-display` | 48 / 56 |
| `text-h1` … `text-h4` | 32/40 · 24/32 · 20/28 · 16/24 |
| `text-body-l` · `text-body-m` · `text-body-s` | 16/24 · 14/20 · 12/16 |
| `text-13` · `text-caption` · `text-mono` | 13/18 · 11/14 · 13/20 |

## Radius & elevation

`rounded-xs` 4 · `sm` 6 · `md` 8 · `lg` 12 · `xl` 16 · `2xl` 20 · `3xl` 28.
Shadows: `shadow-raised` (cards, nodes, composer), `shadow-overlay` (menus, popovers, toasts),
`shadow-modal` (dialogs, drawers), `shadow-inverse` (dark pills). In dark mode elevation also steps up the surface.

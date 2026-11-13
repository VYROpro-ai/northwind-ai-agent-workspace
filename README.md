# Northwind — AI Agent Workspace

A production-ready React template for building, running and governing AI agents with a team.
101 screens across 12 product areas, a full design-token system with light and dark themes,
and a reusable component library for chat, tool calls, approvals, workflows and analytics.

- **Stack:** React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router
- **Zero backend:** every screen runs on typed mock data, so you can wire in your own API.
- **Light & dark:** one semantic token layer, switchable at runtime (persisted, respects the OS setting).
- **Responsive:** 360 px phones to wide desktops; the sidebar becomes a drawer below 1024 px.
- **Accessible:** semantic HTML, labelled controls, focus rings, focus-trapped dialogs, reduced-motion support.
- **Lightweight:** no UI framework or chart library — charts are hand-built SVG components.

---

## Quick start

Requirements: **Node.js 22.22+** (LTS) and npm 10+.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The [screen index](http://localhost:5173/screens) lists every
screen, and [/design-system](http://localhost:5173/design-system) shows the tokens and components.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler only |
| `npm run lint` | ESLint (TypeScript, React Hooks rules) |
| `npm run format` | Format with Prettier (+ Tailwind class sorting) |

---

## What's inside

| Area | Screens |
|---|---|
| 01 Auth & onboarding | Sign in, sign up, SSO, verify email, reset password, create workspace, invite team, choose template |
| 02 Home | Overview dashboard, first-run home, activity feed, notifications panel |
| 03 Agents | Library, agent detail, 5-step create wizard with live test chat, settings, versions, templates, archive, sharing |
| 04 Chat | New chat, agent picker, streaming, stopped, citations, tool calls, reasoning, plan & confirm, file analysis, model compare, prompt library, voice mode |
| 05 Workflows | List, canvas editor (AI suggestion & validation states), node picker, node config, conditions, triggers, test run, debugger, version diff, publish |
| 06 Runs & approvals | Runs list, run timeline, step trace, failed run, approvals queue & detail (approved / self-approval blocked), live logs, alerts, incidents, evaluations |
| 07 Knowledge | Sources, upload, connect source, indexing, document chunks, retrieval test, sync settings |
| 08 Integrations | Directory, integration detail, permission consent, API keys, webhooks, custom tool editor |
| 09 Analytics | Usage, token & cost (over-budget forecast), agent performance, feedback, latency, export |
| 10 Admin | Members, roles, invite, audit log, security, data & privacy, workspace settings, guardrails |
| 11 Billing | Plans, plan usage, invoices, payment method, limit-reached upgrade |
| 12 Account & system | Profile, preferences, notification settings, ⌘K command palette, 404, maintenance |

---

## Project structure

```
northwind/
├── public/
│   ├── fonts/              Geist & Geist Mono (SIL OFL 1.1)
│   ├── images/             avatars, tour photo, workspace logo
│   ├── favicon.svg
│   └── _redirects          SPA fallback for Netlify
├── src/
│   ├── styles/globals.css  Design tokens (primitives → semantic, light/dark) + Tailwind theme
│   ├── components/
│   │   ├── ui/             Button, Badge, Avatar, Card, inputs, Tabs, Modal, Drawer, Dropdown, Table, Toast …
│   │   ├── ai/             Messages, Composer, ToolCall, ReasoningBlock, citations, token meter …
│   │   ├── charts/         Sparkline, LineChart, BarChart, BarList, Donut, Gauge (SVG)
│   │   ├── icons/          180 stroke icons on a 24 px grid
│   │   ├── app/            Sidebar, Topbar, SettingsNav, CommandPalette, NotificationsPanel
│   │   └── brand/          Northwind and workspace logos
│   ├── layouts/AppShell.tsx  Sidebar + top bar + main, responsive
│   ├── pages/<area>/       One folder per product area; local components/ and data.ts
│   ├── routes/             screens.ts (route table) and router.tsx
│   ├── data/               Shared mock people and navigation
│   └── lib/                cn(), theme provider, hooks, formatters
├── docs/                   Guides (theming, components, customising, deployment)
└── index.html
```

---

## Theming in 30 seconds

Colours live in two layers in `src/styles/globals.css`:

1. **Primitives** — `--cobalt-600`, `--slate-200` … raw palette.
2. **Semantic tokens** — `--surface`, `--fg-2`, `--brand`, `--ai-subtle`, `--danger-text` … remapped under `.dark`.

Tailwind utilities are generated from the semantic layer, so components read like
`bg-surface text-fg-2 border-border`. To rebrand, change `--brand*` (and optionally `--ai*`) in both the
`:root` and `.dark` blocks — every screen follows. See [docs/THEMING.md](docs/THEMING.md).

---

## Documentation

- [Getting started](docs/GETTING_STARTED.md)
- [Theming & tokens](docs/THEMING.md)
- [Components](docs/COMPONENTS.md)
- [Adding a screen & connecting data](docs/CUSTOMIZING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Changelog](CHANGELOG.md) · [License](LICENSE.md) · [Credits](docs/CREDITS.md)

## Browser support

Latest two versions of Chrome, Edge, Firefox and Safari (desktop and mobile).

## Support

Questions or bug reports: **babar@zaptatech.com** — we reply within 2 business days.

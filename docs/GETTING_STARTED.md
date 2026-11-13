# Getting started

## 1. Install

```bash
npm install
```

Node.js 22.22 or newer (current LTS) is required (`.nvmrc` pins the major version — run `nvm use` if you use nvm).

## 2. Run

```bash
npm run dev
```

Open <http://localhost:5173>. Useful entry points:

| URL | What you'll see |
|---|---|
| `/` | Overview dashboard |
| `/screens` | Index of every screen with its kit ID (e.g. `W4-02`) |
| `/design-system` | Tokens, type, icons and live components |
| `/sign-in` | Start of the auth & onboarding flow |

Press **⌘K** (Ctrl+K on Windows/Linux) anywhere in the app to open the command palette.

## 3. Build

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

## 4. Code quality

```bash
npm run typecheck
npm run lint
npm run format
```

The project ships with strict TypeScript, ESLint (typescript-eslint + React Hooks) and Prettier
with automatic Tailwind class ordering. Recommended VS Code extensions are listed in `.vscode/extensions.json`.

## Editor tip

Install the **Tailwind CSS IntelliSense** extension: it reads `src/styles/globals.css`, so it autocompletes
the semantic utilities (`bg-surface`, `text-fg-2`, `border-ai-border` …).

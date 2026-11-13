# Customising

## Add a screen

1. Create the page component, e.g. `src/pages/agents/AgentLogs.tsx`:

   ```tsx
   import { AppShell } from '@/layouts/AppShell';
   import { Card } from '@/components/ui';

   /** Agent logs */
   export default function AgentLogs() {
     return (
       <AppShell active="Agents" crumbs={[{ label: 'Agents', to: '/agents' }, { label: 'Logs' }]}>
         <Card>…</Card>
       </AppShell>
     );
   }
   ```

2. Register it in `src/routes/screens.ts`:

   ```ts
   { id: 'X-01', title: 'Agent logs', epic: 'agents', path: '/agents/support-agent/logs',
     Component: lazy(() => import('@/pages/agents/AgentLogs')) },
   ```

   It is code-split automatically and appears in the `/screens` index and the ⌘K palette.

3. Add it to the sidebar if needed in `src/data/navigation.ts`.

## Connect real data

Every area keeps its mock data in `src/pages/<area>/data.ts` with TypeScript types. Replace an import of mock
data with your data-fetching hook of choice (TanStack Query, SWR, React Router loaders …) that returns the same
type — the components don't need to change.

## Remove what you don't need

Delete the page folder and its rows in `src/routes/screens.ts`. Nothing else depends on page folders.

## Remove the demo index pages

`/screens` and `/design-system` are for evaluation. Delete their routes in `src/routes/router.tsx`
(and the files in `src/pages/ScreensIndex.tsx`, `src/pages/design-system/`) before shipping.

## Authentication

The auth screens are UI only. Hook their submit handlers to your provider and protect routes by wrapping
the authenticated routes in a guard element in `src/routes/router.tsx`.

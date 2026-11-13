import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { screens } from './screens';

const ScreensIndex = lazy(() => import('@/pages/ScreensIndex'));
const DesignSystem = lazy(() => import('@/pages/design-system/DesignSystem'));
const NotFound = lazy(() => import('@/pages/system/NotFound'));
const AgentDetail = lazy(() => import('@/pages/agents/AgentDetail'));
const NewChat = lazy(() => import('@/pages/chat/NewChat'));

function PageFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas text-fg-3">
      <Spinner size={24} />
    </div>
  );
}

function Root() {
  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </>
  );
}

/** Routes that stay public even when Supabase is configured. */
const PUBLIC_PATHS = new Set([
  '/sign-in',
  '/sign-up',
  '/reset-password',
  '/verify-email',
  '/sso',
  '/screens',
  '/design-system',
]);

/**
 * Demo mode (no env vars): everything is visible, as today. Configured mode:
 * show a spinner while auth resolves, then redirect anonymous visitors to /sign-in.
 */
function RequireAuth() {
  const { authLoading, session } = useAuth();
  if (!isSupabaseConfigured) return <Outlet />;
  if (authLoading) return <PageFallback />;
  if (!session) return <Navigate to="/sign-in" replace />;
  return <Outlet />;
}

const page = (node: ReactNode) => node;

const publicScreens = screens.filter((s) => PUBLIC_PATHS.has(s.path));
const guardedScreens = screens.filter((s) => !PUBLIC_PATHS.has(s.path));

export const router = createBrowserRouter(
  [
    {
      element: <Root />,
      children: [
        ...publicScreens.map(({ path, Component }) => ({ path, element: page(<Component />) })),
        { path: '/screens', element: <ScreensIndex /> },
        { path: '/design-system', element: <DesignSystem /> },
        {
          element: <RequireAuth />,
          children: [
            ...guardedScreens.map(({ path, Component }) => ({ path, element: page(<Component />) })),
            { path: '/agents/:id', element: <AgentDetail /> },
            { path: '/chat/:id', element: <NewChat /> },
            { path: '*', element: <NotFound /> },
          ],
        },
      ],
    },
  ],
  { basename: '/northwind-ai-agent-workspace' },
);

import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router';
import { Spinner } from '@/components/ui/Spinner';
import { screens } from './screens';

const ScreensIndex = lazy(() => import('@/pages/ScreensIndex'));
const DesignSystem = lazy(() => import('@/pages/design-system/DesignSystem'));
const NotFound = lazy(() => import('@/pages/system/NotFound'));

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

const page = (node: ReactNode) => node;

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      ...screens.map(({ path, Component }) => ({ path, element: page(<Component />) })),
      { path: '/screens', element: <ScreensIndex /> },
      { path: '/design-system', element: <DesignSystem /> },
      { path: '*', element: <NotFound /> },
    ],
  },
],
  { basename: '/northwind-ai-agent-workspace' },
);

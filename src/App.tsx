import { RouterProvider } from 'react-router';
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from '@/components/ui/Toast';
import { router } from '@/routes/router';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  );
}

import { cn } from '@/lib/cn';
import { useTheme } from '@/lib/theme';
import { Icon } from '@/components/icons';

/** Sun / moon pill used in the top bar. */
export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setPreference } = useTheme();
  const item = (value: 'light' | 'dark') =>
    cn(
      'inline-flex size-[30px] items-center justify-center rounded-full transition-colors',
      theme === value ? 'bg-inverse text-on-inverse' : 'text-fg-2 hover:text-fg',
    );
  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        'flex items-center gap-0.5 rounded-full border border-border bg-sunken p-[3px]',
        className,
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        aria-label="Light theme"
        className={item('light')}
        onClick={() => setPreference('light')}
      >
        <Icon name="sun" size={15} strokeWidth={2} />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        aria-label="Dark theme"
        className={item('dark')}
        onClick={() => setPreference('dark')}
      >
        <Icon name="moon" size={15} strokeWidth={2} />
      </button>
    </div>
  );
}

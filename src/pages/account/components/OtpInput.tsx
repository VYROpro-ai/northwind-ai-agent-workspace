import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

/**
 * One-time code input: one box per digit, auto-advance, backspace to go back and paste support.
 * `value` keeps positions — empty boxes are spaces (trailing spaces trimmed).
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => (value[i] ?? '').trim());

  const setDigit = (i: number, digit: string) => {
    const next = digits.slice();
    next[i] = digit;
    onChange(
      next
        .map((d) => d || ' ')
        .join('')
        .trimEnd(),
    );
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault();
      setDigit(i - 1, '');
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1.5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(node) => {
            refs.current[i] = node;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={d}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, '').slice(-1);
            setDigit(i, digit);
            if (digit && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-11 w-9 rounded-md border border-border-strong bg-surface text-center font-mono text-[18px] font-semibold text-fg transition-[border-color,box-shadow] outline-none sm:w-10',
            'focus:border-focus focus:shadow-[0_0_0_3px_var(--focus-ring)] focus-visible:outline-none',
          )}
        />
      ))}
    </div>
  );
}

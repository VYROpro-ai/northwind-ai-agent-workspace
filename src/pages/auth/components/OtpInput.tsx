import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

export interface OtpInputProps {
  /** One string per box ('' when empty). */
  value: string[];
  onChange: (value: string[]) => void;
  /** Index of the box to focus on mount. */
  autoFocusIndex?: number;
  label: string;
  invalid?: boolean;
}

/** Six one-digit boxes. Typing moves forward, Backspace moves back, pasting fills every box. */
export function OtpInput({ value, onChange, autoFocusIndex, label, invalid }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocusIndex !== undefined) refs.current[autoFocusIndex]?.focus();
  }, [autoFocusIndex]);

  const focus = (index: number) => {
    const box = refs.current[Math.max(0, Math.min(value.length - 1, index))];
    box?.focus();
    box?.select();
  };

  const setDigit = (index: number, digit: string) => {
    const next = [...value];
    next[index] = digit;
    onChange(next);
  };

  const onInput = (index: number, raw: string) => {
    let digits = raw.replace(/\D/g, '');
    if (!digits) return setDigit(index, '');
    // Typing into a filled box without a selection appends: keep the new digit only.
    if (digits.length === 2 && value[index]) digits = digits.replace(value[index], '');
    if (digits.length > 1) return fill(index, digits);
    setDigit(index, digits);
    if (index < value.length - 1) focus(index + 1);
  };

  const fill = (start: number, digits: string) => {
    const next = [...value];
    digits
      .slice(0, value.length - start)
      .split('')
      .forEach((d, i) => (next[start + i] = d));
    onChange(next);
    focus(Math.min(start + digits.length, value.length - 1));
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, '');
      focus(index - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focus(index + 1);
    }
  };

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!digits) return;
    event.preventDefault();
    fill(index, digits);
  };

  return (
    <div role="group" aria-label={label} className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1} of ${value.length}`}
          aria-invalid={invalid || undefined}
          onChange={(event) => onInput(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
          onFocus={(event) => event.target.select()}
          className="h-14 w-full min-w-0 rounded-[10px] border border-border-strong bg-surface text-center font-mono text-[24px] leading-8 text-fg caret-fg transition-[border-color,box-shadow] outline-none focus:border-focus focus:shadow-[0_0_0_3px_var(--focus-ring)] focus-visible:outline-none aria-[invalid=true]:border-danger"
        />
      ))}
    </div>
  );
}

import { useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/icons';
import { IconButton, Input, type InputProps } from '@/components/ui';
import { cn } from '@/lib/cn';

/** Password field with a working show/hide toggle and a Caps Lock warning. */
export function PasswordInput({
  className,
  size = 'lg',
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: Omit<InputProps, 'type'>) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const readCaps = (event: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState('CapsLock'));

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        size={size}
        className={cn(!visible && props.value ? 'tracking-[0.1em]' : '', className)}
        onKeyDown={(event) => {
          readCaps(event);
          onKeyDown?.(event);
        }}
        onKeyUp={(event) => {
          readCaps(event);
          onKeyUp?.(event);
        }}
        onBlur={(event) => {
          setCapsLock(false);
          onBlur?.(event);
        }}
        rightSlot={
          <IconButton
            icon={visible ? 'eye-off' : 'eye'}
            label={visible ? 'Hide password' : 'Show password'}
            variant="ghost"
            size={size === 'lg' ? 'md' : 'sm'}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          />
        }
      />
      {capsLock && (
        <span role="status" className="inline-flex items-center gap-1.5 text-body-s text-warn-text">
          <Icon name="arrow-up" size={12} strokeWidth={2.25} />
          Caps Lock is on
        </span>
      )}
    </div>
  );
}

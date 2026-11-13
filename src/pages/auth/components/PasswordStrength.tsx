import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { checkPassword, type PasswordChecks } from '../password';

const levels = [
  { label: 'Too short', bar: 'bg-danger', text: 'text-danger-text' },
  { label: 'Weak', bar: 'bg-danger', text: 'text-danger-text' },
  { label: 'Fair', bar: 'bg-warn', text: 'text-warn-text' },
  { label: 'Strong', bar: 'bg-ok', text: 'text-ok-text' },
  { label: 'Very strong', bar: 'bg-ok', text: 'text-ok-text' },
];

const rules: { key: keyof PasswordChecks; label: string }[] = [
  { key: 'length', label: '8+ characters' },
  { key: 'number', label: 'One number' },
  { key: 'symbol', label: 'One symbol' },
];

/** Four-segment strength meter with an optional checklist of rules. */
export function PasswordStrength({ value, showRules }: { value: string; showRules?: boolean }) {
  const { checks, score } = checkPassword(value);
  const level = levels[value ? score : 0];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          role="meter"
          aria-label="Password strength"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={score}
          aria-valuetext={level.label}
          className="grid flex-1 grid-cols-4 gap-1"
        >
          {[1, 2, 3, 4].map((step) => (
            <span key={step} className={cn('h-1 rounded-full', score >= step ? level.bar : 'bg-subtle')} />
          ))}
        </div>
        <span aria-hidden className={cn('text-body-s font-medium', value ? level.text : 'text-fg-3')}>
          {value ? level.label : 'Enter a password'}
        </span>
      </div>
      {showRules && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-body-s">
          {rules.map((rule) => (
            <li
              key={rule.key}
              className={cn(
                'inline-flex items-center gap-1',
                checks[rule.key] ? 'text-ok-text' : 'text-fg-3',
              )}
            >
              <Icon name={checks[rule.key] ? 'check' : 'dot'} size={12} strokeWidth={2.5} />
              {rule.label}
              <span className="sr-only">{checks[rule.key] ? '(done)' : '(missing)'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

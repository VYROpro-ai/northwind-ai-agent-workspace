export interface PasswordChecks {
  length: boolean;
  number: boolean;
  symbol: boolean;
  long: boolean;
}

/** Scores a password 0–4: 8+ chars, a number, a symbol, and 16+ chars each add a point. */
export function checkPassword(value: string): { checks: PasswordChecks; score: number } {
  const checks = {
    length: value.length >= 8,
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
    long: value.length >= 16,
  };
  return { checks, score: Object.values(checks).filter(Boolean).length };
}

/** Loose work-email check used for inline validation. */
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

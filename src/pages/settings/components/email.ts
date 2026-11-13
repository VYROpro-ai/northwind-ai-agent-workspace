const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type EmailChipState = 'valid' | 'invalid' | 'member';

/** Classifies an address: malformed, already in the workspace, or good to invite. */
export function emailState(email: string, isMember: (email: string) => boolean): EmailChipState {
  if (!EMAIL.test(email)) return 'invalid';
  if (isMember(email)) return 'member';
  return 'valid';
}

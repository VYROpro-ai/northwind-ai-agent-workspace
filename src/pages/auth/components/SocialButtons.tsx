import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import googleMark from '../assets/google.svg';

/** "Continue with Google" + "Continue with SSO" pair under the auth forms. */
export function SocialButtons({
  verb,
  onGoogle,
  onSso,
  compact,
}: {
  /** "Sign in" or "Sign up". */
  verb: string;
  onGoogle: () => void;
  onSso: () => void;
  /** 40 px buttons (sign-up) instead of 42 px. */
  compact?: boolean;
}) {
  const size = compact ? 'h-10 gap-2' : 'h-[42px] gap-2.5';
  return (
    <div className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2">
      <Button variant="secondary" className={cn('text-13', size)} onClick={onGoogle}>
        <img src={googleMark} alt="" width={compact ? 16 : 18} height={compact ? 16 : 18} />
        {verb} with Google
      </Button>
      <Button
        variant="secondary"
        leftIcon="key"
        className={cn('text-13 [&>svg]:text-icon', size)}
        onClick={onSso}
      >
        {verb} with SSO
      </Button>
    </div>
  );
}

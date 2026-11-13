import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import { Button, useToast } from '@/components/ui';
import { AuthHeading } from './components/AuthHeading';
import { AuthLayout } from './components/AuthLayout';
import { OtpInput } from './components/OtpInput';
import { signedInUser } from './data';

const RESEND_AFTER = 42;
const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** W1-04 · Verify email */
export default function VerifyEmail() {
  const navigate = useNavigate();
  const toast = useToast();
  const [code, setCode] = useState(['4', '8', '2', '9', '', '']);
  const [seconds, setSeconds] = useState(RESEND_AFTER);
  const [loading, setLoading] = useState(false);
  const complete = code.every(Boolean);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!complete) return;
    setLoading(true);
    window.setTimeout(() => navigate('/onboarding/workspace'), 600);
  };

  const resend = () => {
    setSeconds(60);
    setCode(['', '', '', '', '', '']);
    toast({ title: 'New code sent', description: `Check ${signedInUser.email}.`, tone: 'ok' });
  };

  return (
    <AuthLayout screen="verify" title="Verify your email">
      <form noValidate onSubmit={onSubmit} className="flex w-full max-w-[400px] flex-col gap-6">
        <div className="relative size-[72px]">
          <span className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-brand-subtle text-brand-text">
            <Icon name="mail" size={40} strokeWidth={1.5} />
          </span>
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 size-6 rounded-full border-[3px] border-surface bg-brand text-center text-caption leading-[18px] font-bold text-white"
          >
            1
          </span>
        </div>
        <AuthHeading title="Check your inbox">
          <span className="leading-[22px]">
            We sent a 6-digit code to <strong className="font-semibold text-fg">{signedInUser.email}</strong>.
            Enter it below, or open the link in the email.
          </span>
        </AuthHeading>

        <div className="flex flex-col gap-2">
          <span className="text-body-m font-medium text-fg">Verification code</span>
          <OtpInput label="Verification code" value={code} onChange={setCode} autoFocusIndex={4} />
          <span className="text-body-s text-fg-3">The code expires in 10 minutes.</span>
        </div>

        <Button type="submit" size="lg" fullWidth disabled={!complete} loading={loading}>
          Verify email
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-body-m">
          {seconds > 0 ? (
            <span className="text-fg-3">
              Resend code in <span className="font-mono text-fg-2 tabular">{formatTime(seconds)}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="font-medium text-link underline-offset-2 hover:underline"
            >
              Resend code
            </button>
          )}
          <Link to="/sign-up" className="font-medium text-link underline-offset-2 hover:underline">
            Change email
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

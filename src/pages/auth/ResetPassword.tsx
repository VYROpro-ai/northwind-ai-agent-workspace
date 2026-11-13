import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Icon } from '@/components/icons';
import { Button, Field, Input, useToast } from '@/components/ui';
import { cn } from '@/lib/cn';
import { AuthHeading } from './components/AuthHeading';
import { AuthLayout } from './components/AuthLayout';
import { PasswordInput } from './components/PasswordInput';
import { PasswordStrength } from './components/PasswordStrength';
import { signedInUser } from './data';
import { checkPassword, isEmail } from './password';

const steps = ['email', 'inbox', 'new', 'done'] as const;
type Step = (typeof steps)[number];

const textLink = 'font-medium text-link underline-offset-2 hover:underline';

/** W1-05 · Forgot & reset password — a four-step flow driven by `?step=`. Defaults to the design's step 3. */
export default function ResetPassword() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('step');
  const step: Step = steps.includes(raw as Step) ? (raw as Step) : 'new';
  const [email, setEmail] = useState(signedInUser.email);
  const go = (next: Step) => setParams({ step: next });

  return (
    <AuthLayout screen="reset" title="Reset password">
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <StepProgress current={steps.indexOf(step) + 1} />
        {step === 'email' && <EmailStep email={email} onEmail={setEmail} onNext={() => go('inbox')} />}
        {step === 'inbox' && <InboxStep email={email} onNext={() => go('new')} onBack={() => go('email')} />}
        {step === 'new' && <NewPasswordStep email={email} onNext={() => go('done')} />}
        {step === 'done' && <DoneStep />}
      </div>
    </AuthLayout>
  );
}

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuenow={current}
        aria-label={`Step ${current} of 4`}
        className="grid grid-cols-4 gap-1.5"
      >
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={cn('h-1 rounded-full', n <= current ? 'bg-brand' : 'bg-subtle')} />
        ))}
      </div>
      <span className="text-body-s text-fg-3">
        Step {current} of 4 · Email, check inbox, new password, done
      </span>
    </div>
  );
}

function EmailStep({
  email,
  onEmail,
  onNext,
}: {
  email: string;
  onEmail: (v: string) => void;
  onNext: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const error = submitted && !isEmail(email) ? 'Enter the email you sign in with' : undefined;
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (isEmail(email)) onNext();
  };
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <AuthHeading title="Reset your password">We’ll email you a link to choose a new one.</AuthHeading>
      <Field label="Work email" error={error}>
        {(id, describedBy) => (
          <Input
            id={id}
            type="email"
            size="lg"
            autoComplete="email"
            value={email}
            invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(e) => onEmail(e.target.value)}
          />
        )}
      </Field>
      <Button type="submit" size="lg" fullWidth>
        Send reset link
      </Button>
      <p className="text-center text-body-m text-fg-2">
        Remembered it?{' '}
        <Link to="/sign-in" className={textLink}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

function InboxStep({ email, onNext, onBack }: { email: string; onNext: () => void; onBack: () => void }) {
  const toast = useToast();
  return (
    <div className="flex flex-col gap-6">
      <span className="flex size-12 items-center justify-center rounded-[18px] bg-brand-subtle text-brand-text">
        <Icon name="mail" size={24} />
      </span>
      <AuthHeading title="Check your inbox">
        We sent a reset link to <strong className="font-semibold text-fg">{email}</strong>. It expires in 30
        minutes.
      </AuthHeading>
      <Button size="lg" fullWidth onClick={onNext}>
        I’ve opened the link
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-3 text-body-m">
        <button
          type="button"
          className={textLink}
          onClick={() =>
            toast({ title: 'Reset link sent again', description: `Check ${email}.`, tone: 'ok' })
          }
        >
          Resend link
        </button>
        <button type="button" className={textLink} onClick={onBack}>
          Use a different email
        </button>
      </div>
    </div>
  );
}

function NewPasswordStep({ email, onNext }: { email: string; onNext: () => void }) {
  const [password, setPassword] = useState('Harbor#Lights-48');
  const [confirm, setConfirm] = useState('Harbor#Lights-48');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { score } = checkPassword(password);
  const matches = confirm.length > 0 && confirm === password;
  const weak = score < 3;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (weak || !matches) return;
    setLoading(true);
    window.setTimeout(onNext, 600);
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <AuthHeading title="Choose a new password">
        For {email}. Use one you haven’t used here before.
      </AuthHeading>
      <div className="flex flex-col gap-4">
        <Field
          label="New password"
          className="gap-2"
          error={submitted && weak ? 'Use 8+ characters with a number and a symbol' : undefined}
        >
          {(id, describedBy) => (
            <>
              <PasswordInput
                id={id}
                autoComplete="new-password"
                value={password}
                invalid={submitted && weak}
                aria-describedby={describedBy}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrength value={password} />
            </>
          )}
        </Field>
        <Field label="Confirm new password">
          {(id) => (
            <div className="flex flex-col gap-1.5">
              <PasswordInput
                id={id}
                autoComplete="new-password"
                value={confirm}
                invalid={submitted && !matches}
                aria-describedby={`${id}-match`}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirm.length > 0 && (
                <span
                  id={`${id}-match`}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-body-s',
                    matches ? 'text-ok-text' : 'text-danger-text',
                  )}
                >
                  <Icon name={matches ? 'check' : 'alert-circle'} size={12} strokeWidth={2.5} />
                  {matches ? 'Passwords match' : 'Passwords don’t match'}
                </span>
              )}
            </div>
          )}
        </Field>
      </div>
      <Button type="submit" size="lg" fullWidth loading={loading}>
        Update password
      </Button>
      <p className="text-center text-13 text-fg-3">You’ll be signed out of other devices after this.</p>
    </form>
  );
}

function DoneStep() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6">
      <span className="flex size-12 items-center justify-center rounded-[18px] bg-ok-subtle text-ok-text">
        <Icon name="check-circle" size={24} />
      </span>
      <AuthHeading title="Password updated">
        You’re all set. We signed you out of other devices and added this change to the audit log.
      </AuthHeading>
      <Button size="lg" fullWidth onClick={() => navigate('/sign-in')}>
        Continue to sign in
      </Button>
    </div>
  );
}

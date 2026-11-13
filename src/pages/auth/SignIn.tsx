import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Checkbox, Divider, Field, Input } from '@/components/ui';
import { AuthHeading } from './components/AuthHeading';
import { AuthLayout } from './components/AuthLayout';
import { PasswordInput } from './components/PasswordInput';
import { SocialButtons } from './components/SocialButtons';
import { signedInUser } from './data';
import { isEmail } from './password';

const textLink = 'font-medium text-link hover:underline underline-offset-2';

/** W1-01 · Sign in */
export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(signedInUser.email);
  const [password, setPassword] = useState('northwind2026');
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailError = submitted && !isEmail(email) ? 'Enter a valid work email' : undefined;
  const passwordError = submitted && !password ? 'Enter your password' : undefined;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isEmail(email) || !password) return;
    setLoading(true);
    window.setTimeout(() => navigate('/'), 600);
  };

  return (
    <AuthLayout screen="signin" title="Sign in">
      <form noValidate onSubmit={onSubmit} className="flex w-full max-w-[400px] flex-col gap-6">
        <AuthHeading title="Welcome back">Sign in to your workspace.</AuthHeading>

        <div className="flex flex-col gap-4">
          <Field label="Work email" error={emailError}>
            {(id, describedBy) => (
              <Input
                id={id}
                type="email"
                size="lg"
                autoComplete="email"
                value={email}
                invalid={Boolean(emailError)}
                aria-describedby={describedBy}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </Field>
          <Field
            label="Password"
            error={passwordError}
            labelAside={
              <Link to="/reset-password?step=email" className={`text-13 ${textLink}`}>
                Forgot password?
              </Link>
            }
          >
            {(id, describedBy) => (
              <PasswordInput
                id={id}
                autoComplete="current-password"
                value={password}
                invalid={Boolean(passwordError)}
                aria-describedby={describedBy}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>
          <Checkbox
            label="Keep me signed in"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Sign in
        </Button>
        <p className="text-center text-body-m text-fg-2">
          New to Northwind?{' '}
          <Link to="/sign-up" className={textLink}>
            Create an account
          </Link>
        </p>
        <Divider label="Or" />
        <SocialButtons verb="Sign in" onGoogle={() => navigate('/')} onSso={() => navigate('/sso')} />
      </form>
    </AuthLayout>
  );
}

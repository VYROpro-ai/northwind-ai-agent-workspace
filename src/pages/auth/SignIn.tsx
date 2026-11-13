import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Checkbox, Divider, Field, Input, useToast } from '@/components/ui';
import { AuthHeading } from './components/AuthHeading';
import { AuthLayout } from './components/AuthLayout';
import { PasswordInput } from './components/PasswordInput';
import { SocialButtons } from './components/SocialButtons';
import { isEmail } from './password';
import { useAuth } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const textLink = 'font-medium text-link hover:underline underline-offset-2';

/** W1-01 · Sign in */
export default function SignIn() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  // Already signed in — go straight to the workspace.
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const emailError = submitted && !isEmail(email) ? 'Enter a valid work email' : undefined;
  const passwordError = submitted && !password ? 'Enter your password' : undefined;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setAuthError(undefined);
    if (!isEmail(email) || !password) return;
    if (!isSupabaseConfigured) {
      // Demo mode keeps the template's behaviour: a short pause, then home.
      setLoading(true);
      window.setTimeout(() => navigate('/'), 600);
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    navigate('/');
  };

  const onGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      navigate('/');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) toast({ tone: 'danger', title: 'Google sign-in failed', description: error.message });
  };

  return (
    <AuthLayout screen="signin" title="Sign in">
      <form noValidate onSubmit={onSubmit} className="flex w-full max-w-[400px] flex-col gap-6">
        <AuthHeading title="Welcome back">Sign in to your workspace.</AuthHeading>

        <div className="flex flex-col gap-4">
          <Field label="Work email" error={emailError ?? authError}>
            {(id, describedBy) => (
              <Input
                id={id}
                type="email"
                size="lg"
                autoComplete="email"
                value={email}
                invalid={Boolean(emailError ?? authError)}
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
        <SocialButtons verb="Sign in" onGoogle={onGoogle} onSso={() => navigate('/sso')} />
      </form>
    </AuthLayout>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Checkbox, Divider, Field, Input, useToast } from '@/components/ui';
import { AuthHeading } from './components/AuthHeading';
import { AuthLayout } from './components/AuthLayout';
import { PasswordInput } from './components/PasswordInput';
import { PasswordStrength } from './components/PasswordStrength';
import { SocialButtons } from './components/SocialButtons';
import { checkPassword, isEmail } from './password';
import { useAuth } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const textLink = 'font-medium text-link hover:underline underline-offset-2';

/** W1-02 · Sign up */
export default function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  // Already signed in — go straight to the workspace.
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const { checks } = checkPassword(password);
  const passwordOk = checks.length && checks.number && checks.symbol;
  const errors = {
    name: submitted && !name.trim() ? 'Enter your full name' : undefined,
    email: submitted && !isEmail(email) ? 'Enter a valid work email' : undefined,
    password: submitted && !passwordOk ? 'Use 8+ characters with a number and a symbol' : undefined,
    terms: submitted && !agreed,
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setAuthError(undefined);
    if (!name.trim() || !isEmail(email) || !passwordOk || !agreed) return;
    if (!isSupabaseConfigured) {
      // Demo mode keeps the template's behaviour: a short pause, then verify-email.
      setLoading(true);
      window.setTimeout(() => navigate('/verify-email'), 600);
      return;
    }
    setLoading(true);
    const { error, session } = await signUp(email, password, name.trim());
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    // Confirm-email OFF is assumed: a session means the account is live.
    navigate(session ? '/' : '/verify-email');
  };

  const onGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      navigate('/onboarding/workspace');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) toast({ tone: 'danger', title: 'Google sign-up failed', description: error.message });
  };

  const legal = (label: string) =>
    toast({
      title: `${label} opens on northwind.app`,
      description: 'Legal pages live on the marketing site.',
    });

  return (
    <AuthLayout screen="signup" title="Create your account">
      <form noValidate onSubmit={onSubmit} className="flex w-full max-w-[400px] flex-col gap-5">
        <AuthHeading title="Create your account">Free for up to 3 people. No card needed.</AuthHeading>

        <div className="flex flex-col gap-3.5">
          <Field label="Full name" error={errors.name}>
            {(id, describedBy) => (
              <Input
                id={id}
                autoComplete="name"
                className="h-10"
                value={name}
                invalid={Boolean(errors.name)}
                aria-describedby={describedBy}
                onChange={(e) => setName(e.target.value)}
              />
            )}
          </Field>
          <Field label="Work email" error={errors.email ?? authError}>
            {(id, describedBy) => (
              <Input
                id={id}
                type="email"
                autoComplete="email"
                className="h-10"
                value={email}
                invalid={Boolean(errors.email ?? authError)}
                aria-describedby={describedBy}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </Field>
          <Field label="Password" error={errors.password} className="gap-2">
            {(id, describedBy) => (
              <>
                <PasswordInput
                  id={id}
                  size="md"
                  autoComplete="new-password"
                  className="h-10"
                  value={password}
                  invalid={Boolean(errors.password)}
                  aria-describedby={describedBy}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordStrength value={password} showRules />
              </>
            )}
          </Field>
          <div className="flex flex-col gap-1.5">
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              aria-invalid={errors.terms || undefined}
              className="[&_span]:text-13 [&_span]:text-fg-2"
              label={
                <>
                  I agree to the{' '}
                  <button type="button" className={textLink} onClick={() => legal('Terms of service')}>
                    Terms
                  </button>{' '}
                  and{' '}
                  <button type="button" className={textLink} onClick={() => legal('Privacy policy')}>
                    Privacy Policy
                  </button>
                </>
              }
            />
            {errors.terms && (
              <p className="pl-6.5 text-body-s text-danger-text">Accept the terms to create your account</p>
            )}
          </div>
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Create account
        </Button>
        <p className="text-center text-body-m text-fg-2">
          Already have an account?{' '}
          <Link to="/sign-in" className={textLink}>
            Sign in
          </Link>
        </p>
        <Divider label="Or" />
        <SocialButtons compact verb="Sign up" onGoogle={onGoogle} onSso={() => navigate('/sso')} />
      </form>
    </AuthLayout>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Icon } from '@/components/icons';
import { Button, Field, Input } from '@/components/ui';
import { AuthHeading } from './components/AuthHeading';
import { AuthLayout } from './components/AuthLayout';

const isDomainOrEmail = (value: string) =>
  /^([^\s@]+@)?[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(value.trim());

/** W1-03 · SSO sign-in */
export default function SsoSignIn() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('northwindlabs.com');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const error =
    submitted && !isDomainOrEmail(domain)
      ? 'Enter a work email or a domain like northwindlabs.com'
      : undefined;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isDomainOrEmail(domain)) return;
    setLoading(true);
    window.setTimeout(() => navigate('/'), 800);
  };

  return (
    <AuthLayout screen="sso" title="Sign in with SSO">
      <form noValidate onSubmit={onSubmit} className="flex w-full max-w-[400px] flex-col gap-6">
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-1.5 self-start text-13 font-medium text-fg-2 transition-colors hover:text-fg"
        >
          <Icon name="chevron-left" size={14} strokeWidth={2} />
          All sign-in options
        </Link>
        <span className="flex size-12 items-center justify-center rounded-[18px] bg-brand-subtle text-brand-text">
          <Icon name="lock-keyhole" size={24} />
        </span>
        <AuthHeading title="Sign in with SSO">
          Use your company’s sign-in. You won’t need a separate password for Northwind.
        </AuthHeading>

        <Field
          label="Work email or company domain"
          error={error}
          hint="For example maya@northwindlabs.com or northwindlabs.com"
        >
          {(id, describedBy) => (
            <Input
              id={id}
              size="lg"
              autoComplete="email"
              value={domain}
              invalid={Boolean(error)}
              aria-describedby={describedBy}
              onChange={(e) => setDomain(e.target.value)}
            />
          )}
        </Field>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Redirecting to your identity provider…' : 'Continue'}
        </Button>

        <div className="flex gap-3 rounded-[10px] border border-border bg-sunken px-4 py-3.5">
          <Icon name="info" size={18} className="mt-px shrink-0 text-info-text" />
          <div className="flex flex-col gap-1 text-13">
            <p className="font-semibold text-fg">What is SSO?</p>
            <p className="text-fg-2">
              Single sign-on lets you use the account your company already manages. Your Admin sets it up once
              in Security settings.
            </p>
          </div>
        </div>
        <p className="text-center text-body-m text-fg-2">
          No SSO at your company?{' '}
          <Link to="/sign-in" className="font-medium text-link underline-offset-2 hover:underline">
            Sign in with email
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

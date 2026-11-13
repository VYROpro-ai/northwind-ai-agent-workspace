import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '@/components/icons';
import { Badge, Button, Input, useToast } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/lib/hooks';

type ServiceTone = 'brand' | 'ok' | 'warn';

const services: { name: string; status: string; tone: ServiceTone }[] = [
  { name: 'Chat and agents', status: 'Paused for maintenance', tone: 'brand' },
  { name: 'Workflows and scheduled runs', status: 'Queued · 38 waiting', tone: 'brand' },
  { name: 'Approvals by email', status: 'Working', tone: 'ok' },
  { name: 'Model C Deep', status: 'Slow', tone: 'warn' },
];

const toneText: Record<ServiceTone, string> = {
  brand: 'text-brand-text',
  ok: 'text-ok-text',
  warn: 'text-warn-text',
};
const toneDot: Record<ServiceTone, string> = {
  brand: 'bg-brand-text',
  ok: 'bg-ok-text',
  warn: 'bg-warn-text',
};

/** Seconds left in the maintenance window when the page opens (00:42:18). */
const WINDOW_SECONDS = 42 * 60 + 18;
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** W12-06 · Maintenance & status */
export default function Maintenance() {
  useDocumentTitle('Planned maintenance');
  const toast = useToast();
  const [left, setLeft] = useState(WINDOW_SECONDS);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  const parts = [
    { value: Math.floor(left / 3600), unit: 'hours' },
    { value: Math.floor((left % 3600) / 60), unit: 'minutes' },
    { value: left % 60, unit: 'seconds' },
  ];

  const subscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!isEmail(email)) return setError('Enter a valid email address');
    setError(undefined);
    setSubscribed(true);
    toast({
      title: 'You’re on the list',
      description: `We’ll email ${email.trim()} when Northwind is back.`,
      tone: 'ok',
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-fg">
      <div
        role="status"
        className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 bg-warn-subtle px-4 py-2.5 text-center text-13 text-warn-text"
      >
        <Icon name="alert-triangle" size={15} strokeWidth={2} className="shrink-0" />
        <b className="font-semibold">Model C Deep is slow right now.</b>
        <span>Agents using it may take longer.</span>
        <a href="#service-status" className="font-medium text-link underline-offset-2 hover:underline">
          Status page
        </a>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="flex w-[624px] max-w-full flex-col gap-5 rounded-xl border border-border bg-surface p-5 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-[18px] bg-brand-subtle text-brand-text">
            <Icon name="wrench" size={22} strokeWidth={1.9} />
          </span>
          <div className="flex flex-col gap-1.5">
            <Badge tone="brand" bordered={false} className="self-center border-transparent">
              Planned maintenance
            </Badge>
            <h1 className="mt-1.5 text-h2 font-semibold tracking-normal">Northwind is getting an upgrade</h1>
            <p className="text-body-m leading-[21px] text-fg-2">
              We’re moving to faster servers. Chats, agents and workflows are paused. Scheduled runs will
              start again automatically when we’re done.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span id="countdown-label" className="text-body-s leading-[18px] font-semibold text-fg-3">
              Back in about
            </span>
            <div role="timer" aria-labelledby="countdown-label" className="flex gap-2">
              {parts.map((part) => (
                <div
                  key={part.unit}
                  className="flex w-[72px] flex-col items-center gap-0.5 rounded-[10px] bg-subtle py-2.5"
                >
                  <span className="font-mono text-[26px] leading-8 font-semibold tabular">
                    {String(part.value).padStart(2, '0')}
                  </span>
                  <span className="text-caption text-fg-3">{part.unit}</span>
                </div>
              ))}
            </div>
            <span className="text-body-s leading-[18px] text-fg-3">
              Expected to end at 3:00 AM PKT · Oct 27
            </span>
          </div>

          <ul id="service-status" aria-label="Service status" className="flex scroll-mt-6 flex-col">
            {services.map((service) => (
              <li key={service.name} className="flex items-center gap-2.5 border-t border-border py-2">
                <span aria-hidden className={cn('size-2 shrink-0 rounded-full', toneDot[service.tone])} />
                <span className="text-13 leading-[19px] font-medium">{service.name}</span>
                <span
                  className={cn(
                    'ml-auto text-right text-body-s leading-[18px] font-medium',
                    toneText[service.tone],
                  )}
                >
                  {service.status}
                </span>
              </li>
            ))}
          </ul>

          <form noValidate onSubmit={subscribe} className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-2 min-[420px]:flex-row">
              <label htmlFor="updates-email" className="sr-only">
                Email for status updates
              </label>
              <Input
                id="updates-email"
                type="email"
                autoComplete="email"
                placeholder="you@northwindlabs.com"
                className="h-10 min-w-0 flex-1 text-13"
                value={email}
                invalid={Boolean(error)}
                aria-describedby={error ? 'updates-error' : undefined}
                disabled={subscribed}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                className="h-10 px-3.5 text-13"
                leftIcon={subscribed ? 'check' : undefined}
                disabled={subscribed}
              >
                {subscribed ? 'Subscribed' : 'Get updates'}
              </Button>
            </div>
            {error && (
              <p id="updates-error" className="text-body-s text-danger-text">
                {error}
              </p>
            )}
          </form>
          <p className="text-body-s text-fg-3">
            Updates also at <span className="font-medium text-link">status.northwind.app</span>
          </p>
        </div>
      </main>
    </div>
  );
}

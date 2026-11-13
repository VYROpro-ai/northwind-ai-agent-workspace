import { useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, InlineNotice, Input, Progress, Radio, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { BillingCard, BillingLayout } from './components/BillingLayout';
import { alertThresholds, usageMeters, type UsageMeter } from './data';

type CapAction = 'pause' | 'overage';

const formatCap = (raw: string) => {
  const n = Number(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
};

/** W11-02 · Current plan & usage limits, with the owner's spend controls. */
export default function PlanUsage() {
  const toast = useToast();
  const navigate = useNavigate();
  const capRef = useRef<HTMLInputElement>(null);
  const capId = useId();
  const capHintId = useId();
  const [cap, setCap] = useState('1,400.00');
  const [thresholds, setThresholds] = useState<number[]>([...alertThresholds]);
  const [capAction, setCapAction] = useState<CapAction>('overage');

  const raiseCap = () => {
    capRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    capRef.current?.focus({ preventScroll: true });
  };

  const toggleThreshold = (t: number) =>
    setThresholds((list) =>
      list.includes(t) ? list.filter((x) => x !== t) : [...list, t].sort((a, b) => a - b),
    );

  const save = () => {
    if (!formatCap(cap)) {
      toast({ tone: 'danger', title: 'Enter a monthly spend cap' });
      capRef.current?.focus();
      return;
    }
    toast({
      title: 'Spend controls saved',
      description: `Cap $${formatCap(cap)} · alerts at ${thresholds.map((t) => `${t}%`).join(', ') || 'no thresholds'}`,
    });
  };

  return (
    <BillingLayout
      crumb="Plan"
      title="Plan & usage"
      description="October 12 – November 11"
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon="plus"
          className="h-[34px]"
          onClick={() =>
            toast({
              title: 'Extra credits requested',
              description: '$200 of credits will be charged to Visa •••• 6411.',
            })
          }
        >
          Buy extra credits
        </Button>
      }
    >
      <InlineNotice
        tone="warn"
        title="You’ve used 85% of this month’s credits."
        actions={
          <Button variant="secondary" size="xs" onClick={raiseCap}>
            Raise cap
          </Button>
        }
      >
        At this pace they run out around Oct 30. Agents keep running into overage up to your cap.
      </InlineNotice>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <BillingCard className="flex flex-col gap-3.5 p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 className="text-h3 font-semibold text-fg">Pro</h2>
              <p className="text-13 text-fg-2">$29 per seat / month · renews Nov 12</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-[34px]"
              onClick={() => navigate('/settings/plans')}
            >
              Change plan
            </Button>
          </div>
          <dl className="grid grid-cols-3 gap-3 border-t border-border pt-3.5">
            {[
              ['Next invoice', '$725.00'],
              ['Seats', '24 of 25'],
              ['Paid with', 'Visa •••• 6411'],
            ].map(([term, value]) => (
              <div key={term} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-caption font-medium whitespace-nowrap text-fg-3">{term}</dt>
                <dd className="truncate text-13 font-medium text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center gap-2.5 rounded-[10px] bg-ai-subtle px-3.5 py-2.5 text-13 text-ai-text">
            <Icon name="sparkle" size={16} strokeWidth={2} className="shrink-0" />
            <span className="flex-1">Trying Business features (SSO, custom roles) free until Nov 9.</span>
            <Link to="/settings/plans" className="text-body-s font-medium text-link hover:underline">
              Upgrade
            </Link>
          </div>
        </BillingCard>

        <BillingCard className="flex flex-col gap-4 p-4">
          <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Usage this period</h2>
          {usageMeters.map((m) => (
            <Meter key={m.label} meter={m} />
          ))}
        </BillingCard>
      </div>

      <BillingCard className="flex flex-col gap-3.5 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Spend controls</h2>
          <span className="text-body-s text-fg-3">Owner only</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={capId} className="text-body-s font-semibold text-fg-2">
              Monthly spend cap
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-13 text-fg-3">
                $
              </span>
              <Input
                ref={capRef}
                id={capId}
                inputMode="decimal"
                value={cap}
                onChange={(e) => setCap(e.target.value.replace(/[^\d.,]/g, ''))}
                onBlur={() => setCap(formatCap(cap))}
                aria-describedby={capHintId}
                className="pl-7 font-mono text-13 font-medium"
              />
            </div>
            <span id={capHintId} className="text-body-s text-fg-3">
              Includes credits and overage
            </span>
          </div>
          <fieldset className="flex min-w-0 flex-col gap-1.5">
            <legend className="mb-1.5 text-body-s font-semibold text-fg-2">Email the Owner at</legend>
            <div className="flex flex-wrap gap-1.5">
              {alertThresholds.map((t) => {
                const on = thresholds.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleThreshold(t)}
                    className={cn(
                      'inline-flex h-[30px] items-center rounded-full border px-3 text-13 font-medium transition-colors',
                      on
                        ? 'border-brand-border bg-brand-subtle text-brand-text'
                        : 'border-border bg-surface text-fg-2 hover:bg-subtle',
                    )}
                  >
                    {t}%
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 text-body-s font-semibold text-fg-2">When the cap is reached</legend>
            <Radio
              name="cap-action"
              checked={capAction === 'pause'}
              onChange={() => setCapAction('pause')}
              label={<span className="text-13">Pause all agents</span>}
            />
            <Radio
              name="cap-action"
              checked={capAction === 'overage'}
              onChange={() => setCapAction('overage')}
              label={<span className="text-13">Allow overage up to $200 more</span>}
            />
          </fieldset>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex-1 text-body-s text-fg-3">
            Overage is billed at $1 per $1 of credits on your next invoice.
          </span>
          <Button size="sm" onClick={save}>
            Save
          </Button>
        </div>
      </BillingCard>

      <BillingCard className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Overage example</h2>
          <span className="text-body-s text-fg-3">What a cap-reached month looks like</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-13">
            <span className="font-medium text-fg">Credits</span>
            <span className="flex-1" />
            <span className="text-fg-2">
              <b className="font-semibold text-fg">$1,310</b> of $1,250
            </span>
          </div>
          <div
            className="flex h-2 overflow-hidden rounded-full bg-subtle"
            role="img"
            aria-label="$1,250 of included credits used plus $60 overage"
          >
            <span className="h-full w-[95%] bg-brand" />
            <span className="h-full w-[5%] bg-[repeating-linear-gradient(135deg,var(--danger)_0_4px,var(--danger-subtle)_4px_8px)]" />
          </div>
          <span className="text-body-s text-fg-3">$60 overage this period</span>
        </div>
        <InlineNotice
          tone="danger"
          icon="pause"
          title="Spend cap reached."
          actions={
            <Button variant="secondary" size="xs" onClick={raiseCap}>
              Raise cap
            </Button>
          }
        >
          Agents are paused until Nov 12 or until you raise the cap.
        </InlineNotice>
      </BillingCard>
    </BillingLayout>
  );
}

function Meter({ meter }: { meter: UsageMeter }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-13">
        <span className="font-medium text-fg">{meter.label}</span>
        <span className="flex-1" />
        <span className="text-fg-2">
          <b className="font-semibold text-fg">{meter.used}</b> of {meter.limit}
        </span>
      </div>
      <Progress value={meter.percent} tone={meter.tone} className="h-2" label={`${meter.label} used`} />
      {meter.hint && <span className="text-body-s text-fg-3">{meter.hint}</span>}
    </div>
  );
}

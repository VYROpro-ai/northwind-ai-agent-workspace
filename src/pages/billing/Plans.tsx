import { useState } from 'react';
import {
  Badge,
  Button,
  Segmented,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
} from '@/components/ui';
import { Icon } from '@/components/icons';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { BillingCard, BillingLayout } from './components/BillingLayout';
import {
  comparison,
  downgradeImpact,
  planOrder,
  plans,
  workspaceSeats,
  yearlyDiscount,
  type BillingCycle,
  type Plan,
  type PlanId,
} from './data';

const seatPrice = (plan: Plan, cycle: BillingCycle) =>
  plan.seatPrice === null
    ? null
    : cycle === 'yearly'
      ? plan.seatPrice * (1 - yearlyDiscount)
      : plan.seatPrice;

const money = (v: number) => (Number.isInteger(v) ? `$${formatNumber(v)}` : `$${v.toFixed(2)}`);

/** W11-01 · Plans — monthly / yearly pricing, current plan and the plan comparison. */
export default function Plans() {
  const toast = useToast();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [current, setCurrent] = useState<PlanId>('pro');
  const [showDowngrade, setShowDowngrade] = useState(true);
  const currentPlan = plans.find((p) => p.id === current) ?? plans[1];

  const choose = (plan: Plan) => {
    if (plan.id === 'enterprise') {
      toast({ title: 'Sales will be in touch', description: 'Expect an email within one business day.' });
      return;
    }
    if (plan.id === 'free') {
      setShowDowngrade(true);
      return;
    }
    const previous = current;
    setCurrent(plan.id);
    setShowDowngrade(false);
    toast({
      title: `You’re on ${plan.name} now`,
      description: `Billed ${cycle === 'yearly' ? 'yearly' : 'monthly'} from today. Credits update right away.`,
      action: { label: 'Undo', onClick: () => setCurrent(previous) },
    });
  };

  return (
    <BillingLayout
      crumb="Plan"
      title="Plans"
      description="Pick the plan that fits Northwind Labs. Prices in USD."
      actions={
        <Segmented
          label="Billing cycle"
          value={cycle}
          onChange={setCycle}
          options={[
            { value: 'monthly', label: 'Monthly' },
            {
              value: 'yearly',
              label: (
                <>
                  Yearly
                  <Badge
                    tone="ok"
                    size="sm"
                    bordered={false}
                    className="h-[18px] border-transparent px-2 text-body-s"
                  >
                    Save 20%
                  </Badge>
                </>
              ),
            },
          ]}
        />
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            current={plan.id === current}
            direction={Math.sign(planOrder.indexOf(plan.id) - planOrder.indexOf(current))}
            onChoose={() => choose(plan)}
          />
        ))}
      </div>

      {showDowngrade && current !== 'free' && (
        <BillingCard className="flex flex-col gap-2.5 border-danger-border p-4" as="div">
          <div className="flex flex-wrap items-center gap-2">
            <Icon name="alert-triangle" size={16} strokeWidth={2} className="text-danger-text" />
            <h2 className="text-body-m font-semibold text-fg">Moving to Free would stop these</h2>
            <span className="flex-1" />
            <Button
              variant="secondary"
              size="sm"
              className="h-[30px]"
              onClick={() => setShowDowngrade(false)}
            >
              Keep {currentPlan.name}
            </Button>
          </div>
          <ul className="grid grid-cols-1 gap-x-5 gap-y-1.5 text-13 text-fg-2 md:grid-cols-2">
            {downgradeImpact.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </BillingCard>
      )}

      <BillingCard className="overflow-hidden">
        <TableContainer>
          <Table className="min-w-[640px] table-fixed text-13">
            <caption className="sr-only">Compare plans</caption>
            <THead className="bg-sunken">
              <TR>
                <TH className="w-[26%] font-medium first:pl-4">Compare plans</TH>
                {plans.map((p) => (
                  <TH key={p.id} className="w-[18.5%] text-center font-medium">
                    {p.name}
                  </TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {comparison.map((group) => (
                <GroupRows key={group.group} group={group} />
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </BillingCard>
    </BillingLayout>
  );
}

function PlanCard({
  plan,
  cycle,
  current,
  direction,
  onChoose,
}: {
  plan: Plan;
  cycle: BillingCycle;
  current: boolean;
  /** -1 = downgrade, 1 = upgrade relative to the current plan. */
  direction: number;
  onChoose: () => void;
}) {
  const price = seatPrice(plan, cycle);
  const isPaidSeatPlan = price !== null && price > 0;
  const headline =
    plan.id === 'pro' && price !== null
      ? `${workspaceSeats} seats · ${money(price * workspaceSeats)}/month`
      : plan.headline;

  return (
    <section
      className={cn(
        'flex min-w-0 flex-col gap-3.5 rounded-[14px] bg-surface p-5',
        current ? 'border-2 border-brand p-[19px]' : 'border border-border',
      )}
      aria-label={`${plan.name} plan${current ? ' (current)' : ''}`}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-h4 font-semibold text-fg">{plan.name}</h2>
        <span className="flex-1" />
        {current ? (
          <Badge tone="brand" bordered={false} className="h-[22px] border-transparent">
            Current plan
          </Badge>
        ) : (
          plan.badge && (
            <Badge tone={plan.badge.tone} bordered={false} className="h-[22px] border-transparent">
              {plan.badge.label}
            </Badge>
          )
        )}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[30px] leading-9 font-semibold tracking-[-0.02em] text-fg tabular">
          {price === null ? 'Custom' : money(price)}
        </span>
        {plan.priceNote && (
          <span className="text-13 text-fg-3">
            {plan.priceNote}
            {isPaidSeatPlan && cycle === 'yearly' && ', billed yearly'}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 text-13">
        <span className="font-medium text-fg">{headline}</span>
        <span className="text-fg-2">{plan.credits}</span>
      </div>
      {current ? (
        <Button size="lg" disabled className="h-[38px] text-13">
          Current plan
        </Button>
      ) : (
        <Button
          size="lg"
          variant={plan.id === 'business' && direction > 0 ? 'primary' : 'secondary'}
          className="h-[38px] text-13"
          onClick={onChoose}
        >
          {plan.id === 'enterprise'
            ? 'Contact sales'
            : direction < 0
              ? 'Downgrade'
              : `Upgrade to ${plan.name}`}
        </Button>
      )}
      <ul className="flex flex-col gap-2 border-t border-border pt-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-13 text-fg-2">
            <Icon name="check" size={14} strokeWidth={2.4} className="mt-0.5 shrink-0 text-ok-text" />
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}

function GroupRows({ group }: { group: (typeof comparison)[number] }) {
  return (
    <>
      <TR className="bg-sunken">
        <th
          scope="colgroup"
          colSpan={5}
          className="h-9 px-4 text-left text-caption font-semibold tracking-[0.02em] text-fg-3 uppercase"
        >
          {group.group}
        </th>
      </TR>
      {group.rows.map((row) => (
        <TR key={row.feature}>
          <th scope="row" className="h-[38px] px-4 text-left font-normal text-fg">
            {row.feature}
          </th>
          {row.values.map((v, i) => (
            <TD key={i} className="h-[38px] text-center text-fg-2">
              {v === true ? (
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  label="Included"
                  className="inline text-ok-text"
                />
              ) : v === false ? (
                <span className="text-fg-disabled">
                  <span aria-hidden>—</span>
                  <span className="sr-only">Not included</span>
                </span>
              ) : (
                v
              )}
            </TD>
          ))}
        </TR>
      ))}
    </>
  );
}

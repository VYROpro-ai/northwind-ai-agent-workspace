import { useState } from 'react';
import { Link } from 'react-router';
import { InlineNotice, Button, Divider, Modal, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { formatNumber } from '@/lib/format';
import { plans, workspaceSeats } from '../data';

const business = plans.find((p) => p.id === 'business');
const businessSeatPrice = business?.seatPrice ?? 59;

/** W11-05 · Credits used up: recommend Business, offer a one-off credit top-up. */
export function LimitReachedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [buying, setBuying] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [declined, setDeclined] = useState(true);

  const buyCredits = () => {
    setBuying(true);
    setDeclined(false);
    window.setTimeout(() => {
      setBuying(false);
      setDeclined(true);
    }, 900);
  };

  const upgrade = () => {
    setUpgrading(true);
    window.setTimeout(() => {
      toast({
        title: 'Welcome to Business',
        description: 'Credits are topped up and your agents are running again.',
      });
      onClose();
    }, 900);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      bare
      label="Agent limit reached"
      size="md"
      className="sm:max-w-[520px]"
    >
      <div className="flex flex-col items-center gap-3.5 px-7 pt-7 pb-1.5 text-center">
        <span className="inline-flex size-[52px] items-center justify-center rounded-[14px] bg-warn-subtle text-warn-text">
          <Icon name="zap" size={24} strokeWidth={2} />
        </span>
        <h2 className="text-h3 font-semibold text-fg">You’ve used this month’s credits</h2>
        <p className="text-body-m leading-[21px] text-fg-2">
          Northwind Labs used all $1,250 of its Pro credits and reached the $1,400 spend cap. Agents are
          paused until Nov 12.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-3.5">
        <div className="flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-brand bg-brand-subtle px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] leading-[21px] font-semibold text-fg">Business</span>
            <span className="text-body-s font-medium text-brand-text">Recommended</span>
            <span className="flex-1" />
            <span className="text-13 text-fg-2">${businessSeatPrice} per seat / month</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {[
              `$80 credits per seat, $${formatNumber(80 * workspaceSeats)} a month for your ${workspaceSeats} seats`,
              'SSO, custom roles and a 1-year audit log',
              'Real-time knowledge sync',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2 text-13 text-fg-2">
                <Icon name="check" size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-ok-text" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <Divider label="or" />

        <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-border px-3.5 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="text-13 font-semibold text-fg">Buy $200 of credits</span>
            <span className="text-body-s text-fg-3">
              Agents resume right away · charged to Visa •••• 6411
            </span>
          </div>
          <Button variant="secondary" size="sm" loading={buying} onClick={buyCredits}>
            Buy credits
          </Button>
        </div>

        {declined && (
          <InlineNotice
            tone="danger"
            icon="close"
            actions={
              <Link to="/settings/payment" className="text-body-s font-medium text-link hover:underline">
                Update card
              </Link>
            }
          >
            Your card was declined, so nothing changed. Try another card.
          </InlineNotice>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 pt-4 pb-5">
        <Button variant="ghost" size="sm" className="-ml-3" onClick={onClose}>
          Not now
        </Button>
        <span className="flex-1" />
        <Button size="sm" className="h-[34px]" loading={upgrading} onClick={upgrade}>
          Upgrade to Business · ${formatNumber(businessSeatPrice * workspaceSeats)}/mo
        </Button>
      </div>
    </Modal>
  );
}

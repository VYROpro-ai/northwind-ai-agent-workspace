import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { Button, Checkbox, Modal, Textarea, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { approvalDiff } from '../data';
import { RiskBadge } from './ApprovalsQueueScreen';
import { ButtonLink } from './ButtonLink';
import { Section } from './Section';

const DETAIL = '/approvals/apr_240';

/**
 * Approval detail (W6-06). `overlay` opens the result dialogs drawn over it:
 * `approved` (W6-06a) and `self-blocked` (W6-06b).
 */
export function ApprovalDetailScreen({ overlay }: { overlay?: 'approved' | 'self-blocked' }) {
  const navigate = useNavigate();
  const toast = useToast();
  const reasonId = useId();
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);

  const reject = () => {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    toast({
      title: 'Rejected · Send refund of $240 to Acme Co.',
      description: 'Support Agent was told why and won’t send the refund.',
      tone: 'neutral',
    });
    navigate('/approvals');
  };

  return (
    <AppShell
      active="Approvals"
      role="reviewer"
      crumbs={[{ label: 'Approvals', to: '/approvals' }, { label: 'Refund $240 to Acme Co.' }]}
    >
      <div className="flex flex-wrap items-center gap-2 text-13">
        <nav aria-label="Queue" className="flex items-center gap-2">
          <Link to="/approvals" className="font-medium text-link hover:underline">
            Approvals
          </Link>
          <span className="text-fg-3">/</span>
          <span className="text-fg-2">Waiting for me</span>
        </nav>
        <span className="flex-1" />
        <span className="text-fg-3">2 of 4</span>
        <ButtonLink to="/approvals" variant="ghost">
          Previous
        </ButtonLink>
        <ButtonLink to="/approvals" icon="chevron-right">
          Next request
        </ButtonLink>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <section
            aria-labelledby="request-title"
            className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-ai-subtle text-ai-text">
                <Icon name="nav-agents" size={20} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
                <h1 id="request-title" className="text-[18px] leading-6 font-semibold text-fg">
                  Send refund of $240 to Acme Co.
                </h1>
                <p className="text-13 text-fg-2">Support Agent · asked by Sofia Rossi in chat · 14 min ago</p>
              </div>
              <RiskBadge risk="medium" />
            </div>

            <div className="overflow-hidden rounded-[10px] border border-border">
              <table className="w-full table-fixed text-13">
                <caption className="sr-only">Changes this approval makes in Shopdesk</caption>
                <thead className="bg-sunken text-body-s font-medium text-fg-3">
                  <tr>
                    <th scope="col" className="w-[104px] px-3 py-2 text-left font-medium sm:w-[132px]">
                      Shopdesk refund
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      Before
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      After approval
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {approvalDiff.map((row) => (
                    <tr key={row.field} className="border-t border-border">
                      <th scope="row" className="px-3 py-2 text-left font-normal text-fg-3">
                        {row.field}
                      </th>
                      <td className={cn('px-3 py-2 text-fg-3', row.struck && 'line-through')}>
                        {row.before}
                      </td>
                      <td className={cn('px-3 py-2 text-fg', row.before !== row.after && 'font-semibold')}>
                        {row.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-1.5 rounded-[10px] border border-border px-3.5 py-3 text-13">
              <span className="text-body-s text-fg-3">Then emails dana.whitfield@acme.example</span>
              <b className="font-semibold text-fg">Your refund for order #48213</b>
              <p className="leading-5 text-fg-2">
                Hi Dana, you were charged $240 twice on Oct 22. We’ve refunded the duplicate to your Visa
                ending 6411. It should arrive{' '}
                <del className="rounded-[3px] bg-ai-subtle px-[3px] text-ai-text">within 5 business days</del>{' '}
                <ins className="rounded-[3px] bg-info-subtle px-[3px] text-info-text no-underline">
                  in 3–5 business days
                </ins>
                .
              </p>
              <span className="text-body-s text-info-text">
                Your edit · shown in blue, saved to the audit log
              </span>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Section title="Why it’s asking" className="gap-2">
              <p className="text-13 font-medium text-fg">Refunds over $100 need a reviewer.</p>
              <p className="text-body-s text-fg-3">
                Policy:{' '}
                <Link to="/settings/guardrails" className="underline hover:text-fg">
                  Refund guardrail
                </Link>{' '}
                · set by Daniel Okafor
              </p>
              <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                <h3 className="text-body-s font-semibold text-fg-3">Agent’s reasoning</h3>
                <p className="text-13 text-fg-2">
                  Order 48213 shows two identical $240 charges 4 minutes apart. Duplicate charges are always
                  refunded in full.
                </p>
              </div>
            </Section>
            <Section title="Sources & conversation" className="gap-2">
              <Link
                to="/knowledge/documents/refund-policy-2026"
                className="text-13 font-medium text-link hover:underline"
              >
                Refund policy 2026.pdf · p. 2
              </Link>
              <Link to="/integrations" className="text-13 font-medium text-link hover:underline">
                Shopdesk · order 48213 payments
              </Link>
              <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                <h3 className="text-body-s font-semibold text-fg-3">Sofia Rossi · 9:14 AM</h3>
                <p className="text-13 text-fg-2">
                  “Can Acme Co. get a refund for order #48213? They were charged twice on Oct 22.”
                </p>
                <Link to="/chat" className="text-body-s font-medium text-link hover:underline">
                  Open full chat
                </Link>
              </div>
            </Section>
          </div>
        </div>

        <section
          aria-labelledby="decision-title"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-[18px]"
        >
          <h2 id="decision-title" className="text-[15px] leading-[22px] font-semibold text-fg">
            Your decision
          </h2>
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-[10px] bg-warn-subtle px-3.5 py-2.5 text-13 text-warn-text"
          >
            <Icon name="alert-triangle" size={16} strokeWidth={2} className="shrink-0" />
            <p className="flex-1">
              Data changed since this request: a $20 store credit was added to this order at 9:20 AM.
            </p>
          </div>
          <Button
            size="lg"
            leftIcon="check-sm"
            className="h-10 text-13"
            fullWidth
            onClick={() => navigate(`${DETAIL}/approved`)}
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-10 text-13"
            fullWidth
            onClick={() => navigate(`${DETAIL}/approved`)}
          >
            Approve with my edits
          </Button>
          <div className="flex flex-col gap-1.5 border-t border-border pt-3">
            <label htmlFor={reasonId} className="text-body-s font-semibold text-fg-2">
              Reject with a reason
            </label>
            <Textarea
              id={reasonId}
              rows={2}
              value={reason}
              invalid={reasonError}
              aria-describedby={reasonError ? `${reasonId}-error` : undefined}
              placeholder="e.g. Customer already got a manual refund"
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setReasonError(false);
              }}
              className="min-h-16 resize-none text-13"
            />
            {reasonError && (
              <p id={`${reasonId}-error`} className="flex items-center gap-1.5 text-body-s text-danger-text">
                <Icon name="alert-circle" size={13} strokeWidth={2} />
                Add a reason so the agent knows what to change.
              </p>
            )}
            <button
              type="button"
              onClick={reject}
              className="h-9 rounded-full border border-danger-border bg-danger-subtle text-13 font-medium text-danger-text transition-colors hover:bg-danger hover:text-white"
            >
              Reject
            </button>
          </div>
          <ButtonLink to="/chat" variant="ghost" size="md" icon="ai-generate">
            Ask the agent a question
          </ButtonLink>
          <div className="border-t border-border pt-3 opacity-60">
            <Checkbox
              disabled
              label={
                <span className="text-13 font-medium text-fg">
                  Always allow refunds under $250 for this agent
                </span>
              }
              description="Admins only"
            />
          </div>
        </section>
      </div>

      <Modal
        open={overlay === 'approved'}
        onClose={() => navigate(DETAIL)}
        bare
        label="Refund approved"
        className="max-w-[460px] sm:rounded-2xl"
      >
        <div className="flex flex-col items-center gap-3 px-7 pt-8 pb-2 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-ok-subtle text-ok-text">
            <Icon name="check-sm" size={28} strokeWidth={2.6} />
          </span>
          <h2 className="text-h3 font-semibold text-fg">Approved</h2>
          <p className="text-body-m text-fg-2">
            Support Agent is refunding $240 to Acme Co. and emailing Dana. You’ll see it in run_4835.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-6 pt-4 pb-5">
          <ButtonLink to="/runs/run_4835" variant="ghost" size="md">
            View run
          </ButtonLink>
          <span className="flex-1" />
          <ButtonLink to="/approvals" size="md">
            Back to queue
          </ButtonLink>
          <ButtonLink to="/approvals" variant="primary" size="md">
            Next request · 3 left
          </ButtonLink>
        </div>
      </Modal>

      <Modal
        open={overlay === 'self-blocked'}
        onClose={() => navigate(DETAIL)}
        bare
        label="You can't approve your own request"
        className="max-w-[500px] sm:rounded-2xl"
      >
        <div className="flex gap-3.5 px-6 pt-6 pb-2">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-warn-subtle text-warn-text">
            <Icon name="lock" size={20} strokeWidth={2} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[18px] leading-6 font-semibold text-fg">
              You can’t approve your own request
            </h2>
            <p className="text-body-m text-fg-2">
              You started this refund in chat. The Refund guardrail needs a second person. We’ve sent it to
              Leo Martins and the Support leads.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 px-6 pt-4 pb-5">
          <Button
            variant="secondary"
            size="sm"
            className="h-[34px] px-3.5"
            onClick={() =>
              toast({
                title: 'Sent to the Support leads',
                description: 'We’ll let you know when someone decides.',
              })
            }
          >
            Ask someone else
          </Button>
          <Button size="sm" className="h-[34px] px-3.5" onClick={() => navigate(DETAIL)}>
            Got it
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

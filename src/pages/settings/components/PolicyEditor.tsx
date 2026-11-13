import { useId, useState } from 'react';
import { Badge, Button, IconButton, Input, Select, Textarea } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { actionOptions, approverOptions, policyActions, type Policy, type PolicyAction } from '../data';
import { PrefixSelect } from './PrefixSelect';

const labelClass = 'text-body-s font-semibold text-fg-2';

/** Parses "$240" style amounts out of a test message. */
function amountIn(text: string) {
  const match = text.match(/\$\s?(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

/** Right-hand policy editor (W10-08): plain-words rule, conditions, action, conflict check and a live tester. */
export function PolicyEditor({
  policy,
  onClose,
  onSave,
}: {
  policy: Policy;
  onClose: () => void;
  onSave: (patch: Pick<Policy, 'rule' | 'action'>) => void;
}) {
  const id = useId();
  const [rule, setRule] = useState(policy.rule);
  const [action, setAction] = useState<PolicyAction>(policy.action);
  const [approvers, setApprovers] = useState('support-leads');
  const [tool, setTool] = useState('tool = orders.refund');
  const [join, setJoin] = useState('and');
  const [threshold, setThreshold] = useState('100');
  const [test, setTest] = useState('Please refund $240 for order 48213, charged twice.');
  const isRefund = policy.id === 'refund';

  const limit = Number(threshold) || 0;
  const amount = amountIn(test);
  const triggers = /refund/i.test(test) && amount !== null && amount > limit;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex min-w-0 flex-col gap-3.5 rounded-[18px] border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-2">
        <h2 id={`${id}-title`} className="min-w-0 truncate text-[17px] leading-6 font-semibold text-fg">
          {policy.name}
        </h2>
        <Badge bordered={false} size="sm" className="border-transparent">
          {policy.type}
        </Badge>
        <span className="flex-1" />
        <IconButton icon="close" label="Close editor" variant="ghost" size="xs" onClick={onClose} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-rule`} className={labelClass}>
          Rule in plain words
        </label>
        <Textarea
          id={`${id}-rule`}
          rows={2}
          value={rule}
          onChange={(e) => setRule(e.target.value)}
          className="rounded-lg text-13"
        />
      </div>

      {isRefund && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className={cn(labelClass, 'mb-1.5')}>When</legend>
          <div className="grid grid-cols-[minmax(0,1fr)_70px_80px] gap-1.5">
            <Input
              aria-label="Condition"
              value={tool}
              onChange={(e) => setTool(e.target.value)}
              className="h-12 font-mono text-body-s"
            />
            <Select
              aria-label="Join conditions"
              options={[
                { value: 'and', label: 'and' },
                { value: 'or', label: 'or' },
              ]}
              value={join}
              onChange={(e) => setJoin(e.target.value)}
              className="h-12 pr-7 pl-2.5 text-13"
            />
            <label className="flex h-12 flex-col justify-center rounded-md border border-border-strong bg-surface px-2.5 font-mono text-body-s leading-[18px] text-fg focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]">
              <span>amount &gt;</span>
              <input
                aria-label="Amount threshold"
                inputMode="numeric"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-transparent outline-none focus-visible:outline-none"
              />
            </label>
          </div>
        </fieldset>
      )}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-act`} className={labelClass}>
            Then
          </label>
          <PrefixSelect
            id={`${id}-act`}
            pill
            prefix="Act"
            options={actionOptions}
            value={action}
            onChange={(e) => setAction(e.target.value as PolicyAction)}
          />
        </div>
        {action === 'approval' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-who`} className={labelClass}>
              Approvers
            </label>
            <PrefixSelect
              id={`${id}-who`}
              pill
              prefix="Who"
              options={approverOptions}
              value={approvers}
              onChange={(e) => setApprovers(e.target.value)}
              containerClassName="sm:max-w-[172px]"
            />
          </div>
        )}
      </div>

      {isRefund && (
        <p className="flex gap-2.5 rounded-[10px] bg-warn-subtle px-3.5 py-2.5 text-13 leading-[18px] text-warn-text">
          <Icon name="alert-triangle" size={16} strokeWidth={2} className="mt-px shrink-0" />
          <span>
            Conflicts with <b className="font-semibold">“VIP refunds auto-approve”</b> in Ticket triage &amp;
            reply. The stricter rule wins: approval is required.
          </span>
        </p>
      )}

      {isRefund && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-test`} className={labelClass}>
            Try a message
          </label>
          <Input
            id={`${id}-test`}
            value={test}
            onChange={(e) => setTest(e.target.value)}
            className="h-10 rounded-lg text-13"
          />
          <p
            aria-live="polite"
            className={cn(
              'mt-1 flex items-start gap-2 rounded-[10px] px-3.5 py-2.5 text-13 leading-[18px]',
              triggers ? 'bg-warn-subtle text-warn-text' : 'bg-ok-subtle text-ok-text',
            )}
          >
            <Icon
              name={triggers ? 'guardrail' : 'check-circle'}
              size={15}
              strokeWidth={2}
              className="mt-px shrink-0"
            />
            {triggers ? (
              <span>
                <b className="font-semibold">Triggers.</b> orders.refund · ${amount} &gt; ${limit} →{' '}
                {policyActions[action].label}
              </span>
            ) : (
              <span>
                <b className="font-semibold">No match.</b> The agent can go ahead.
              </span>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h3 className={labelClass}>Impact if you save</h3>
        <p className="text-body-s leading-[18px] text-fg-2">
          {isRefund
            ? 'Applies to 1 agent and 2 live workflows: Ticket triage & reply, Refund over $100 → approval.'
            : `Applies to ${policy.scope === 'All agents' ? 'all 6 agents' : `1 agent (${policy.scope})`} right away.`}
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" className="h-[34px]" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" className="h-[34px]" onClick={() => onSave({ rule, action })}>
          Save policy
        </Button>
      </div>
    </section>
  );
}

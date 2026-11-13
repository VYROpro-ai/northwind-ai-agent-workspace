import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { PageHeader } from '@/components/app/PageHeader';
import {
  Badge,
  Button,
  Checkbox,
  Field,
  Modal,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tabs,
  Textarea,
  useToast,
  type Tone,
} from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { approvals, type ApprovalRequest, type Risk } from '../data';
import { BulkBar, BulkButton } from './BulkBar';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { ButtonLink } from './ButtonLink';

type QueueTab = 'waiting' | 'pending' | 'decided';

const sortOptions = ['Oldest first', 'Newest first', 'Expires soonest'] as const;
const agentOptions = ['All', 'Support Agent', 'Data Cleaner', 'Sales Researcher', 'Lead enrichment'] as const;
const riskOptions = ['Any', 'High', 'Medium', 'Low'] as const;
const actionOptions = ['Any', 'Refund', 'Reply', 'Delete', 'Tag'] as const;

const riskBadge: Record<Risk, { tone: Tone; label: string }> = {
  high: { tone: 'danger', label: 'High risk' },
  medium: { tone: 'warn', label: 'Medium risk' },
  low: { tone: 'ok', label: 'Low risk' },
};

/** Risk pill: shield icon + words, never colour alone. */
export function RiskBadge({ risk }: { risk: Risk }) {
  const r = riskBadge[risk];
  return (
    <Badge tone={r.tone} icon="shield" bordered={false} className="h-[22px] border-transparent">
      {r.label}
    </Badge>
  );
}

/** "2 h 10 min" → 130 */
const minutes = (text: string) => {
  const h = /(\d+)\s*h/.exec(text);
  const m = /(\d+)\s*min/.exec(text);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
};

/** Decided requests not in the mock list (shown as counts only). */
const DECIDED_OFFSET = 123;

/** Approvals queue (W6-05). `empty` renders the all-clear state (W6-05s). */
export function ApprovalsQueueScreen({ empty = false }: { empty?: boolean }) {
  const toast = useToast();
  const [items, setItems] = useState<ApprovalRequest[]>(() =>
    empty
      ? approvals
          .filter((a) => a.assignee === 'others' && !a.decided)
          .slice(0, 2)
          .concat(approvals.filter((a) => a.decided))
      : approvals,
  );
  const [decidedOffset] = useState(empty ? DECIDED_OFFSET + 4 : DECIDED_OFFSET);
  const [tab, setTab] = useState<QueueTab>('waiting');
  const [sort, setSort] = useState<(typeof sortOptions)[number]>('Oldest first');
  const [agent, setAgent] = useState<(typeof agentOptions)[number]>('All');
  const [risk, setRisk] = useState<(typeof riskOptions)[number]>('Any');
  const [action, setAction] = useState<(typeof actionOptions)[number]>('Any');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(empty ? [] : ['apr_241', 'apr_242']));
  const [rejecting, setRejecting] = useState<string[] | null>(null);
  const [notice, setNotice] = useState(!empty);

  const open = items.filter((a) => !a.decided);
  const counts = {
    waiting: open.filter((a) => a.assignee === 'me').length,
    pending: open.length,
    decided: items.filter((a) => a.decided).length + decidedOffset,
  };

  const rows = useMemo(() => {
    const list = items.filter((a) => {
      if (tab === 'decided') return Boolean(a.decided);
      if (a.decided) return false;
      if (tab === 'waiting' && a.assignee !== 'me') return false;
      if (agent !== 'All' && !a.context.startsWith(agent)) return false;
      if (risk !== 'Any' && a.risk !== risk.toLowerCase()) return false;
      if (action !== 'Any' && !a.title.toLowerCase().includes(action.toLowerCase())) return false;
      return true;
    });
    if (tab === 'decided') return list;
    const key =
      sort === 'Expires soonest'
        ? (a: ApprovalRequest) => minutes(a.expires)
        : (a: ApprovalRequest) => -minutes(a.waiting);
    return [...list].sort((a, b) => (sort === 'Newest first' ? key(b) - key(a) : key(a) - key(b)));
  }, [items, tab, agent, risk, action, sort]);

  const decide = (ids: string[], decided: 'Approved' | 'Rejected') => {
    const before = items;
    setItems((list) => list.map((a) => (ids.includes(a.id) ? { ...a, decided } : a)));
    setSelected((s) => new Set([...s].filter((id) => !ids.includes(id))));
    const first = items.find((a) => a.id === ids[0]);
    toast({
      title: ids.length === 1 && first ? `${decided} · ${first.title}` : `${decided} ${ids.length} requests`,
      description: decided === 'Approved' ? 'The agent picks it up right away.' : 'The agent was told why.',
      tone: decided === 'Approved' ? 'ok' : 'neutral',
      action: { label: 'Undo', onClick: () => setItems(before) },
    });
  };

  const selectable = rows.filter((a) => a.risk !== 'high' && !a.decided);
  const selectedRows = open.filter((a) => selected.has(a.id));
  const allLow = selectedRows.every((a) => a.risk === 'low');
  const allSelected = selectable.length > 0 && selectable.every((a) => selected.has(a.id));
  const someSelected = selectable.some((a) => selected.has(a.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const showEmpty = tab !== 'decided' && rows.length === 0;
  const filtersActive = agent !== 'All' || risk !== 'Any' || action !== 'Any';

  return (
    <AppShell
      active="Approvals"
      role="reviewer"
      crumbs={[{ label: 'Workspace', to: '/' }, { label: 'Approvals' }]}
    >
      <PageHeader
        title="Approvals"
        description="Agents pause here until a person decides."
        actions={
          counts.pending > 0 &&
          !empty && (
            <>
              <FilterSelect label="Sort" value={sort} options={sortOptions} onChange={setSort} align="end" />
              <FilterSelect
                label="Agent"
                value={agent}
                options={agentOptions}
                onChange={setAgent}
                align="end"
              />
              <FilterSelect label="Risk" value={risk} options={riskOptions} onChange={setRisk} align="end" />
              <FilterSelect
                label="Action"
                value={action}
                options={actionOptions}
                onChange={setAction}
                align="end"
              />
            </>
          )
        }
      />
      <Tabs
        label="Approval queues"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'waiting', label: 'Waiting for me', count: counts.waiting },
          { value: 'pending', label: 'All pending', count: counts.pending },
          { value: 'decided', label: 'Decided', count: counts.decided },
        ]}
      />

      {selectedRows.length > 0 && tab !== 'decided' && (
        <BulkBar
          title={`${selectedRows.length} ${allLow ? 'low-risk ' : ''}${selectedRows.length === 1 ? 'request' : 'requests'} selected`}
          hint="High-risk requests must be opened one by one"
        >
          <BulkButton onClick={() => setRejecting(selectedRows.map((a) => a.id))}>
            Reject {selectedRows.length}
          </BulkButton>
          <BulkButton
            tone="brand"
            onClick={() =>
              decide(
                selectedRows.map((a) => a.id),
                'Approved',
              )
            }
          >
            Approve {selectedRows.length}…
          </BulkButton>
        </BulkBar>
      )}

      {showEmpty && !filtersActive ? (
        <AllClear onViewDecided={() => setTab('decided')} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <TableContainer>
            <Table className="min-w-[860px] text-13">
              <THead className="border-b border-border bg-sunken font-medium">
                <tr>
                  <TH className="w-10 pl-4 first:pl-4">
                    {tab !== 'decided' && (
                      <Checkbox
                        aria-label="Select all low- and medium-risk requests"
                        checked={someSelected}
                        indeterminate={someSelected && !allSelected}
                        disabled={selectable.length === 0}
                        onChange={() =>
                          setSelected((s) => {
                            const next = new Set(s);
                            selectable.forEach((a) => (allSelected ? next.delete(a.id) : next.add(a.id)));
                            return next;
                          })
                        }
                      />
                    )}
                  </TH>
                  <TH>Request</TH>
                  <TH className="w-[110px]">Risk</TH>
                  <TH className="w-[112px]">Waiting</TH>
                  <TH className="w-[120px]">Expires</TH>
                  <TH className="w-[190px]">
                    <span className="sr-only">Actions</span>
                  </TH>
                </tr>
              </THead>
              <TBody>
                {rows.map((a) => (
                  <ApprovalRow
                    key={a.id}
                    request={a}
                    checked={selected.has(a.id)}
                    onCheck={() => toggle(a.id)}
                    onApprove={() => decide([a.id], 'Approved')}
                    onReject={() => setRejecting([a.id])}
                  />
                ))}
              </TBody>
            </Table>
          </TableContainer>
          {rows.length === 0 && (
            <p className="px-5 py-10 text-center text-13 text-fg-3">
              {tab === 'decided' ? 'Nothing decided yet.' : 'No requests match these filters.'}
            </p>
          )}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex max-w-full animate-pop-in items-center gap-3 self-end rounded-2xl bg-inverse px-3.5 py-3 text-13 text-on-inverse shadow-overlay"
        >
          <Icon name="info" size={15} strokeWidth={2} className="shrink-0" />
          <p className="min-w-0">
            <b className="font-semibold">Already approved by Maya Chen.</b> “Refund $18 to Pinecrest” left
            your queue.
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice(false)}
            className="shrink-0 rounded-full p-0.5 opacity-80 hover:opacity-100"
          >
            <Icon name="close" size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {!showEmpty && (
        <p className="text-body-s text-fg-3">
          Decided in the last 24 h: 31 approved · 4 rejected · 2 expired (escalated to Maya Chen)
        </p>
      )}

      <RejectModal
        count={rejecting?.length ?? 0}
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        onConfirm={() => {
          decide(rejecting ?? [], 'Rejected');
          setRejecting(null);
        }}
      />
    </AppShell>
  );
}

function ApprovalRow({
  request: a,
  checked,
  onCheck,
  onApprove,
  onReject,
}: {
  request: ApprovalRequest;
  checked: boolean;
  onCheck: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const high = a.risk === 'high';
  return (
    <TR className={cn(high && !a.decided && 'bg-danger-subtle shadow-[inset_3px_0_0_var(--danger)]')}>
      <TD className="h-[67px] pl-4 first:pl-4">
        {!a.decided && (
          <Checkbox
            aria-label={high ? `${a.title} — high risk, open to decide` : `Select ${a.title}`}
            checked={checked}
            disabled={high}
            onChange={onCheck}
          />
        )}
      </TD>
      <TD className="h-[67px] max-w-0">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-ai-subtle text-ai-text">
            <Icon name="nav-agents" size={18} strokeWidth={1.8} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              to="/approvals/apr_240"
              className="truncate text-body-m font-semibold text-fg hover:underline"
            >
              {a.title}
            </Link>
            <span className="truncate text-body-s text-fg-3">{a.context}</span>
          </div>
        </div>
      </TD>
      <TD className="h-[67px]">
        <RiskBadge risk={a.risk} />
      </TD>
      {a.decided ? (
        <TD className="h-[67px] text-fg-2" colSpan={3}>
          <div className="flex justify-end">
            <Badge
              tone={a.decided === 'Approved' ? 'ok' : a.decided === 'Rejected' ? 'danger' : 'neutral'}
              icon={a.decided === 'Approved' ? 'check-sm' : a.decided === 'Rejected' ? 'close' : 'clock'}
              bordered={false}
              className="border-transparent"
            >
              {a.decided}
            </Badge>
          </div>
        </TD>
      ) : (
        <>
          <TD className="h-[67px]">
            <span className="block text-body-l text-fg-2">{a.waiting}</span>
            <span className="block text-body-s text-fg-3">waiting</span>
          </TD>
          <TD className="h-[67px]">
            <span className="block text-body-l font-medium text-warn-text">{a.expires}</span>
            <span className="block text-body-s text-fg-3">expires in</span>
          </TD>
          <TD className="h-[67px]">
            <div className="flex justify-end gap-1.5">
              {high ? (
                <ButtonLink to="/approvals/apr_240">Open</ButtonLink>
              ) : (
                <>
                  <Button variant="secondary" size="sm" className="h-[30px] px-3" onClick={onReject}>
                    Reject
                  </Button>
                  <Button size="sm" className="h-[30px] px-3" onClick={onApprove}>
                    Approve
                  </Button>
                </>
              )}
            </div>
          </TD>
        </>
      )}
    </TR>
  );
}

function AllClear({ onViewDecided }: { onViewDecided: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-4 py-16 text-center sm:py-[100px]">
      <span className="inline-flex size-[72px] items-center justify-center rounded-2xl bg-ok-subtle text-ok-text">
        <Icon name="check-sm" size={32} strokeWidth={2.4} />
      </span>
      <h2 className="text-[22px] leading-[30px] font-semibold text-fg">
        All clear. Nothing waiting for you.
      </h2>
      <p className="max-w-[420px] text-body-m text-fg-2">
        We’ll notify you in the app, by email and on your phone when an agent needs a decision.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="sm" className="h-[34px] px-3.5" onClick={onViewDecided}>
          View decided
        </Button>
        <ButtonLink to="/settings/notifications" variant="ghost" size="md">
          Notification settings
        </ButtonLink>
      </div>
    </div>
  );
}

function RejectModal({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const close = () => {
    setReason('');
    setTouched(false);
    onClose();
  };
  const invalid = touched && !reason.trim();
  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title={count > 1 ? `Reject ${count} requests` : 'Reject request'}
      description="The agent sees your reason and learns from it."
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setTouched(true);
              if (!reason.trim()) return;
              onConfirm();
              setReason('');
              setTouched(false);
            }}
          >
            Reject
          </Button>
        </>
      }
    >
      <Field
        label="Reason"
        required
        error={invalid ? 'Add a reason so the agent knows what to change.' : undefined}
      >
        {(id, describedBy) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            rows={3}
            invalid={invalid}
            placeholder="e.g. Customer already got a manual refund"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
      </Field>
    </Modal>
  );
}

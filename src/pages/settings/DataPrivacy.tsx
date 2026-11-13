import { useId, useState, type ReactNode } from 'react';
import { Button, Input, Modal, Segmented, Switch, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import {
  piiRules,
  retentionOptions,
  retentionRules,
  workspaceName,
  type PiiKind,
  type Retention,
  type RetentionRule,
} from './data';
import { SettingsCard, SettingsCardHeader, SettingsLayout, SettingsRow } from './components/SettingsLayout';
import { dangerSoft, rectSegmented } from './components/styles';
import { cn } from '@/lib/cn';

type RetentionState = Record<RetentionRule['id'], Retention>;

const initialRetention = Object.fromEntries(retentionRules.map((r) => [r.id, r.value])) as RetentionState;
const initialPii = Object.fromEntries(piiRules.map((r) => [r.id, r.on])) as Record<PiiKind, boolean>;

/** Masked or plain token inside the trace preview. */
function Token({ masked, plain, hidden }: { masked: string; plain: string; hidden: boolean }) {
  return hidden ? (
    <code className="rounded-xs bg-subtle px-1 font-mono text-body-s text-fg-2">{masked}</code>
  ) : (
    <span>{plain}</span>
  );
}

function RetentionCard() {
  const toast = useToast();
  const [saved, setSaved] = useState(initialRetention);
  const [value, setValue] = useState(initialRetention);
  const pendingRuns = value.runs === '30d' && saved.runs !== '30d';

  const change = (id: RetentionRule['id'], next: Retention) => {
    setValue((v) => ({ ...v, [id]: next }));
    if (id !== 'runs' || next !== '30d') {
      setSaved((s) => ({ ...s, [id]: next }));
      toast({
        title: 'Retention updated',
        description: `${retentionRules.find((r) => r.id === id)?.label} · ${retentionOptions.find((o) => o.value === next)?.label}`,
      });
    }
  };

  return (
    <SettingsCard>
      <SettingsCardHeader title="Retention" description="Older data is deleted every night." />
      {retentionRules.map((rule) => (
        <SettingsRow key={rule.id} label={rule.label} description={rule.description}>
          <Segmented<Retention>
            size="sm"
            label={`${rule.label} retention`}
            value={value[rule.id]}
            onChange={(next) => change(rule.id, next)}
            options={retentionOptions.map((o) => ({ ...o, disabled: rule.locked?.includes(o.value) }))}
            className={cn(rectSegmented, 'scrollbar-none max-w-full overflow-x-auto')}
          />
        </SettingsRow>
      ))}
      {pendingRuns && (
        <div className="px-[18px] pb-4">
          <div
            role="alert"
            className="flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-[10px] bg-warn-subtle px-3.5 py-2.5 text-13 text-warn-text"
          >
            <Icon name="alert-triangle" size={16} strokeWidth={2} className="shrink-0" />
            <p className="min-w-0 flex-1 basis-64">
              <b className="font-semibold">Runs older than 30 days will be deleted on Oct 28.</b> That’s 8,214
              runs. Export them first if you need them.
            </p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setValue((v) => ({ ...v, runs: saved.runs }))}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSaved((s) => ({ ...s, runs: '30d' }));
                  toast({
                    tone: 'warn',
                    title: 'Runs kept for 30 days',
                    description: 'Older runs are deleted on Oct 28.',
                  });
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}

function MaskingCards() {
  const [pii, setPii] = useState(initialPii);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SettingsCard>
        <SettingsCardHeader title="Mask personal data" description="Hidden in traces, logs and exports." />
        {piiRules.map((rule) => (
          <SettingsRow key={rule.id} label={rule.label} className="py-3">
            <Switch
              aria-label={`Mask ${rule.label.toLowerCase()}`}
              checked={pii[rule.id]}
              onChange={(e) => setPii((p) => ({ ...p, [rule.id]: e.target.checked }))}
            />
          </SettingsRow>
        ))}
      </SettingsCard>
      <SettingsCard>
        <SettingsCardHeader title="Preview" description="How a trace looks with these settings" />
        <p aria-live="polite" className="px-[18px] pb-4 text-13 leading-6 text-fg-2">
          Customer <Token hidden={pii.email} masked="d•••@acme.example" plain="dana.whitfield@acme.example" />{' '}
          called from <Token hidden={pii.phone} masked="+1 •••-•••-0192" plain="+1 415-555-0192" /> about card{' '}
          <Token hidden={pii.card} masked="•••• 4417" plain="4242 8810 3391 4417" />. ID{' '}
          <Token hidden={pii.nationalId} masked="••••-••••-33" plain="4920-1877-33" /> was shared.
        </p>
      </SettingsCard>
    </div>
  );
}

function DeleteDataModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const id = useId();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const ready = name.trim() === workspaceName && /^\d{6}$/.test(code);
  const close = () => {
    setName('');
    setCode('');
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      icon={
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-subtle text-danger-text">
          <Icon name="alert-triangle" size={18} strokeWidth={2} />
        </span>
      }
      title="Delete all workspace data?"
      description="Chats, runs, files, agents and settings are erased for everyone. This can’t be undone."
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!ready}
            onClick={() => {
              close();
              toast({
                tone: 'danger',
                title: 'Deletion scheduled',
                description: 'All data is erased within 24 hours.',
              });
            }}
          >
            Delete everything
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-name`} className="text-body-m font-medium text-fg">
            Type <b className="font-semibold">{workspaceName}</b> to confirm
          </label>
          <Input
            id={`${id}-name`}
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            placeholder={workspaceName}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-code`} className="text-body-m font-medium text-fg">
            2FA code
          </label>
          <Input
            id={`${id}-code`}
            value={code}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="6-digit code"
            className="font-mono tracking-[0.2em]"
          />
        </div>
      </div>
    </Modal>
  );
}

function DangerRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <SettingsRow label={label} description={description} className="border-danger-border/60">
      {children}
    </SettingsRow>
  );
}

/** W10-06 · Data retention & privacy */
export default function DataPrivacy() {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  return (
    <SettingsLayout
      crumb="Data & privacy"
      role="owner"
      title="Data & privacy"
      description="How long data is kept and what’s hidden."
    >
      <p className="flex items-center gap-2.5 rounded-[10px] bg-ok-subtle px-3.5 py-2.5 text-13 text-ok-text">
        <Icon name="shield" size={16} strokeWidth={2} className="shrink-0" />
        Northwind never uses your data to train models. This is always on.
      </p>
      <RetentionCard />
      <MaskingCards />
      <SettingsCard danger>
        <SettingsCardHeader title="Danger zone" danger />
        <DangerRow
          label="Export all workspace data"
          description="A ZIP of chats, runs, files and settings. Ready in about 20 minutes."
        >
          <Button
            size="sm"
            variant="secondary"
            disabled={exporting}
            onClick={() => {
              setExporting(true);
              toast({
                title: 'Export requested',
                description: 'We’ll email maya@northwindlabs.com when it’s ready.',
              });
            }}
          >
            {exporting ? 'Export requested' : 'Request export'}
          </Button>
        </DangerRow>
        <DangerRow
          label="Delete all workspace data"
          description="Owner only. Needs the workspace name and a 2FA code. This can’t be undone."
        >
          <Button size="sm" variant="secondary" className={dangerSoft} onClick={() => setDeleting(true)}>
            Delete all data…
          </Button>
        </DangerRow>
      </SettingsCard>
      <DeleteDataModal open={deleting} onClose={() => setDeleting(false)} />
    </SettingsLayout>
  );
}

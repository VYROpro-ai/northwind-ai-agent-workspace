import { cn } from '@/lib/cn';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Button, Field, Input, Radio, Segmented, useToast } from '@/components/ui';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { keyExpiryOptions, type KeyExpiry, type KeyScope } from '../data';
import { boardSegmented, fieldLabels, labelText } from '../utils';

export interface NewKeyRequest {
  name: string;
  scope: KeyScope;
  expiry: KeyExpiry;
  allowedIps: string;
}

const scopes: KeyScope[] = ['Read', 'Write', 'Admin'];

/** Name, expiry, scope and optional IP allow-list for a new API key. */
export function CreateKeyForm({
  initialName = 'Mobile app',
  onCreate,
  onCancel,
}: {
  initialName?: string;
  onCreate: (request: NewKeyRequest) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [expiry, setExpiry] = useState<KeyExpiry>('90d');
  const [scope, setScope] = useState<KeyScope>('Read');
  const [showIps, setShowIps] = useState(false);
  const [allowedIps, setAllowedIps] = useState('');
  const [touched, setTouched] = useState(false);
  const invalid = touched && !name.trim();

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (name.trim()) onCreate({ name: name.trim(), scope, expiry, allowedIps });
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" error={invalid ? 'Give the key a name' : undefined} className={fieldLabels}>
          {(id, describedBy) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              value={name}
              invalid={invalid}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Mobile app"
              className="px-2.5 text-13"
            />
          )}
        </Field>
        <div className="flex flex-col gap-1.5">
          <span className={labelText}>Expires</span>
          <Segmented
            label="Expires"
            size="sm"
            className={cn(boardSegmented, '[&>button]:h-[30px]')}
            options={keyExpiryOptions.map((o) => ({ value: o.value, label: o.label }))}
            value={expiry}
            onChange={setExpiry}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
        <span className="text-body-s font-semibold text-fg-2" id="key-scope">
          Scope
        </span>
        <div role="radiogroup" aria-labelledby="key-scope" className="flex flex-wrap items-center gap-3.5">
          {scopes.map((s) => (
            <Radio
              key={s}
              name="key-scope"
              checked={scope === s}
              onChange={() => setScope(s)}
              label={<span className="text-13">{s}</span>}
            />
          ))}
        </div>
        <Button
          variant="link"
          className="ml-auto text-body-s font-normal text-fg-3"
          aria-expanded={showIps}
          onClick={() => setShowIps((v) => !v)}
        >
          Allowed IPs (optional)
        </Button>
      </div>
      {showIps && (
        <Field label="Allowed IPs" hint="Comma-separated addresses or CIDR ranges.">
          {(id, describedBy) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
              placeholder="203.0.113.0/24"
              className="font-mono text-body-s"
            />
          )}
        </Field>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Create key
        </Button>
      </div>
    </form>
  );
}

/** Shows a freshly created key exactly once, with copy-to-clipboard. */
export function NewKeyReveal({ secret, onDone }: { secret: string; onDone: () => void }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast({ title: 'Key copied to the clipboard', tone: 'ok' });
    } catch {
      toast({ title: 'Couldn’t copy — select the key and copy it manually', tone: 'warn' });
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-[46px] flex-wrap items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 py-1.5">
        <code className="min-w-0 flex-1 font-mono text-body-s break-all text-fg select-all">{secret}</code>
        <Button size="xs" leftIcon={copied ? 'check' : 'copy'} className="h-7 px-3 text-13" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <InlineNotice tone="warn">You won’t see this key again. Store it somewhere safe now.</InlineNotice>
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={onDone}>
          I’ve saved it
        </Button>
      </div>
    </div>
  );
}

/** Placeholder for the reveal panel before a key has been created. */
export function NewKeyEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-strong px-4 py-6 text-center">
      <Icon name="key" size={18} className="text-fg-3" />
      <p className="text-13 text-fg-2">Create a key and it appears here — once.</p>
    </div>
  );
}

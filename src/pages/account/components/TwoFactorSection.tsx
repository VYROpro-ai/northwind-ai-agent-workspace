import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Badge, Button, useToast } from '@/components/ui';
import { backupCodes, qrRows } from '../data';
import { OtpInput } from './OtpInput';
import { SettingsSection } from './AccountLayout';

/** Placeholder QR — always dark modules on white so it scans in either theme. */
function QrCode() {
  return (
    <div className="shrink-0 rounded-[10px] border border-border bg-white p-2.5">
      <div role="img" aria-label="Authenticator QR code" className="grid grid-cols-[repeat(17,6px)]">
        {qrRows.flatMap((row, r) =>
          row
            .split('')
            .map((cell, c) => (
              <span key={`${r}-${c}`} className={cn('size-1.5', cell === '1' && 'bg-[var(--slate-950)]')} />
            )),
        )}
      </div>
    </div>
  );
}

/** W12-01 · Two-factor setup: QR, 6-digit code and one-time backup codes. */
export function TwoFactorSection() {
  const toast = useToast();
  const [code, setCode] = useState('4810');
  const [enabled, setEnabled] = useState(false);

  const onCode = (next: string) => {
    setCode(next);
    if (!enabled && next.replace(/\s/g, '').length === 6) {
      setEnabled(true);
      toast({
        title: 'Two-factor authentication is on',
        description: 'You’ll be asked for a code when you sign in.',
      });
    }
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      toast({ title: 'Backup codes copied' });
    } catch {
      toast({
        title: 'Couldn’t copy',
        description: 'Select the codes and copy them manually.',
        tone: 'warn',
      });
    }
  };

  const downloadCodes = () => {
    const url = URL.createObjectURL(new Blob([backupCodes.join('\n')], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'northwind-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SettingsSection
      title="Two-factor authentication"
      description="Scan the code with an authenticator app, then enter the 6-digit code."
      aside={
        enabled ? (
          <Badge tone="ok" icon="check-sm" bordered={false} className="border-transparent">
            On
          </Badge>
        ) : (
          <Badge tone="brand" bordered={false} className="border-transparent">
            Setting up
          </Badge>
        )
      }
    >
      <div className="flex flex-col gap-6 px-4 pb-4 sm:flex-row sm:items-start sm:px-[18px]">
        <QrCode />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col gap-1.5">
            <span className="text-body-s font-semibold text-fg-2">6-digit code</span>
            <OtpInput label="6-digit code" value={code} onChange={onCode} />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="flex-1 text-body-s font-semibold text-fg-2">Backup codes</span>
            <Button variant="ghost" size="sm" leftIcon="copy" className="h-[26px]" onClick={copyCodes}>
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon="download"
              className="h-[26px]"
              onClick={downloadCodes}
            >
              Download
            </Button>
          </div>
          <ul className="flex flex-wrap gap-1.5" aria-label="Backup codes">
            {backupCodes.map((c) => (
              <li key={c} className="rounded-sm bg-subtle px-2 py-1 font-mono text-body-s">
                {c}
              </li>
            ))}
          </ul>
          <p className="text-body-s leading-[18px] text-warn-text">
            You’ll only see these once. Each code works one time.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  IconButton,
  Modal,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
  type Tone,
} from '@/components/ui';
import { people } from '@/data/people';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { IntegrationsShell } from './components/IntegrationsShell';
import { boardCell as cell } from './utils';
import { CreateKeyForm, NewKeyEmpty, NewKeyReveal, type NewKeyRequest } from './components/ApiKeyForms';
import { apiKeys, keyExpiryOptions, type ApiKey, type KeyScope } from './data';

const scopeTone: Record<KeyScope, Tone> = { Read: 'neutral', Write: 'brand', Admin: 'ai' };

/** Obviously fake demo secret — the template never generates anything that looks like a real key. */
function demoSecret() {
  const tail = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, '0');
  return { secret: `sk-demo-NOT-A-REAL-KEY-${tail}`, masked: `sk-demo-••••${tail}` };
}

/** Fixed, obviously fake secret for the design's "just created" state. */
const initialDemoSecret = 'sk-demo-NOT-A-REAL-KEY-7qe2';

function KeyStatus({ status }: { status: ApiKey['status'] }) {
  const pill = 'border-transparent h-5 px-2 text-body-s';
  if (status === 'active')
    return (
      <Badge tone="ok" dot bordered={false} className={pill}>
        Active
      </Badge>
    );
  if (status === 'disabled')
    return (
      <Badge tone="danger" icon="close" bordered={false} className={pill}>
        Disabled
      </Badge>
    );
  return (
    <Badge tone="neutral" dot bordered={false} className={pill}>
      Revoked
    </Badge>
  );
}

function KeyRow({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke: () => void }) {
  const toast = useToast();
  return (
    <TR className={cn('text-13 [&>td]:h-[44px]', apiKey.status === 'disabled' && 'bg-danger-subtle')}>
      <TD className={cn(cell, 'truncate font-semibold text-fg')}>{apiKey.name}</TD>
      <TD className={cn(cell, 'font-mono text-body-s whitespace-nowrap text-fg-2')}>{apiKey.masked}</TD>
      <TD className={cell}>
        <Badge
          tone={scopeTone[apiKey.scope]}
          bordered={false}
          className="h-5 border-transparent px-2 text-body-s"
        >
          {apiKey.scope}
        </Badge>
      </TD>
      <TD className={cell}>
        <Avatar name={apiKey.owner.name} src={apiKey.owner.avatar} size="xs" />
      </TD>
      <TD className={cn(cell, 'text-fg-2 tabular')}>{apiKey.created}</TD>
      <TD className={cn(cell, 'whitespace-nowrap text-fg-2 tabular')}>{apiKey.lastUsed}</TD>
      <TD className={cn(cell, 'whitespace-nowrap text-fg-2 tabular')}>
        {apiKey.expiresSoon ? (
          <Badge
            tone="warn"
            icon="clock"
            bordered={false}
            className="h-5 border-transparent px-2 text-body-s"
          >
            {apiKey.expires}
          </Badge>
        ) : (
          apiKey.expires
        )}
      </TD>
      <TD className={cell}>
        <KeyStatus status={apiKey.status} />
      </TD>
      <TD className={cn(cell, 'text-right')}>
        <Dropdown
          align="end"
          width={200}
          items={[
            {
              label: 'Copy masked key',
              icon: 'copy',
              onSelect: () => {
                void navigator.clipboard?.writeText(apiKey.masked).catch(() => undefined);
                toast({ title: 'Masked key copied' });
              },
            },
            {
              label: 'Revoke key',
              icon: 'reject',
              danger: true,
              separator: true,
              disabled: apiKey.status === 'revoked',
              onSelect: onRevoke,
            },
          ]}
          trigger={(props) => (
            <IconButton
              {...props}
              icon="more"
              label={`Actions for ${apiKey.name}`}
              variant="ghost"
              size="xs"
            />
          )}
        />
      </TD>
    </TR>
  );
}

/** W8-04 · API keys — list, create (key shown once) and revoke with confirmation. */
export default function ApiKeys() {
  const toast = useToast();
  const [keys, setKeys] = useState(apiKeys);
  const [modal, setModal] = useState<{ name?: string; secret?: string } | null>(null);
  // The design shows the panel right after "Mobile app" was created, so it starts revealed.
  const [inlineSecret, setInlineSecret] = useState<string | null>(initialDemoSecret);
  const [formKey, setFormKey] = useState(0);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const [staleNotice, setStaleNotice] = useState(true);

  const create = (request: NewKeyRequest) => {
    const { secret, masked } = demoSecret();
    const expires = keyExpiryOptions.find((o) => o.value === request.expiry)?.expires ?? 'Never';
    const newKey: ApiKey = {
      id: `k-${Date.now()}`,
      name: request.name,
      masked,
      scope: request.scope,
      owner: people.daniel,
      created: 'Today',
      lastUsed: 'Never',
      expires,
      status: 'active',
    };
    setKeys((list) => [newKey, ...list]);
    toast({ title: `“${request.name}” created`, tone: 'ok' });
    return secret;
  };

  const revoke = (key: ApiKey) => {
    setKeys((list) => list.map((k) => (k.id === key.id ? { ...k, status: 'revoked', expires: '—' } : k)));
    if (key.id === 'k3') setStaleNotice(false);
    setRevoking(null);
    toast({ title: `“${key.name}” revoked`, description: 'Requests using it now fail with 401.' });
  };

  const staleKey = keys.find((k) => k.id === 'k3');

  return (
    <IntegrationsShell
      tab="/integrations/api-keys"
      current="API keys"
      actions={
        <Button size="sm" leftIcon="plus" onClick={() => setModal({})}>
          Create API key
        </Button>
      }
    >
      <InlineNotice
        tone="danger"
        icon="shield"
        title="“Old website widget” was found in a public code repo and has been disabled."
        actions={
          <Button
            variant="secondary"
            size="xs"
            className="h-7 px-3 text-13"
            onClick={() => setModal({ name: 'Website widget' })}
          >
            Create replacement
          </Button>
        }
      >
        Create a new key and update the widget. Nothing was called with it after 10:02 AM.
      </InlineNotice>

      <Card padding="none" className="overflow-hidden rounded-[18px]">
        <TableContainer>
          <Table className="min-w-[1000px] table-fixed">
            <THead className="border-b border-border bg-sunken font-medium">
              <tr>
                <TH className={cn(cell, 'h-9')}>Name</TH>
                <TH className={cn(cell, 'h-9 w-[160px]')}>Key</TH>
                <TH className={cn(cell, 'h-9 w-[80px]')}>Scope</TH>
                <TH className={cn(cell, 'h-9 w-[38px]')}>By</TH>
                <TH className={cn(cell, 'h-9 w-[94px]')}>Created</TH>
                <TH className={cn(cell, 'h-9 w-[110px]')}>Last used</TH>
                <TH className={cn(cell, 'h-9 w-[120px]')}>Expires</TH>
                <TH className={cn(cell, 'h-9 w-[102px]')}>Status</TH>
                <TH className={cn(cell, 'h-9 w-[41px]')}>
                  <span className="sr-only">Actions</span>
                </TH>
              </tr>
            </THead>
            <TBody>
              {keys.map((k) => (
                <KeyRow key={k.id} apiKey={k} onRevoke={() => setRevoking(k)} />
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </Card>

      {staleNotice && staleKey?.status === 'active' && (
        <InlineNotice
          tone="info"
          actions={
            <>
              <Button
                variant="ghost"
                size="xs"
                className="h-7 px-3 text-13"
                onClick={() => setStaleNotice(false)}
              >
                Keep
              </Button>
              <Button
                variant="secondary"
                size="xs"
                className="h-7 px-3 text-13"
                onClick={() => setRevoking(staleKey)}
              >
                Revoke
              </Button>
            </>
          }
        >
          “Data export job” hasn’t been used in 94 days. Revoke it to reduce risk?
        </InlineNotice>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="none" className="flex flex-col gap-3.5 rounded-[18px] p-4">
          <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Create API key</h2>
          <CreateKeyForm
            key={formKey}
            onCreate={(request) => {
              setInlineSecret(create(request));
              setFormKey((n) => n + 1);
            }}
            onCancel={() => setFormKey((n) => n + 1)}
          />
        </Card>
        <Card padding="none" className="flex flex-col gap-3 rounded-[18px] p-4">
          <div className="flex items-center gap-2">
            <Icon name="key" size={16} strokeWidth={2} className="text-ok-text" />
            <h2 className="text-body-m font-semibold text-fg">Your new key</h2>
          </div>
          {inlineSecret ? (
            <NewKeyReveal secret={inlineSecret} onDone={() => setInlineSecret(null)} />
          ) : (
            <NewKeyEmpty />
          )}
        </Card>
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.secret ? 'Your new key' : 'Create API key'}
        description={modal?.secret ? undefined : 'Keys act as your workspace. Give each app its own key.'}
      >
        {modal?.secret ? (
          <NewKeyReveal secret={modal.secret} onDone={() => setModal(null)} />
        ) : (
          modal && (
            <CreateKeyForm
              initialName={modal.name ?? ''}
              onCreate={(request) => setModal({ secret: create(request) })}
              onCancel={() => setModal(null)}
            />
          )
        )}
      </Modal>

      <Modal
        open={revoking !== null}
        onClose={() => setRevoking(null)}
        size="sm"
        title="Revoke this key?"
        description={
          revoking
            ? `Anything using “${revoking.name}” (${revoking.masked}) stops working immediately. This can’t be undone.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRevoking(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={() => revoking && revoke(revoking)}>
              Revoke key
            </Button>
          </>
        }
      />
    </IntegrationsShell>
  );
}

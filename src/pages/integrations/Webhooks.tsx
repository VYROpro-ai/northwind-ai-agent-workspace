import { useRef, useState, type RefObject } from 'react';
import { cn } from '@/lib/cn';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Input,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
} from '@/components/ui';
import { formatNumber } from '@/lib/format';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { IntegrationsShell } from './components/IntegrationsShell';
import { boardCell as cell, fieldLabels, labelText } from './utils';
import {
  deliveries as initialDeliveries,
  webhookEndpoints,
  webhookEvents,
  type WebhookEndpoint,
  type WebhookEvent,
} from './data';

const hex4 = () =>
  Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, '0');

function urlError(url: string) {
  const value = url.trim();
  if (!value) return 'Enter the URL that should receive events.';
  if (value.startsWith('http://')) return 'Use an https:// URL. We don’t send events over plain http.';
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? null : 'Use an https:// URL.';
  } catch {
    return 'Enter a full URL, like https://example.com/hook.';
  }
}

function EventTag({ event }: { event: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-xs bg-subtle px-1.5 font-mono text-caption whitespace-nowrap text-fg-2">
      {event}
    </span>
  );
}

function SigningSecret() {
  const toast = useToast();
  const [tail, setTail] = useState('3c9e');
  const [revealed, setRevealed] = useState(false);
  const secret = `whsec_demo_not_a_real_secret_${tail}`;
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelText}>Signing secret</span>
      <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 py-1.5">
        <code className="min-w-0 flex-1 truncate font-mono text-body-s text-fg">
          {revealed ? secret : `whsec_••••••••••••••••${tail}`}
        </code>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="xs"
            leftIcon={revealed ? 'eye-off' : 'eye'}
            className="text-13"
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? 'Hide' : 'Reveal'}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            leftIcon="copy"
            className="text-13"
            onClick={() => {
              void navigator.clipboard?.writeText(secret).catch(() => undefined);
              toast({ title: 'Signing secret copied', tone: 'ok' });
            }}
          >
            Copy
          </Button>
          <Button
            variant="ghost"
            size="xs"
            leftIcon="refresh"
            className="text-13"
            onClick={() => {
              setTail(hex4());
              toast({ title: 'Secret rotated', description: 'The old secret keeps working for 24 hours.' });
            }}
          >
            Rotate
          </Button>
        </div>
      </div>
    </div>
  );
}

const initialUrl = 'http://staging.northwindlabs.com/hook';
const initialEvents: WebhookEvent[] = ['run.completed', 'run.failed', 'approval.requested'];

function AddEndpointForm({
  urlRef,
  onAdd,
}: {
  urlRef: RefObject<HTMLInputElement | null>;
  onAdd: (url: string, events: WebhookEvent[]) => void;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [events, setEvents] = useState<WebhookEvent[]>(initialEvents);
  const error = urlError(url);
  const canAdd = !error && events.length > 0;

  const reset = () => {
    setUrl('');
    setEvents(initialEvents);
  };

  return (
    <Card padding="none" className="flex w-full min-w-0 flex-col gap-3.5 rounded-[18px] p-4 xl:flex-1">
      <h2 className="text-[15px] leading-[22px] font-semibold text-fg" id="add-endpoint">
        Add endpoint
      </h2>
      <form
        aria-labelledby="add-endpoint"
        className="flex flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canAdd) return;
          onAdd(url.trim(), events);
          reset();
        }}
      >
        <Field label="Endpoint URL" error={url ? (error ?? undefined) : undefined} className={fieldLabels}>
          {(id, describedBy) => (
            <Input
              ref={urlRef}
              id={id}
              aria-describedby={describedBy}
              value={url}
              invalid={Boolean(url && error)}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/northwind-events"
              className="font-mono text-body-s"
            />
          )}
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className={cn(labelText, 'mb-2')}>Events</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {webhookEvents.map((event) => (
              <Checkbox
                key={event}
                checked={events.includes(event)}
                onChange={(e) =>
                  setEvents((list) => (e.target.checked ? [...list, event] : list.filter((x) => x !== event)))
                }
                label={<span className="font-mono text-body-s">{event}</span>}
              />
            ))}
          </div>
        </fieldset>
        <SigningSecret />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={reset}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!canAdd}>
            Add endpoint
          </Button>
        </div>
      </form>
    </Card>
  );
}

/** W8-05 · Webhooks — endpoints, add form with https validation and a delivery log. */
export default function Webhooks() {
  const toast = useToast();
  const urlRef = useRef<HTMLInputElement>(null);
  const [endpoints, setEndpoints] = useState(webhookEndpoints);
  const [selected, setSelected] = useState(webhookEndpoints[0].id);
  const [log, setLog] = useState(initialDeliveries);
  const [resending, setResending] = useState<string | null>(null);

  const legacy = endpoints.find((e) => e.id === 'w3');
  const current = endpoints.find((e) => e.id === selected) ?? endpoints[0];
  const currentLog = current.status === 'disabled' ? [] : log.filter((d) => current.events.includes(d.event));

  const turnOn = (endpoint: WebhookEndpoint) => {
    setEndpoints((list) => list.map((e) => (e.id === endpoint.id ? { ...e, status: 'active' } : e)));
    toast({ title: 'Endpoint turned on', description: 'We’ll send a test event first.', tone: 'ok' });
  };

  const resend = (id: string) => {
    setResending(id);
    window.setTimeout(() => {
      setLog((list) => list.map((d) => (d.id === id ? { ...d, code: 200, ms: 164, sent: 'Just now' } : d)));
      setResending(null);
      toast({ title: 'Delivered', description: 'run.completed · 200 OK', tone: 'ok' });
    }, 900);
  };

  const focusForm = () => {
    urlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    urlRef.current?.focus({ preventScroll: true });
  };

  return (
    <IntegrationsShell
      tab="/integrations/webhooks"
      current="Webhooks"
      actions={
        <Button size="sm" leftIcon="plus" onClick={focusForm}>
          Add endpoint
        </Button>
      }
    >
      {legacy?.status === 'disabled' && (
        <InlineNotice
          tone="danger"
          title="hooks.legacy-erp.example was turned off"
          actions={
            <Button variant="secondary" size="xs" className="h-7 px-3 text-13" onClick={() => turnOn(legacy)}>
              Turn on again
            </Button>
          }
        >
          after 50 failed deliveries in a row. Fix the endpoint, then turn it back on.
        </InlineNotice>
      )}

      <Card padding="none" className="overflow-hidden rounded-[18px]">
        <TableContainer>
          <Table className="min-w-[760px] table-fixed">
            <THead className="border-b border-border bg-sunken font-medium">
              <tr>
                <TH className={cn(cell, 'h-9 w-[35%]')}>Endpoint</TH>
                <TH className={cn(cell, 'h-9')}>Events</TH>
                <TH className={cn(cell, 'h-9 w-[130px]')}>Status</TH>
                <TH className={cn(cell, 'h-9 w-[117px] text-right [&>span]:justify-end')}>Success 7 d</TH>
              </tr>
            </THead>
            <TBody>
              {endpoints.map((endpoint) => {
                const off = endpoint.status === 'disabled';
                return (
                  <TR key={endpoint.id} className={cn('text-13 [&>td]:h-[44px]', off && 'bg-danger-subtle')}>
                    <TD className={cell}>
                      <button
                        type="button"
                        aria-pressed={endpoint.id === selected}
                        onClick={() => setSelected(endpoint.id)}
                        aria-label={`Show deliveries for ${endpoint.url}`}
                        className="max-w-full truncate text-left font-mono text-body-s font-medium text-fg hover:text-link"
                      >
                        {endpoint.url}
                      </button>
                    </TD>
                    <TD className={cell}>
                      <div className="flex flex-wrap gap-1">
                        {endpoint.events.map((event) => (
                          <EventTag key={event} event={event} />
                        ))}
                      </div>
                    </TD>
                    <TD className={cell}>
                      {off ? (
                        <Badge
                          tone="danger"
                          icon="close"
                          bordered={false}
                          className="h-5 border-transparent px-2 text-body-s"
                        >
                          Auto-disabled
                        </Badge>
                      ) : (
                        <Badge
                          tone="ok"
                          dot
                          bordered={false}
                          className="h-5 border-transparent px-2 text-body-s"
                        >
                          Active
                        </Badge>
                      )}
                    </TD>
                    <TD
                      className={cn(
                        cell,
                        'text-right font-semibold tabular',
                        off ? 'text-danger-text' : endpoint.success === '99.8%' ? 'text-ok-text' : 'text-fg',
                      )}
                    >
                      {endpoint.success}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableContainer>
      </Card>

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <AddEndpointForm
          urlRef={urlRef}
          onAdd={(url, events) => {
            const id = `w-${Date.now()}`;
            setEndpoints((list) => [...list, { id, url, events, status: 'active', success: '—' }]);
            setSelected(id);
            toast({ title: 'Endpoint added', description: url, tone: 'ok' });
          }}
        />

        <section
          aria-labelledby="delivery-log"
          className="flex w-full min-w-0 flex-col gap-2.5 xl:flex-[1.2]"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3">
            <h2 id="delivery-log" className="text-[15px] leading-[22px] font-semibold text-fg">
              Delivery log
            </h2>
            <span className="truncate font-mono text-body-s text-fg-3">
              {current.url.replace('https://', '')}
            </span>
          </div>
          <Card padding="none" className="overflow-hidden rounded-[18px]">
            {currentLog.length ? (
              <TableContainer>
                <Table className="min-w-[540px] table-fixed">
                  <THead className="border-b border-border bg-sunken font-medium">
                    <tr>
                      <TH className={cn(cell, 'h-9')}>Event</TH>
                      <TH className={cn(cell, 'h-9 w-[74px]')}>Code</TH>
                      <TH className={cn(cell, 'h-9 w-[74px] text-right [&>span]:justify-end')}>Time</TH>
                      <TH className={cn(cell, 'h-9 w-[106px]')}>Sent</TH>
                      <TH className={cn(cell, 'h-9 w-[93px]')}>
                        <span className="sr-only">Actions</span>
                      </TH>
                    </tr>
                  </THead>
                  <TBody>
                    {currentLog.map((d) => (
                      <TR key={d.id} className="text-13 [&>td]:h-[39px]">
                        <TD className={cn(cell, 'truncate font-mono text-body-s text-fg')}>{d.event}</TD>
                        <TD className={cell}>
                          <Badge
                            tone={d.code < 300 ? 'ok' : 'danger'}
                            bordered={false}
                            className="h-5 border-transparent px-2 text-body-s"
                          >
                            {d.code}
                          </Badge>
                        </TD>
                        <TD
                          className={cn(cell, 'text-right font-mono text-body-s whitespace-nowrap text-fg-2')}
                        >
                          {formatNumber(d.ms)} ms
                        </TD>
                        <TD className={cn(cell, 'whitespace-nowrap text-fg-2 tabular')}>{d.sent}</TD>
                        <TD className={cn(cell, 'text-right')}>
                          {d.code >= 300 && (
                            <Button
                              variant="secondary"
                              size="xs"
                              className="h-[26px] px-3 text-13"
                              loading={resending === d.id}
                              onClick={() => resend(d.id)}
                            >
                              Resend
                            </Button>
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState
                icon="webhook"
                title="No recent deliveries"
                description={
                  current.status === 'disabled'
                    ? 'This endpoint is turned off, so nothing is being sent.'
                    : 'Events will show up here as soon as they’re sent.'
                }
              />
            )}
          </Card>
        </section>
      </div>
    </IntegrationsShell>
  );
}

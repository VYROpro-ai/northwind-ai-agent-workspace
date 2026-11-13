import { useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
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
import { people } from '@/data/people';
import { cn } from '@/lib/cn';
import { BillingCard, BillingLayout } from './components/BillingLayout';
import { billingDetails, invoices as initialInvoices, invoiceStatus, type Invoice } from './data';
import { FieldLabel } from './components/FieldLabel';

const money = (v: number) =>
  `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** W11-03 · Invoices — invoice history with payment actions, plus the billing details form. */
export default function Invoices() {
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [paying, setPaying] = useState<string | null>(null);
  const [details, setDetails] = useState(billingDetails);
  const [saved, setSaved] = useState(billingDetails);
  const [submitted, setSubmitted] = useState(false);
  const emailError =
    submitted && !emailPattern.test(details.email) ? 'Enter a valid email address' : undefined;

  const pay = (invoice: Invoice) => {
    setPaying(invoice.id);
    window.setTimeout(() => {
      setInvoices((list) =>
        list.map((i) => (i.id === invoice.id ? { ...i, status: 'paid', note: undefined } : i)),
      );
      setPaying(null);
      toast({
        title: `${invoice.id} paid`,
        description: `${money(invoice.amount)} charged to Visa •••• 6411.`,
      });
    }, 900);
  };

  const download = (invoice: Invoice) =>
    toast({
      tone: 'neutral',
      title: `Downloading ${invoice.id}.pdf`,
      description: `${invoice.period} · ${money(invoice.amount)}`,
    });

  const save = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!emailPattern.test(details.email)) return;
    setSaved(details);
    toast({ title: 'Billing details saved', description: 'They’ll appear on your next invoice.' });
  };

  const set = (key: keyof typeof details) => (value: string) => setDetails((d) => ({ ...d, [key]: value }));

  return (
    <BillingLayout crumb="Invoices" title="Invoices" description="Download invoices for your finance team.">
      <BillingCard className="overflow-hidden">
        <TableContainer>
          <Table className="min-w-[760px] text-13 [&_td]:h-[50px] [&_td:first-child]:pl-4 [&_th:first-child]:pl-4">
            <THead className="bg-sunken">
              <TR>
                <TH className="w-[130px] font-medium">Invoice</TH>
                <TH className="w-[110px] font-medium">Date</TH>
                <TH className="font-medium">Period</TH>
                <TH className="w-[110px] text-right font-medium">Amount</TH>
                <TH className="w-[120px] font-medium">Status</TH>
                <TH className="w-[170px]">
                  <span className="sr-only">Actions</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {invoices.map((invoice) => {
                const status = invoiceStatus[invoice.status];
                const owed = invoice.status === 'due' || invoice.status === 'failed';
                return (
                  <TR key={invoice.id} className={cn(invoice.status === 'failed' && 'bg-danger-subtle')}>
                    <TD className="font-mono text-body-s font-medium text-fg">{invoice.id}</TD>
                    <TD className="text-fg-2">{invoice.date}</TD>
                    <TD className="text-fg-2">
                      <span className="block">{invoice.period}</span>
                      {invoice.note && (
                        <span className="block truncate text-body-s text-fg-3">{invoice.note}</span>
                      )}
                    </TD>
                    <TD className="text-right font-semibold text-fg tabular">{money(invoice.amount)}</TD>
                    <TD>
                      <Badge
                        tone={status.tone}
                        icon={status.icon}
                        dot={!status.icon}
                        bordered={false}
                        className="h-5 border-transparent"
                      >
                        {status.label}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        {owed && (
                          <Button
                            size="xs"
                            className="text-13"
                            variant={invoice.status === 'failed' ? 'primary' : 'secondary'}
                            loading={paying === invoice.id}
                            onClick={() => pay(invoice)}
                          >
                            Pay now
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon="download"
                          className="text-13"
                          aria-label={`Download ${invoice.id} as PDF`}
                          onClick={() => download(invoice)}
                        >
                          PDF
                        </Button>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableContainer>
      </BillingCard>

      <BillingCard className="p-4 sm:p-[18px]">
        <form onSubmit={save} noValidate className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Billing details</h2>
              <p className="text-13 text-fg-2">Shown on every invoice.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDetails(saved);
                setSubmitted(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save details
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-x-3.5 gap-y-3 md:grid-cols-2 [&_label]:leading-4">
            <Field label={<FieldLabel>Company name</FieldLabel>}>
              {(id) => (
                <Input
                  id={id}
                  value={details.company}
                  onChange={(e) => set('company')(e.target.value)}
                  autoComplete="organization"
                  className="px-2.5 text-13"
                />
              )}
            </Field>
            <Field label={<FieldLabel>Billing email</FieldLabel>} error={emailError}>
              {(id, describedBy) => (
                <Input
                  id={id}
                  type="email"
                  value={details.email}
                  invalid={Boolean(emailError)}
                  aria-describedby={describedBy}
                  onChange={(e) => set('email')(e.target.value)}
                  autoComplete="email"
                  className="px-2.5 text-13"
                />
              )}
            </Field>
            <Field label={<FieldLabel>Address</FieldLabel>}>
              {(id) => (
                <Input
                  id={id}
                  value={details.address}
                  onChange={(e) => set('address')(e.target.value)}
                  autoComplete="street-address"
                  className="px-2.5 text-13"
                />
              )}
            </Field>
            <Field label={<FieldLabel>Tax ID</FieldLabel>}>
              {(id) => (
                <Input
                  id={id}
                  value={details.taxId}
                  onChange={(e) => set('taxId')(e.target.value)}
                  className="px-2.5 font-mono text-13"
                />
              )}
            </Field>
          </div>
        </form>
      </BillingCard>

      <p className="text-body-s text-fg-3">
        {people.omar.name} (Viewer, Finance) can view and download invoices but can’t edit these details.
      </p>
    </BillingLayout>
  );
}

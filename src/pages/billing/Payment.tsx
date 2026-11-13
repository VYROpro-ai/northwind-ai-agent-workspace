import { useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Checkbox, Field, Input, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { BillingCard, BillingLayout } from './components/BillingLayout';
import { brandLabels, defaultCardId, savedCards, type CardBrand, type SavedCard } from './data';
import { FieldLabel } from './components/FieldLabel';

const digits = (v: string) => v.replace(/\D/g, '');

/** "4242424242424242" → "4242 4242 4242 4242" (max 19 digits). */
const formatCardNumber = (v: string) =>
  digits(v)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

/** "1228" → "12 / 28". */
const formatExpiry = (v: string) => {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
};

const detectBrand = (number: string): CardBrand => {
  const d = digits(number);
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  return 'card';
};

/** Luhn checksum — catches typos before the provider is called. */
const luhn = (number: string) => {
  const d = digits(number);
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return d.length >= 13 && sum % 10 === 0;
};

const expiryValid = (v: string) => {
  const [mm, yy] = [Number(digits(v).slice(0, 2)), Number(digits(v).slice(2, 4))];
  if (!mm || mm > 12 || digits(v).length !== 4) return false;
  return new Date(2000 + yy, mm) > new Date();
};

interface CardErrors {
  number?: string;
  expiry?: string;
  cvc?: string;
}

/** W11-04 · Payment method — saved cards and the add-card form (masked numbers only). */
export default function Payment() {
  const toast = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const [cards, setCards] = useState<SavedCard[]>(savedCards);
  const [defaultId, setDefaultId] = useState(defaultCardId);
  const [name, setName] = useState('Maya Chen');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [sameAddress, setSameAddress] = useState(true);
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<CardErrors>({});
  const [saving, setSaving] = useState(false);
  const brand = detectBrand(number);

  const remove = (card: SavedCard) => {
    setCards((list) => list.filter((c) => c.id !== card.id));
    toast({
      tone: 'neutral',
      title: `${brandLabels[card.brand]} •••• ${card.last4} removed`,
      action: { label: 'Undo', onClick: () => setCards((list) => [...list, card]) },
    });
  };

  const reset = () => {
    setNumber('');
    setExpiry('');
    setCvc('');
    setErrors({});
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const next: CardErrors = {
      number: luhn(number) ? undefined : 'Enter a valid card number.',
      expiry: expiryValid(expiry) ? undefined : 'Enter a future expiry date.',
      cvc: digits(cvc).length >= 3 ? undefined : 'Enter the 3 or 4 digit code.',
    };
    setErrors(next);
    if (next.number || next.expiry || next.cvc) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      // Demo: numbers ending in 0002 behave like a declined card.
      if (digits(number).endsWith('0002')) {
        setErrors({ number: 'Your bank declined this card. Try another card or call your bank.' });
        return;
      }
      const card: SavedCard = {
        id: `card-${Date.now()}`,
        brand,
        last4: digits(number).slice(-4),
        expires: formatExpiry(expiry).replace(' / ', '/'),
      };
      setCards((list) => [...list, card]);
      reset();
      toast({ title: `${brandLabels[brand]} •••• ${card.last4} added` });
    }, 900);
  };

  return (
    <BillingLayout
      crumb="Payment"
      title="Payment method"
      description="Cards used for your Pro subscription and extra credits."
    >
      <BillingCard>
        <div className="flex items-start gap-3 px-[18px] py-4">
          <h2 className="flex-1 text-[15px] leading-[22px] font-semibold text-fg">Saved cards</h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon="plus"
            className="h-[30px]"
            onClick={() => {
              nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              nameRef.current?.focus({ preventScroll: true });
            }}
          >
            Add card
          </Button>
        </div>
        <ul>
          {cards.map((card) => {
            const isDefault = card.id === defaultId;
            return (
              <li
                key={card.id}
                className="flex flex-wrap items-center gap-3.5 border-t border-border px-[18px] py-3.5"
              >
                <CardArt brand={card.brand} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-mono text-13 font-medium text-fg">
                    {brandLabels[card.brand]} •••• {card.last4}
                  </span>
                  <span className="text-body-s text-fg-3">Expires {card.expires}</span>
                  {card.expiringSoon && (
                    <span className="text-body-s font-medium text-warn-text">
                      Expires next month. Update it to avoid failed payments.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isDefault ? (
                    <>
                      <Badge tone="brand" bordered={false} className="mr-1 h-5 border-transparent">
                        Default
                      </Badge>
                      <Button size="xs" variant="secondary" className="text-13" disabled title="Default card">
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-13"
                        onClick={() => {
                          setDefaultId(card.id);
                          toast({
                            title: `${brandLabels[card.brand]} •••• ${card.last4} is now the default`,
                          });
                        }}
                      >
                        Make default
                      </Button>
                      <Button size="xs" variant="ghost" className="text-13" onClick={() => remove(card)}>
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="px-[18px] pt-2.5 pb-3.5 text-body-s text-fg-3">
          You can’t remove the default card while you’re on a paid plan.
        </p>
      </BillingCard>

      <BillingCard>
        <form onSubmit={save} noValidate>
          <div className="flex flex-wrap items-start gap-3 px-[18px] py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 className="text-[15px] leading-[22px] font-semibold text-fg">Add a card</h2>
              <p className="text-13 text-fg-2">
                Card details are handled by our payment provider and never stored by Northwind.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-body-s text-fg-3">
              <Icon name="lock" size={13} strokeWidth={2} />
              Secure payment
            </span>
          </div>
          <div className="flex flex-col gap-3 px-[18px] pb-[18px] [&_label]:leading-4">
            <Field label={<FieldLabel>Name on card</FieldLabel>}>
              {(id) => (
                <Input
                  ref={nameRef}
                  id={id}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="cc-name"
                  className="px-2.5 text-13"
                />
              )}
            </Field>
            <Field label={<FieldLabel>Card number</FieldLabel>} error={errors.number}>
              {(id, describedBy) => (
                <Input
                  id={id}
                  value={number}
                  onChange={(e) => setNumber(formatCardNumber(e.target.value))}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 1234 1234 1234"
                  invalid={Boolean(errors.number)}
                  aria-describedby={describedBy}
                  className="h-10 bg-sunken font-mono text-body-s"
                  rightSlot={
                    <span className="pr-1.5 text-fg-3" aria-hidden>
                      {brand === 'card' || !number ? (
                        <Icon name="credit-card" size={16} />
                      ) : (
                        <span className="text-caption font-semibold">{brandLabels[brand]}</span>
                      )}
                    </span>
                  }
                />
              )}
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={<FieldLabel>Expiry</FieldLabel>} error={errors.expiry}>
                {(id, describedBy) => (
                  <Input
                    id={id}
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                    invalid={Boolean(errors.expiry)}
                    aria-describedby={describedBy}
                    className="h-10 bg-sunken font-mono text-body-s"
                  />
                )}
              </Field>
              <Field label={<FieldLabel>Security code</FieldLabel>} error={errors.cvc}>
                {(id, describedBy) => (
                  <Input
                    id={id}
                    type="password"
                    value={cvc}
                    onChange={(e) => setCvc(digits(e.target.value).slice(0, 4))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="•••"
                    invalid={Boolean(errors.cvc)}
                    aria-describedby={describedBy}
                    className="h-10 bg-sunken font-mono text-body-s"
                  />
                )}
              </Field>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-body-s font-semibold text-fg-2">Billing address</span>
              <Checkbox
                checked={sameAddress}
                onChange={(e) => setSameAddress(e.target.checked)}
                label={
                  <span className="text-13 text-fg-2">
                    Same as billing details · 410 Harbor Street, Austin, TX
                  </span>
                }
              />
              {!sameAddress && (
                <Input
                  aria-label="Card billing address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="billing street-address"
                  placeholder="Street, city, postcode, country"
                />
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" size="sm" className="h-[34px]" onClick={reset}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-[34px]" loading={saving}>
                Save card
              </Button>
            </div>
          </div>
        </form>
      </BillingCard>
    </BillingLayout>
  );
}

const cardArt: Record<CardBrand, string> = {
  visa: 'bg-[var(--cobalt-700)] dark:bg-[var(--cobalt-600)]',
  mastercard: 'bg-[var(--amber-700)]',
  amex: 'bg-[var(--sky-700)] dark:bg-[var(--sky-600)]',
  card: 'bg-[var(--slate-700)] dark:bg-[var(--slate-600)]',
};

/** Small brand tile standing in for the card network logo. */
function CardArt({ brand }: { brand: CardBrand }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-8 w-12 shrink-0 items-end overflow-hidden rounded-sm px-1.5 py-1',
        'text-[9px] leading-none font-bold tracking-[0.04em] text-white uppercase',
        cardArt[brand],
      )}
    >
      {brandLabels[brand]}
    </span>
  );
}

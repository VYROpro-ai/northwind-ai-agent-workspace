import { useId, useState, type KeyboardEvent } from 'react';
import { Avatar, Button, InlineNotice, Modal, Radio, Segmented, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { people, type Person } from '@/data/people';
import { cn } from '@/lib/cn';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { InlineSwitch } from './InlineSwitch';
import { rectSegmented } from './Panels';

export type ReportKind = 'usage' | 'cost' | 'performance';

const reports: { value: ReportKind; label: string; description: string }[] = [
  { value: 'usage', label: 'Usage', description: 'Users, chats, runs' },
  { value: 'cost', label: 'Cost', description: 'Spend, forecast, budget' },
  { value: 'performance', label: 'Performance', description: 'Quality and speed' },
];

const rangeChoices = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This month', 'Last month'] as const;
const monthDays = ['1st of the month', '15th of the month', 'Last day of the month'] as const;
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const times = ['8:00 AM PKT', '9:00 AM PKT', '12:00 PM PKT', '5:00 PM PKT'] as const;

const members: Person[] = Object.values(people).filter((p) => p.email.endsWith('@northwindlabs.com'));

interface Recipient {
  email: string;
  person?: Person;
}

const toRecipient = (email: string): Recipient => ({
  email,
  person: members.find((m) => m.email.toLowerCase() === email.toLowerCase()),
});

const initialRecipients = [people.maya.email, people.daniel.email, 'board@investors.example'].map(
  toRecipient,
);

/**
 * W9-06 · Export report dialog — file export or a scheduled email to workspace members.
 * Mount it only while open so every opening starts from the defaults.
 */
export function ExportReportModal({
  open,
  onClose,
  defaultReport = 'usage',
}: {
  open: boolean;
  onClose: () => void;
  defaultReport?: ReportKind;
}) {
  const toast = useToast();
  const inputId = useId();
  const errorId = useId();
  const [report, setReport] = useState<ReportKind>(defaultReport);
  const [range, setRange] = useState<(typeof rangeChoices)[number]>('Last 30 days');
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [charts, setCharts] = useState(true);
  const [scheduled, setScheduled] = useState(true);
  const [every, setEvery] = useState<'week' | 'month'>('month');
  const [monthDay, setMonthDay] = useState<(typeof monthDays)[number]>('1st of the month');
  const [weekDay, setWeekDay] = useState<(typeof weekDays)[number]>('Monday');
  const [time, setTime] = useState<(typeof times)[number]>('9:00 AM PKT');
  const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients);
  const [draft, setDraft] = useState('');

  const outsiders = recipients.filter((r) => !r.person);

  const addDraft = () => {
    const email = draft.trim().replace(/,$/, '');
    if (!email) return;
    if (!recipients.some((r) => r.email.toLowerCase() === email.toLowerCase())) {
      setRecipients((list) => [...list, toRecipient(email)]);
    }
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addDraft();
    } else if (e.key === 'Backspace' && !draft && recipients.length) {
      setRecipients((list) => list.slice(0, -1));
    }
  };

  const submit = () => {
    if (scheduled && outsiders.length) {
      toast({
        tone: 'danger',
        title: 'Remove non-members first',
        description: outsiders.map((r) => r.email).join(', '),
      });
      return;
    }
    const name = reports.find((r) => r.value === report)?.label ?? 'Usage';
    toast({
      title: scheduled ? `${name} report scheduled` : `${name} report is being prepared`,
      description: scheduled
        ? `Every ${every === 'month' ? `month on the ${monthDay.replace(' of the month', '')}` : weekDay} at ${time}.`
        : `We’ll email you a ${format.toUpperCase()} link in a few minutes.`,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Export report"
      description="Share results with leadership as a file or on a schedule."
      className="sm:max-w-[620px]"
    >
      <div className="flex flex-col gap-3.5">
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-body-s font-semibold text-fg-2">Report</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {reports.map((r) => (
              <Radio
                key={r.value}
                name="export-report"
                value={r.value}
                checked={report === r.value}
                onChange={() => setReport(r.value)}
                label={<span className="text-13 font-semibold">{r.label}</span>}
                description={r.description}
                className={cn(
                  'rounded-[10px] border p-3 transition-colors',
                  report === r.value
                    ? 'border-brand bg-brand-subtle shadow-[0_0_0_0.5px_var(--brand)]'
                    : 'border-border hover:bg-subtle',
                )}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-x-5 gap-y-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-body-s font-semibold text-fg-2">Range</span>
            <FilterSelect
              label="Range"
              value={range}
              options={rangeChoices}
              onChange={setRange}
              className="w-[220px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-body-s font-semibold text-fg-2">Format</span>
            <Segmented
              label="Format"
              size="sm"
              className={rectSegmented}
              value={format}
              onChange={setFormat}
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'csv', label: 'CSV' },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-body-s font-semibold text-fg-2">Charts</span>
            <InlineSwitch
              checked={charts && format === 'pdf'}
              onChange={setCharts}
              disabled={format === 'csv'}
              className="h-[34px]"
              labelClassName="text-fg"
            >
              Include charts
            </InlineSwitch>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-sunken p-3.5">
          <InlineSwitch checked={scheduled} onChange={setScheduled} labelClassName="font-semibold text-fg">
            Send on a schedule
          </InlineSwitch>
          {scheduled && (
            <>
              <div className="flex flex-wrap gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-body-s font-semibold text-fg-2">Every</span>
                  <Segmented
                    label="Every"
                    size="sm"
                    className={rectSegmented}
                    value={every}
                    onChange={setEvery}
                    options={[
                      { value: 'week', label: 'Week' },
                      { value: 'month', label: 'Month' },
                    ]}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-body-s font-semibold text-fg-2">On</span>
                  {every === 'month' ? (
                    <FilterSelect label="Day" value={monthDay} options={monthDays} onChange={setMonthDay} />
                  ) : (
                    <FilterSelect label="Day" value={weekDay} options={weekDays} onChange={setWeekDay} />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-body-s font-semibold text-fg-2">At</span>
                  <FilterSelect label="Time" value={time} options={times} onChange={setTime} align="end" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={inputId} className="text-body-s font-semibold text-fg-2">
                  Recipients
                </label>
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-1.5 rounded-md border bg-surface px-2 py-1.5 focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
                    outsiders.length ? 'border-danger' : 'border-border-strong focus-within:border-focus',
                  )}
                >
                  {recipients.map((r) => (
                    <span
                      key={r.email}
                      className={cn(
                        'inline-flex h-[26px] max-w-full items-center gap-1.5 rounded-full pr-1.5 text-body-s font-medium',
                        r.person ? 'bg-subtle pl-[3px] text-fg' : 'bg-danger-subtle pl-2 text-danger-text',
                      )}
                    >
                      {r.person ? (
                        <Avatar name={r.person.name} src={r.person.avatar} size="xs" />
                      ) : (
                        <Icon name="alert-triangle" size={13} strokeWidth={2} />
                      )}
                      <span className="truncate">{r.person?.name ?? r.email}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${r.person?.name ?? r.email}`}
                        onClick={() => setRecipients((list) => list.filter((x) => x.email !== r.email))}
                        className="inline-flex size-4 items-center justify-center rounded-full text-fg-3 hover:bg-border hover:text-fg"
                      >
                        <Icon name="close" size={11} strokeWidth={2.4} />
                      </button>
                    </span>
                  ))}
                  <input
                    id={inputId}
                    type="email"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={addDraft}
                    placeholder={recipients.length ? '' : 'Add a member’s email'}
                    aria-invalid={outsiders.length > 0 || undefined}
                    aria-describedby={outsiders.length ? errorId : undefined}
                    className="h-[26px] min-w-10 flex-1 bg-transparent text-13 text-fg outline-none placeholder:text-fg-3"
                  />
                </div>
                {outsiders.length > 0 && (
                  <p id={errorId} className="text-body-s text-danger-text">
                    {outsiders.map((r) => r.email).join(', ')}{' '}
                    {outsiders.length > 1 ? 'aren’t members' : 'isn’t a member'} of Northwind Labs. Reports go
                    to members only.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <InlineNotice tone="info" className="border border-info-border leading-[18px]">
          This report covers 12,480 runs. We’ll email you a link when it’s ready, usually within 5 minutes.
        </InlineNotice>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" size="sm" className="h-[34px]" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" className="h-[34px]" onClick={submit}>
            {scheduled ? 'Export and schedule' : 'Export'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { cn } from '@/lib/cn';
import {
  Button,
  Checkbox,
  Switch,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
} from '@/components/ui';
import { AccountLayout, SettingsSection } from './components/AccountLayout';
import { PrefixSelect } from './components/PrefixSelect';
import { channels, notificationEvents, quietDays, quietFrom, quietTo, type Channel } from './data';

type Matrix = Record<string, Record<Exclude<Channel, 'push'>, boolean>>;

const initialMatrix: Matrix = Object.fromEntries(notificationEvents.map((e) => [e.id, { ...e.defaults }]));

/** W12-03 · Notification settings */
export default function NotificationSettings() {
  const toast = useToast();
  const [matrix, setMatrix] = useState<Matrix>(initialMatrix);
  const [paused, setPaused] = useState<null | '1 h' | 'today'>(null);
  const [quiet, setQuiet] = useState(true);
  const [from, setFrom] = useState('10:00 PM');
  const [to, setTo] = useState('7:00 AM');
  const [days, setDays] = useState('every');

  const toggle = (id: string, channel: Exclude<Channel, 'push'>) =>
    setMatrix((m) => ({ ...m, [id]: { ...m[id], [channel]: !m[id][channel] } }));

  const pause = (period: '1 h' | 'today') => {
    setPaused(period);
    toast({
      title: period === '1 h' ? 'Notifications paused for 1 hour' : 'Notifications paused until tomorrow',
      tone: 'neutral',
      action: { label: 'Undo', onClick: () => setPaused(null) },
    });
  };

  return (
    <AccountLayout
      title="Notifications"
      description="Choose what reaches you and where."
      actions={
        paused ? (
          <Button variant="secondary" size="sm" leftIcon="play" onClick={() => setPaused(null)}>
            Resume · paused {paused === '1 h' ? 'for 1 h' : 'today'}
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" leftIcon="pause" onClick={() => pause('1 h')}>
              Pause 1 h
            </Button>
            <Button variant="ghost" size="sm" onClick={() => pause('today')}>
              Pause today
            </Button>
          </>
        )
      }
    >
      <SettingsSection className="overflow-hidden">
        <TableContainer>
          <Table className="min-w-[640px] text-13">
            <THead className="bg-sunken font-medium">
              <TR>
                <TH className="h-[38px] first:pl-4">Event</TH>
                {channels.map((c) => (
                  <TH
                    key={c.key}
                    className="h-[38px] w-[106px] text-center last:pr-4 [&>span]:justify-center"
                  >
                    {c.label}
                  </TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {notificationEvents.map((e) => {
                const row = matrix[e.id];
                return (
                  <TR key={e.id} className={cn(paused && 'opacity-60')}>
                    <TD className="h-auto py-3 first:pl-4">
                      <span className="block font-medium text-fg">{e.title}</span>
                      <span className="block text-body-s leading-[18px] text-fg-3">{e.hint}</span>
                      {e.emailOffWarning && !row.email && (
                        <span className="block text-body-s font-medium text-warn-text">
                          {e.emailOffWarning}
                        </span>
                      )}
                    </TD>
                    {channels.map((c) =>
                      c.key === 'push' ? (
                        <TD key={c.key} className="h-auto text-center">
                          <Button
                            variant="link"
                            className="text-body-s"
                            onClick={() =>
                              toast({
                                title: 'Download link sent',
                                description: 'Check maya@northwindlabs.com on your phone.',
                              })
                            }
                          >
                            Get the app
                          </Button>
                        </TD>
                      ) : (
                        <TD key={c.key} className="h-auto text-center last:pr-4">
                          <Checkbox
                            aria-label={`${e.title} · ${c.label}`}
                            checked={row[c.key]}
                            onChange={() => toggle(e.id, c.key as Exclude<Channel, 'push'>)}
                          />
                        </TD>
                      ),
                    )}
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableContainer>
      </SettingsSection>

      <SettingsSection
        title="Quiet hours"
        description="No push, email or chat-app notifications. In-app still collects them."
        aside={
          <Switch aria-label="Quiet hours" checked={quiet} onChange={(e) => setQuiet(e.target.checked)} />
        }
      >
        <div className="flex flex-wrap items-center gap-3 px-4 pb-4 sm:px-[18px]">
          <PrefixSelect
            prefix="From"
            label="Quiet hours start"
            options={quietFrom}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            disabled={!quiet}
            className="w-[150px] sm:w-[150px]"
          />
          <span className="text-13 text-fg-3">to</span>
          <PrefixSelect
            prefix="To"
            label="Quiet hours end"
            options={quietTo}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={!quiet}
            className="w-[130px] sm:w-[130px]"
          />
          <PrefixSelect
            prefix="Days"
            label="Quiet days"
            options={quietDays}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            disabled={!quiet}
            className="w-[150px] sm:w-[150px]"
          />
          <span className="w-full text-body-s text-fg-3 sm:ml-auto sm:w-auto">Central Time (Austin)</span>
        </div>
      </SettingsSection>
    </AccountLayout>
  );
}

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useTheme, type ThemePreference } from '@/lib/theme';
import { Alert, Button, Segmented, Switch, useToast } from '@/components/ui';
import { AccountLayout, SettingsRow, SettingsSection } from './components/AccountLayout';
import { PrefixSelect } from './components/PrefixSelect';
import { dateFormats, defaultAgents, languages, startPages, timeZones } from './data';

/* Theme thumbnails always depict their own theme, so they use fixed primitives on purpose. */
const lightThumb = { bg: 'bg-[var(--slate-50)]', panel: 'bg-white', bar: 'bg-[var(--slate-200)]' };
const darkThumb = {
  bg: 'bg-[var(--slate-950)]',
  panel: 'bg-[var(--slate-800)]',
  bar: 'bg-[var(--slate-700)]',
};

function Thumb({ t }: { t: typeof lightThumb }) {
  return (
    <span className={cn('flex h-full gap-1.5 p-2', t.bg)}>
      <span className={cn('w-[26px] rounded-xs', t.panel)} />
      <span className="flex flex-1 flex-col gap-[5px]">
        <span className={cn('h-2 w-3/5 rounded-[3px]', t.bar)} />
        <span className={cn('flex-1 rounded-[5px]', t.panel)} />
      </span>
    </span>
  );
}

const themeOptions: { value: ThemePreference; label: string; preview: ReactNode }[] = [
  { value: 'light', label: 'Light', preview: <Thumb t={lightThumb} /> },
  { value: 'dark', label: 'Dark', preview: <Thumb t={darkThumb} /> },
  {
    value: 'system',
    label: 'System',
    preview: (
      <span className="flex h-full">
        <span className={cn('flex-1 p-2', lightThumb.bg)}>
          <span className={cn('block h-full rounded-[5px]', lightThumb.panel)} />
        </span>
        <span className={cn('flex-1 p-2', darkThumb.bg)}>
          <span className={cn('block h-full rounded-[5px]', darkThumb.panel)} />
        </span>
      </span>
    ),
  },
];

function AppearanceSection() {
  const { preference, setPreference } = useTheme();
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  return (
    <SettingsSection title="Appearance">
      <fieldset className="grid grid-cols-1 gap-3 px-4 pb-3.5 sm:grid-cols-3 sm:px-[18px]">
        <legend className="sr-only">Theme</legend>
        {themeOptions.map((o) => {
          const on = preference === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                'flex cursor-pointer flex-col gap-2 rounded-[18px] border p-2 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                on ? 'border-2 border-brand p-[7px]' : 'border-border hover:border-border-strong',
              )}
            >
              <span aria-hidden className="block h-[84px] overflow-hidden rounded-md">
                {o.preview}
              </span>
              <span className="flex items-center gap-2 px-1 pb-0.5">
                <input
                  type="radio"
                  name="theme"
                  value={o.value}
                  checked={on}
                  onChange={() => setPreference(o.value)}
                  className="size-4 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-border-strong bg-surface transition-[border] checked:border-[5px] checked:border-brand focus-visible:outline-none"
                />
                <span className="text-13 font-medium text-fg">{o.label}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
      <SettingsRow label="Density" hint="Compact fits more rows in tables and lists">
        <Segmented
          label="Density"
          size="sm"
          value={density}
          onChange={setDensity}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

function RegionSection() {
  const toast = useToast();
  const [language, setLanguage] = useState('en-US');
  const [zone, setZone] = useState('America/Chicago');
  const [tzNoticeOpen, setTzNoticeOpen] = useState(true);
  const [dateFormat, setDateFormat] = useState<(typeof dateFormats)[number]['value']>('mdy');
  const [startPage, setStartPage] = useState('/');

  const resolveNotice = (switchZone: boolean) => {
    setTzNoticeOpen(false);
    if (switchZone) setZone('Asia/Karachi');
    toast({
      title: switchZone ? 'Time zone set to GMT+5 (Karachi)' : 'Keeping Central Time (Austin)',
      tone: 'neutral',
    });
  };

  return (
    <SettingsSection title="Language and region">
      {tzNoticeOpen && (
        <div className="px-4 pb-3 sm:px-[18px]">
          <Alert
            tone="info"
            icon="clock"
            className="flex-wrap items-center rounded-[10px] border-transparent px-3.5 py-2.5"
            title={
              <span className="text-13 font-normal">
                Your device is in GMT+5 (Karachi). Your profile uses Central Time (Austin).
              </span>
            }
            action={
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7" onClick={() => resolveNotice(false)}>
                  Keep Central
                </Button>
                <Button variant="secondary" size="sm" className="h-7" onClick={() => resolveNotice(true)}>
                  Switch to GMT+5
                </Button>
              </div>
            }
          />
        </div>
      )}
      <SettingsRow label="Language">
        <PrefixSelect
          prefix="Lang"
          label="Language"
          options={languages}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
      </SettingsRow>
      <SettingsRow label="Time zone">
        <PrefixSelect
          prefix="TZ"
          label="Time zone"
          options={timeZones}
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="sm:w-60"
        />
      </SettingsRow>
      <SettingsRow label="Date format">
        <Segmented
          label="Date format"
          size="sm"
          value={dateFormat}
          onChange={setDateFormat}
          options={dateFormats.map((d) => ({ value: d.value, label: d.label }))}
          className="scrollbar-none max-w-full overflow-x-auto"
        />
      </SettingsRow>
      <SettingsRow label="Start page">
        <PrefixSelect
          prefix="Start"
          label="Start page"
          options={startPages}
          value={startPage}
          onChange={(e) => setStartPage(e.target.value)}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

function ChatSection() {
  const [enterToSend, setEnterToSend] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);
  const [agent, setAgent] = useState('support');
  const row = 'border-t border-border px-4 py-3 sm:px-[18px] [&_span.text-body-m]:text-13';
  return (
    <SettingsSection title="Chat">
      <Switch
        className={row}
        label="Press Enter to send"
        description="Shift + Enter adds a new line"
        checked={enterToSend}
        onChange={(e) => setEnterToSend(e.target.checked)}
      />
      <Switch
        className={row}
        label="Show reasoning steps by default"
        description="You can always expand them"
        checked={showReasoning}
        onChange={(e) => setShowReasoning(e.target.checked)}
      />
      <SettingsRow label="Default agent">
        <PrefixSelect
          prefix="Agent"
          label="Default agent"
          options={defaultAgents}
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

/** W12-02 · Preferences — the theme choice drives the app theme (light / dark / system). */
export default function Preferences() {
  return (
    <AccountLayout title="Preferences" description="Only change how Northwind looks and works for you.">
      <AppearanceSection />
      <RegionSection />
      <ChatSection />
    </AccountLayout>
  );
}

import { useId, useState } from 'react';
import { Button, Input, Modal, Select, useToast } from '@/components/ui';
import { WorkspaceLogo } from '@/components/brand/Logo';
import { people } from '@/data/people';
import { languages, models, timeZones, weekStarts, workspaceName } from './data';
import { PrefixSelect } from './components/PrefixSelect';
import { SettingsCard, SettingsCardHeader, SettingsLayout, SettingsRow } from './components/SettingsLayout';

interface WorkspaceForm {
  name: string;
  url: string;
  timeZone: string;
  language: string;
  model: string;
  weekStart: string;
}

const saved: WorkspaceForm = {
  name: workspaceName,
  url: 'northwindlabs',
  timeZone: 'Asia/Karachi',
  language: 'en-US',
  model: 'model-b',
  weekStart: 'monday',
};

const fieldLabels: Record<keyof WorkspaceForm, string> = {
  name: 'Name',
  url: 'URL',
  timeZone: 'Time zone',
  language: 'Language',
  model: 'Default model',
  weekStart: 'Week start',
};

const labelClass = 'text-body-s font-semibold text-fg-2';

/** W10-07 · Workspace settings (General) */
export default function WorkspaceSettings() {
  const toast = useToast();
  const id = useId();
  const [base, setBase] = useState(saved);
  // Opens clean; the save bar appears as soon as a field changes.
  const [form, setForm] = useState<WorkspaceForm>(saved);
  const [transferOpen, setTransferOpen] = useState(false);
  const [heir, setHeir] = useState(people.daniel.id);

  const changed = (Object.keys(form) as (keyof WorkspaceForm)[]).filter((k) => form[k] !== base[k]);
  const set = <K extends keyof WorkspaceForm>(key: K, value: WorkspaceForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const urlChanged = form.url !== base.url;

  return (
    <SettingsLayout
      crumb="General"
      role="owner"
      title="General"
      description="Your workspace’s name, address and defaults."
    >
      <SettingsCard>
        <SettingsCardHeader title="Workspace" className="pb-1" />
        <div className="flex flex-col gap-5 px-[18px] pt-3 pb-[18px] md:flex-row">
          <div className="flex shrink-0 flex-col items-center gap-2.5 self-start md:w-[168px]">
            <div className="flex h-[72px] w-[168px] items-center justify-center rounded-[14px] border border-border bg-surface">
              <WorkspaceLogo className="w-[136px]" />
            </div>
            <Button
              variant="link"
              className="text-body-s"
              onClick={() =>
                toast({
                  title: 'Choose a logo',
                  description: 'SVG or PNG, at least 320 × 120 px.',
                  tone: 'info',
                })
              }
            >
              Change logo
            </Button>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-3.5 gap-y-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-name`} className={labelClass}>
                Name
              </label>
              <Input id={`${id}-name`} value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-url`} className={labelClass}>
                URL
              </label>
              <div className="flex h-9 items-center rounded-md border border-border-strong bg-surface text-body-m transition-[border-color,box-shadow] focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--focus-ring)]">
                <span className="shrink-0 pl-3 text-13 text-fg-3">northwind.app/</span>
                <input
                  id={`${id}-url`}
                  value={form.url}
                  onChange={(e) => set('url', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  aria-describedby={urlChanged ? `${id}-url-hint` : undefined}
                  className="h-full min-w-0 flex-1 bg-transparent pr-3 pl-2 font-medium text-fg outline-none focus-visible:outline-none"
                />
              </div>
              {urlChanged && (
                <p id={`${id}-url-hint`} className="text-body-s text-warn-text">
                  Old links to northwind.app/{base.url} keep working for 30 days.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-tz`} className={labelClass}>
                Time zone
              </label>
              <PrefixSelect
                id={`${id}-tz`}
                prefix="TZ"
                options={timeZones}
                value={form.timeZone}
                onChange={(e) => set('timeZone', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-lang`} className={labelClass}>
                Language
              </label>
              <PrefixSelect
                id={`${id}-lang`}
                prefix="Lang"
                options={languages}
                value={form.language}
                onChange={(e) => set('language', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-model`} className={labelClass}>
                Default model for new agents
              </label>
              <PrefixSelect
                id={`${id}-model`}
                prefix="Model"
                options={models}
                value={form.model}
                onChange={(e) => set('model', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-week`} className={labelClass}>
                Week starts on
              </label>
              <PrefixSelect
                id={`${id}-week`}
                prefix="Week"
                options={weekStarts}
                value={form.weekStart}
                onChange={(e) => set('weekStart', e.target.value)}
              />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard danger>
        <SettingsCardHeader title="Danger zone" danger />
        <SettingsRow
          label="Transfer ownership"
          description="Make another Admin the Owner. You become an Admin."
          className="border-danger-border/60"
        >
          <Button size="sm" variant="secondary" onClick={() => setTransferOpen(true)}>
            Transfer…
          </Button>
        </SettingsRow>
        <SettingsRow
          label="Delete workspace"
          description="Cancel the Pro plan first. Your subscription renews on Nov 12."
          className="border-danger-border/60"
        >
          <Button size="sm" variant="secondary" disabled>
            Delete workspace
          </Button>
        </SettingsRow>
      </SettingsCard>

      {changed.length > 0 && (
        <div
          role="status"
          className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-inverse py-2.5 pr-2.5 pl-4 text-on-inverse shadow-inverse sm:pl-5"
        >
          <span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden />
          <p className="min-w-0 flex-1 text-body-m">
            <b className="font-semibold">
              {changed.length} unsaved change{changed.length === 1 ? '' : 's'}
            </b>{' '}
            · {changed.map((k) => fieldLabels[k]).join(', ')}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="text-on-inverse hover:bg-white/10 hover:text-on-inverse"
            onClick={() => setForm(base)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setBase(form);
              toast({ title: 'Workspace settings saved' });
            }}
          >
            Save changes
          </Button>
        </div>
      )}

      <Modal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        size="sm"
        title="Transfer ownership"
        description="The new Owner controls billing and can delete the workspace. You become an Admin."
        footer={
          <>
            <Button variant="secondary" onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setTransferOpen(false);
                toast({
                  title: 'Transfer request sent',
                  description: 'It completes when they accept by email.',
                });
              }}
            >
              Transfer ownership
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-heir`} className="text-body-m font-medium text-fg">
            New owner
          </label>
          <Select
            id={`${id}-heir`}
            value={heir}
            onChange={(e) => setHeir(e.target.value)}
            options={[{ value: people.daniel.id, label: `${people.daniel.name} · Admin` }]}
          />
        </div>
      </Modal>
    </SettingsLayout>
  );
}

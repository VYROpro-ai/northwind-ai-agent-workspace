import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Button, Dropdown, IconButton, Tabs, Tooltip, useToast, type MenuItem } from '@/components/ui';
import { DsSectionBlock, ExampleRow, SectionHeader, Specimen, VariantLabel } from '../Specimen';

type RunTab = 'all' | 'live' | 'approvals' | 'failed';
type SettingsTab = 'general' | 'members' | 'billing' | 'security';

const runTabCopy: Record<RunTab, string> = {
  all: '1,284 runs in the last 7 days across 12 agents.',
  live: '3 runs are streaming right now.',
  approvals: '4 runs are waiting on a reviewer.',
  failed: '7 runs failed — most on “Update CRM record”.',
};

/** C5 · Navigation — tabs, dropdown menu, tooltip. */
export function NavigationGallery() {
  const toast = useToast();
  const [runTab, setRunTab] = useState<RunTab>('all');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general');

  const menu: MenuItem[] = [
    {
      label: 'Agent',
      icon: 'agent',
      shortcut: 'A',
      onSelect: () => toast({ title: 'New agent', tone: 'info' }),
    },
    {
      label: 'Workflow',
      icon: 'workflow',
      shortcut: 'W',
      onSelect: () => toast({ title: 'New workflow', tone: 'info' }),
    },
    {
      label: 'Chat',
      icon: 'chat',
      shortcut: 'C',
      onSelect: () => toast({ title: 'New chat', tone: 'info' }),
    },
    {
      label: 'Import from template',
      description: '24 ready-made agents',
      icon: 'download',
      separator: true,
      onSelect: () => toast({ title: 'Templates opened', tone: 'info' }),
    },
  ];

  const rowMenu: MenuItem[] = [
    { label: 'Rename', icon: 'edit', onSelect: () => toast({ title: 'Rename', tone: 'neutral' }) },
    { label: 'Duplicate', icon: 'copy', onSelect: () => toast({ title: 'Agent duplicated', tone: 'ok' }) },
    { label: 'Share', icon: 'share', disabled: true },
    {
      label: 'Archive agent',
      icon: 'archive',
      danger: true,
      separator: true,
      onSelect: () =>
        toast({
          title: 'Support Agent archived',
          tone: 'danger',
          action: { label: 'Undo', onClick: () => undefined },
        }),
    },
  ];

  return (
    <DsSectionBlock id="navigation">
      <SectionHeader
        id="navigation"
        eyebrow="Components · C5"
        title="Navigation"
        description="Underline tabs sit under page headers; pill tabs switch views inside a card. Menus close on outside click and Escape, and support arrow keys."
        meta="Tabs · Dropdown · Tooltip"
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Specimen
          title="Tabs"
          meta="underline · pill"
          importPath="import { Tabs } from '@/components/ui'"
          className="xl:col-span-2"
        >
          <VariantLabel>Underline · icon and count</VariantLabel>
          <Tabs
            label="Runs"
            value={runTab}
            onChange={setRunTab}
            items={[
              { value: 'all', label: 'All runs', count: '1,284' },
              { value: 'live', label: 'Live', icon: 'streaming', count: 3 },
              { value: 'approvals', label: 'Approvals', icon: 'approval', count: 4 },
              { value: 'failed', label: 'Failed', count: 7 },
            ]}
          />
          <p role="tabpanel" className="mt-3 text-body-m text-fg-2">
            {runTabCopy[runTab]}
          </p>
          <VariantLabel className="mt-6">Pill</VariantLabel>
          <Tabs
            label="Settings"
            variant="pill"
            value={settingsTab}
            onChange={setSettingsTab}
            items={[
              { value: 'general', label: 'General', icon: 'settings' },
              { value: 'members', label: 'Members', icon: 'users' },
              { value: 'billing', label: 'Billing', icon: 'credit-card' },
              { value: 'security', label: 'Security', icon: 'shield' },
            ]}
          />
        </Specimen>

        <Specimen
          title="Dropdown menu"
          meta="icons · shortcuts · danger"
          importPath="import { Dropdown } from '@/components/ui'"
        >
          <ExampleRow className="min-h-64 items-start">
            <Dropdown
              items={menu}
              trigger={(props) => (
                <Button leftIcon="plus" rightIcon="chevron-down" {...props}>
                  New
                </Button>
              )}
            />
            <Dropdown
              items={rowMenu}
              align="start"
              width={200}
              trigger={(props) => <IconButton icon="more" label="Agent actions" {...props} />}
            />
          </ExampleRow>
        </Specimen>

        <Specimen
          title="Tooltip"
          meta="hover or focus"
          importPath="import { Tooltip } from '@/components/ui'"
        >
          <ExampleRow className="gap-4 pt-10">
            <Tooltip content="Copy run ID">
              <IconButton icon="copy" label="Copy run ID" />
            </Tooltip>
            <Tooltip content="Regenerate answer">
              <IconButton icon="refresh" label="Regenerate" variant="ghost" />
            </Tooltip>
            <Tooltip content="Policy-locked by your admin" side="bottom">
              <span
                tabIndex={0}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-sunken px-3 text-13 font-medium text-fg-disabled"
              >
                <Icon name="lock" size={13} strokeWidth={2} />
                Auto-run
              </span>
            </Tooltip>
          </ExampleRow>
          <p className="mt-10 text-body-s text-fg-3">
            Keep tooltip copy to a few words; never hide required information in one.
          </p>
        </Specimen>
      </div>
    </DsSectionBlock>
  );
}

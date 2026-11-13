import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Checkbox, Radio, Segmented, Slider, Switch } from '@/components/ui';
import { DsSectionBlock, SectionHeader, Specimen, VariantLabel } from '../Specimen';

const channels = ['Email', 'Push', 'In-app'] as const;
type Channel = (typeof channels)[number];
type Mode = 'auto' | 'ask' | 'off';
type Range = '24h' | '7d' | '30d' | '90d';
type View = 'grid' | 'list';

const modes: { value: Mode; label: string; description: string }[] = [
  { value: 'auto', label: 'Auto-run', description: 'The agent acts without asking.' },
  { value: 'ask', label: 'Ask first', description: 'A reviewer approves each action.' },
  { value: 'off', label: 'Off', description: 'The tool is unavailable to the agent.' },
];

/** C4 · Selection controls with working state. */
export function ControlsGallery() {
  const [memory, setMemory] = useState(true);
  const [voice, setVoice] = useState(false);
  const [selected, setSelected] = useState<Channel[]>(['Email']);
  const [mode, setMode] = useState<Mode>('ask');
  const [range, setRange] = useState<Range>('7d');
  const [view, setView] = useState<View>('grid');
  const [temperature, setTemperature] = useState(0.4);

  const all = selected.length === channels.length;
  const some = selected.length > 0 && !all;
  const toggle = (c: Channel) =>
    setSelected((list) => (list.includes(c) ? list.filter((x) => x !== c) : [...list, c]));

  return (
    <DsSectionBlock id="controls">
      <SectionHeader
        id="controls"
        eyebrow="Components · C4"
        title="Controls"
        description="Native inputs under the hood, so keyboard and screen readers work for free. Every example here is live — try them."
        meta="Switch · Checkbox · Radio · Segmented · Slider"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Specimen title="Switch" importPath="import { Switch } from '@/components/ui'">
          <div className="flex flex-col gap-4">
            <Switch
              label="Long-term memory"
              description="Remember facts across conversations."
              checked={memory}
              onChange={(e) => setMemory(e.target.checked)}
            />
            <Switch
              label="Voice mode"
              description={voice ? 'On — the mic button appears in chat.' : 'Off'}
              checked={voice}
              onChange={(e) => setVoice(e.target.checked)}
            />
            <Switch label="SSO enforcement" description="Locked by your admin." checked disabled readOnly />
          </div>
        </Specimen>

        <Specimen
          title="Checkbox"
          meta="incl. indeterminate"
          importPath="import { Checkbox } from '@/components/ui'"
        >
          <Checkbox
            label="Notify on approval requests"
            checked={all || some}
            indeterminate={some}
            onChange={() => setSelected(all ? [] : [...channels])}
          />
          <ul className="mt-3 ml-6.5 flex flex-col gap-2.5">
            {channels.map((c) => (
              <li key={c}>
                <Checkbox label={c} checked={selected.includes(c)} onChange={() => toggle(c)} />
              </li>
            ))}
            <li>
              <Checkbox label="SMS" description="Available on the Business plan." disabled />
            </li>
          </ul>
        </Specimen>

        <Specimen title="Radio" importPath="import { Radio } from '@/components/ui'">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-body-m font-medium text-fg">When the agent issues a refund</legend>
            {modes.map((m) => (
              <Radio
                key={m.value}
                name="ds-refund-mode"
                value={m.value}
                label={m.label}
                description={m.description}
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
              />
            ))}
          </fieldset>
        </Specimen>

        <Specimen
          title="Segmented"
          meta="track · inverse"
          importPath="import { Segmented } from '@/components/ui'"
          className="md:col-span-2 xl:col-span-2"
        >
          <div className="flex flex-col gap-5">
            <div>
              <VariantLabel>Track (default)</VariantLabel>
              <div className="flex flex-wrap items-center gap-3">
                <Segmented
                  label="Time range"
                  value={range}
                  onChange={setRange}
                  options={[
                    { value: '24h', label: '24 h' },
                    { value: '7d', label: '7 d' },
                    { value: '30d', label: '30 d' },
                    { value: '90d', label: '90 d' },
                  ]}
                />
                <Segmented
                  label="Layout"
                  size="sm"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'grid', label: <Icon name="grid" size={14} label="Grid view" /> },
                    { value: 'list', label: <Icon name="list" size={14} label="List view" /> },
                  ]}
                />
              </div>
            </div>
            <div>
              <VariantLabel>Inverse · with a disabled option</VariantLabel>
              <Segmented
                label="Approval mode"
                variant="inverse"
                value={mode}
                onChange={setMode}
                options={[
                  { value: 'auto', label: 'Auto-run', disabled: true },
                  { value: 'ask', label: 'Ask first' },
                  { value: 'off', label: 'Off' },
                ]}
              />
            </div>
            <p className="text-body-s text-fg-3">
              Showing the last <span className="font-medium text-fg">{range}</span> as a{' '}
              <span className="font-medium text-fg">{view}</span>.
            </p>
          </div>
        </Specimen>

        <Specimen title="Slider" importPath="import { Slider } from '@/components/ui'">
          <div className="flex items-baseline justify-between">
            <span className="text-body-m font-medium text-fg">Temperature</span>
            <span className="font-mono text-body-m text-fg tabular">{temperature.toFixed(1)}</span>
          </div>
          <div className="mt-4">
            <Slider label="Temperature" value={temperature} onChange={setTemperature} />
          </div>
          <div className="mt-2 flex justify-between text-body-s text-fg-3">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </Specimen>
      </div>
    </DsSectionBlock>
  );
}

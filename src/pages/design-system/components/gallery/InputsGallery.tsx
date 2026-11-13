import { useState } from 'react';
import { Field, Input, Kbd, Select, Textarea } from '@/components/ui';
import { DsSectionBlock, ExampleRow, SectionHeader, Specimen, VariantLabel } from '../Specimen';

const MAX_INSTRUCTIONS = 280;
const modelOptions = [
  { value: 'fast', label: 'Model A · Fast' },
  { value: 'balanced', label: 'Model B · Balanced' },
  { value: 'deep', label: 'Model C · Deep reasoning' },
];

/** C3 · Inputs — Field wrapper and every text control state. */
export function InputsGallery() {
  const [name, setName] = useState('Support Agent');
  const [email, setEmail] = useState('leo@northwind');
  const [instructions, setInstructions] = useState(
    'Answer billing questions for Acme Co. Ask Leo before issuing any refund over $100.',
  );
  const [model, setModel] = useState('balanced');
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <DsSectionBlock id="inputs">
      <SectionHeader
        id="inputs"
        eyebrow="Components · C3"
        title="Inputs"
        description="Field wires the label, hint and error to the control with ids and aria attributes. Focus is a 1 px focus border plus a 3 px halo; errors swap both to danger."
        meta="Field · Input · Textarea · Select · Kbd"
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Specimen
          title="Field states"
          meta="label · hint · error"
          importPath="import { Field, Input } from '@/components/ui'"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Agent name" required>
              {(id, describedBy) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
            </Field>
            <Field label="Workspace URL" hint="Lowercase letters, numbers and dashes.">
              {(id, describedBy) => (
                <Input id={id} aria-describedby={describedBy} placeholder="northwind-labs" />
              )}
            </Field>
            <Field
              label="Approver email"
              error={emailInvalid ? 'Enter a full email, e.g. leo@northwindlabs.com' : undefined}
              hint={emailInvalid ? undefined : 'Looks good — Leo will be asked first.'}
            >
              {(id, describedBy) => (
                <Input
                  id={id}
                  type="email"
                  aria-describedby={describedBy}
                  invalid={emailInvalid}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </Field>
            <Field label="Workspace ID" hint="Set by your admin.">
              {(id, describedBy) => (
                <Input id={id} aria-describedby={describedBy} value="ws_northwind_01" disabled readOnly />
              )}
            </Field>
            <Field label="Search" labelAside={<Kbd>⌘K</Kbd>}>
              {(id) => <Input id={id} leftIcon="search" placeholder="Search runs, agents, docs" pill />}
            </Field>
            <Field label="Model">
              {(id) => (
                <Select
                  id={id}
                  options={modelOptions}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              )}
            </Field>
          </div>
        </Specimen>

        <div className="flex flex-col gap-4">
          <Specimen
            title="Textarea"
            meta="with counter"
            importPath="import { Textarea } from '@/components/ui'"
          >
            <Field
              label="Instructions"
              labelAside={
                <span className="font-mono text-body-s text-fg-3 tabular">
                  {instructions.length} / {MAX_INSTRUCTIONS}
                </span>
              }
              hint="Plain language works best. The agent sees this on every run."
            >
              {(id, describedBy) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  value={instructions}
                  maxLength={MAX_INSTRUCTIONS}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              )}
            </Field>
          </Specimen>
          <Specimen
            title="Sizes & keys"
            meta="sm 32 · md 36 · lg 44"
            importPath="import { Kbd } from '@/components/ui'"
          >
            <div className="flex flex-col gap-3">
              <Input size="sm" placeholder="Small" aria-label="Small input" />
              <Input size="md" placeholder="Medium" aria-label="Medium input" />
              <Input
                size="lg"
                placeholder="Large with a right slot"
                aria-label="Large input"
                rightSlot={<Kbd>Enter</Kbd>}
              />
            </div>
            <VariantLabel className="mt-5">Keyboard hints</VariantLabel>
            <ExampleRow className="gap-2">
              <Kbd>⌘K</Kbd>
              <Kbd>Esc</Kbd>
              <Kbd>⇧ Enter</Kbd>
              <Kbd>/</Kbd>
              <Kbd>G then R</Kbd>
            </ExampleRow>
          </Specimen>
        </div>
      </div>
    </DsSectionBlock>
  );
}

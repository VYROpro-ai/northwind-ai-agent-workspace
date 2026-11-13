import { useEffect, useState } from 'react';
import type { IconName } from '@/components/icons';
import { Button, IconButton, Tooltip, type ButtonVariant } from '@/components/ui';
import { DsSectionBlock, ExampleRow, SectionHeader, Specimen, VariantLabel } from '../Specimen';

interface VariantDemo {
  variant: ButtonVariant;
  label: string;
  busy: string;
  icon?: IconName;
}

const variantDemos: VariantDemo[] = [
  { variant: 'primary', label: 'Publish', busy: 'Publishing' },
  { variant: 'secondary', label: 'Save draft', busy: 'Saving' },
  { variant: 'ghost', label: 'Cancel', busy: 'Cancelling' },
  { variant: 'danger', label: 'Delete', busy: 'Deleting' },
  { variant: 'ai', label: 'Generate', busy: 'Generating', icon: 'ai-generate' },
  { variant: 'inverse', label: 'Continue', busy: 'Continuing', icon: 'arrow-right' },
];

const iconVariants = ['outline', 'ghost', 'solid', 'inverse'] as const;
const iconSizes = ['xs', 'sm', 'md', 'lg'] as const;

/** C1 · Buttons — buttons, icon buttons and links. */
export function ActionsGallery() {
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!publishing) return;
    const t = window.setTimeout(() => setPublishing(false), 1600);
    return () => window.clearTimeout(t);
  }, [publishing]);

  return (
    <DsSectionBlock id="buttons">
      <SectionHeader
        id="buttons"
        eyebrow="Components · C1"
        title="Buttons"
        description="Six fill variants plus link, four sizes, pill or rounded-square. Loading swaps the leading icon for a spinner and blocks clicks; disabled drops to the subtle fill."
        meta="Button · IconButton"
      />
      <div className="flex flex-col gap-4">
        <Specimen
          title="Variants × states"
          meta="size md"
          importPath="import { Button } from '@/components/ui'"
        >
          <div className="hidden grid-cols-[112px_repeat(3,minmax(0,1fr))] gap-3 border-b border-border pb-2 text-body-s text-fg-3 sm:grid">
            <span />
            <span>Default</span>
            <span>Disabled</span>
            <span>Loading</span>
          </div>
          <ul className="divide-y divide-border">
            {variantDemos.map((d) => (
              <li
                key={d.variant}
                className="flex flex-col gap-2.5 py-3.5 sm:grid sm:grid-cols-[112px_repeat(3,minmax(0,1fr))] sm:items-center sm:gap-3"
              >
                <span className="text-body-m font-medium text-fg capitalize">{d.variant}</span>
                <div className="flex flex-wrap gap-3 sm:contents">
                  <span>
                    <Button variant={d.variant} leftIcon={d.icon}>
                      {d.label}
                    </Button>
                  </span>
                  <span>
                    <Button variant={d.variant} leftIcon={d.icon} disabled>
                      {d.label}
                    </Button>
                  </span>
                  <span>
                    <Button variant={d.variant} loading>
                      {d.busy}
                    </Button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Specimen>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Specimen title="Sizes & shapes" meta="xs 28 · sm 32 · md 36 · lg 44">
            <VariantLabel>Pill (default)</VariantLabel>
            <ExampleRow>
              {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
                <Button key={size} size={size}>
                  New agent
                </Button>
              ))}
            </ExampleRow>
            <VariantLabel className="mt-5">With icon · pill=false</VariantLabel>
            <ExampleRow>
              {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
                <Button key={size} size={size} variant="secondary" pill={false} leftIcon="plus">
                  Add tool
                </Button>
              ))}
            </ExampleRow>
            <VariantLabel className="mt-5">Interactive loading · full width</VariantLabel>
            <div className="flex flex-col gap-3 sm:max-w-xs">
              <Button loading={publishing} leftIcon="send" onClick={() => setPublishing(true)} fullWidth>
                {publishing ? 'Publishing…' : 'Publish agent'}
              </Button>
              <Button variant="secondary" rightIcon="chevron-down" fullWidth>
                Version 12
              </Button>
            </div>
          </Specimen>

          <Specimen
            title="Icon buttons & links"
            meta="label is required"
            importPath="import { IconButton } from '@/components/ui'"
          >
            <div className="flex flex-col gap-4">
              {iconVariants.map((variant) => (
                <div key={variant} className="flex flex-wrap items-center gap-3">
                  <span className="w-16 text-body-s text-fg-3 capitalize">{variant}</span>
                  {iconSizes.map((size) => (
                    <IconButton
                      key={size}
                      icon="settings"
                      label={`Settings (${size})`}
                      variant={variant}
                      size={size}
                    />
                  ))}
                  <IconButton icon="more" label="More actions" variant={variant} size="md" shape="square" />
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-16 text-body-s text-fg-3">States</span>
                <Tooltip content="3 unread">
                  <IconButton icon="bell" label="Notifications" dot />
                </Tooltip>
                <IconButton icon="trash" label="Delete (disabled)" disabled />
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
                <Button variant="link">View full trace</Button>
                <Button variant="link" rightIcon="arrow-up-right">
                  Open status page
                </Button>
                <Button variant="link" disabled>
                  Manage plan
                </Button>
              </div>
            </div>
          </Specimen>
        </div>
      </div>
    </DsSectionBlock>
  );
}

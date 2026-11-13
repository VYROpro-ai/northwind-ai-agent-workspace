import { people } from '@/data/people';
import {
  AgentAvatar,
  Avatar,
  AvatarGroup,
  Badge,
  CountBadge,
  StatusBadge,
  type AgentTone,
  type Tone,
} from '@/components/ui';
import { runStatuses } from '../../data';
import { DsSectionBlock, ExampleRow, SectionHeader, Specimen, VariantLabel } from '../Specimen';

const tones: Tone[] = ['neutral', 'brand', 'ai', 'ok', 'warn', 'danger', 'info', 'inverse'];
const agentTones: AgentTone[] = ['ai', 'brand', 'ok', 'warn', 'info', 'danger'];
const team = Object.values(people);

/** C2 · Badges, status pills and avatars. */
export function BadgesGallery() {
  return (
    <DsSectionBlock id="badges">
      <SectionHeader
        id="badges"
        eyebrow="Components · C2"
        title="Badges & avatars"
        description="Status always pairs an icon, dot or spinner with a word — never colour alone. People are circles; agents are rounded squares."
        meta="Badge · StatusBadge · CountBadge · Avatar · AgentAvatar"
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Specimen
          title="Badges"
          meta="tone × style"
          importPath="import { Badge, StatusBadge, CountBadge } from '@/components/ui'"
        >
          <VariantLabel>Tones · with dot</VariantLabel>
          <ExampleRow className="gap-2">
            {tones.map((tone) => (
              <Badge key={tone} tone={tone} dot className="capitalize">
                {tone}
              </Badge>
            ))}
          </ExampleRow>
          <VariantLabel className="mt-5">Icon · small · borderless tags</VariantLabel>
          <ExampleRow className="gap-2">
            <Badge tone="ai" icon="sparkle">
              AI drafted
            </Badge>
            <Badge tone="brand" icon="lock">
              Owner only
            </Badge>
            <Badge tone="info" spinning>
              Indexing
            </Badge>
            <Badge size="sm" tone="ok">
              v12 · live
            </Badge>
            <Badge size="sm" bordered={false}>
              refunds
            </Badge>
            <Badge size="sm" bordered={false}>
              billing
            </Badge>
          </ExampleRow>
          <VariantLabel className="mt-5">Run status pills</VariantLabel>
          <ExampleRow className="gap-2">
            {runStatuses.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
            <StatusBadge status="waiting" label="Waiting for approval" />
          </ExampleRow>
          <VariantLabel className="mt-5">Counters</VariantLabel>
          <ExampleRow>
            <CountBadge count={3} />
            <CountBadge count={12} />
            <CountBadge count="99+" />
          </ExampleRow>
        </Specimen>

        <Specimen
          title="Avatars"
          meta="xs 20 · sm 24 · md 32 · lg 40 · xl 56"
          importPath="import { Avatar, AvatarGroup, AgentAvatar } from '@/components/ui'"
        >
          <VariantLabel>Sizes · photo and initials fallback</VariantLabel>
          <ExampleRow>
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <Avatar key={size} name={people.maya.name} src={people.maya.avatar} size={size} />
            ))}
            <Avatar name="Northwind Labs" size="lg" />
            <Avatar name="Acme Co." size="lg" />
          </ExampleRow>
          <VariantLabel className="mt-5">Presence</VariantLabel>
          <ExampleRow className="gap-4">
            <Avatar name={people.priya.name} src={people.priya.avatar} size="lg" status="online" />
            <Avatar name={people.leo.name} src={people.leo.avatar} size="lg" status="away" />
            <Avatar name={people.omar.name} src={people.omar.avatar} size="lg" status="offline" />
          </ExampleRow>
          <VariantLabel className="mt-5">Group · max 4</VariantLabel>
          <ExampleRow className="gap-6">
            <AvatarGroup people={team.map((p) => ({ name: p.name, src: p.avatar }))} />
            <AvatarGroup size="md" max={3} people={team.map((p) => ({ name: p.name, src: p.avatar }))} />
          </ExampleRow>
          <VariantLabel className="mt-5">Agents · tones, letter, sizes</VariantLabel>
          <ExampleRow>
            {agentTones.map((tone) => (
              <AgentAvatar key={tone} tone={tone} />
            ))}
            <AgentAvatar tone="brand" letter="S" size={40} />
            <AgentAvatar size={24} />
          </ExampleRow>
        </Specimen>
      </div>
    </DsSectionBlock>
  );
}

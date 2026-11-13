import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Badge, Dropdown, IconButton } from '@/components/ui';
import { waitingApprovals } from '../data';
import { Panel, PanelHeader } from './Panel';

const featuredHatch =
  'bg-inverse bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--on-inverse)_7%,transparent)_0_6px,transparent_6px_12px)] dark:bg-none';

/** W2-01 · "Waiting for you" — the two most urgent approvals as cards. */
export function WaitingForYouCard() {
  const navigate = useNavigate();
  return (
    <Panel className="relative flex flex-col gap-3.5 overflow-hidden p-[18px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-wash-success" />
      <PanelHeader
        icon="approval"
        title="Waiting for you"
        actions={
          <Dropdown
            align="end"
            items={[
              { label: 'Open approvals queue', icon: 'approval', onSelect: () => navigate('/approvals') },
              {
                label: 'Notification settings',
                icon: 'bell',
                onSelect: () => navigate('/settings/notifications'),
              },
            ]}
            trigger={(props) => (
              <IconButton {...props} icon="more" label="Approval options" className="size-[38px]" />
            )}
          />
        }
      />
      <ul className="relative grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {waitingApprovals.map((a, i) => {
          const featured = i === 0;
          return (
            <li key={a.title}>
              <Link
                to={a.to}
                className={cn(
                  'flex h-full flex-col gap-2.5 rounded-[18px] p-3 transition-transform hover:-translate-y-0.5',
                  featured
                    ? cn(featuredHatch, 'text-on-inverse shadow-inverse')
                    : 'border border-border bg-surface',
                )}
              >
                <span className="flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex size-9 items-center justify-center rounded-full',
                      featured ? 'bg-on-inverse text-inverse' : 'border border-border bg-sunken text-fg',
                    )}
                  >
                    <Icon name={a.icon} size={featured ? 17 : 16} strokeWidth={2} />
                  </span>
                  {a.risk === 'Medium' ? (
                    <span className="h-5 rounded-full bg-accent-strong px-[7px] text-[10px] leading-5 font-semibold text-white">
                      Medium
                    </span>
                  ) : (
                    <Badge
                      tone="danger"
                      bordered={false}
                      size="sm"
                      className="border-transparent font-semibold"
                    >
                      High
                    </Badge>
                  )}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="truncate text-13 font-semibold">{a.title}</span>
                  <span className={cn('text-caption', featured ? 'opacity-75' : 'text-fg-3')}>{a.meta}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

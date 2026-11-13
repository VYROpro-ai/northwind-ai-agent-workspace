import {
  Avatar,
  Badge,
  Dropdown,
  IconButton,
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui';
import { Icon } from '@/components/icons';
import { roleLabels, type Role } from '@/data/people';
import { assignableRoles, type Member } from '../data';

/** Small grey team tag. */
export function TeamTag({ children }: { children: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-[5px] bg-subtle px-[7px] text-body-s text-fg-2">
      {children}
    </span>
  );
}

function RolePicker({
  member,
  onChange,
  up,
}: {
  member: Member;
  onChange: (role: Role) => void;
  up?: boolean;
}) {
  if (member.role === 'owner') {
    return (
      <span className="inline-flex items-center gap-1.5 text-13 text-fg-2">
        <Icon name="lock" size={14} />
        Owner
      </span>
    );
  }
  return (
    <Dropdown
      width={180}
      className={up ? 'top-auto bottom-full mt-0 mb-2' : undefined}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={`Role for ${member.person.name}: ${roleLabels[member.role]}`}
          className="inline-flex h-7 w-[120px] items-center gap-1 rounded-sm border border-border bg-surface px-2 text-13 text-fg hover:bg-subtle"
        >
          {roleLabels[member.role]}
          <Icon name="chevron-down" size={12} strokeWidth={2} className="text-fg-3" />
        </button>
      )}
      items={assignableRoles.map((r) => ({
        label: roleLabels[r],
        icon: r === member.role ? 'check' : undefined,
        onSelect: () => r !== member.role && onChange(r),
      }))}
    />
  );
}

/** Members table: avatar + email, role picker, teams, status, last active, 2FA, row menu. */
export function MembersTable({
  members,
  onRoleChange,
  onToggleSuspend,
  onRemove,
  onRemind,
}: {
  members: Member[];
  onRoleChange: (member: Member, role: Role) => void;
  onToggleSuspend: (member: Member) => void;
  onRemove: (member: Member) => void;
  onRemind: (member: Member) => void;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-surface">
      <TableContainer className="rounded-[17px] xl:overflow-visible">
        <Table className="min-w-[860px] text-13">
          <THead className="border-b border-border bg-sunken font-medium">
            <tr>
              <TH className="rounded-tl-[17px] pl-4 first:pl-4">Member</TH>
              <TH className="w-[130px]">Role</TH>
              <TH className="w-[216px]">Teams</TH>
              <TH className="w-[106px]">Status</TH>
              <TH className="w-[110px]">Last active</TH>
              <TH className="w-[64px]">2FA</TH>
              <TH className="w-[44px] rounded-tr-[17px] pr-4 last:pr-4">
                <span className="sr-only">Actions</span>
              </TH>
            </tr>
          </THead>
          <TBody>
            {members.map((m, i) => (
              <TR key={m.person.id} className="hover:bg-sunken/60">
                <TD className="h-[58px] pl-4 first:pl-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={m.person.name} src={m.person.avatar} size="md" />
                    <div className="min-w-0">
                      <p className="truncate leading-[19px] font-semibold text-fg">{m.person.name}</p>
                      <p className="truncate text-body-s leading-[18px] text-fg-3">{m.person.email}</p>
                    </div>
                  </div>
                </TD>
                <TD>
                  <RolePicker
                    member={m}
                    up={i >= members.length - 3 && i > 2}
                    onChange={(r) => onRoleChange(m, r)}
                  />
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {m.teams.map((t) => (
                      <TeamTag key={t}>{t}</TeamTag>
                    ))}
                  </div>
                </TD>
                <TD>
                  {m.status === 'active' ? (
                    <Badge tone="ok" dot bordered={false} className="h-5 border-transparent">
                      Active
                    </Badge>
                  ) : (
                    <Badge tone="danger" dot bordered={false} className="h-5 border-transparent">
                      Suspended
                    </Badge>
                  )}
                </TD>
                <TD className="whitespace-nowrap text-fg-2 tabular">{m.lastActive}</TD>
                <TD>
                  {m.twoFactor ? (
                    <Badge tone="ok" icon="check-sm" bordered={false} className="h-5 border-transparent">
                      On
                    </Badge>
                  ) : (
                    <Badge tone="warn" bordered={false} className="h-5 border-transparent">
                      Off
                    </Badge>
                  )}
                </TD>
                <TD className="pr-4 text-right last:pr-4">
                  <Dropdown
                    align="end"
                    width={210}
                    className={
                      i >= members.length - 2 && i > 1 ? 'top-auto bottom-full mt-0 mb-2' : undefined
                    }
                    trigger={(props) => (
                      <IconButton
                        {...props}
                        icon="more"
                        label={`Actions for ${m.person.name}`}
                        variant="ghost"
                        size="xs"
                      />
                    )}
                    items={[
                      {
                        label: 'Remind to set up 2FA',
                        icon: 'shield',
                        disabled: m.twoFactor,
                        onSelect: () => onRemind(m),
                      },
                      {
                        label: m.status === 'active' ? 'Suspend' : 'Reactivate',
                        icon: m.status === 'active' ? 'pause' : 'play',
                        disabled: m.role === 'owner',
                        onSelect: () => onToggleSuspend(m),
                      },
                      {
                        label: 'Remove from workspace',
                        icon: 'trash',
                        danger: true,
                        separator: true,
                        disabled: m.role === 'owner',
                        onSelect: () => onRemove(m),
                      },
                    ]}
                  />
                </TD>
              </TR>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-13 text-fg-3">
                  No members match these filters.
                </td>
              </tr>
            )}
          </TBody>
        </Table>
      </TableContainer>
    </div>
  );
}

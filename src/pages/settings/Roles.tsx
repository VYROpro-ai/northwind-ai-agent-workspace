import { Fragment, useMemo, useState } from 'react';
import { Button, Checkbox, Table, TableContainer, TBody, TD, TH, THead, useToast } from '@/components/ui';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { roleLabels } from '@/data/people';
import { defaultRoleColumns, permissionGroups, type Grant } from './data';
import { SettingsLayout } from './components/SettingsLayout';

type CustomGrants = Record<string, boolean>;

const initialCustom: CustomGrants = Object.fromEntries(
  permissionGroups.flatMap((g) => g.permissions.map((p) => [p.id, p.custom])),
);

/** Read-only checkbox for locked default roles. */
function LockedGrant({ grant, role, permission }: { grant: Grant; role: string; permission: string }) {
  if (grant === null) {
    return (
      <span className="text-fg-3" aria-label={`${permission}: not applicable for ${role}`} role="img">
        —
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={`${permission}: ${grant ? 'allowed' : 'not allowed'} for ${role}`}
      className={cn(
        'inline-flex size-4 items-center justify-center rounded-xs',
        grant ? 'bg-brand text-white' : 'border border-border-strong bg-surface',
      )}
    >
      {grant && <Icon name="check" size={10} strokeWidth={3.5} />}
    </span>
  );
}

/** W10-02 · Roles & permissions */
export default function Roles() {
  const toast = useToast();
  const [custom, setCustom] = useState(initialCustom);
  const dirty = useMemo(() => Object.keys(custom).some((k) => custom[k] !== initialCustom[k]), [custom]);

  return (
    <SettingsLayout
      crumb="Roles"
      title="Roles & permissions"
      description="6 default roles and 1 custom role."
      actions={
        <Button
          size="sm"
          variant="secondary"
          leftIcon="plus"
          onClick={() =>
            toast({ title: 'Custom role drafted', description: 'Copied from Member — rename it to finish.' })
          }
        >
          Create custom role
        </Button>
      }
    >
      <div
        role="status"
        className="flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-[10px] bg-ai-subtle px-3.5 py-2.5 text-13 leading-[18px] text-ai-text"
      >
        <Icon name="info" size={16} strokeWidth={2} className="shrink-0" />
        <p className="min-w-0 flex-1 basis-64">
          <b className="font-semibold">Editing “Support lead”</b> · copied from Reviewer. Turning off “Approve
          refunds” affects 2 people who are using it right now.
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCustom(initialCustom);
              toast({ tone: 'neutral', title: dirty ? 'Changes discarded' : 'No changes to discard' });
            }}
          >
            Discard
          </Button>
          <Button
            size="sm"
            onClick={() =>
              toast({
                title: 'Support lead saved',
                description: dirty ? 'Permission changes apply right away.' : undefined,
              })
            }
          >
            Save role
          </Button>
        </div>
      </div>

      <div className="rounded-[18px] border border-border bg-surface">
        <TableContainer className="rounded-[17px]">
          <Table className="min-w-[860px] table-fixed text-13">
            <caption className="sr-only">Permissions by role</caption>
            <colgroup>
              <col />
              {defaultRoleColumns.map((r) => (
                <col key={r} className="w-[86px]" />
              ))}
              <col className="w-[96px]" />
            </colgroup>
            <THead className="border-b border-border bg-sunken font-medium">
              <tr>
                <TH className="pl-4 first:pl-4">Permission</TH>
                {defaultRoleColumns.map((r) => (
                  <TH key={r} className="text-center [&>span]:justify-center">
                    {roleLabels[r]}
                  </TH>
                ))}
                <TH className="pr-4 text-center font-semibold text-ai-text last:pr-4 [&>span]:justify-center">
                  Support lead
                </TH>
              </tr>
            </THead>
            <TBody>
              {permissionGroups.map((group) => (
                <Fragment key={group.label}>
                  <tr className="border-b border-border bg-sunken">
                    <th
                      scope="colgroup"
                      colSpan={defaultRoleColumns.length + 2}
                      className="h-9 px-4 text-left text-caption font-semibold tracking-[0.04em] text-fg-3 uppercase"
                    >
                      {group.label}
                    </th>
                  </tr>
                  {group.permissions.map((p) => {
                    const changed = custom[p.id] !== initialCustom[p.id];
                    return (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <th scope="row" className="py-2 pl-4 text-left font-normal text-fg">
                          {p.label}
                          {p.affected && (
                            <span className="block text-caption font-medium text-warn-text">
                              {p.affected} people affected
                            </span>
                          )}
                        </th>
                        {defaultRoleColumns.map((r) => (
                          <TD key={r} className="h-auto py-2 text-center">
                            <LockedGrant grant={p.grants[r]} role={roleLabels[r]} permission={p.label} />
                          </TD>
                        ))}
                        <TD className="h-auto py-0.5 pr-4 last:pr-4">
                          <span
                            className={cn(
                              'flex h-[33px] items-center justify-center rounded-xs bg-ai-subtle',
                              changed && 'ring-1 ring-ai-border',
                            )}
                          >
                            <Checkbox
                              aria-label={`${p.label} for Support lead`}
                              checked={custom[p.id]}
                              onChange={(e) => setCustom((c) => ({ ...c, [p.id]: e.target.checked }))}
                            />
                          </span>
                        </TD>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      <p className="text-body-s text-fg-3">
        Default roles are locked. Custom roles are a Business feature, included in your free trial until Nov
        9.
      </p>
    </SettingsLayout>
  );
}

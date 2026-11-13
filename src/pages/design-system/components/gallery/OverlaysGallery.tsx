import { useState } from 'react';
import { Icon } from '@/components/icons';
import { people } from '@/data/people';
import { Avatar, Badge, Button, Drawer, Field, Input, Modal, useToast } from '@/components/ui';
import { DsSectionBlock, ExampleRow, SectionHeader, Specimen } from '../Specimen';

/** C6 · Overlays — modal, drawer and toasts. */
export function OverlaysGallery() {
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [drawer, setDrawer] = useState(false);

  return (
    <DsSectionBlock id="overlays">
      <SectionHeader
        id="overlays"
        eyebrow="Components · C6"
        title="Overlays"
        description="Modals and drawers render in a portal with a scrim, trap focus, lock scroll and close on Escape. On phones the modal becomes a bottom sheet."
        meta="Modal · Drawer · useToast"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Specimen title="Modal" meta="sm · md · lg · xl" importPath="import { Modal } from '@/components/ui'">
          <ExampleRow>
            <Button variant="secondary" leftIcon="users" onClick={() => setModal(true)}>
              Invite people
            </Button>
            <Button variant="danger" leftIcon="trash" onClick={() => setConfirm(true)}>
              Delete agent
            </Button>
          </ExampleRow>
        </Specimen>
        <Specimen title="Drawer" meta="400 px · right" importPath="import { Drawer } from '@/components/ui'">
          <Button variant="secondary" leftIcon="panel-right" onClick={() => setDrawer(true)}>
            Open run details
          </Button>
        </Specimen>
        <Specimen
          title="Toast"
          meta="bottom-right · 4.5 s"
          importPath="import { useToast } from '@/components/ui'"
        >
          <ExampleRow className="gap-2">
            <Button
              size="sm"
              onClick={() => toast({ title: 'Agent published', description: 'Support Agent v12 is live.' })}
            >
              Success
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast({
                  title: 'Run cancelled',
                  tone: 'neutral',
                  action: { label: 'Undo', onClick: () => toast({ title: 'Run restored', tone: 'info' }) },
                })
              }
            >
              With action
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast({ title: 'Credits at 85%', description: 'Top up to avoid paused runs.', tone: 'warn' })
              }
            >
              Warning
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast({ title: 'Webhook failed', description: '3 retries left.', tone: 'danger' })
              }
            >
              Error
            </Button>
          </ExampleRow>
        </Specimen>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Invite people"
        description="They’ll join Northwind Labs as members. You can change roles later."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              leftIcon="send"
              onClick={() => {
                setModal(false);
                toast({ title: 'Invite sent', description: 'sofia@northwindlabs.com' });
              }}
            >
              Send invite
            </Button>
          </>
        }
      >
        <Field label="Email" hint="Separate several addresses with commas.">
          {(id, describedBy) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              type="email"
              defaultValue="sofia@northwindlabs.com"
            />
          )}
        </Field>
      </Modal>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        size="sm"
        title="Delete Support Agent?"
        description="This removes 12 versions and stops 3 scheduled runs. Run history is kept for 90 days."
        icon={
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-subtle text-danger-text">
            <Icon name="alert-triangle" size={18} />
          </span>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Keep agent
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirm(false);
                toast({ title: 'Support Agent deleted', tone: 'danger' });
              }}
            >
              Delete
            </Button>
          </>
        }
      />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="run_4835"
        description="Support Agent · started 9:14 AM"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setDrawer(false);
                toast({ title: 'Refund approved', description: '$240 to Acme Co.' });
              }}
            >
              Approve
            </Button>
          </>
        }
      >
        <dl className="divide-y divide-border px-5">
          {[
            [
              'Status',
              <Badge key="s" tone="warn" icon="clock">
                Waiting for approval
              </Badge>,
            ],
            [
              'Requested by',
              <span key="r" className="inline-flex items-center gap-2">
                <Avatar name={people.sofia.name} src={people.sofia.avatar} size="sm" />
                {people.sofia.name}
              </span>,
            ],
            [
              'Reviewer',
              <span key="v" className="inline-flex items-center gap-2">
                <Avatar name={people.leo.name} src={people.leo.avatar} size="sm" />
                {people.leo.name}
              </span>,
            ],
            ['Action', 'Issue refund · $240'],
            [
              'Tokens',
              <span key="t" className="font-mono">
                2,410 · $0.04
              </span>,
            ],
          ].map(([term, value]) => (
            <div key={String(term)} className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-body-m text-fg-3">{term}</dt>
              <dd className="text-right text-body-m text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </Drawer>
    </DsSectionBlock>
  );
}

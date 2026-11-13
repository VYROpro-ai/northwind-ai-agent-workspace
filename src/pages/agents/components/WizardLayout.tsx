import { Fragment, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/lib/hooks';
import { Icon } from '@/components/icons';
import { AgentAvatar, Button, Drawer, useToast } from '@/components/ui';
import { wizardSteps } from '../data';
import { TestChat } from './TestChat';

export type WizardStepNumber = 1 | 2 | 3 | 4 | 5;

export interface WizardHeaderProps {
  /** Current step, 1–5. */
  step: WizardStepNumber;
  agentName?: string;
  /** Extra action before "Save draft" (e.g. the test-chat toggle on small screens). */
  action?: ReactNode;
}

/** Part · Wizard header — exit, draft status, save and the five-step progress. */
export function WizardHeader({ step, agentName = 'Support Agent', action }: WizardHeaderProps) {
  const toast = useToast();
  return (
    <header className="shrink-0 border-b border-border bg-surface text-fg">
      <div className="flex h-[60px] items-center gap-3 border-b border-border pr-4 pl-2 sm:pr-5 sm:pl-3">
        <Link
          to="/agents"
          aria-label="Exit wizard"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-icon transition-colors hover:bg-subtle hover:text-fg"
        >
          <Icon name="close" size={18} strokeWidth={2} />
        </Link>
        <span className="h-6 w-px shrink-0 bg-border" aria-hidden />
        <AgentAvatar tone="ai" size={28} className="rounded-[7px]" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] leading-5 font-semibold">{agentName}</span>
          <span className="truncate text-body-s text-fg-3">New agent · Draft · Saved 10 s ago</span>
        </div>
        {action}
        <Button
          variant="secondary"
          size="sm"
          className="h-[34px]"
          onClick={() => toast({ title: 'Draft saved', description: `${agentName} is saved as a draft.` })}
        >
          Save draft
        </Button>
      </div>
      <nav aria-label="Create agent steps" className="scrollbar-none overflow-x-auto">
        <ol className="mx-auto flex h-[59px] w-max items-center gap-3 px-4 sm:px-6">
          {wizardSteps.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const current = n === step;
            return (
              <Fragment key={s.name}>
                <li className="flex shrink-0 items-center">
                  <Link
                    to={s.to}
                    aria-current={current ? 'step' : undefined}
                    className="group flex items-center gap-2.5 rounded-full"
                  >
                    <span
                      className={cn(
                        'inline-flex size-[26px] shrink-0 items-center justify-center rounded-full text-body-s font-semibold',
                        done && 'bg-brand text-white',
                        current && 'border-2 border-brand bg-surface text-brand-text',
                        !done && !current && 'border-[1.5px] border-border-strong bg-surface text-fg-3',
                      )}
                    >
                      {done ? <Icon name="check" size={13} strokeWidth={2.5} label="Done" /> : n}
                    </span>
                    <span
                      className={cn(
                        'text-body-m whitespace-nowrap group-hover:text-fg',
                        current ? 'font-semibold text-fg' : done ? 'text-fg' : 'text-fg-2',
                        !current && 'hidden md:inline',
                      )}
                    >
                      {s.name}
                    </span>
                  </Link>
                </li>
                {n < wizardSteps.length && (
                  <li
                    aria-hidden
                    className={cn(
                      'h-[1.5px] w-6 shrink-0 rounded-xs md:w-[72px]',
                      done ? 'bg-brand' : 'bg-border',
                    )}
                  />
                )}
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}

export interface WizardLayoutProps {
  step: WizardStepNumber;
  headerAction?: ReactNode;
  children: ReactNode;
}

/**
 * Full-page create-agent layout (no app sidebar): wizard header + body.
 * From xl the page fills the viewport and panels scroll on their own; below xl the page scrolls.
 */
export function WizardLayout({ step, headerAction, children }: WizardLayoutProps) {
  useDocumentTitle(`New agent · ${wizardSteps[step - 1].name}`);
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-fg xl:h-dvh xl:overflow-hidden">
      <WizardHeader step={step} action={headerAction} />
      <main id="main" className="flex min-h-0 flex-1 flex-col xl:flex-row">
        {children}
      </main>
    </div>
  );
}

export interface WizardStepProps {
  step: Exclude<WizardStepNumber, 5>;
  title: string;
  description: string;
  /** Right side of the title row (buttons, search). */
  actions?: ReactNode;
  /** Note shown in the test-chat panel. */
  chatNote: string;
  /** Extra footer button before "Next" (e.g. "Skip for now"). */
  footerExtra?: ReactNode;
  /** Max width of the form column in px. */
  width?: 640 | 680;
  /** Rhythm between sections: 20 px (default), 14 px (`mid`) or 12 px (`dense`). */
  rhythm?: 'base' | 'mid' | 'dense';
  /** Top padding of the form column on sm+ in px (designs vary per step). */
  top?: 18 | 24 | 28;
  children: ReactNode;
}

/** A form step of the wizard: centred form, Back / Next footer and the live test chat. */
export function WizardStep({
  step,
  title,
  description,
  actions,
  chatNote,
  footerExtra,
  width = 680,
  rhythm = 'base',
  top = 28,
  children,
}: WizardStepProps) {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const prev = step > 1 ? wizardSteps[step - 2] : null;
  const next = wizardSteps[step];

  const chatToggle = (
    <Button variant="ghost" size="sm" leftIcon="chat" className="xl:hidden" onClick={() => setChatOpen(true)}>
      <span className="hidden sm:inline">Test chat</span>
      <span className="sr-only sm:hidden">Open test chat</span>
    </Button>
  );

  return (
    <WizardLayout step={step} headerAction={chatToggle}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            'flex-1 px-4 py-6 sm:px-12 sm:pb-7 xl:min-h-0 xl:scrollbar-thin xl:overflow-y-auto',
            { 18: 'sm:pt-[18px]', 24: 'sm:pt-6', 28: 'sm:pt-7' }[top],
          )}
        >
          <div
            className={cn(
              'mx-auto flex flex-col',
              { base: 'gap-5', mid: 'gap-3.5', dense: 'gap-3' }[rhythm],
              width === 640 ? 'max-w-[640px]' : 'max-w-[680px]',
            )}
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="text-h2 font-semibold tracking-[-0.015em]">{title}</h1>
                <p className="text-body-m text-fg-2">{description}</p>
              </div>
              {actions}
            </div>
            {children}
          </div>
        </div>
        <div className="sticky bottom-0 flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3.5 sm:px-12">
          <Button
            variant="secondary"
            size="lg"
            className="h-10 px-4 text-body-m disabled:border disabled:border-border disabled:bg-surface"
            disabled={!prev}
            onClick={() => prev && navigate(prev.to)}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            {footerExtra}
            <Button
              size="lg"
              className="h-10 px-[18px] text-body-m"
              rightIcon="arrow-right"
              onClick={() => navigate(next.to)}
            >
              <span>
                Next<span className="hidden sm:inline">: {next.name}</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden w-[400px] shrink-0 border-l border-border xl:flex">
        <TestChat note={chatNote} className="w-full" />
      </div>
      <Drawer open={chatOpen} onClose={() => setChatOpen(false)} width={440} label="Test chat">
        <TestChat note={chatNote} onClose={() => setChatOpen(false)} />
      </Drawer>
    </WizardLayout>
  );
}

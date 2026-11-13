import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AppShell } from '@/layouts/AppShell';
import { Icon } from '@/components/icons';
import { AgentAvatar, Button, Card, Modal, Progress, useToast } from '@/components/ui';
import { setupSteps, type SetupStep } from './data';

function StepRow({ step, index, primary }: { step: SetupStep; index: number; primary: boolean }) {
  const navigate = useNavigate();
  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-3.5 border-b border-border px-4 py-4 sm:flex-nowrap sm:px-6',
        primary && 'bg-sunken',
      )}
    >
      <span
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-body-s font-semibold',
          step.done ? 'bg-ok text-white' : 'border-[1.5px] border-border-strong bg-surface text-fg-2',
        )}
      >
        {step.done ? <Icon name="check" size={14} strokeWidth={3} label="Done" /> : index + 1}
      </span>
      <div className="flex min-w-0 flex-1 basis-[calc(100%-42px)] flex-col sm:basis-0">
        <span
          className={cn(
            'text-[15px] leading-5 font-medium',
            step.done ? 'text-fg-2 line-through' : 'text-fg',
          )}
        >
          {step.title}
        </span>
        <span className="text-13 text-fg-2">{step.detail}</span>
      </div>
      {step.cta && step.to && (
        <Button
          size="sm"
          variant={primary ? 'primary' : 'secondary'}
          className="ml-[42px] h-[34px] px-3.5 shadow-none sm:ml-0"
          onClick={() => navigate(step.to!)}
        >
          {step.cta}
        </Button>
      )}
    </li>
  );
}

/** W2-02 · First-run home */
export default function FirstRun() {
  const navigate = useNavigate();
  const toast = useToast();
  const [checklistHidden, setChecklistHidden] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const done = setupSteps.filter((s) => s.done).length;
  const nextIndex = setupSteps.findIndex((s) => !s.done);

  const hideChecklist = () => {
    setChecklistHidden(true);
    toast({
      title: 'Checklist hidden',
      description: 'You can find it again under Help.',
      tone: 'neutral',
      action: { label: 'Undo', onClick: () => setChecklistHidden(false) },
    });
  };

  return (
    <AppShell active="Home" role="owner" crumbs={[{ label: 'Home' }]} mainClassName="lg:p-8 gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h2 font-semibold tracking-[-0.02em] sm:text-[28px] sm:leading-9">
          Welcome to Northwind, Maya
        </h1>
        <p className="text-body-m text-fg-2">
          Your Support agent is ready. Three more steps and your team can start using it.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_358px]">
        {checklistHidden ? (
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-body-m text-fg-2">Setup checklist hidden · {done} of 5 done</p>
            <Button size="sm" variant="secondary" onClick={() => setChecklistHidden(false)}>
              Show checklist
            </Button>
          </Card>
        ) : (
          <Card padding="none" radius="xl" className="overflow-hidden">
            <section aria-labelledby="setup-title">
              <div className="flex flex-col gap-3 border-b border-border px-4 py-5 sm:px-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id="setup-title" className="text-[18px] leading-[26px] font-semibold">
                    Get set up
                  </h2>
                  <span className="text-13 text-fg-2">
                    <strong className="font-semibold text-fg">{done} of 5</strong> done
                  </span>
                </div>
                <Progress value={(done / setupSteps.length) * 100} label="Setup progress" />
              </div>
              <ol>
                {setupSteps.map((step, i) => (
                  <StepRow key={step.title} step={step} index={i} primary={i === nextIndex} />
                ))}
              </ol>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-6">
                <span className="text-13 text-fg-3">The checklist moves to Help when you hide it.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2.5 sm:-mr-2.5 sm:ml-0"
                  onClick={hideChecklist}
                >
                  Hide checklist
                </Button>
              </div>
            </section>
          </Card>
        )}

        <div className="flex flex-col gap-5">
          <Card radius="xl" className="flex flex-col gap-3.5 border-ai-border">
            <div className="flex items-center gap-3">
              <AgentAvatar tone="ai" size={44} className="rounded-[11px]" />
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="text-h4 leading-[22px] font-semibold">Support Agent</h2>
                <p className="text-body-s text-fg-2">From template · Draft · only you can use it</p>
              </div>
            </div>
            <p className="text-13 leading-5 text-fg-2">
              Answers billing and order questions. Ask it something a customer would, like “Where is order
              #48213?”
            </p>
            <Button leftIcon="chat" fullWidth className="h-10" onClick={() => navigate('/chat')}>
              Try it in chat
            </Button>
          </Card>

          <Card padding="none" radius="xl" className="overflow-hidden">
            <button
              type="button"
              onClick={() => setTourOpen(true)}
              className="group relative flex h-[170px] w-full items-center justify-center overflow-hidden bg-[var(--cobalt-900)]"
            >
              <span className="sr-only">Play the</span>
              <img
                src={`${import.meta.env.BASE_URL}images/tour-photo.jpg`}
                alt=""
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-[var(--slate-950)]/5 to-[var(--slate-950)]/55"
              />
              <span className="absolute top-3 left-3 inline-flex h-6 items-center gap-1.5 rounded-full bg-white/90 px-2.5 text-caption font-semibold text-[var(--slate-950)]">
                <span className="size-1.5 rounded-full bg-accent" />
                Product tour
              </span>
              <span className="relative inline-flex size-[52px] items-center justify-center rounded-full bg-white text-[var(--slate-950)] shadow-overlay transition-transform group-hover:scale-110">
                <Icon name="play" size={20} className="fill-current" />
              </span>
              <span className="absolute right-2.5 bottom-2.5 h-[22px] rounded-full bg-[var(--slate-950)]/70 px-2 font-mono text-caption leading-[22px] text-white">
                2:04
              </span>
            </button>
            <div className="flex flex-col gap-1.5 px-5 py-4">
              <h2 className="text-[15px] leading-5 font-semibold">Take the 2-minute tour</h2>
              <p className="text-13 text-fg-2">See how agents, approvals and runs fit together.</p>
              <Link to="/screens" className="mt-1 text-13 font-medium text-link hover:underline">
                Read the docs
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        size="lg"
        title="Take the 2-minute tour"
        description="See how agents, approvals and runs fit together."
        footer={
          <Button variant="secondary" onClick={() => setTourOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--cobalt-900)]">
          <img
            src={`${import.meta.env.BASE_URL}images/tour-photo.jpg`}
            alt="Team working together at laptops"
            className="size-full object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-[var(--slate-950)]/30"
          >
            <span className="inline-flex size-16 items-center justify-center rounded-full bg-white text-[var(--slate-950)] shadow-overlay">
              <Icon name="play" size={24} className="fill-current" />
            </span>
          </span>
        </div>
      </Modal>
    </AppShell>
  );
}

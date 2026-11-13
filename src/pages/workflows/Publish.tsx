import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, IconButton, Modal, Radio, Textarea, useToast } from '@/components/ui';
import { CanvasScreen } from './components/CanvasScreen';
import { publishChecks } from './data';

const runOptions = [
  { value: 'finish', label: 'Let running runs finish on v4', meta: 'Recommended' },
  { value: 'restart', label: 'Pause them and restart on v5', meta: '' },
];

/** W5-10 · Publish modal — drawn over the workflow canvas. */
export default function Publish() {
  const navigate = useNavigate();
  const toast = useToast();
  const [notes, setNotes] = useState(
    'Urgent tickets now need a support lead’s approval before the reply goes out. Survey email removed.',
  );
  const [runs, setRuns] = useState('finish');
  const [publishing, setPublishing] = useState(false);
  const close = () => navigate('/workflows/editor');

  const publish = () => {
    setPublishing(true);
    window.setTimeout(() => {
      toast({ title: 'v5 is live', description: 'Ticket triage & reply now runs on every new ticket.' });
      navigate('/workflows');
    }, 900);
  };

  return (
    <>
      <CanvasScreen />
      <Modal
        open
        bare
        onClose={close}
        label="Publish Ticket triage & reply"
        className="bg-raised sm:max-w-[540px]"
      >
        <div className="flex items-start gap-3 px-6 pt-[22px] pb-3.5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="text-[18px] leading-[26px] font-semibold text-fg">
              Publish Ticket triage &amp; reply
            </h2>
            <p className="text-13 leading-[19px] text-fg-2">v5 replaces v4 for every new ticket.</p>
          </div>
          <IconButton
            icon="close"
            label="Close"
            variant="ghost"
            size="xs"
            onClick={close}
            className="-mt-0.5 -mr-1.5 text-fg-3"
          />
        </div>

        <div className="flex flex-col gap-4 px-6">
          <ul
            aria-label="Pre-publish checks"
            className="divide-y divide-border overflow-hidden rounded-[10px] border border-border"
          >
            {publishChecks.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 px-3 py-2.5">
                <span
                  className={cn(
                    'inline-flex size-5 shrink-0 items-center justify-center rounded-full',
                    c.tone === 'ok' ? 'bg-ok-subtle text-ok-text' : 'bg-info-subtle text-info-text',
                  )}
                >
                  <Icon
                    name={c.tone === 'ok' ? 'check-sm' : 'info'}
                    size={11}
                    strokeWidth={3}
                    label={c.tone === 'ok' ? 'Passed' : 'Info'}
                  />
                </span>
                <span className="flex-1 text-13 text-fg">{c.label}</span>
                <span className="text-body-s text-fg-3 tabular">{c.meta}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="release-notes" className="text-13 font-medium text-fg">
              Release notes
            </label>
            <Textarea
              id="release-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-[84px] min-h-[60px] border-border-strong bg-transparent text-13 leading-[19px] sm:h-[60px]"
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-13 font-medium text-fg">Runs already in progress (3)</legend>
            {runOptions.map((o) => (
              <div key={o.value} className="flex items-center gap-2.5">
                <Radio
                  name="in-progress-runs"
                  value={o.value}
                  checked={runs === o.value}
                  onChange={() => setRuns(o.value)}
                  label={o.label}
                  className="flex-1 [&_.text-body-m]:text-13"
                />
                {o.meta && <span className="text-body-s text-fg-3">{o.meta}</span>}
              </div>
            ))}
          </fieldset>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-6 py-5">
          <p className="w-full text-body-s text-fg-3 sm:mr-auto sm:w-auto">
            About $0.014 per run · ~$11.80/month
          </p>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={publish} loading={publishing}>
              Publish v5
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

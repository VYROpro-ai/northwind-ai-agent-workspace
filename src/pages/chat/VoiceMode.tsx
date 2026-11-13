import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/lib/hooks';
import { Icon, type IconName } from '@/components/icons';
import { Dropdown, useToast } from '@/components/ui';
import { AgentMark } from './components/ChatHeader';
import { agents, languages, voices, voiceTranscript } from './data';
import { useElapsed, useReducedMotion, useTypewriter } from './hooks';

const BARS = [18, 34, 48, 30, 22, 40, 16];
const SPOKEN_AT = voiceTranscript.agent.indexOf('If it');

const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** "Voice  Juniper ▾" pill menu in the header. */
function SettingPill({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Dropdown
      align="end"
      width={200}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="inline-flex h-[34px] items-center gap-2 rounded-full border border-border px-3 text-13 text-fg transition-colors hover:bg-subtle"
        >
          <span className="sr-only text-fg-3 sm:not-sr-only">{label}</span> {value}
          <Icon name="chevron-down" size={14} strokeWidth={2} className="text-fg-3" />
        </button>
      )}
      items={options.map((o) => ({
        label: o,
        icon: o === value ? 'check' : undefined,
        onSelect: () => onChange(o),
      }))}
    />
  );
}

function RoundControl({
  icon,
  label,
  caption,
  onClick,
  pressed,
  danger,
}: {
  icon: IconName;
  label: string;
  caption: ReactNode;
  onClick: () => void;
  pressed?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-colors',
          danger
            ? 'size-16 bg-danger text-white hover:bg-danger-hover'
            : 'size-14 border border-border-strong bg-surface text-fg hover:bg-subtle',
          pressed && 'border-fg bg-inverse text-on-inverse hover:bg-inverse',
        )}
      >
        <Icon name={icon} size={danger ? 24 : 22} strokeWidth={danger ? 2.25 : 1.75} />
      </button>
      <span className="text-body-s text-fg-3">{caption}</span>
    </div>
  );
}

/** W4-10 · Voice mode — full-screen voice chat with a live orb and transcript. */
export default function VoiceMode() {
  useDocumentTitle('Voice mode');
  const agent = agents.support;
  const navigate = useNavigate();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [speaking, setSpeaking] = useState(true);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState(true);
  const [voice, setVoice] = useState(voices[0]);
  const [language, setLanguage] = useState(languages[0]);
  const [levels, setLevels] = useState(BARS);
  const [seconds] = useElapsed(true, 102);
  const { count, done } = useTypewriter(voiceTranscript.agent.length, {
    from: SPOKEN_AT,
    running: speaking,
    step: 1,
    interval: 70,
  });
  const talking = speaking && !done;

  // Bounce the waveform while the agent talks.
  useEffect(() => {
    if (!talking || reduced) return;
    const id = window.setInterval(() => {
      setLevels(BARS.map((h) => Math.round(h * (0.45 + Math.random() * 0.75))));
    }, 160);
    return () => window.clearInterval(id);
  }, [talking, reduced]);

  const bars = talking && !reduced ? levels : BARS.map((h) => (talking ? h : Math.max(6, h / 4)));
  const status = talking
    ? 'Speaking · tap anywhere to interrupt'
    : muted
      ? 'Muted · tap to unmute'
      : 'Listening…';

  const interrupt = () => {
    if (talking) setSpeaking(false);
    else if (muted) setMuted(false);
  };

  return (
    <div className="flex h-dvh min-h-[560px] flex-col overflow-hidden bg-sunken text-fg">
      <header className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
        <AgentMark agent={agent} size={32} />
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-body-m font-semibold">{agent.name}</h1>
          <span className="text-body-s text-fg-3 tabular">Voice · {clock(seconds)}</span>
        </div>
        <span className="flex-1" />
        <SettingPill label="Voice" value={voice} options={voices} onChange={setVoice} />
        <span className="hidden sm:block">
          <SettingPill label="Language" value={language} options={languages} onChange={setLanguage} />
        </span>
      </header>

      <main
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-7 overflow-y-auto px-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) interrupt();
        }}
      >
        <button
          type="button"
          onClick={interrupt}
          aria-label={talking ? 'Interrupt' : 'Voice orb'}
          className="relative flex size-[200px] shrink-0 items-center justify-center rounded-full sm:size-60"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--violet-500)_7%,transparent)] dark:bg-[color-mix(in_srgb,var(--violet-400)_7%,transparent)]"
          />
          <span
            aria-hidden
            className={cn(
              'absolute inset-5 rounded-full bg-[color-mix(in_srgb,var(--violet-500)_14%,transparent)] transition-transform duration-500 sm:inset-6 dark:bg-[color-mix(in_srgb,var(--violet-400)_16%,transparent)]',
              talking && 'scale-105',
            )}
          />
          <span
            aria-hidden
            className={cn(
              'relative size-[124px] rounded-full sm:size-[148px]',
              'bg-[radial-gradient(circle_at_35%_30%,var(--violet-300)_0%,var(--violet-600)_45%,var(--cobalt-500)_100%)]',
              'dark:bg-[radial-gradient(circle_at_35%_30%,var(--violet-300)_0%,var(--violet-600)_45%,var(--cobalt-600)_100%)]',
              'shadow-[0_16px_48px_color-mix(in_srgb,var(--violet-600)_35%,transparent)] dark:shadow-[0_16px_48px_color-mix(in_srgb,var(--violet-600)_50%,transparent)]',
            )}
          />
          <span aria-hidden className="absolute flex items-center gap-[5px]">
            {bars.map((h, i) => (
              <span
                key={i}
                className="w-[5px] rounded-full bg-white/90 transition-[height] duration-150"
                style={{ height: h }}
              />
            ))}
          </span>
        </button>

        <button
          type="button"
          onClick={interrupt}
          className="inline-flex h-[30px] items-center gap-2 rounded-full bg-ai-subtle px-3 text-13 font-medium text-ai-text"
        >
          <span
            aria-hidden
            className={cn('size-[7px] rounded-full bg-ai-caret', talking && 'animate-pulse-soft')}
          />
          <span aria-live="polite">{status}</span>
        </button>

        {transcript && (
          <section aria-label="Transcript" className="flex w-full max-w-[640px] flex-col gap-3.5">
            <div className="flex gap-2.5">
              <span className="w-[52px] shrink-0 text-body-s leading-[22px] font-semibold text-fg-3">
                You
              </span>
              <p className="text-[15px] leading-[22px] text-fg-2">{voiceTranscript.you}</p>
            </div>
            <div className="flex gap-2.5">
              <span className="w-[52px] shrink-0 text-body-s leading-[26px] font-semibold text-ai-text">
                Agent
              </span>
              <p className="text-[17px] leading-[26px] text-fg">
                {voiceTranscript.agent.slice(0, count)}
                <span className="text-fg-3">{voiceTranscript.agent.slice(count)}</span>
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="flex shrink-0 items-center justify-center gap-5 px-6 pt-6 pb-9">
        <RoundControl
          icon={muted ? 'mic-off' : 'mic'}
          label={muted ? 'Unmute' : 'Mute'}
          caption={muted ? 'Unmute' : 'Mute'}
          pressed={muted}
          onClick={() => setMuted(!muted)}
        />
        <RoundControl
          icon="close"
          label="End voice chat"
          caption="End"
          danger
          onClick={() => {
            toast({
              title: 'Voice chat ended',
              description: `${clock(seconds)} · transcript saved to this chat`,
            });
            navigate('/chat');
          }}
        />
        <RoundControl
          icon="list"
          label={transcript ? 'Hide transcript' : 'Show transcript'}
          caption="Transcript"
          onClick={() => setTranscript(!transcript)}
        />
      </footer>
    </div>
  );
}

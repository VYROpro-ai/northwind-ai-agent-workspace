import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/lib/hooks';
import { WorkflowTopbar, type WorkflowTopbarProps } from './WorkflowTopbar';

export interface WorkflowEditorLayoutProps {
  topbar?: WorkflowTopbarProps;
  /** Document title (editor pages are full screen, without the app shell). */
  title?: string;
  /** Left rail, e.g. the step library. Shown from `lg` up. */
  left?: ReactNode;
  /** Right config panel (400 px). Becomes a bottom sheet under `lg`. */
  panel?: ReactNode;
  /** Optional bar under the canvas. */
  bottomBar?: ReactNode;
  /** The canvas. */
  children: ReactNode;
}

/** Full-screen workflow editor: 56 px top bar + canvas + optional 400 px config panel and bottom bar. */
export function WorkflowEditorLayout({
  topbar,
  title = 'Ticket triage & reply',
  left,
  panel,
  bottomBar,
  children,
}: WorkflowEditorLayoutProps) {
  useDocumentTitle(title);
  return (
    <div className="flex h-dvh min-h-[560px] flex-col overflow-hidden bg-canvas text-fg">
      <WorkflowTopbar {...topbar} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {left}
        <main id="main" className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {children}
          {bottomBar}
        </main>
        {panel}
      </div>
    </div>
  );
}

import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/icons';
import { useToast } from '@/components/ui';
import {
  aiEdge,
  baseNodes,
  branchLabels,
  edges,
  extraNodes,
  insertPoints,
  modeStates,
  nodeRoutes,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  type CanvasMode,
  type NodeId,
  type NodeState,
  type NodeStateMap,
} from '../data';
import { WorkflowNode } from './WorkflowNode';

/** The stage's main column is centred on x = 320; the widest content reaches x = 740. */
const STAGE_ANCHOR = 320;
const BOARD_SIDE = 440;
const BOARD_PAD = 40;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

const clampZoom = (z: number) => Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)) * 100) / 100;

const reached = (s?: NodeState) => s === 'ok' || s === 'run' || s === 'fail';

export interface WorkflowCanvasProps {
  mode?: CanvasMode;
  /** Overrides the node states for the mode (e.g. a test run that advances). */
  states?: NodeStateMap;
  /** Initially selected node id. */
  selected?: NodeId | '';
  /** Shows a collaborator's live cursor (base editor only). */
  presence?: boolean;
  /** Hide zoom controls and the mini-map. */
  chrome?: boolean;
  /** Positions the zoom controls (e.g. lift them above a bottom composer). */
  chromeClassName?: string;
  /** Floating content over the viewport (issue cards, pickers, composers). */
  children?: ReactNode;
  className?: string;
}

/**
 * Workflow canvas · dot-grid board with nodes, SVG edges, per-mode node states, zoom controls and a mini-map.
 * The 760 × 660 stage lives in a fixed-size board inside a scrollable, pannable viewport.
 */
export function WorkflowCanvas({
  mode = 'edit',
  states: stateOverrides,
  selected: initialSelected = '',
  presence = false,
  chrome = true,
  chromeClassName = 'bottom-4',
  children,
  className,
}: WorkflowCanvasProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [selected, setSelected] = useState<NodeId | ''>(initialSelected);
  // Small screens start zoomed out so more of the graph is visible.
  const [zoom, setZoom] = useState(() =>
    clampZoom(Math.min(1, Math.floor(((window.innerWidth - BOARD_PAD * 2) / (BOARD_SIDE * 2)) * 20) / 20)),
  );

  const states = stateOverrides ?? modeStates[mode] ?? {};
  const nodes = [...baseNodes, ...(extraNodes[mode] ?? [])];
  const banner = mode === 'debug';
  const editable = mode === 'edit' || mode === 'ai' || mode === 'warn';
  const stageTop = banner ? 72 : 44;

  const fitZoom = () => {
    const el = viewport.current;
    if (!el) return 1;
    const byWidth = (el.clientWidth - BOARD_PAD * 2) / (BOARD_SIDE * 2);
    const byHeight = (el.clientHeight - stageTop - BOARD_PAD) / STAGE_HEIGHT;
    return clampZoom(Math.floor(Math.min(byWidth, byHeight) * 20) / 20);
  };

  // Keep the main column centred horizontally when the board overflows.
  useLayoutEffect(() => {
    const el = viewport.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [zoom]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a')) return;
    const el = viewport.current;
    if (!el) return;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = viewport.current;
    if (!drag.current || !el) return;
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const endDrag = () => {
    drag.current = null;
  };

  const selectNode = (id: NodeId) => {
    setSelected(id);
    const route = nodeRoutes[id];
    if (editable && route) navigate(route);
  };

  const edgeOn = (from: NodeId, to: NodeId | null) =>
    (mode === 'test' || mode === 'debug') &&
    to !== null &&
    reached(states[from]?.state) &&
    reached(states[to]?.state);

  const boardWidth = BOARD_SIDE * 2 * zoom + BOARD_PAD * 2;
  const boardHeight = stageTop + STAGE_HEIGHT * zoom + BOARD_PAD * 3;

  return (
    <div className={cn('relative min-h-0 flex-1 overflow-hidden bg-sunken', className)}>
      <div
        ref={viewport}
        role="region"
        aria-label="Workflow canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute inset-0 cursor-grab scrollbar-thin overflow-auto active:cursor-grabbing"
      >
        <div
          className="relative bg-dot-grid"
          style={{ width: `max(100%, ${boardWidth}px)`, height: `max(100%, ${boardHeight}px)` }}
        >
          <div
            className="absolute"
            style={{
              top: stageTop,
              left: `calc(50% - ${STAGE_ANCHOR * zoom}px)`,
              width: STAGE_WIDTH,
              height: STAGE_HEIGHT,
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <Edges mode={mode} edgeOn={edgeOn} />

            {branchLabels.map((l) => (
              <span
                key={l.label}
                className="absolute h-5 rounded-full border border-border bg-surface px-[7px] text-caption leading-[18px] font-semibold text-fg-2"
                style={{ left: l.x, top: l.y }}
              >
                {l.label}
              </span>
            ))}

            {editable &&
              insertPoints.map((p) => (
                <Link
                  key={p.id}
                  to="/workflows/editor/add-node"
                  aria-label="Add a step here"
                  className="absolute inline-flex size-5 items-center justify-center rounded-full border border-border-strong bg-surface text-icon transition-colors hover:border-brand hover:bg-brand hover:text-white"
                  style={{ left: p.x, top: p.y }}
                >
                  <Icon name="plus" size={10} strokeWidth={3} />
                </Link>
              ))}

            {nodes.map((n) => (
              <WorkflowNode
                key={n.id}
                node={n}
                state={states[n.id]?.state}
                label={states[n.id]?.label}
                selected={selected === n.id}
                onSelect={() => selectNode(n.id)}
                className="absolute"
                style={{ left: n.x, top: n.y, width: n.w ?? 240 }}
              />
            ))}

            {presence && mode === 'edit' && !selected && <PresenceCursor name="Leo Martins" />}
          </div>
        </div>
      </div>

      {banner && (
        <div
          role="status"
          className="absolute top-3.5 left-1/2 z-[3] flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-2.5 rounded-[10px] border border-info-border bg-info-subtle py-2 pr-2.5 pl-3.5 text-13 text-info-text shadow-overlay"
        >
          <span className="min-w-0">This run used v3. You’re viewing v5.</span>
          <button
            type="button"
            onClick={() =>
              toast({
                title: 'Switched to v3',
                description: 'Showing the graph this run used.',
                tone: 'info',
              })
            }
            className="h-[26px] shrink-0 rounded-sm border border-border-strong bg-surface px-2.5 text-body-s font-medium text-fg hover:bg-subtle"
          >
            Switch to v3
          </button>
        </div>
      )}

      {chrome && (
        <div className={cn('absolute right-4 z-[2] flex flex-col items-end gap-2', chromeClassName)}>
          <MiniMap mode={mode} />
          <div className="flex gap-2">
            <ControlGroup>
              <ChromeButton
                icon="undo"
                label="Undo"
                onClick={() => toast({ title: 'Change undone', tone: 'neutral' })}
              />
              <ChromeButton
                icon="redo"
                label="Redo"
                onClick={() => toast({ title: 'Change redone', tone: 'neutral' })}
              />
            </ControlGroup>
            <ControlGroup>
              <ChromeButton
                icon="minus"
                label="Zoom out"
                className="w-8"
                disabled={zoom <= MIN_ZOOM}
                onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
              />
              <span
                aria-live="polite"
                className="w-11 text-center font-mono text-body-s font-medium text-fg tabular"
              >
                {Math.round(zoom * 100)}%
              </span>
              <ChromeButton
                icon="plus"
                label="Zoom in"
                className="w-8"
                disabled={zoom >= MAX_ZOOM}
                onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
              />
              <span className="h-[18px] w-px bg-border" aria-hidden />
              <button
                type="button"
                onClick={() => setZoom(fitZoom())}
                className="h-full rounded-r-[10px] px-2.5 text-body-s font-medium text-fg-2 hover:text-fg"
              >
                Fit
              </button>
            </ControlGroup>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

function Edges({ mode, edgeOn }: { mode: CanvasMode; edgeOn: (from: NodeId, to: NodeId | null) => boolean }) {
  return (
    <svg
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden
    >
      <defs>
        {(
          [
            ['wf-arrow', 'var(--icon-muted)'],
            ['wf-arrow-on', 'var(--ok)'],
            ['wf-arrow-ai', 'var(--ai)'],
          ] as const
        ).map(([id, fill]) => (
          <marker
            key={id}
            id={id}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10z" fill={fill} />
          </marker>
        ))}
      </defs>
      {edges.map((e) => {
        const on = edgeOn(e.from, e.to);
        const added = mode === 'diff' && (e.id === 'cond-approval' || e.id === 'approval-reply');
        return (
          <path
            key={e.id}
            d={e.d}
            fill="none"
            stroke={on || added ? 'var(--ok)' : 'var(--icon-muted)'}
            strokeWidth={on || added ? 2 : 1.5}
            markerEnd={on ? 'url(#wf-arrow-on)' : 'url(#wf-arrow)'}
          />
        );
      })}
      {mode === 'ai' && (
        <path
          d={aiEdge}
          fill="none"
          stroke="var(--ai)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          markerEnd="url(#wf-arrow-ai)"
        />
      )}
    </svg>
  );
}

function MiniMap({ mode }: { mode: CanvasMode }) {
  const nodes = [...baseNodes, ...(extraNodes[mode] ?? [])];
  return (
    <div
      aria-label="Mini-map"
      role="img"
      className="relative box-content hidden h-[104px] w-[168px] overflow-hidden rounded-[10px] border border-border bg-surface shadow-overlay sm:block"
    >
      {nodes.map((n) => (
        <span
          key={n.id}
          className={cn(
            'absolute h-2 rounded-[2px]',
            n.variant === 'ai' ? 'bg-ai' : n.variant === 'del' ? 'bg-danger' : 'bg-border-strong',
          )}
          style={{
            left: Math.round(24 + n.x * 0.16),
            top: Math.round(12 + n.y * 0.12),
            width: Math.round((n.w ?? 240) * 0.16),
          }}
        />
      ))}
      <span className="absolute top-2 left-7 h-[86px] w-28 rounded-xs border-[1.5px] border-brand bg-brand/5" />
    </div>
  );
}

function ControlGroup({ children }: { children: ReactNode }) {
  return (
    <div className="box-content flex h-9 items-center rounded-[10px] border border-border bg-surface shadow-overlay">
      {children}
    </div>
  );
}

function ChromeButton({
  icon,
  label,
  onClick,
  disabled,
  className,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-full w-[34px] items-center justify-center rounded-[10px] text-icon transition-colors hover:text-fg disabled:opacity-40',
        className,
      )}
    >
      <Icon name={icon} size={15} strokeWidth={2} />
    </button>
  );
}

function PresenceCursor({ name }: { name: string }) {
  return (
    <div
      className="pointer-events-none absolute top-[400px] left-[404px] flex flex-col items-start gap-0.5"
      aria-hidden
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        className="fill-[var(--amber-500)] stroke-white"
        strokeWidth={1.5}
      >
        <path d="M4 3l16 7-7 2-2 7z" />
      </svg>
      <span className="ml-3 rounded-xs bg-[var(--amber-500)] px-1.5 py-0.5 text-caption font-semibold whitespace-nowrap text-[var(--slate-950)]">
        {name}
      </span>
    </div>
  );
}

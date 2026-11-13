import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/icons';
import { Button, Checkbox, Modal, Switch, useToast } from '@/components/ui';
import { formatNumber } from '@/lib/format';
import { people } from '@/data/people';
import {
  connectorKinds,
  connectorLabels,
  folderTree,
  initialExpanded,
  initialFolderSelection,
  planDocLimit,
  sourceKinds,
  type FolderNode,
  type SourceKind,
} from '../data';
import { IconTile } from '@/components/ui/Tiles';
import { boardModal } from './boardModal';
import { InlineNotice } from '@/components/ui/InlineNotice';

/* ---------- folder-tree selection helpers ---------- */

function descendants(node: FolderNode): string[] {
  return (node.children ?? []).flatMap((child) => [child.id, ...descendants(child)]);
}

function ancestorsOf(
  id: string,
  node: FolderNode = folderTree,
  trail: FolderNode[] = [],
): FolderNode[] | null {
  if (node.id === id) return trail;
  for (const child of node.children ?? []) {
    const found = ancestorsOf(id, child, [...trail, node]);
    if (found) return found;
  }
  return null;
}

function selectedCount(node: FolderNode, selected: Set<string>): number {
  if (selected.has(node.id)) return node.count;
  return (node.children ?? []).reduce((sum, child) => sum + selectedCount(child, selected), 0);
}

function toggleNode(node: FolderNode, selected: Set<string>) {
  const next = new Set(selected);
  const ancestors = ancestorsOf(node.id) ?? [];
  if (next.has(node.id)) {
    [node.id, ...descendants(node), ...ancestors.map((a) => a.id)].forEach((id) => next.delete(id));
  } else {
    [node.id, ...descendants(node)].forEach((id) => next.add(id));
    // A parent becomes fully selected once all of its children are.
    for (const parent of [...ancestors].reverse()) {
      if (parent.children?.every((child) => next.has(child.id))) next.add(parent.id);
    }
  }
  return next;
}

function FolderRow({
  node,
  depth,
  selected,
  expanded,
  onToggle,
  onExpand,
}: {
  node: FolderNode;
  depth: number;
  selected: Set<string>;
  expanded: Set<string>;
  onToggle: (node: FolderNode) => void;
  onExpand: (id: string) => void;
}) {
  const isOpen = expanded.has(node.id);
  const checked = selected.has(node.id);
  const partial = !checked && descendants(node).some((id) => selected.has(id));
  return (
    <li>
      <div className="flex h-8 items-center gap-2 text-13" style={{ paddingLeft: depth * 20 }}>
        {node.children ? (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.name}`}
            onClick={() => onExpand(node.id)}
            className="inline-flex size-4 items-center justify-center rounded-xs text-fg-3 hover:text-fg"
          >
            <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={12} strokeWidth={2} />
          </button>
        ) : (
          <span className="w-4" aria-hidden />
        )}
        <Checkbox
          checked={checked || partial}
          indeterminate={partial}
          onChange={() => onToggle(node)}
          className="min-w-0 flex-1 items-center"
          label={
            <span className="flex items-center gap-2 text-13">
              <Icon name="folder" size={14} strokeWidth={1.9} className="text-fg-3" />
              <span className="truncate">{node.name}</span>
            </span>
          }
        />
        <span className="text-body-s text-fg-3 tabular">
          {formatNumber(node.count)}
          {depth === 0 && ' docs'}
        </span>
      </div>
      {node.children && isOpen && (
        <ul>
          {node.children.map((child) => (
            <FolderRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              expanded={expanded}
              onToggle={onToggle}
              onExpand={onExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** W7-03 · Connect a source modal — connector picker, account, folder selection with plan limit. */
export function ConnectSourceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [kind, setKind] = useState<SourceKind>('drive');
  const [selected, setSelected] = useState(() => new Set(initialFolderSelection));
  const [expanded, setExpanded] = useState(() => new Set(initialExpanded));
  const [respectPermissions, setRespectPermissions] = useState(true);

  const count = useMemo(() => selectedCount(folderTree, selected), [selected]);
  const overLimit = count > planDocLimit;
  const minutes = Math.max(1, Math.round(count / 276));
  const kindLabel = connectorLabels[kind] ?? sourceKinds[kind].label;

  const expand = (id: string) =>
    setExpanded((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const connect = () => {
    toast({
      title: `${kindLabel} connected`,
      description: `Indexing ${formatNumber(count)} docs.`,
      tone: 'ok',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      className={cn('max-w-[640px]', boardModal)}
      title="Connect a source"
      description="Keep agents up to date with docs that live in other tools."
      footer={
        <>
          <span className="mr-auto text-body-s text-fg-3">
            {count > 0 ? `About ${minutes} min to index` : 'Choose at least one folder'}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Back
          </Button>
          <Button size="sm" disabled={overLimit || count === 0} onClick={connect}>
            Connect {formatNumber(count)} docs
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div
          role="radiogroup"
          aria-label="Source type"
          className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:grid-cols-3"
        >
          {connectorKinds.map((c) => {
            const meta = sourceKinds[c.kind];
            const on = c.kind === kind;
            return (
              <button
                key={c.kind}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setKind(c.kind)}
                className={cn(
                  'flex gap-2.5 rounded-[10px] p-3 text-left transition-colors',
                  on ? 'border-[1.5px] border-brand bg-brand-subtle' : 'border border-border hover:bg-subtle',
                )}
              >
                <IconTile icon={meta.icon} tone={meta.tone} />
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="text-13 font-semibold text-fg">
                    {connectorLabels[c.kind] ?? meta.label}
                  </span>
                  <span className="text-body-s text-fg-3">{c.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-border px-3 py-2.5">
          <IconTile icon={sourceKinds[kind].icon} tone={sourceKinds[kind].tone} />
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="text-13 font-semibold text-fg">{kindLabel} · northwindlabs</span>
            <span className="text-body-s text-ok-text">Connected as {people.daniel.name}</span>
          </div>
          <Button
            variant="link"
            className="text-body-s"
            onClick={() =>
              toast({
                title: 'Sign in with another account',
                description: `Opens the ${kindLabel} sign-in window.`,
              })
            }
          >
            Change account
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body-s font-semibold text-fg-2" id="choose-folders">
            Choose folders
          </span>
          <ul aria-labelledby="choose-folders" className="rounded-[10px] border border-border px-3 py-1.5">
            <FolderRow
              node={folderTree}
              depth={0}
              selected={selected}
              expanded={expanded}
              onToggle={(node) => setSelected((set) => toggleNode(node, set))}
              onExpand={expand}
            />
          </ul>
        </div>

        {overLimit && (
          <InlineNotice
            tone="danger"
            title={`This selection has ${formatNumber(count)} docs. Your plan allows ${formatNumber(planDocLimit)}.`}
            actions={
              <Button
                variant="secondary"
                size="xs"
                className="h-7 px-3 text-13"
                onClick={() => navigate('/settings/plans')}
              >
                Upgrade
              </Button>
            }
          >
            Untick a folder or upgrade to Business.
          </InlineNotice>
        )}

        <Switch
          label={<span className="text-13">Respect source permissions</span>}
          description="People only get answers from docs they can open in the drive"
          checked={respectPermissions}
          onChange={(e) => setRespectPermissions(e.target.checked)}
        />
      </div>
    </Modal>
  );
}

import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { Table, TableContainer, TBody, TD, TH, THead, TR } from '@/components/ui';
import { topAgents } from '../data';
import { AgentGlyph } from './AgentGlyph';
import { Panel, PanelHeader } from './Panel';

const num = 'px-1 text-right tabular';

/** W2-01 · Top agents leaderboard (runs, success, cost per run, thumbs-up rate). */
export function TopAgentsCard() {
  return (
    <Panel className="flex flex-col gap-3 px-[18px] pt-[18px] pb-2">
      <PanelHeader
        icon="nav-agents"
        title="Top agents"
        actions={
          <Link to="/agents" className="text-body-s font-medium text-link hover:underline">
            All agents
          </Link>
        }
      />
      <TableContainer>
        <Table className="min-w-[340px] text-body-s">
          <THead className="text-caption">
            <TR>
              <TH className="h-8 first:pl-1">Agent</TH>
              <TH className={cn(num, 'h-8 w-[54px] [&>span]:justify-end')}>Runs</TH>
              <TH className={cn(num, 'h-8 w-[58px] [&>span]:justify-end')}>Success</TH>
              <TH className={cn(num, 'h-8 w-[58px] [&>span]:justify-end')}>Cost/run</TH>
              <TH className={cn(num, 'h-8 w-10 last:pr-1 [&>span]:justify-end')}>
                <span role="img" aria-label="Thumbs-up rate">
                  👍
                </span>
              </TH>
            </TR>
          </THead>
          <TBody>
            {topAgents.map((a) => (
              <TR key={a.agent.name}>
                <TD className="h-11 max-w-0 first:pl-1">
                  <Link to={a.to} className="flex min-w-0 items-center gap-2 hover:underline">
                    <AgentGlyph agent={a.agent} variant="dot" />
                    <span className="truncate text-13 font-medium">{a.agent.name}</span>
                  </Link>
                </TD>
                <TD className={cn(num, 'h-11 font-semibold')}>{a.runs}</TD>
                <TD
                  className={cn(
                    num,
                    'h-11 font-semibold',
                    a.belowTarget ? 'text-danger-text' : 'text-ok-text',
                  )}
                >
                  {a.success}
                </TD>
                <TD className={cn(num, 'h-11 text-fg-2')}>{a.costPerRun}</TD>
                <TD className={cn(num, 'h-11 text-fg-2 last:pr-1')}>{a.thumbsUp}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableContainer>
    </Panel>
  );
}

import { useMemo, useState } from 'react';
import { tok } from '@/lib/syntax';
import { Sparkline } from '@/components/charts';
import {
  Button,
  Card,
  CardHeader,
  Checkbox,
  CodeBlock,
  Pagination,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  TableContainer,
} from '@/components/ui';
import { demoRuns, sparkData } from '../../data';
import { DsSectionBlock, SectionHeader, Specimen } from '../Specimen';

const PAGE_COUNT = 4;
const TOTAL_RUNS = 24;

const codeSample = `{
  "status": "succeeded",
  "latency": 1.8,
  "cost": 0.04,
  "approved_by": "leo@northwindlabs.com",
  "tools": ["search_crm", "issue_refund"]
}`;

/** C8 · Data display — table with pagination, code block, card. */
export function DataGallery() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    const offset = (page - 1) * demoRuns.length;
    const list = demoRuns.map((r, i) => ({ ...r, id: `run_${4835 - offset - i}` }));
    return sort === 'desc' ? list : [...list].reverse();
  }, [page, sort]);

  const toggleRow = (id: string) =>
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const allOnPage = rows.every((r) => selected.includes(r.id));
  const someOnPage = !allOnPage && rows.some((r) => selected.includes(r.id));
  const first = (page - 1) * demoRuns.length + 1;

  return (
    <DsSectionBlock id="data">
      <SectionHeader
        id="data"
        eyebrow="Components · C8"
        title="Data display"
        description="Tables scroll inside TableContainer on small screens, so wide data never breaks the page. Cards frame dashboard content; code blocks stay dark in both modes."
        meta="Table · Pagination · CodeBlock · Card"
      />
      <div className="flex flex-col gap-4">
        <Specimen
          title="Table + pagination"
          meta={selected.length ? `${selected.length} selected` : 'click a row to select'}
          importPath="import { TableContainer, Table, THead, TBody, TR, TH, TD, Pagination } from '@/components/ui'"
          bodyClassName="p-0 pt-4"
        >
          <TableContainer className="border-t border-border">
            <Table className="min-w-[720px]">
              <THead className="bg-sunken">
                <TR>
                  <TH className="w-10">
                    <Checkbox
                      aria-label="Select all runs on this page"
                      checked={allOnPage || someOnPage}
                      indeterminate={someOnPage}
                      onChange={() =>
                        setSelected((list) =>
                          allOnPage
                            ? list.filter((id) => !rows.some((r) => r.id === id))
                            : [...new Set([...list, ...rows.map((r) => r.id)])],
                        )
                      }
                    />
                  </TH>
                  <TH sorted={sort}>
                    <button
                      type="button"
                      onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
                      className="hover:text-fg"
                    >
                      Run
                    </button>
                  </TH>
                  <TH>Agent</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Duration</TH>
                  <TH className="text-right">Cost</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((r) => {
                  const on = selected.includes(r.id);
                  return (
                    <TR
                      key={r.id}
                      selected={on}
                      onClick={() => toggleRow(r.id)}
                      className="cursor-pointer hover:bg-sunken"
                    >
                      <TD onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label={`Select ${r.id}`}
                          checked={on}
                          onChange={() => toggleRow(r.id)}
                        />
                      </TD>
                      <TD>
                        <p className="font-mono text-13 text-fg">{r.id}</p>
                        <p className="text-body-s text-fg-3">{r.task}</p>
                      </TD>
                      <TD className="text-fg-2">{r.agent}</TD>
                      <TD>
                        <StatusBadge status={r.status} />
                      </TD>
                      <TD className="text-right font-mono text-body-s text-fg-2">{r.duration}</TD>
                      <TD className="text-right font-mono text-body-s text-fg">{r.cost}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableContainer>
          <div className="border-t border-border">
            <Pagination
              page={page}
              pageCount={PAGE_COUNT}
              onChange={setPage}
              summary={`Showing ${first}–${first + demoRuns.length - 1} of ${TOTAL_RUNS} runs`}
            />
          </div>
        </Specimen>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Specimen
            title="Code block"
            meta="copy · tok colours"
            importPath="import { CodeBlock } from '@/components/ui' · import { tok } from '@/lib/syntax'"
          >
            <CodeBlock code={codeSample} language="json">
              <span className={tok.muted}>{'{'}</span>
              {'\n  '}
              <span className={tok.key}>"status"</span>: <span className={tok.str}>"succeeded"</span>,{'\n  '}
              <span className={tok.key}>"latency"</span>: <span className={tok.num}>1.8</span>,{'\n  '}
              <span className={tok.key}>"cost"</span>: <span className={tok.num}>0.04</span>,{'\n  '}
              <span className={tok.key}>"approved_by"</span>:{' '}
              <span className={tok.str}>"leo@northwindlabs.com"</span>,{'\n  '}
              <span className={tok.key}>"tools"</span>: [<span className={tok.str}>"search_crm"</span>,{' '}
              <span className={tok.str}>"issue_refund"</span>]{'\n'}
              <span className={tok.muted}>{'}'}</span>
            </CodeBlock>
          </Specimen>

          <Specimen
            title="Card"
            meta="flat · raised"
            importPath="import { Card, CardHeader } from '@/components/ui'"
            bodyClassName="bg-sunken"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card padding="md" className="sm:col-span-2">
                <CardHeader
                  icon="analytics"
                  title="Runs this week"
                  description="All agents · Oct 20–26"
                  actions={
                    <Button size="sm" variant="secondary">
                      View all
                    </Button>
                  }
                />
              </Card>
              <Card elevation="raised" padding="sm" radius="xl">
                <p className="text-body-s text-fg-3">Resolved by agents</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="text-h2 font-semibold text-fg tabular">82%</p>
                  <Sparkline data={sparkData} color="var(--ok)" area />
                </div>
              </Card>
              <Card padding="sm" radius="xl">
                <p className="text-body-s text-fg-3">Avg. latency</p>
                <p className="mt-1 text-h2 font-semibold text-fg tabular">1.8 s</p>
              </Card>
            </div>
          </Specimen>
        </div>
      </div>
    </DsSectionBlock>
  );
}

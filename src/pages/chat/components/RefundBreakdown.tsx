import { cn } from '@/lib/cn';
import { refundRows } from '../data';

const MAX = 9000;
const money = (v: number) => `$${v.toLocaleString('en-US')}`;
const totals = refundRows.reduce((t, r) => ({ jul: t.jul + r.jul, sep: t.sep + r.sep }), { jul: 0, sep: 0 });

/** Grouped Jul / Sep bars for the refund reasons (the shared BarChart only stacks). */
export function RefundBars({ className }: { className?: string }) {
  return (
    <figure className={cn('flex min-w-0 flex-col gap-2', className)}>
      <figcaption className="flex gap-3.5 text-body-s text-fg-2">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[2px] bg-chart-3" />
          July
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[2px] bg-chart-1" />
          September
        </span>
      </figcaption>
      <div
        className="flex gap-2"
        role="img"
        aria-label={refundRows
          .map((r) => `${r.name}: ${money(r.jul)} in July, ${money(r.sep)} in September`)
          .join('; ')}
      >
        <div className="-mt-1.5 flex h-[120px] w-6 flex-col justify-between text-right font-mono text-[10px] leading-3 text-fg-3">
          <span>$9K</span>
          <span>$6K</span>
          <span>$3K</span>
          <span>0</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex h-[120px] items-end justify-around border-b border-border-strong bg-[linear-gradient(var(--chart-grid)_1px,transparent_1px)] bg-[length:100%_40px]">
            {refundRows.map((r) => (
              <div key={r.name} className="flex h-full items-end gap-[3px]">
                <span
                  title={`${r.name} · July ${money(r.jul)}`}
                  className="w-3.5 rounded-t-[2px] bg-chart-3"
                  style={{ height: `${(r.jul / MAX) * 100}%` }}
                />
                <span
                  title={`${r.name} · September ${money(r.sep)}`}
                  className="w-3.5 rounded-t-[2px] bg-chart-1"
                  style={{ height: `${(r.sep / MAX) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div aria-hidden className="flex justify-around text-caption text-fg-3">
            {refundRows.map((r) => (
              <span key={r.name} className="w-14 text-center">
                {r.short}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

/** Reason / Jul / Sep / Change table with a total row. */
export function RefundTable({ className }: { className?: string }) {
  return (
    <table className={cn('w-full min-w-0 text-13 leading-[18px] tabular', className)}>
      <caption className="sr-only">Refunds by reason, July vs September</caption>
      <thead>
        <tr className="border-b border-border text-body-s text-fg-3">
          <th scope="col" className="pb-2 text-left font-normal">
            Reason
          </th>
          <th scope="col" className="pb-2 text-right font-normal">
            Jul
          </th>
          <th scope="col" className="pb-2 text-right font-normal">
            Sep
          </th>
          <th scope="col" className="pb-2 text-right font-normal">
            Change
          </th>
        </tr>
      </thead>
      <tbody>
        {refundRows.map((r) => (
          <tr key={r.name} className="border-b border-border">
            <th scope="row" className={cn('py-2 pr-2 text-left', r.top ? 'font-semibold' : 'font-normal')}>
              {r.name}
            </th>
            <td className="py-2 pl-2 text-right text-fg-2">{money(r.jul)}</td>
            <td className="py-2 pl-2 text-right">{money(r.sep)}</td>
            <td
              className={cn('py-2 pl-2 text-right font-semibold', r.top ? 'text-danger-text' : 'text-fg-2')}
            >
              {r.change}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="font-semibold">
          <th scope="row" className="py-2 text-left">
            Total
          </th>
          <td className="py-2 pl-2 text-right">{money(totals.jul)}</td>
          <td className="py-2 pl-2 text-right">{money(totals.sep)}</td>
          <td className="py-2 pl-2 text-right">+48%</td>
        </tr>
      </tfoot>
    </table>
  );
}

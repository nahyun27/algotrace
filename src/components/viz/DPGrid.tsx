import type { ReactNode } from 'react';
import { Panel, cn } from '../ui';
import { toneSoft, toneSolid, toneText } from '../ui/tone';
import type { VizState } from './palette';

export type DPRowState = 'current' | 'dim' | undefined;

interface DPGridProps {
  title: ReactNode;
  actions?: ReactNode;
  /** Header of the row-label column */
  corner?: ReactNode;
  rowLabels: ReactNode[];
  colLabels: ReactNode[];
  values: (number | string | null)[][];
  /** Cell text (default: '∞' for ≥ 1e9, '' for null) */
  format?: (value: number | string | null, row: number, col: number) => ReactNode;
  /** Visual state of a cell (default: idle) */
  cellState?: (row: number, col: number) => VizState;
  /** Cells the current cell reads from: outlined in the candidate color */
  deps?: [number, number][];
  /** Emphasize or fade a whole row */
  rowState?: (row: number) => DPRowState;
  /** Rows to leave out entirely */
  hideRow?: (row: number) => boolean;
  className?: string;
}

const defaultFormat = (v: number | string | null) => (v === null ? '' : typeof v === 'number' && v >= 1e9 ? '∞' : v);

const CELL_CLASS: Record<VizState, string> = {
  idle: '',
  current: `${toneSoft.current} font-bold ring-2 ring-state-current/50`,
  candidate: `${toneSoft.candidate} font-bold ring-2 ring-state-candidate/50`,
  visited: `${toneSoft.visited} font-semibold`,
  path: `${toneSolid.path} font-bold`,
  danger: `${toneSoft.danger} font-bold`,
};

/**
 * Two-dimensional DP table shared by DP pages (TSP, LCS, knapsack, …).
 * Each cell is styled by its VizState; `deps` outlines the cells the current one depends on.
 */
export default function DPGrid({
  title,
  actions,
  corner,
  rowLabels,
  colLabels,
  values,
  format = defaultFormat,
  cellState = () => 'idle',
  deps = [],
  rowState = () => undefined,
  hideRow = () => false,
  className,
}: DPGridProps) {
  const isDep = (r: number, c: number) => deps.some(([dr, dc]) => dr === r && dc === c);

  return (
    <Panel className={cn('h-full w-full flex flex-col', className)} title={title} actions={actions} bodyClassName="flex-1 overflow-auto p-3 relative">
      <div className="overflow-hidden rounded-xl border border-border inline-block min-w-full">
        <table className="w-full text-xs text-center border-collapse [border-spacing:0] bg-card">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="border-b border-border px-2 py-2 bg-muted font-semibold text-muted-foreground whitespace-nowrap">{corner}</th>
              {colLabels.map((label, c) => (
                <th key={c} className="border-b border-l border-border px-2 py-2 bg-muted font-bold text-muted-foreground min-w-12 font-mono">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((row, r) => {
              if (hideRow(r)) return null;
              const rs = rowState(r);
              return (
                <tr
                  key={r}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    rs === 'current' && 'bg-state-current/6',
                    rs === 'dim' && 'opacity-30 bg-muted/50',
                  )}
                >
                  <td className={cn('border-t border-border px-2 py-1.5 font-mono text-[11px]', rs === 'current' ? `font-bold ${toneText.current}` : 'text-muted-foreground')}>
                    {rowLabels[r]}
                  </td>
                  {row.map((val, c) => {
                    const state = cellState(r, c);
                    const empty = val === null || (typeof val === 'number' && val >= 1e9);
                    return (
                      <td key={c} className="border-l border-t border-border px-1.5 py-1 transition-all duration-300">
                        <span className={cn(
                          'inline-flex min-w-[36px] justify-center rounded-md px-1.5 py-0.5 font-mono transition-colors duration-300',
                          state === 'idle' && empty && 'text-hint',
                          CELL_CLASS[state],
                          isDep(r, c) && 'outline-2 outline-dashed outline-offset-1 outline-state-candidate',
                        )}>
                          {format(val, r, c)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

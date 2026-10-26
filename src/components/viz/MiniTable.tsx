import type { ReactNode } from 'react';
import { cn } from '../ui';
import { toneSoft, toneSolid, toneText } from '../ui/tone';
import { NODE_COLORS, type VizState } from './palette';

const CELL_CLASS: Record<VizState, string> = {
  idle: 'text-foreground/80',
  current: `${toneSolid.current} font-bold ring-2 ring-state-current/40`,
  candidate: `${toneSoft.candidate} font-bold ring-2 ring-state-candidate/60`,
  visited: `${toneSoft.visited} font-semibold`,
  path: `${toneSolid.path} font-bold`,
  danger: `${toneSoft.danger} font-bold ring-2 ring-state-danger/50`,
};

interface MiniTableProps {
  rowLabels: ReactNode[];
  colLabels: ReactNode[];
  /** null = not filled yet (drawn as an empty cell) */
  values: (number | string | null)[][];
  cellState?: (row: number, col: number) => VizState;
  corner?: ReactNode;
  className?: string;
}

/**
 * A tiny DP table for concept storyboards: same state colors as the real DP grids,
 * small enough to sit in a 240px frame.
 */
export function MiniTable({ rowLabels, colLabels, values, cellState = () => 'idle', corner, className }: MiniTableProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      <table className="text-xs sm:text-sm text-center border-collapse font-mono">
        <thead>
          <tr className="bg-muted text-muted-foreground">
            <th className="px-2 py-1 font-semibold text-[11px] whitespace-nowrap">{corner}</th>
            {colLabels.map((l, c) => <th key={c} className="px-1 py-1 font-bold border-l border-border min-w-8 sm:min-w-10">{l}</th>)}
          </tr>
        </thead>
        <tbody>
          {values.map((row, r) => (
            <tr key={r} className="border-t border-border">
              <td className="px-2 py-0.5 font-bold text-muted-foreground whitespace-nowrap">{rowLabels[r]}</td>
              {row.map((v, c) => (
                <td key={c} className="border-l border-border px-0.5 py-0.5">
                  <span className={cn('inline-flex min-w-7 sm:min-w-8 h-6 items-center justify-center rounded-md px-1 tabular-nums transition-colors', CELL_CLASS[cellState(r, c)])}>
                    {v ?? ''}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface MiniCellsProps {
  values: (number | string | null)[];
  stateOf?: (index: number) => VizState;
  /** Label at the start of the row, e.g. "a" or "dp" */
  label?: ReactNode;
  /** Small text under each cell, e.g. the index */
  under?: (index: number) => ReactNode;
  className?: string;
}

/** One row of value boxes in the same colors as ArrayView, sized for storyboard frames. */
export function MiniCells({ values, stateOf = () => 'idle', label, under, className }: MiniCellsProps) {
  return (
    <div className={cn('flex items-start gap-2', className)}>
      {label !== undefined && <span className={cn('w-10 sm:w-14 pt-2 text-right text-xs font-bold font-mono shrink-0', toneText.neutral)}>{label}</span>}
      <div className="flex gap-1 sm:gap-1.5">
        {values.map((v, i) => {
          const c = NODE_COLORS[stateOf(i)];
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-sm sm:text-base tabular-nums transition-colors"
                style={{ backgroundColor: v === null ? 'transparent' : c.fill, borderColor: v === null ? 'var(--border)' : c.stroke, color: c.text, borderStyle: v === null ? 'dashed' : 'solid' }}
              >
                {v ?? ''}
              </div>
              {under && <span className="text-[11px] font-mono text-hint mt-0.5 h-4">{under(i)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import type { MouseEvent, ReactNode } from 'react';
import { cn } from '../ui';
import type { VizState } from './palette';

export interface GridCellPos {
  r: number;
  c: number;
}

/**
 * Visual state of a grid cell. A bare VizState is the strong (filled) variant; `<state>-soft`
 * is a light tint, e.g. A*'s open set (candidate-soft) and closed set (visited-soft).
 */
export type GridCellState = VizState | `${Exclude<VizState, 'idle'>}-soft`;

const CELL: Record<GridCellState, string> = {
  idle:             'bg-card border-border/60 text-foreground/80',
  current:          'bg-state-current border-state-current text-white ring-2 ring-state-current/50 ring-offset-1 ring-offset-card relative z-20',
  candidate:        'bg-state-candidate border-state-candidate text-foreground relative z-10',
  visited:          'bg-state-visited border-state-visited text-white relative z-10',
  path:             'bg-state-path border-state-path text-white relative z-10',
  danger:           'bg-state-danger border-state-danger text-white relative z-10',
  'current-soft':   'bg-state-current/20 border-state-current/45 text-foreground/80',
  'candidate-soft': 'bg-state-candidate/20 border-state-candidate/45 text-foreground/80',
  'visited-soft':   'bg-state-visited/20 border-state-visited/40 text-foreground/80',
  'path-soft':      'bg-state-path/20 border-state-path/45 text-foreground/80',
  'danger-soft':    'bg-state-danger/20 border-state-danger/45 text-foreground/80',
};

const SOLID_WALL = 'bg-foreground/80 border-foreground/80';
/** Breakable wall with no other state: a darker neutral cell (the hatch is layered on top). */
const HATCHED_WALL_IDLE = 'bg-muted-foreground/30 border-muted-foreground/50 text-foreground';
const MARKER_FILL = {
  start: 'bg-state-visited border-state-visited text-white',
  goal: 'bg-state-danger border-state-danger text-white',
};
const HATCH_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(135deg, color-mix(in oklab, var(--foreground) 28%, transparent) 0 2px, transparent 2px 7px)',
};

const SIZE = {
  md: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10',
  lg: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
};

export interface GridViewProps {
  rows: number;
  cols: number;
  /** Visual state per cell (default: idle) */
  cellState?: (r: number, c: number) => GridCellState;
  /** Wall flag per cell */
  isWall?: (r: number, c: number) => boolean;
  /**
   * `solid` (default): walls are opaque blocks that ignore cell state and text (A*).
   * `hatched`: breakable walls: a striped neutral cell that still shows its state and text (0-1 BFS).
   */
  wallStyle?: 'solid' | 'hatched';
  /** Small text inside a cell (not shown on solid walls) */
  cellText?: (r: number, c: number) => ReactNode;
  start?: GridCellPos | null;
  goal?: GridCellPos | null;
  /**
   * `fill` (default): start/goal cells are filled (visited/danger) with a big S/G and ignore state.
   * `badge`: the cell keeps its state and text; a small S/G tag sits in its corner.
   */
  markerStyle?: 'fill' | 'badge';
  cellSize?: keyof typeof SIZE;
  editable?: boolean;
  onCellMouseDown?: (r: number, c: number, e: MouseEvent) => void;
  onCellMouseEnter?: (r: number, c: number, e: MouseEvent) => void;
  onCellMouseUp?: () => void;
}

const same = (p: GridCellPos | null | undefined, r: number, c: number) => !!p && p.r === r && p.c === c;

/** Generic rectangular grid of cells, shared by grid-based visualizations (A* grid, 0-1 BFS, …). */
export default function GridView({
  rows,
  cols,
  cellState = () => 'idle',
  isWall = () => false,
  wallStyle = 'solid',
  cellText,
  start,
  goal,
  markerStyle = 'fill',
  cellSize = 'md',
  editable,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
}: GridViewProps) {
  const renderCell = (r: number, c: number) => {
    const wall = isWall(r, c);
    const marker = same(start, r, c) ? 'start' : same(goal, r, c) ? 'goal' : null;
    let cls: string;
    let content: ReactNode = null;
    let hatched = false;

    if (wall && wallStyle === 'solid') {
      cls = SOLID_WALL;
    } else if (marker && markerStyle === 'fill') {
      cls = MARKER_FILL[marker];
      content = <span className="font-extrabold text-xs">{marker === 'start' ? 'S' : 'G'}</span>;
    } else {
      const state = cellState(r, c);
      hatched = wall;
      cls = wall && state === 'idle' ? HATCHED_WALL_IDLE : CELL[state];
      if (!wall && state === 'idle' && editable) cls += ' hover:bg-muted';
      content = (
        <>
          {cellText?.(r, c)}
          {marker && (
            <span
              className={cn(
                'absolute top-px left-px px-[3px] rounded-[3px] text-[11px] leading-[13px] font-extrabold',
                marker === 'start' ? 'bg-state-visited text-white' : 'bg-state-danger text-white',
              )}
            >
              {marker === 'start' ? 'S' : 'G'}
            </span>
          )}
        </>
      );
    }

    return (
      <div
        key={`${r}-${c}`}
        onMouseDown={(e) => onCellMouseDown?.(r, c, e)}
        onMouseEnter={(e) => onCellMouseEnter?.(r, c, e)}
        className={cn(
          SIZE[cellSize],
          'border rounded-[3px] flex items-center justify-center transition-colors duration-150',
          (hatched || (marker && markerStyle === 'badge')) && 'relative',
          editable && 'cursor-pointer',
          cls,
        )}
        style={hatched ? HATCH_STYLE : undefined}
      >
        {content}
      </div>
    );
  };

  return (
    <div
      className="inline-block select-none max-w-full overflow-x-auto"
      onMouseLeave={() => onCellMouseUp?.()}
      onMouseUp={onCellMouseUp}
    >
      <div className="grid gap-px bg-border p-1 rounded-xl" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((_, c) => renderCell(r, c)))}
      </div>
    </div>
  );
}

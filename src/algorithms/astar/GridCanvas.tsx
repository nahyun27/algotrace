import { useMemo } from 'react';
import type { GridMap, GridStep, GridPos } from './gridTypes';
import { INF } from './gridTypes';
import { cn } from '../../components/ui';

interface Props {
  map: GridMap;
  step: GridStep;
  showScores: boolean;
  onCellMouseDown?: (r: number, c: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (r: number, c: number, e: React.MouseEvent) => void;
  onCellMouseUp?: () => void;
  editable?: boolean;
}

function posEquals(a: GridPos | null, b: GridPos | null): boolean {
  if (!a || !b) return false;
  return a.r === b.r && a.c === b.c;
}

/** Cell classes, one meaning per color (see conventions): wall neutral, start visited, goal danger,
 *  open set candidate, closed set visited-soft, current cell current, final path path. */
const CELL = {
  wall:     'bg-foreground/80 border-foreground/80',
  start:    'bg-state-visited border-state-visited text-white',
  goal:     'bg-state-danger border-state-danger text-white',
  path:     'bg-state-path border-state-path text-white relative z-10',
  current:  'bg-state-current border-state-current text-white ring-2 ring-state-current/50 ring-offset-1 ring-offset-card relative z-20',
  neighbor: 'bg-state-candidate border-state-candidate text-foreground relative z-10',
  closed:   'bg-state-visited/20 border-state-visited/40 text-foreground/80',
  open:     'bg-state-candidate/20 border-state-candidate/45 text-foreground/80',
  idle:     'bg-card border-border/60 text-foreground/80 hover:bg-muted',
};

export default function GridCanvas({ map, step, showScores, onCellMouseDown, onCellMouseEnter, onCellMouseUp, editable }: Props) {
  const { rows, cols, walls, start, goal } = map;

  const openSet = useMemo(() => new Set(step.openSet.map(p => `${p.r},${p.c}`)), [step.openSet]);
  const closedSet = useMemo(() => new Set(step.closedSet.map(p => `${p.r},${p.c}`)), [step.closedSet]);
  const pathSet = useMemo(() => new Set(step.path.map(p => `${p.r},${p.c}`)), [step.path]);

  const getCellStyle = (r: number, c: number): string => {
    const key = `${r},${c}`;
    if (walls[r][c]) return CELL.wall;
    if (r === start.r && c === start.c) return CELL.start;
    if (r === goal.r && c === goal.c) return CELL.goal;
    if (pathSet.has(key)) return CELL.path;
    if (posEquals(step.currentCell, { r, c })) return CELL.current;
    if (posEquals(step.neighborCell, { r, c })) return CELL.neighbor;
    if (closedSet.has(key)) return CELL.closed;
    if (openSet.has(key)) return CELL.open;
    return CELL.idle;
  };

  const getCellText = (r: number, c: number) => {
    if (walls[r][c]) return null;
    if (r === start.r && c === start.c) return <span className="font-extrabold text-xs">S</span>;
    if (r === goal.r && c === goal.c) return <span className="font-extrabold text-xs">G</span>;
    if (!showScores) return null;
    const gv = step.g[r][c];
    const fv = step.f[r][c];
    if (gv >= INF) return null;
    return (
      <div className="text-[11px] leading-[11px] font-mono font-semibold text-center tracking-tighter pointer-events-none">
        <div>g{gv}</div>
        <div className="opacity-70">f{fv >= INF ? '∞' : fv}</div>
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
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <div
              key={`${r}-${c}`}
              onMouseDown={(e) => onCellMouseDown?.(r, c, e)}
              onMouseEnter={(e) => onCellMouseEnter?.(r, c, e)}
              className={cn(
                'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border rounded-[3px] flex items-center justify-center transition-colors duration-150',
                editable && 'cursor-pointer',
                getCellStyle(r, c),
              )}
            >
              {getCellText(r, c)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

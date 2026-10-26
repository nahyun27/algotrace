import { useMemo } from 'react';
import type { GridMap, GridStep } from './gridTypes';
import { INF } from './gridTypes';
import GridView, { type GridCellState } from '../../components/viz/GridView';

interface Props {
  map: GridMap;
  step: GridStep;
  showScores: boolean;
  onCellMouseDown?: (r: number, c: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (r: number, c: number, e: React.MouseEvent) => void;
  onCellMouseUp?: () => void;
  editable?: boolean;
}

/** A* grid on the shared GridView: open set candidate-soft, closed set visited-soft, current cell current,
 *  examined neighbour candidate, final path path; solid walls, filled S/G markers. */
export default function GridCanvas({ map, step, showScores, onCellMouseDown, onCellMouseEnter, onCellMouseUp, editable }: Props) {
  const { rows, cols, walls, start, goal } = map;

  const openSet = useMemo(() => new Set(step.openSet.map(p => `${p.r},${p.c}`)), [step.openSet]);
  const closedSet = useMemo(() => new Set(step.closedSet.map(p => `${p.r},${p.c}`)), [step.closedSet]);
  const pathSet = useMemo(() => new Set(step.path.map(p => `${p.r},${p.c}`)), [step.path]);

  const cellState = (r: number, c: number): GridCellState => {
    const key = `${r},${c}`;
    if (pathSet.has(key)) return 'path';
    if (step.currentCell && step.currentCell.r === r && step.currentCell.c === c) return 'current';
    if (step.neighborCell && step.neighborCell.r === r && step.neighborCell.c === c) return 'candidate';
    if (closedSet.has(key)) return 'visited-soft';
    if (openSet.has(key)) return 'candidate-soft';
    return 'idle';
  };

  const cellText = (r: number, c: number) => {
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
    <GridView
      rows={rows}
      cols={cols}
      isWall={(r, c) => walls[r][c]}
      cellState={cellState}
      cellText={cellText}
      start={start}
      goal={goal}
      editable={editable}
      onCellMouseDown={onCellMouseDown}
      onCellMouseEnter={onCellMouseEnter}
      onCellMouseUp={onCellMouseUp}
    />
  );
}

import { cn } from '../../components/ui';
import GridView, { type GridCellState } from '../../components/viz/GridView';
import Legend from '../../components/viz/Legend';
import { useTr } from '../../i18n';
import type { SudokuStep } from './types';

/** Sudoku board: givens bold, the tried digit blue, accepted digits green, conflicts red, erased digits amber. */
export function SudokuBoard({ step, puzzle }: { step: SudokuStep; puzzle: number[][] }) {
  const tr = useTr();
  const n = puzzle.length;
  const b = Math.round(Math.sqrt(n));
  const at = (cell: [number, number] | null, r: number, c: number) => !!cell && cell[0] === r && cell[1] === c;
  const inUnit = (r: number, c: number) => {
    if (step.type !== 'INVALID' || !step.cell) return false;
    const [cr, cc] = step.cell;
    if (step.conflictKind === 'row') return r === cr;
    if (step.conflictKind === 'col') return c === cc;
    return Math.floor(r / b) === Math.floor(cr / b) && Math.floor(c / b) === Math.floor(cc / b);
  };

  const cellState = (r: number, c: number): GridCellState => {
    const given = puzzle[r][c] !== 0;
    if (step.type === 'DONE' && !step.solved && (at(step.cell, r, c) || at(step.conflict, r, c))) return 'danger';
    if (step.type === 'INVALID' && at(step.conflict, r, c)) return 'danger';
    if ((step.type === 'TRY' || step.type === 'INVALID') && at(step.cell, r, c)) return 'current';
    if (step.type === 'FILL_OK' && at(step.cell, r, c)) return 'visited';
    if (step.type === 'BACKTRACK' && at(step.cell, r, c)) return 'candidate';
    if (step.type === 'BACKTRACK' && at(step.deadEnd, r, c)) return 'danger-soft';
    if (inUnit(r, c)) return 'danger-soft';
    if (!given && step.board[r][c] !== 0) return step.solved ? 'path' : 'visited-soft';
    return 'idle';
  };

  const big = n <= 4;
  const cellText = (r: number, c: number) => {
    const given = puzzle[r][c] !== 0;
    let v = step.board[r][c];
    let ghost = false;
    if ((step.type === 'TRY' || step.type === 'INVALID' || step.type === 'BACKTRACK') && at(step.cell, r, c)) {
      v = step.digit ?? 0;
      ghost = step.type === 'BACKTRACK';
    }
    if (!v) return null;
    return (
      <span
        className={cn(
          'font-mono pointer-events-none',
          big ? 'text-xl' : 'text-sm sm:text-base',
          given ? 'font-extrabold text-foreground' : 'font-semibold',
          ghost && 'line-through opacity-70',
        )}
      >
        {v}
      </span>
    );
  };

  // Thicker lines between boxes
  const cellClassName = (r: number, c: number) => cn(
    c % b === b - 1 && c < n - 1 && 'border-r-[3px] border-r-foreground/45',
    r % b === b - 1 && r < n - 1 && 'border-b-[3px] border-b-foreground/45',
  ) || undefined;

  return (
    <div className="viz-surface rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-3">
      <GridView rows={n} cols={n} cellState={cellState} cellText={cellText} cellClassName={cellClassName} cellSize={big ? 'lg' : 'md'} />
      <Legend
        items={[
          { state: 'current', label: tr('시도 중인 숫자', 'Digit being tried'), kind: 'cell' },
          { state: 'visited', label: tr('채운 숫자', 'Accepted digit'), kind: 'cell' },
          { state: 'danger', label: tr('충돌', 'Conflict'), kind: 'cell' },
          { state: 'candidate', label: tr('지운 숫자', 'Erased digit'), kind: 'cell' },
          { state: 'path', label: tr('완성', 'Solved'), kind: 'cell' },
        ]}
      />
      <p className="text-xs text-muted-foreground text-center">
        {tr('굵은 숫자는 처음부터 주어진 숫자예요. 빈칸을 위에서 아래, 왼쪽에서 오른쪽 순서로 채워요.',
          'Bold digits are the givens. Blanks are filled top to bottom, left to right.')}
      </p>
    </div>
  );
}

import { useMemo } from 'react';
import { ChevronRight, Crown, Layers, Trophy } from 'lucide-react';
import { Panel, cn } from '../../components/ui';
import { toneSoft } from '../../components/ui/tone';
import GridView, { type GridCellState } from '../../components/viz/GridView';
import Legend from '../../components/viz/Legend';
import { useTr } from '../../i18n';
import { attackedCells, cellsBetween } from './solver';
import type { QueensStep } from './types';

const HATCH_SWATCH = {
  backgroundImage: 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--foreground) 28%, transparent) 0 2px, transparent 2px 5px)',
};

/** Chess board with crowns as queens, attacked squares hatched, and the conflict line in red. */
export function QueensBoard({ step }: { step: QueensStep }) {
  const tr = useTr();
  const n = step.board.length;
  const attacked = useMemo(() => attackedCells(step.board), [step.board]);
  const between = useMemo(
    () => new Set(step.type === 'CONFLICT' && step.cell && step.attacker ? cellsBetween(step.attacker, step.cell).map(([r, c]) => `${r},${c}`) : []),
    [step],
  );
  const solved = step.board.every(c => c >= 0);
  const at = (cell: [number, number] | null, r: number, c: number) => !!cell && cell[0] === r && cell[1] === c;
  const isQueen = (r: number, c: number) => step.board[r] === c;

  const cellState = (r: number, c: number): GridCellState => {
    if (step.type === 'CONFLICT' && (at(step.cell, r, c) || at(step.attacker, r, c))) return 'danger';
    if (between.has(`${r},${c}`)) return 'danger-soft';
    if (isQueen(r, c)) {
      if (solved) return 'path';
      if (step.type === 'PLACE' && at(step.cell, r, c)) return 'current';
      return 'visited';
    }
    if (step.type === 'BACKTRACK' && at(step.cell, r, c)) return 'candidate';
    return 'idle';
  };
  const isWall = (r: number, c: number) => attacked[r][c] && !isQueen(r, c);
  const dark = (r: number, c: number) => (r + c) % 2 === 1;
  const plain = (r: number, c: number) => cellState(r, c) === 'idle' && !isWall(r, c);

  const iconSize = n >= 7 ? 'w-5 h-5' : 'w-6 h-6 sm:w-7 sm:h-7';
  const cellText = (r: number, c: number) => {
    const ghost = (step.type === 'CONFLICT' || step.type === 'BACKTRACK') && at(step.cell, r, c);
    return (
      <>
        {plain(r, c) && dark(r, c) && <span className="absolute inset-0 rounded-[2px] bg-foreground/[0.07] pointer-events-none" />}
        {(isQueen(r, c) || ghost) && (
          <Crown className={cn(iconSize, 'relative pointer-events-none', ghost && 'opacity-60')} strokeWidth={2.4} aria-hidden />
        )}
      </>
    );
  };

  return (
    <div className="viz-surface rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-3">
      <GridView
        rows={n}
        cols={n}
        cellState={cellState}
        isWall={isWall}
        wallStyle="hatched"
        cellText={cellText}
        cellSize={n >= 7 ? 'md' : 'lg'}
        cellClassName={(r, c) => (plain(r, c) && dark(r, c) ? 'relative' : undefined)}
      />
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        <Legend
          items={[
            { state: 'current', label: tr('방금 놓은 퀸', 'Queen just placed'), kind: 'cell' },
            { state: 'visited', label: tr('놓인 퀸', 'Placed queen'), kind: 'cell' },
            { state: 'danger', label: tr('충돌', 'Conflict'), kind: 'cell' },
            { state: 'candidate', label: tr('치운 퀸', 'Removed queen'), kind: 'cell' },
            { state: 'path', label: tr('해', 'Solution'), kind: 'cell' },
          ]}
        />
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className="w-3.5 h-3.5 rounded-[4px] border border-muted-foreground/50 bg-muted-foreground/30" style={HATCH_SWATCH} />
          {tr('공격받는 칸', 'Attacked square')}
        </span>
      </div>
    </div>
  );
}

/** Breadcrumb of the column chosen in every row: the recursion stack. */
export function DepthTrail({ step }: { step: QueensStep }) {
  const tr = useTr();
  const n = step.board.length;
  const depth = step.board.filter(c => c >= 0).length;
  const activeRow = step.cell?.[0] ?? -1;
  const solved = depth === n;
  return (
    <Panel
      title={tr('탐색 깊이', 'Search depth')}
      icon={Layers}
      iconTone="current"
      actions={<span className="font-mono text-xs font-bold text-muted-foreground">{depth} / {n}</span>}
      bodyClassName="px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-1">
        {step.board.map((col, r) => {
          const tone = col >= 0
            ? solved ? 'path' : step.type === 'PLACE' && r === activeRow ? 'current' : 'visited'
            : r === activeRow ? (step.type === 'CONFLICT' ? 'danger' : 'candidate') : 'neutral';
          const label = col >= 0 ? `c${col}` : r === activeRow && step.cell ? `c${step.cell[1]}?` : '·';
          return (
            <span key={r} className="inline-flex items-center gap-1">
              {r > 0 && <ChevronRight className="w-3.5 h-3.5 text-hint" aria-hidden />}
              <span className={cn('inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-xs font-bold', toneSoft[tone], col < 0 && r !== activeRow && 'opacity-60')}>
                <span className="opacity-70">r{r}</span>
                {label}
              </span>
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-hint">
        {tr('재귀 한 단계가 행 하나예요. 각 행에서 고른 열이 쌓이고, 백트래킹하면 오른쪽 끝부터 사라져요.',
          'Each recursion level is one row. The chosen columns stack up, and backtracking pops them from the right.')}
      </p>
    </Panel>
  );
}

/** Mini boards of every solution found so far. */
export function SolutionGallery({ step, capped }: { step: QueensStep; capped: boolean }) {
  const tr = useTr();
  const n = step.board.length;
  const px = n >= 7 ? 5 : 7;
  return (
    <Panel
      title={tr(`찾은 해 ${step.solutions}개`, `${step.solutions} solution${step.solutions === 1 ? '' : 's'} found`)}
      icon={Trophy}
      iconTone="path"
      bodyClassName="px-4 py-3"
    >
      {step.found.length === 0 ? (
        <p className="text-xs text-hint">{tr('아직 찾은 해가 없어요.', 'No solution yet.')}</p>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
          {step.found.map((sol, i) => {
            const latest = i === step.found.length - 1 && step.type === 'SOLUTION';
            return (
              <div key={i} className={cn('flex flex-col items-center gap-1 rounded-lg p-1', latest && 'ring-2 ring-state-path/60')}>
                <div className="grid gap-px bg-border p-px rounded" style={{ gridTemplateColumns: `repeat(${n}, ${px}px)` }}>
                  {Array.from({ length: n * n }, (_, k) => {
                    const r = Math.floor(k / n), c = k % n;
                    return (
                      <span
                        key={k}
                        style={{ width: px, height: px }}
                        className={sol[r] === c ? 'bg-state-path' : (r + c) % 2 ? 'bg-muted' : 'bg-card'}
                      />
                    );
                  })}
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">#{i + 1}</span>
              </div>
            );
          })}
        </div>
      )}
      {capped && (
        <p className="mt-2 text-[11px] text-hint">
          {tr('단계가 너무 많아서 앞부분 이후로는 해를 찾은 순간만 보여 줘요. 개수는 끝까지 정확하게 세요.',
            'There are too many steps, so after the first part only the moments a solution is found are shown. The count stays exact.')}
        </p>
      )}
    </Panel>
  );
}

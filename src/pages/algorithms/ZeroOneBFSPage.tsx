import { useState, useMemo } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, SegmentedControl, cn, type Tone } from '../../components/ui';
import { toneSolid } from '../../components/ui/tone';
import Legend from '../../components/viz/Legend';
import GridView, { type GridCellState } from '../../components/viz/GridView';
import ZeroOneBFSCodeViewer from '../../algorithms/zero-one-bfs/CodeViewer';
import ZeroOneBFSInfoModal from '../../algorithms/zero-one-bfs/InfoModal';
import ZeroOneBFSProblemList from '../../algorithms/zero-one-bfs/ProblemList';
import DequePanel from '../../algorithms/zero-one-bfs/DequePanel';
import { generateZeroOneBFSSteps } from '../../algorithms/zero-one-bfs/solver';
import { DEFAULT_GRID, INF, cloneGrid, type ZeroOneStepType } from '../../algorithms/zero-one-bfs/types';
import { useLang, useTr } from '../../i18n';

const STEP_TONE: Record<ZeroOneStepType, Tone> = {
  INIT: 'neutral',
  POP: 'current',
  PUSH_FRONT: 'candidate',
  PUSH_BACK: 'candidate',
  SKIP: 'neutral',
  DONE: 'path',
};

type SizeKey = 'sample' | 'medium' | 'large';
const SIZES: Record<SizeKey, [number, number]> = { sample: [3, 3], medium: [5, 7], large: [8, 10] };

function randomGrid(rows: number, cols: number): number[][] {
  const g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (Math.random() < 0.45 ? 1 : 0)));
  g[0][0] = 0;
  g[rows - 1][cols - 1] = 0;
  return g;
}

export default function ZeroOneBFSPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [grid, setGrid] = useState<number[][]>(() => cloneGrid(DEFAULT_GRID));
  const [size, setSize] = useState<SizeKey>('sample');
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** Value painted while dragging (set by the first cell toggled), null when not dragging */
  const [paint, setPaint] = useState<number | null>(null);

  const steps = useMemo(() => generateZeroOneBFSSteps(grid, lang), [grid, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const rows = grid.length;
  const cols = grid[0].length;
  const goal = { r: rows - 1, c: cols - 1 };
  const isEndpoint = (r: number, c: number) => (r === 0 && c === 0) || (r === goal.r && c === goal.c);

  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'POP' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [steps],
  );

  /* ── Editing ── */
  const setCell = (r: number, c: number, v: number) => {
    if (isEndpoint(r, c) || grid[r][c] === v) return;
    setGrid(prev => prev.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)));
    pb.reset();
  };
  const handleMouseDown = (r: number, c: number) => {
    if (isEndpoint(r, c)) return;
    const v = grid[r][c] === 1 ? 0 : 1;
    setPaint(v);
    setCell(r, c, v);
  };
  const handleMouseEnter = (r: number, c: number) => {
    if (paint !== null) setCell(r, c, paint);
  };
  const changeSize = (key: SizeKey) => {
    setSize(key);
    setGrid(key === 'sample' ? cloneGrid(DEFAULT_GRID) : randomGrid(...SIZES[key]));
    pb.reset();
  };
  const handleRandom = () => {
    setGrid(randomGrid(...SIZES[size]));
    pb.reset();
  };
  const handleReset = () => {
    setSize('sample');
    setGrid(cloneGrid(DEFAULT_GRID));
    pb.reset();
  };

  /* ── Cell look ── */
  const pathSet = useMemo(() => new Set(step.path.map(p => `${p.r},${p.c}`)), [step.path]);
  const dequeSet = useMemo(() => new Set(step.deque.map(p => `${p.r},${p.c}`)), [step.deque]);
  const brokenOnPath = step.path.filter(p => grid[p.r][p.c] === 1).length;

  const cellState = (r: number, c: number): GridCellState => {
    const key = `${r},${c}`;
    if (pathSet.has(key)) return grid[r][c] === 1 ? 'danger' : 'path';
    if (step.current && step.current.r === r && step.current.c === c) return 'current';
    if (step.neighbor && step.neighbor.r === r && step.neighbor.c === c) return 'candidate';
    if (step.done[r][c]) return 'visited-soft';
    if (dequeSet.has(key)) return 'candidate-soft';
    return 'idle';
  };

  const large = cols <= 5;
  const cellText = (r: number, c: number) => {
    const d = step.dist[r][c];
    return (
      <span className={cn('font-mono font-bold pointer-events-none', large ? 'text-base' : 'text-[11px]', d >= INF && 'opacity-40 font-semibold')}>
        {d >= INF ? '∞' : d}
      </span>
    );
  };

  const swatch = 'w-3.5 h-3.5 rounded-[4px] text-[11px] leading-[14px] text-center font-bold';

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('0-1 BFS 벽 부수기', '0-1 BFS wall breaking')}
            onInfo={() => setIsModalOpen(true)}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={
                <>
                  <Badge tone="visited">{tr('확정', 'Settled')} <span className="font-mono">{step.pops}</span></Badge>
                  {step.answer !== null && (
                    <Badge tone="path">{tr('답', 'Answer')} <span className="font-mono">{step.answer}</span></Badge>
                  )}
                </>
              }
            />

            <div className="flex flex-col p-3 sm:p-5 gap-4">
              <div className="viz-surface rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-3">
                <GridView
                  rows={rows}
                  cols={cols}
                  isWall={(r, c) => grid[r][c] === 1}
                  wallStyle="hatched"
                  cellState={cellState}
                  cellText={cellText}
                  start={{ r: 0, c: 0 }}
                  goal={goal}
                  markerStyle="badge"
                  cellSize={large ? 'lg' : 'md'}
                  editable
                  onCellMouseDown={handleMouseDown}
                  onCellMouseEnter={handleMouseEnter}
                  onCellMouseUp={() => setPaint(null)}
                />
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <Legend
                    items={[
                      { state: 'current',   label: tr('꺼낸 칸', 'Popped cell'), kind: 'cell' },
                      { state: 'candidate', label: tr('덱 안 / 검토 중', 'In deque / examined'), kind: 'cell' },
                      { state: 'visited',   label: tr('확정', 'Settled'), kind: 'cell' },
                      { state: 'path',      label: tr('최종 경로', 'Final path'), kind: 'cell' },
                      { state: 'danger',    label: tr('부순 벽', 'Broken wall'), kind: 'cell' },
                    ]}
                  />
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span
                      className="w-3.5 h-3.5 rounded-[4px] border border-muted-foreground/50 bg-muted-foreground/30"
                      style={{ backgroundImage: 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--foreground) 28%, transparent) 0 2px, transparent 2px 5px)' }}
                    />
                    {tr('벽 (비용 1)', 'Wall (cost 1)')}
                    <span className={cn('ml-2', swatch, toneSolid.visited)}>S</span>{tr('출발', 'Start')}
                    <span className={cn('ml-2', swatch, toneSolid.danger)}>G</span>{tr('목표', 'Goal')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {tr('칸 안의 숫자는 dist(지금까지 부순 벽 수)예요. 칸을 클릭하거나 드래그해 벽을 바꿀 수 있어요.',
                    'Numbers are dist (walls broken so far). Click or drag over cells to toggle walls.')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-center">
                <SegmentedControl
                  id="zero-one-bfs-size"
                  value={size}
                  onChange={changeSize}
                  options={[
                    { value: 'sample', label: tr('3×3 (백준 예제)', '3×3 (BOJ sample)') },
                    { value: 'medium', label: '5×7' },
                    { value: 'large',  label: '8×10' },
                  ]}
                />
                <Button onClick={handleRandom}><Shuffle className="w-3.5 h-3.5" />{tr('랜덤 격자', 'Random grid')}</Button>
                <Button onClick={handleReset}><RotateCcw className="w-3.5 h-3.5" />{tr('초기화', 'Reset')}</Button>
              </div>

              <DequePanel step={step} />

              {step.type === 'DONE' && step.answer !== null && (
                <div className="rounded-2xl border border-state-path/35 bg-state-path/12 px-4 py-3 text-sm">
                  {lang === 'ko' ? (
                    <p>최소 <strong className="font-mono">{step.answer}</strong>개의 벽을 부수면 ({goal.r},{goal.c})에 도착해요. 보라색이 경로, 빨간색이 부순 벽 {brokenOnPath}개예요.</p>
                  ) : (
                    <p>Breaking at least <strong className="font-mono">{step.answer}</strong> walls reaches ({goal.r},{goal.c}). Violet is the path; the {brokenOnPath} red cells are the walls broken on it.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<ZeroOneBFSCodeViewer codeLine={step.codeLine} />}
            problems={<ZeroOneBFSProblemList />}
          />
        }
      />
      <ZeroOneBFSInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

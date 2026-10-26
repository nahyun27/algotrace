import { useState, useMemo, useCallback } from 'react';
import { Shuffle, Eraser } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader, { BackToVisualizationButton, EditGraphButton } from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, Panel, SegmentedControl, cn, type Tone } from '../../components/ui';
import { toneBorder, toneSoft, toneSolid, toneText } from '../../components/ui/tone';
import Legend from '../../components/viz/Legend';
import GraphEditor from '../../components/GraphEditor';
import type { GraphData } from '../../types/graph';
import AStarGraphCanvas from '../../algorithms/astar/GraphCanvas';
import AStarCodeViewer from '../../algorithms/astar/CodeViewer';
import AStarProblemList from '../../algorithms/astar/ProblemList';
import AStarScoreTable from '../../algorithms/astar/ScoreTable';
import AStarInfoModal from '../../algorithms/astar/InfoModal';
import { generateAStarSteps } from '../../algorithms/astar/solver';
import type { AStarStep, AStarStepType } from '../../algorithms/astar/types';
import GridCanvas from '../../algorithms/astar/GridCanvas';
import GridAStarCodeViewer from '../../algorithms/astar/GridCodeViewer';
import GridAStarInfoModal from '../../algorithms/astar/GridInfoModal';
import GridAStarProblemList from '../../algorithms/astar/GridProblemList';
import { generateGridAStarSteps, generateGridDijkstraSteps } from '../../algorithms/astar/solverGrid';
import type { GridStep, GridMap, GridStepType } from '../../algorithms/astar/gridTypes';
import { PRESETS, INF as GRID_INF, cloneWalls, randomMaze } from '../../algorithms/astar/gridTypes';
import { ASTAR_DEFAULT_GRAPH } from '../../types/graph';
import { graphDataToDijkstra } from './graphConvert';
import { useLang, useTr } from '../../i18n';

type PageMode = 'example' | 'editor';
type ViewMode = 'graph' | 'grid';

/* ─────────────── Shared mode switch ─────────────── */

function ModeTabs({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  const tr = useTr();
  return (
    <SegmentedControl
      id="astar-mode"
      value={value}
      onChange={onChange}
      options={[
        { value: 'grid',  label: tr('격자 모드', 'Grid') },
        { value: 'graph', label: tr('그래프 모드', 'Graph') },
      ]}
    />
  );
}

/* ─────────────── Graph mode ─────────────── */

/** Edges on the final path, traced back from the goal through parent[] (only once the goal is reached). */
function computeAStarPathEdges(step: AStarStep, goal: number): [number, number][] {
  if (step.type !== 'DONE' || step.currentProcessingNode !== goal) return [];
  const edges: [number, number][] = [];
  let v = goal;
  const seen = new Set<number>();
  while (step.parent[v] !== -1 && !seen.has(v)) {
    seen.add(v);
    edges.push([step.parent[v], v]);
    v = step.parent[v];
  }
  return edges;
}

const GRAPH_STEP_TONE: Record<AStarStepType, Tone> = {
  INIT: 'neutral',
  DEQUEUE: 'current',
  RELAX: 'candidate',
  CLOSE: 'visited',
  DONE: 'path',
};

function AStarGraphMode({ onTabChange }: { onTabChange: (mode: ViewMode) => void }) {
  const { lang } = useLang();
  const tr = useTr();
  const [mode, setMode] = useState<PageMode>('example');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGraph, setCustomGraph] = useState<ReturnType<typeof graphDataToDijkstra> | null>(null);

  const steps = useMemo(
    () => customGraph
      ? generateAStarSteps(customGraph.edges, customGraph.N, customGraph.nodePositions, lang)
      : generateAStarSteps(undefined, undefined, undefined, lang),
    [customGraph, lang],
  );
  const pb = usePlayback(steps.length);
  const step = steps[pb.index];

  const nodeCount = customGraph?.N ?? ASTAR_DEFAULT_GRAPH.nodes.length;
  const goal = nodeCount - 1;
  // Language-independent: the goal was reached iff the DONE step is processing the goal node
  const goalReached = step.type === 'DONE' && step.currentProcessingNode === goal;

  const shortestEdges = useMemo(() => computeAStarPathEdges(step, goal), [step, goal]);
  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'CLOSE' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [steps],
  );

  const resetPlayback = pb.reset;
  const handleRun = useCallback((data: GraphData): string | null => {
    setCustomGraph(graphDataToDijkstra(data)); // edges + coords, same shape as Dijkstra
    resetPlayback();
    setMode('example');
    return null;
  }, [resetPlayback]);

  const tone: Tone =
    step.type === 'DONE' ? (goalReached ? 'path' : 'danger')
    : step.type === 'RELAX' && !step.isImprovement ? 'neutral'
    : GRAPH_STEP_TONE[step.type];

  const explorePct = Math.min(100, (step.nodesExplored / nodeCount) * 100);

  return (
    <>
      <AlgorithmLayout
        isEditorMode={mode === 'editor'}
        header={
          <AlgorithmHeader
            title={tr('A* 길찾기', 'A* pathfinding')}
            onInfo={() => setIsModalOpen(true)}
            tabs={<ModeTabs value="graph" onChange={onTabChange} />}
            controls={mode === 'editor' && <BackToVisualizationButton onClick={() => setMode('example')} />}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={tone}
              badge={step.type}
              description={step.description}
              aside={<Badge tone="candidate">{tr(`탐색 ${step.nodesExplored}`, `Explored ${step.nodesExplored}`)}</Badge>}
            />
            <div className="relative min-h-[300px] border-b border-border">
              <AStarGraphCanvas
                step={step}
                shortestEdges={shortestEdges}
                customNodes={customGraph?.nodePositions}
                customEdges={customGraph?.edges}
              />
              <EditGraphButton onClick={() => { setMode('editor'); pb.setIsPlaying(false); }} />
            </div>
            <div className="p-3 sm:p-5">
              <AStarScoreTable step={step} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        editor={
          <GraphEditor
            initialData={ASTAR_DEFAULT_GRAPH}
            maxNodes={8}
            algorithmType="astar"
            onRun={handleRun}
            presets={[{ label: tr('A* 예제 (6노드)', 'A* example (6 nodes)'), data: ASTAR_DEFAULT_GRAPH }]}
          />
        }
        rightPanel={
          <RightPanel
            code={<AStarCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} />}
            problems={<AStarProblemList />}
            extraLabel={tr('탐색 효율', 'Efficiency')}
            extra={
              <Panel title={tr('⚡ 탐색 효율 (탐색한 노드 수)', '⚡ Search efficiency (nodes explored)')} bodyClassName="p-4 flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={cn('font-bold', toneText.path)}>A*</span>
                    <span className="text-muted-foreground">
                      {lang === 'ko'
                        ? <>총 {nodeCount}개 중 <b className="font-mono text-foreground">{step.nodesExplored}</b>개 노드 탐색</>
                        : <>explored <b className="font-mono text-foreground">{step.nodesExplored}</b> of {nodeCount} nodes</>}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-state-path h-2 rounded-full transition-all duration-300" style={{ width: `${explorePct}%` }} />
                  </div>
                </div>
                {step.type !== 'DONE' && (
                  <p className="text-xs text-muted-foreground italic">
                    {tr('탐색이 끝나면 최종 탐색 수가 확정돼요.', 'The count becomes final when the search finishes.')}
                  </p>
                )}
                {lang === 'ko' ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">A*는 휴리스틱(h) 덕분에 목적지 방향을 우선 탐색합니다. 주변의 모든 노드를 퍼져나가듯 먼저 탐색하는 다익스트라(탐색 범위 원형)보다 <strong className="text-foreground">탐색 횟수가 훨씬 적습니다.</strong></p>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed">Thanks to the heuristic (h), A* explores toward the goal first. Dijkstra spreads out in a circle over every nearby node, so A* <strong className="text-foreground">explores far fewer nodes.</strong></p>
                )}
              </Panel>
            }
          />
        }
      />
      <AStarInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setMode('example'); pb.reset(true); }}
      />
    </>
  );
}

/* ─────────────── Grid mode ─────────────── */

type GridTool = 'wall' | 'erase' | 'start' | 'goal';
type PresetKey = keyof typeof PRESETS;

const GRID_STEP_TONE: Record<GridStepType, Tone> = {
  INIT: 'neutral',
  DEQUEUE: 'current',
  RELAX: 'candidate',
  CLOSE: 'visited',
  DONE: 'path',
  NO_PATH: 'danger',
};

const fmtScore = (v: number) => (v >= GRID_INF ? '∞' : String(v));

function AStarGridMode({ onTabChange }: { onTabChange: (mode: ViewMode) => void }) {
  const { lang } = useLang();
  const tr = useTr();
  const [map, setMap] = useState<GridMap>(() => ({ ...PRESETS.basic, walls: cloneWalls(PRESETS.basic.walls) }));
  const [tool, setTool] = useState<GridTool>('wall');
  const [showScores, setShowScores] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const steps = useMemo<GridStep[]>(() => generateGridAStarSteps(map, lang), [map, lang]);
  const dijkstraSteps = useMemo<GridStep[]>(
    () => (showCompare ? generateGridDijkstraSteps(map, lang) : []),
    [map, showCompare, lang],
  );
  const pb = usePlayback(steps.length);

  const step = steps[pb.index] ?? steps[0];
  const dijkstraStep = dijkstraSteps[dijkstraSteps.length - 1] ?? null;

  /* ── Edit handlers ── */
  const applyTool = (r: number, c: number) => {
    setMap(prev => {
      const walls = cloneWalls(prev.walls);
      let { start, goal } = prev;
      if (tool === 'wall') {
        if (!(r === start.r && c === start.c) && !(r === goal.r && c === goal.c)) walls[r][c] = true;
      } else if (tool === 'erase') {
        walls[r][c] = false;
      } else if (tool === 'start') {
        if (!walls[r][c] && !(r === goal.r && c === goal.c)) start = { r, c };
      } else if (tool === 'goal') {
        if (!walls[r][c] && !(r === start.r && c === start.c)) goal = { r, c };
      }
      return { ...prev, walls, start, goal };
    });
    pb.reset();
  };

  const handleMouseDown = (r: number, c: number) => {
    setIsDragging(true);
    applyTool(r, c);
  };
  const handleMouseEnter = (r: number, c: number) => {
    if (isDragging && (tool === 'wall' || tool === 'erase')) applyTool(r, c);
  };
  const handleMouseUp = () => setIsDragging(false);

  const loadPreset = (key: PresetKey) => {
    setMap({ ...PRESETS[key], walls: cloneWalls(PRESETS[key].walls) });
    pb.reset();
  };

  const handleRandom = () => {
    setMap(randomMaze(10, 10, 0.28));
    pb.reset();
  };

  const handleReset = () => {
    setMap(prev => ({ ...prev, walls: prev.walls.map(row => row.map(() => false)) }));
    pb.reset();
  };

  const cur = step.currentCell;
  const curG = cur ? step.g[cur.r][cur.c] : GRID_INF;
  const curH = cur ? step.h[cur.r][cur.c] : 0;
  const curF = cur ? step.f[cur.r][cur.c] : GRID_INF;

  const presetLabels: Record<PresetKey, string> = {
    basic: tr('기본', 'Basic'),
    maze: tr('미로', 'Maze'),
    empty: tr('빈 격자', 'Empty'),
  };

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('A* 격자 길찾기', 'A* grid pathfinding')}
            onInfo={() => setIsModalOpen(true)}
            tabs={<ModeTabs value="grid" onChange={onTabChange} />}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={GRID_STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={
                <>
                  <Badge tone="candidate">A* <span className="font-mono">{step.nodesExplored}</span></Badge>
                  {showCompare && dijkstraStep && (
                    <Badge tone="neutral">{tr('다익스트라', 'Dijkstra')} <span className="font-mono">{dijkstraStep.nodesExplored}</span></Badge>
                  )}
                </>
              }
            />

            <div className="flex flex-col p-3 sm:p-5 gap-4">
              {/* Grid canvas */}
              <div className="viz-surface rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-3">
                <GridCanvas
                  map={map}
                  step={step}
                  showScores={showScores}
                  editable
                  onCellMouseDown={handleMouseDown}
                  onCellMouseEnter={handleMouseEnter}
                  onCellMouseUp={handleMouseUp}
                />
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <Legend
                    items={[
                      { state: 'current',   label: tr('현재 셀', 'Current cell'), kind: 'cell' },
                      { state: 'candidate', label: tr('Open Set', 'Open set'), kind: 'cell' },
                      { state: 'visited',   label: tr('Closed Set', 'Closed set'), kind: 'cell' },
                      { state: 'path',      label: tr('최종 경로', 'Final path'), kind: 'cell' },
                    ]}
                  />
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span className="w-3.5 h-3.5 rounded-[4px] bg-foreground/80" />{tr('벽', 'Wall')}
                    <span className={cn('ml-2 w-3.5 h-3.5 rounded-[4px] text-[11px] leading-[14px] text-center font-bold', toneSolid.visited)}>S</span>{tr('출발', 'Start')}
                    <span className={cn('ml-2 w-3.5 h-3.5 rounded-[4px] text-[11px] leading-[14px] text-center font-bold', toneSolid.danger)}>G</span>{tr('목표', 'Goal')}
                  </span>
                </div>
              </div>

              {/* Editor toolbar */}
              <div className="flex flex-wrap gap-2 items-center justify-center">
                <SegmentedControl
                  id="astar-grid-tool"
                  value={tool}
                  onChange={setTool}
                  options={[
                    { value: 'wall',  label: tr('🧱 벽', '🧱 Wall') },
                    { value: 'erase', label: tr('🧽 지우개', '🧽 Erase') },
                    { value: 'start', label: tr('🟢 출발', '🟢 Start') },
                    { value: 'goal',  label: tr('🔴 목표', '🔴 Goal') },
                  ]}
                />
                <div className="flex gap-1.5">
                  <Button onClick={handleReset}><Eraser className="w-3.5 h-3.5" />{tr('초기화', 'Clear walls')}</Button>
                  <Button onClick={handleRandom}><Shuffle className="w-3.5 h-3.5" />{tr('랜덤 미로', 'Random maze')}</Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{tr('예제', 'Presets')}</span>
                  {(Object.keys(PRESETS) as PresetKey[]).map(key => (
                    <Button key={key} variant="ghost" onClick={() => loadPreset(key)}>{presetLabels[key]}</Button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant={showScores ? 'soft' : 'secondary'}
                    aria-pressed={showScores}
                    onClick={() => setShowScores(v => !v)}
                  >
                    {tr('g/f 표시', 'Show g/f')}
                  </Button>
                  <Button
                    variant={showCompare ? 'soft' : 'secondary'}
                    aria-pressed={showCompare}
                    onClick={() => setShowCompare(v => !v)}
                  >
                    {tr('다익스트라 비교', 'Compare with Dijkstra')}
                  </Button>
                </div>
              </div>

              {/* Score + PQ */}
              <div className="grid sm:grid-cols-2 gap-3">
                <Panel title={tr('현재 셀', 'Current cell')} bodyClassName="p-3 min-h-[52px] flex items-center">
                  {cur ? (
                    <div className="font-mono text-sm flex flex-wrap items-center gap-2">
                      <span className="font-bold">({cur.r},{cur.c})</span>
                      <Badge tone="neutral"><span className="font-mono">g={fmtScore(curG)}</span></Badge>
                      <Badge tone="neutral"><span className="font-mono">h={fmtScore(curH)}</span></Badge>
                      <Badge tone="current"><span className="font-mono">f={fmtScore(curF)}</span></Badge>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">{tr('대기 중...', 'Waiting…')}</p>
                  )}
                </Panel>

                <Panel
                  title={tr('우선순위 큐', 'Priority queue')}
                  actions={<span className="text-xs text-muted-foreground">{tr('상위 5개', 'top 5')}</span>}
                  bodyClassName="p-3 min-h-[52px] flex flex-wrap gap-1.5 items-center"
                >
                  {step.openSet.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">{tr('비어 있어요', 'Empty')}</span>
                  ) : step.openSet.slice(0, 5).map((p, i) => (
                    <span
                      key={`${p.r}-${p.c}-${i}`}
                      className={cn(
                        'text-xs font-mono px-2 py-1 rounded-lg border',
                        i === 0 ? `${toneSoft.current} border-state-current/40 font-bold` : 'bg-card border-border text-muted-foreground',
                      )}
                    >
                      f{fmtScore(step.f[p.r][p.c])}·({p.r},{p.c})
                    </span>
                  ))}
                  {step.openSet.length > 5 && (
                    <span className="text-xs text-hint px-1">+{step.openSet.length - 5}</span>
                  )}
                </Panel>
              </div>

              {/* Comparison */}
              {showCompare && dijkstraStep && step.type === 'DONE' && (
                <div className={cn('rounded-2xl border p-3 text-center text-sm font-bold', toneSoft.path, toneBorder.path)}>
                  {tr(
                    `A*: ${step.nodesExplored}개 / 다익스트라: ${dijkstraStep.nodesExplored}개`,
                    `A*: ${step.nodesExplored} cells / Dijkstra: ${dijkstraStep.nodesExplored} cells`,
                  )}
                  {dijkstraStep.nodesExplored > 0 && (
                    <span className={cn('ml-2', toneText.visited)}>
                      {tr(
                        `→ A*가 ${Math.round((1 - step.nodesExplored / dijkstraStep.nodesExplored) * 100)}% 적은 셀 탐색`,
                        `→ A* explored ${Math.round((1 - step.nodesExplored / dijkstraStep.nodesExplored) * 100)}% fewer cells`,
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} />}
        rightPanel={
          <RightPanel
            code={<GridAStarCodeViewer codeLine={step.codeLine} />}
            problems={<GridAStarProblemList />}
          />
        }
      />
      <GridAStarInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

/* ─────────────── A* page (mode switch) ─────────────── */

export default function AStarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  return viewMode === 'graph'
    ? <AStarGraphMode onTabChange={setViewMode} />
    : <AStarGridMode onTabChange={setViewMode} />;
}

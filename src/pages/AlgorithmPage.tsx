import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, ArrowLeft } from 'lucide-react';
import StepController from '../components/algorithm/StepController';
import GraphEditor from '../components/GraphEditor';
import type { GraphData } from '../types/graph';
import { TSP_DEFAULT_GRAPH, DIJKSTRA_DEFAULT_GRAPH } from '../types/graph';

// TSP
import TSPGraphCanvas  from '../algorithms/tsp/GraphCanvas';
import TSPCodeViewer   from '../algorithms/tsp/CodeViewer';
import TSPProblemList  from '../algorithms/tsp/ProblemList';
import TSPDPTable      from '../algorithms/tsp/DPTable';
import TSPInfoModal    from '../algorithms/tsp/TSPInfoModal';
import { generateTSPStepsTopDown }  from '../algorithms/tsp/solverTopDown';
import { generateTSPStepsBottomUp } from '../algorithms/tsp/solverBottomUp';
import type { TSPStep } from '../algorithms/tsp/shared';

// Dijkstra
import DijkstraGraphCanvas from '../algorithms/dijkstra/GraphCanvas';
import DijkstraCodeViewer  from '../algorithms/dijkstra/CodeViewer';
import DijkstraProblemList from '../algorithms/dijkstra/ProblemList';
import DijkstraDistTable   from '../algorithms/dijkstra/DistanceTable';
import DijkstraInfoModal   from '../algorithms/dijkstra/InfoModal';
import { generateDijkstraSteps } from '../algorithms/dijkstra/solver';
import type { DijkstraStep } from '../algorithms/dijkstra/types';

// AStar
import AStarGraphCanvas from '../algorithms/astar/GraphCanvas';
import AStarCodeViewer  from '../algorithms/astar/CodeViewer';
import AStarProblemList from '../algorithms/astar/ProblemList';
import AStarScoreTable  from '../algorithms/astar/ScoreTable';
import AStarInfoModal   from '../algorithms/astar/InfoModal';
import { generateAStarSteps } from '../algorithms/astar/solver';
import type { AStarStep } from '../algorithms/astar/types';
import { ASTAR_DEFAULT_GRAPH } from '../types/graph';


/* ─────────────── helpers ─────────────── */

type PageMode = 'example' | 'editor';

/* ─────────────── TSP Page ─────────────── */

type SolverType = 'topDown' | 'bottomUp';

function graphDataToTSP(data: GraphData): {
  W: number[][];
  N: number;
  nodePositions: { id: number; x: number; y: number }[];
} {
  const sorted = [...data.nodes].sort((a, b) => a.id - b.id);
  const N = sorted.length;
  const idMap = new Map(sorted.map((n, i) => [n.id, i]));
  const W: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (const e of data.edges) {
    const u = idMap.get(e.from)!;
    const v = idMap.get(e.to)!;
    if (u !== undefined && v !== undefined) W[u][v] = e.weight;
  }
  const nodePositions = sorted.map((n, i) => ({ id: i, x: n.x, y: n.y }));
  return { W, N, nodePositions };
}

function TSPPage() {
  const [mode, setMode]                 = useState<PageMode>('example');
  const [solverType, setSolverType]     = useState<SolverType>('topDown');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [customSteps, setCustomSteps]   = useState<TSPStep[] | null>(null);
  const [customGraphMeta, setCustomGraphMeta] = useState<{
    W: number[][];
    nodePositions: { id: number; x: number; y: number }[];
  } | null>(null);

  const defaultSteps = useMemo(
    () => solverType === 'topDown' ? generateTSPStepsTopDown() : generateTSPStepsBottomUp(),
    [solverType],
  );

  const steps = customSteps ?? defaultSteps;
  const customW     = customGraphMeta?.W;
  const customNodes = customGraphMeta?.nodePositions;

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 700);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const step = steps[currentStepIdx];

  const handleRun = useCallback((data: GraphData): string | null => {
    const { W, N, nodePositions } = graphDataToTSP(data);
    const newSteps = solverType === 'topDown'
      ? generateTSPStepsTopDown(W, N)
      : generateTSPStepsBottomUp(W, N);
    setCustomSteps(newSteps);
    setCustomGraphMeta({ W, nodePositions });
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setMode('example');
    return null;
  }, [solverType]);

  const toggleSolver = (type: SolverType) => {
    setSolverType(type);
    setCustomSteps(null);
    setCustomGraphMeta(null);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      <div className="flex-1 border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

        {/* Header */}
        <div className="p-3 lg:p-4 border-b flex justify-between items-center bg-muted/30 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-base lg:text-lg tracking-tight">TSP 비트마스크 DP 시각화</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >TSP란? 💡</button>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'example' ? (
              <div className="flex bg-card p-1 rounded-lg border shadow-sm gap-0.5">
                {(['topDown', 'bottomUp'] as SolverType[]).map(t => (
                  <button key={t}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      solverType === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                    onClick={() => toggleSolver(t)}
                  >{t === 'topDown' ? 'Top-down' : 'Bottom-up'}</button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setMode('example')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border shadow-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft size={14} />
                시각화로 돌아가기
              </button>
            )}
          </div>
        </div>

        {mode === 'example' ? (
          <>
            <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${
              step.description.startsWith('[종료]')
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-900/50'
                : step.isImprovement
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
                  : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            }`}>{step.description}</div>

            <div className="flex-1 flex flex-col xl:flex-row bg-muted/5 divide-y xl:divide-y-0 xl:divide-x divide-border overflow-hidden min-h-0 relative">
              <div className="w-full xl:w-2/5 flex flex-col relative overflow-y-auto group">
                <TSPGraphCanvas
                  currentMask={step.mask} currentCity={step.currentCity}
                  nextCity={step.nextCity} activeEdge={step.activeEdge}
                  customNodes={customNodes} customW={customW}
                />
                <button
                  onClick={() => { setMode('editor'); setIsPlaying(false); }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur border rounded-lg shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-zinc-800 transition-all text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold"
                  title="그래프 직접 만들기"
                >
                  <Edit2 size={14} />
                  <span>직접 만들기</span>
                </button>
              </div>
              <div className="w-full xl:w-3/5 flex-1 p-2 xl:p-4 overflow-hidden relative min-h-[300px]">
                <TSPDPTable dpTable={step.dpTable} currentCity={step.currentCity} currentMask={step.mask} />
              </div>
            </div>

            <StepController
              currentStep={currentStepIdx} totalSteps={steps.length} isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(p => !p)}
              onNext={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.min(steps.length - 1, p + 1)); }}
              onPrev={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.max(0, p - 1)); }}
              onFirst={() => { setIsPlaying(false); setCurrentStepIdx(0); }}
              onLast={() => { setIsPlaying(false); setCurrentStepIdx(steps.length - 1); }}
            />
          </>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <GraphEditor
              initialData={TSP_DEFAULT_GRAPH}
              maxNodes={6}
              algorithmType="tsp"
              onRun={handleRun}
              presets={[
                { label: 'TSP 예제 (4도시)', data: TSP_DEFAULT_GRAPH },
              ]}
            />
          </div>
        )}
      </div>

      <div className="w-full lg:w-[440px] flex flex-col gap-6">
        <TSPCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} solverType={solverType} />
        <TSPProblemList />
      </div>

      <TSPInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); setMode('example'); }} />
    </div>
  );
}

/* ─────────────── Dijkstra Page ─────────────── */

function computeShortestEdges(steps: DijkstraStep[], upTo: number): [number, number][] {
  const prev: Record<number, number> = {};
  for (let i = 0; i <= upTo; i++) {
    const s = steps[i];
    if (s.type === 'RELAX' && s.isImprovement && s.activeEdge) {
      prev[s.activeEdge[1]] = s.activeEdge[0];
    }
  }
  return Object.entries(prev).map(([v, u]) => [Number(u), Number(v)]);
}

function graphDataToDijkstra(data: GraphData): {
  edges: [number, number, number][];
  N: number;
  nodePositions: { id: number; x: number; y: number }[];
} {
  const sorted = [...data.nodes].sort((a, b) => a.id - b.id);
  const N = sorted.length;
  const idMap = new Map(sorted.map((n, i) => [n.id, i]));
  const edges: [number, number, number][] = data.edges
    .map(e => {
      const u = idMap.get(e.from);
      const v = idMap.get(e.to);
      return (u !== undefined && v !== undefined) ? [u, v, e.weight] as [number, number, number] : null;
    })
    .filter((e): e is [number, number, number] => e !== null);
  const nodePositions = sorted.map((n, i) => ({ id: i, x: n.x, y: n.y }));
  return { edges, N, nodePositions };
}

function DijkstraPage() {
  const [mode, setMode]                 = useState<PageMode>('example');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [customSteps, setCustomSteps]   = useState<DijkstraStep[] | null>(null);
  const [customGraphMeta, setCustomGraphMeta] = useState<{
    edges: [number, number, number][];
    nodePositions: { id: number; x: number; y: number }[];
  } | null>(null);

  const defaultSteps = useMemo(() => generateDijkstraSteps(), []);
  const steps = customSteps ?? defaultSteps;

  const customEdges = customGraphMeta?.edges;
  const customNodes = customGraphMeta?.nodePositions;

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 800);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const step = steps[currentStepIdx];
  const shortestEdges = useMemo(
    () => computeShortestEdges(steps, currentStepIdx),
    [steps, currentStepIdx],
  );

  const bannerClass = step.type === 'DONE'
    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-900/50'
    : step.type === 'VISITED'
      ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
      : step.isImprovement
        ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
        : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

  const handleRun = useCallback((data: GraphData): string | null => {
    const { edges, N, nodePositions } = graphDataToDijkstra(data);
    const newSteps = generateDijkstraSteps(edges, N);
    setCustomSteps(newSteps);
    setCustomGraphMeta({ edges, nodePositions });
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setMode('example');
    return null;
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      <div className="flex-1 border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

        {/* Header */}
        <div className="p-3 lg:p-4 border-b flex justify-between items-center bg-muted/30 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-base lg:text-lg tracking-tight">다익스트라 최단경로 시각화</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >다익스트라란? 💡</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {mode === 'example' ? (
              <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
                step.type === 'DEQUEUE' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
                step.type === 'RELAX'   ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700' :
                step.type === 'VISITED' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' :
                step.type === 'DONE'    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' :
                'bg-muted text-muted-foreground border-border'
              }`}>{step.type}</div>
            ) : (
              <button
                onClick={() => setMode('example')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border shadow-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft size={14} />
                시각화로 돌아가기
              </button>
            )}
          </div>
        </div>

        {mode === 'example' ? (
          <>
            <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${bannerClass}`}>
              {step.description}
            </div>

            <div className="flex-1 flex flex-col bg-muted/5 divide-y divide-border overflow-hidden min-h-0 relative">
              <div className="w-full flex flex-col relative overflow-y-auto group border-b" style={{ minHeight: '45%' }}>
                <DijkstraGraphCanvas
                  step={step} shortestEdges={shortestEdges}
                  customNodes={customNodes} customEdges={customEdges}
                />
                <button
                  onClick={() => { setMode('editor'); setIsPlaying(false); }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur border rounded-lg shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-zinc-800 transition-all text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold"
                  title="그래프 직접 만들기"
                >
                  <Edit2 size={14} />
                  <span>직접 만들기</span>
                </button>
              </div>
              <div className="w-full flex-1 p-3 xl:p-5 overflow-auto min-h-[250px]">
                <DijkstraDistTable step={step} />
              </div>
            </div>

            <StepController
              currentStep={currentStepIdx} totalSteps={steps.length} isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(p => !p)}
              onNext={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.min(steps.length - 1, p + 1)); }}
              onPrev={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.max(0, p - 1)); }}
              onFirst={() => { setIsPlaying(false); setCurrentStepIdx(0); }}
              onLast={() => { setIsPlaying(false); setCurrentStepIdx(steps.length - 1); }}
            />
          </>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <GraphEditor
              initialData={DIJKSTRA_DEFAULT_GRAPH}
              maxNodes={8}
              algorithmType="dijkstra"
              onRun={handleRun}
              presets={[
                { label: '다익스트라 예제 (5노드)', data: DIJKSTRA_DEFAULT_GRAPH },
              ]}
            />
          </div>
        )}
      </div>

      <div className="w-full lg:w-[440px] flex flex-col gap-6">
        <DijkstraCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} />
        <DijkstraProblemList />
      </div>

      <DijkstraInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); setMode('example'); }} />
    </div>
  );
}

/* ─────────────── AStar Page ─────────────── */

function computeAStarShortestEdges(steps: AStarStep[], upTo: number): [number, number][] {
  if (steps.length === 0) return [];
  const s = steps[upTo];
  const edges: [number, number][] = [];
  for (let i = 0; i < s.parent.length; i++) {
    if (s.parent[i] !== -1) {
      edges.push([s.parent[i], i]);
    }
  }
  return edges;
}

function AStarPage() {
  const [mode, setMode]                 = useState<PageMode>('example');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [customSteps, setCustomSteps]   = useState<AStarStep[] | null>(null);
  const [customGraphMeta, setCustomGraphMeta] = useState<{
    edges: [number, number, number][];
    nodePositions: { id: number; x: number; y: number }[];
  } | null>(null);

  const defaultSteps = useMemo(() => generateAStarSteps(), []);
  const steps = customSteps ?? defaultSteps;

  const customEdges = customGraphMeta?.edges;
  const customNodes = customGraphMeta?.nodePositions;

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 800);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const step = steps[currentStepIdx];
  const shortestEdges = useMemo(
    () => step.type === 'DONE' ? computeAStarShortestEdges(steps, currentStepIdx) : [],
    [steps, currentStepIdx, step.type],
  );

  const bannerClass = step.type === 'DONE' && step.description.includes('도달했습니다')
    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-100 dark:border-purple-900/50'
    : step.type === 'CLOSE'
      ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
      : step.isImprovement
        ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
        : 'bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 border-blue-100 dark:border-blue-900/30';

  const handleRun = useCallback((data: GraphData): string | null => {
    const { edges, N, nodePositions } = graphDataToDijkstra(data); // Can reuse dijkstra converter as it's just edges + coords
    const newSteps = generateAStarSteps(edges, N, nodePositions);
    setCustomSteps(newSteps);
    setCustomGraphMeta({ edges, nodePositions });
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setMode('example');
    return null;
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      <div className="flex-1 border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

        {/* Header */}
        <div className="p-3 lg:p-4 border-b flex justify-between items-center bg-muted/30 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-base lg:text-lg tracking-tight">A* (A-Star) 길찾기 시각화</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >A*란? 💡</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {mode === 'example' ? (
              <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
                step.type === 'DEQUEUE' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
                step.type === 'RELAX'   ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700' :
                step.type === 'CLOSE'   ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700' :
                step.type === 'DONE'    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700' :
                'bg-muted text-muted-foreground border-border'
              }`}>{step.type}</div>
            ) : (
              <button
                onClick={() => setMode('example')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border shadow-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft size={14} />
                시각화로 돌아가기
              </button>
            )}
          </div>
        </div>

        {mode === 'example' ? (
          <>
            <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${bannerClass}`}>
              {step.description}
            </div>

            <div className="flex-1 flex flex-col bg-muted/5 divide-y divide-border overflow-hidden min-h-0 relative">
              <div className="w-full flex flex-col relative overflow-y-auto group border-b" style={{ minHeight: '45%' }}>
                <AStarGraphCanvas
                  step={step} shortestEdges={shortestEdges}
                  customNodes={customNodes} customEdges={customEdges}
                />
                <button
                  onClick={() => { setMode('editor'); setIsPlaying(false); }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur border rounded-lg shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-zinc-800 transition-all text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold"
                  title="그래프 직접 만들기"
                >
                  <Edit2 size={14} />
                  <span>직접 만들기</span>
                </button>
              </div>
              <div className="w-full flex-1 p-3 xl:p-5 overflow-auto flex flex-col gap-4">
                <AStarScoreTable step={step} />
              </div>
            </div>

            <StepController
              currentStep={currentStepIdx} totalSteps={steps.length} isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(p => !p)}
              onNext={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.min(steps.length - 1, p + 1)); }}
              onPrev={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.max(0, p - 1)); }}
              onFirst={() => { setIsPlaying(false); setCurrentStepIdx(0); }}
              onLast={() => { setIsPlaying(false); setCurrentStepIdx(steps.length - 1); }}
            />
          </>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <GraphEditor
              initialData={ASTAR_DEFAULT_GRAPH}
              maxNodes={8}
              algorithmType="astar"
              onRun={handleRun}
              presets={[
                { label: 'A* 예제 (6노드)', data: ASTAR_DEFAULT_GRAPH },
              ]}
            />
          </div>
        )}
      </div>

      <div className="w-full lg:w-[440px] flex flex-col gap-6">
        <AStarCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} />
        <AStarProblemList />
        
        {/* Stats Panel (A* vs Dijkstra) */}
        {mode === 'example' && step.type === 'DONE' && (
          <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 shadow-sm animate-in fade-in-0 duration-500">
            <h4 className="text-sm font-bold mb-3">⚡ 탐색 효율 (Nodes Explored)</h4>
            <div className="space-y-3 relative">
              {/* AStar bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">A* Algorithm</span>
                  <span>총 {step.nodesExplored} 개 노드 탐색</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (step.nodesExplored / (customNodes?.length || ASTAR_DEFAULT_GRAPH.nodes.length)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              A*는 휴리스틱(h) 덕분에 목적지 방향을 우선 탐색합니다. 주변의 모든 노드를 퍼져나가듯 먼저 탐색하는 다익스트라(탐색 범위 원형)보다 <strong>탐색 횟수가 훨씬 적습니다.</strong>
            </p>
          </div>
        )}
      </div>

      <AStarInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); setMode('example'); }} />
    </div>
  );
}

/* ─────────────── Router ─────────────── */
export default function AlgorithmPage() {
  const { slug } = useParams();
  if (slug === 'tsp')      return <TSPPage />;
  if (slug === 'dijkstra') return <DijkstraPage />;
  if (slug === 'astar')    return <AStarPage />;
  return <div className="p-8 text-center text-muted-foreground">알고리즘을 찾을 수 없습니다.</div>;
}

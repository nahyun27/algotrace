import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, ArrowLeft } from 'lucide-react';
import StepController from '../components/algorithm/StepController';
import RightPanel from '../components/algorithm/RightPanel';
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

// BFS/DFS
import BFSDFSGraphCanvas from '../algorithms/bfsdfs/GraphCanvas';
import BFSDFSCodeViewer from '../algorithms/bfsdfs/CodeViewer';
import BFSDFSProblemList from '../algorithms/bfsdfs/ProblemList';
import QueueStackDisplay from '../algorithms/bfsdfs/QueueStackDisplay';
import VisitOrderDisplay from '../algorithms/bfsdfs/VisitOrderDisplay';
import BFSDFSInfoModal from '../algorithms/bfsdfs/InfoModal';
import { generateBFSSteps } from '../algorithms/bfsdfs/solverBFS';
import { generateDFSSteps } from '../algorithms/bfsdfs/solverDFS';
import { BFS_DFS_DEFAULT_GRAPH } from '../algorithms/bfsdfs/types';
import type { BaseStep, DataItem } from '../algorithms/bfsdfs/types';

// Bellman-Ford
import BFGraphCanvas   from '../algorithms/bellmanford/GraphCanvas';
import BFCodeViewer    from '../algorithms/bellmanford/CodeViewer';
import BFProblemList   from '../algorithms/bellmanford/ProblemList';
import BFDistanceTable from '../algorithms/bellmanford/DistanceTable';
import BFExtraInfo     from '../algorithms/bellmanford/ExtraInfo';
import BFInfoModal     from '../algorithms/bellmanford/InfoModal';
import { generateBellmanFordSteps } from '../algorithms/bellmanford/solver';
import {
  EXAMPLE1_N, EXAMPLE1_EDGES, EXAMPLE1_NODES,
  EXAMPLE2_N, EXAMPLE2_EDGES, EXAMPLE2_NODES,
} from '../algorithms/bellmanford/types';
import type { BellmanFordStep } from '../algorithms/bellmanford/types';

// Floyd-Warshall
import FWGraphCanvas  from '../algorithms/floydwarshall/GraphCanvas';
import FWCodeViewer   from '../algorithms/floydwarshall/CodeViewer';
import FWProblemList  from '../algorithms/floydwarshall/ProblemList';
import FWDistMatrix   from '../algorithms/floydwarshall/DistMatrix';
import FWInfoModal    from '../algorithms/floydwarshall/InfoModal';
import { generateFloydWarshallSteps, reconstructPath } from '../algorithms/floydwarshall/solver';
import { FW_N } from '../algorithms/floydwarshall/types';
import type { FloydWarshallStep } from '../algorithms/floydwarshall/types';

// Kruskal
import KruskalGraphCanvas  from '../algorithms/kruskal/GraphCanvas';
import KruskalCodeViewer   from '../algorithms/kruskal/CodeViewer';
import KruskalProblemList  from '../algorithms/kruskal/ProblemList';
import UnionFindDisplay    from '../algorithms/kruskal/UnionFindDisplay';
import KruskalEdgeList     from '../algorithms/kruskal/EdgeList';
import KruskalInfoModal    from '../algorithms/kruskal/InfoModal';
import { generateKruskalSteps } from '../algorithms/kruskal/solver';
import { KRUSKAL_N, KRUSKAL_NODES, KRUSKAL_EDGES } from '../algorithms/kruskal/types';
import type { KruskalStep } from '../algorithms/kruskal/types';
import PrimGraphCanvas  from '../algorithms/prim/GraphCanvas';
import PrimCodeViewer   from '../algorithms/prim/CodeViewer';
import PrimProblemList  from '../algorithms/prim/ProblemList';
import PrimKeyTable     from '../algorithms/prim/KeyTable';
import PrimInfoModal    from '../algorithms/prim/InfoModal';
import { generatePrimSteps } from '../algorithms/prim/solver';
import type { PrimStep } from '../algorithms/prim/types';

// Topological Sort
import TopoGraphCanvas   from '../algorithms/topological/GraphCanvas';
import TopoCodeViewer    from '../algorithms/topological/CodeViewer';
import TopoProblemList   from '../algorithms/topological/ProblemList';
import InDegreeDisplay   from '../algorithms/topological/InDegreeDisplay';
import ResultOrder       from '../algorithms/topological/ResultOrder';
import TopoInfoModal     from '../algorithms/topological/InfoModal';
import { generateKahnSteps }    from '../algorithms/topological/solverKahn';
import { generateDFSTopoSteps } from '../algorithms/topological/solverDFS';
import {
  TOPO_N, TOPO_NODES, TOPO_EDGES,
  CYCLE_N, CYCLE_NODES, CYCLE_EDGES,
} from '../algorithms/topological/types';
import type { KahnStep, DFSTopoStep } from '../algorithms/topological/types';

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
      <div className="flex-1 min-w-[600px] border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

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
                  : 'bg-zinc-100 dark:bg-accent/50 text-zinc-700 dark:text-muted-foreground border-zinc-200 dark:border-accent'
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

      <RightPanel>
        <TSPCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} solverType={solverType} />
        <TSPProblemList />
      </RightPanel>

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
        : 'bg-zinc-100 dark:bg-accent/50 text-zinc-700 dark:text-muted-foreground border-zinc-200 dark:border-accent';

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
      <div className="flex-1 min-w-[600px] border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

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
              <div className="w-full flex-1 flex flex-col relative overflow-y-auto group border-b">
                <DijkstraGraphCanvas
                  step={step} shortestEdges={shortestEdges}
                  customNodes={customNodes} customEdges={customEdges}
                />
                <button
                  onClick={() => { setMode('editor'); setIsPlaying(false); }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-accent/80 backdrop-blur border rounded-lg shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-accent transition-all text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold"
                  title="그래프 직접 만들기"
                >
                  <Edit2 size={14} />
                  <span>직접 만들기</span>
                </button>
              </div>
              <div className="w-full p-3 xl:p-5 overflow-auto">
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

      <RightPanel>
        <DijkstraCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} />
        <DijkstraProblemList />
      </RightPanel>

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
      ? 'bg-zinc-100 dark:bg-accent/50 text-zinc-700 dark:text-muted-foreground border-zinc-200 dark:border-accent'
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
      <div className="flex-1 min-w-[600px] border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

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
                step.type === 'CLOSE'   ? 'bg-zinc-200 dark:bg-accent text-zinc-700 dark:text-muted-foreground border-zinc-300 dark:border-accent' :
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
              <div className="w-full flex-1 flex flex-col relative overflow-y-auto group border-b">
                <AStarGraphCanvas
                  step={step} shortestEdges={shortestEdges}
                  customNodes={customNodes} customEdges={customEdges}
                />
                <button
                  onClick={() => { setMode('editor'); setIsPlaying(false); }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-accent/80 backdrop-blur border rounded-lg shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-accent transition-all text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold"
                  title="그래프 직접 만들기"
                >
                  <Edit2 size={14} />
                  <span>직접 만들기</span>
                </button>
              </div>
              <div className="w-full p-3 xl:p-5 overflow-auto flex flex-col gap-4">
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

      <RightPanel>
        <AStarCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} />
        <AStarProblemList />
        
        {/* Stats Panel (A* vs Dijkstra) */}
        {mode === 'example' && step.type === 'DONE' && (
          <div className="bg-white dark:bg-card border rounded-xl p-4 shadow-sm animate-in fade-in-0 duration-500">
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
      </RightPanel>

      <AStarInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); setMode('example'); }} />
    </div>
  );
}

/* ─────────────── BFS/DFS Page ─────────────── */

type BFSDFSMode = 'BFS' | 'DFS';

function graphDataToBFSDFS(data: GraphData): {
  edges: [number, number, number][];
  N: number;
} {
  const sorted = [...data.nodes].sort((a, b) => a.id - b.id);
  const N = sorted.length;
  const idMap = new Map(sorted.map((n, i) => [n.id, i]));
  const edges: [number, number, number][] = data.edges.map(e => [
    idMap.get(e.from)!, idMap.get(e.to)!, e.weight
  ]);
  return { edges, N };
}

function BFSDFSPage() {
  const [algoMode, setAlgoMode] = useState<BFSDFSMode>('BFS');
  const [mode, setMode] = useState<PageMode>('example');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customSteps, setCustomSteps] = useState<BaseStep[] | null>(null);
  const [customN, setCustomN] = useState<number | null>(null);

  const defaultSteps = useMemo(() => {
    return algoMode === 'BFS' ? generateBFSSteps() : generateDFSSteps();
  }, [algoMode]);

  const steps = customSteps ?? defaultSteps;
  const numNodes = customN ?? BFS_DFS_DEFAULT_GRAPH.nodes.length;

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), Math.max(300, 700 - steps.length * 3));
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const step = steps[currentStepIdx] || steps[0];

  const handleRun = useCallback((data: GraphData): string | null => {
    const { edges, N } = graphDataToBFSDFS(data);
    const newSteps = algoMode === 'BFS' ? generateBFSSteps(edges, N) : generateDFSSteps(edges, N);
    setCustomSteps(newSteps);
    setCustomN(N);
    setCurrentStepIdx(0);
    setIsPlaying(true);
    setMode('example');
    return null;
  }, [algoMode]);

  const handleAlgorithmChange = (newMode: BFSDFSMode) => {
    setAlgoMode(newMode);
    setCustomSteps(null);
    setCustomN(null);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const bannerClass = step.type === 'INIT' ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
    : step.type === 'DONE' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    : step.isImprovement ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
    : 'bg-muted text-muted-foreground';

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-[600px] flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden min-h-[600px] lg:h-[calc(100vh-140px)]">
        
        {/* Header Tabs */}
        <div className="flex border-b bg-muted/20 px-4 py-2 gap-4">
          <button
            onClick={() => handleAlgorithmChange('BFS')}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${algoMode === 'BFS' ? 'bg-white dark:bg-zinc-800 shadow-sm text-sky-600 dark:text-sky-400' : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'}`}
          >
            너비 우선 탐색 (BFS)
          </button>
          <button
            onClick={() => handleAlgorithmChange('DFS')}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${algoMode === 'DFS' ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'}`}
          >
            깊이 우선 탐색 (DFS)
          </button>
        </div>

        <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-zinc-900 shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2">
              {algoMode === 'BFS' ? '너비 우선 탐색 (BFS)' : '깊이 우선 탐색 (DFS)'}
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {algoMode === 'BFS' ? '큐(Queue)를 이용하여 가장 가까운 주변 노드부터 차례대로 탐색합니다.' : '스택(Stack)을 이용하여 연결된 한 갈래를 끝까지 깊게 탐색합니다.'}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 text-sm font-semibold border rounded-md hover:bg-muted transition-colors text-zinc-700 dark:text-muted-foreground whitespace-nowrap"
          >
            {algoMode} 란?
          </button>
        </div>

        {mode === 'example' ? (
          <>
            <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${bannerClass}`}>
              {step.description}
            </div>

            <div className="flex-1 flex flex-col bg-muted/5 divide-y divide-border overflow-hidden min-h-0 relative">
              {algoMode === 'BFS' ? (
                <>
                  {/* BFS Layout: Classical 50/50 split */}
                  <div className="w-full h-[55%] flex flex-col相对 relative overflow-y-auto group border-b">
                    <BFSDFSGraphCanvas step={step} mode={algoMode} />
                    <button
                      onClick={() => { setMode('editor'); setIsPlaying(false); }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-accent/80 backdrop-blur border rounded-lg shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-accent transition-all text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold"
                      title="그래프 직접 만들기"
                    >
                      <Edit2 size={14} />
                      <span>직접 만들기</span>
                    </button>
                  </div>
                  <div className="w-full h-[45%] p-3 flex flex-row gap-4 overflow-auto">
                    <div className="flex-1 min-w-[300px]">
                      <QueueStackDisplay step={step} mode={algoMode} />
                    </div>
                    <div className="flex-1 min-w-[300px]">
                      <VisitOrderDisplay step={step} totalNodes={numNodes} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* DFS Layout: Stack on the Right for more height */}
                  <div className="flex-1 flex flex-row min-h-0 divide-x divide-border">
                    <div className="flex-1 flex flex-col relative overflow-y-auto group h-full">
                      <BFSDFSGraphCanvas step={step} mode={algoMode} />
                      <button
                        onClick={() => { setMode('editor'); setIsPlaying(false); }}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-accent/80 backdrop-blur border rounded-lg shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-accent transition-all text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold"
                        title="그래프 직접 만들기"
                      >
                        <Edit2 size={14} />
                        <span>직접 만들기</span>
                      </button>
                    </div>
                    <div className="w-[320px] h-full p-3 overflow-y-auto bg-card/30">
                      <QueueStackDisplay step={step} mode={algoMode} />
                    </div>
                  </div>
                  <div className="h-[130px] p-3 bg-card/10 border-t shrink-0">
                    <VisitOrderDisplay step={step} totalNodes={numNodes} />
                  </div>
                </>
              )}
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
              initialData={BFS_DFS_DEFAULT_GRAPH}
              maxNodes={10}
              algorithmType="bfsdfs"
              onRun={handleRun}
              presets={[
                { label: '트리 예제 (7노드)', data: BFS_DFS_DEFAULT_GRAPH },
              ]}
            />
          </div>
        )}
      </div>

      <RightPanel>
        <BFSDFSCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} mode={algoMode} />
        <BFSDFSProblemList />
      </RightPanel>

      <BFSDFSInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode={algoMode} />
    </div>
  );
}

/* ─────────────── Bellman-Ford Page ─────────────── */

type BFExample = 'ex1' | 'ex2';

function BellmanFordPage() {
  const [example, setExample] = useState<BFExample>('ex1');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { nodes, edges, N } = example === 'ex1'
    ? { nodes: EXAMPLE1_NODES, edges: EXAMPLE1_EDGES, N: EXAMPLE1_N }
    : { nodes: EXAMPLE2_NODES, edges: EXAMPLE2_EDGES, N: EXAMPLE2_N };

  const steps = useMemo<BellmanFordStep[]>(
    () => generateBellmanFordSteps(edges, N),
    [example], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const step = steps[currentStepIdx] ?? steps[0];

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 700);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const handleExampleChange = (ex: BFExample) => {
    setExample(ex);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const bannerClass =
    step.type === 'NEGATIVE_CYCLE'
      ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-100 dark:border-red-900/50'
      : step.type === 'DONE'
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-900/50'
        : step.isImprovement
          ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
          : 'bg-zinc-100 dark:bg-accent/50 text-zinc-700 dark:text-muted-foreground border-zinc-200 dark:border-accent';

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      <div className="flex-1 min-w-[600px] border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

        {/* Header */}
        <div className="p-3 lg:p-4 border-b flex justify-between items-center bg-muted/30 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold text-base lg:text-lg tracking-tight">벨만-포드 최단경로 시각화</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >벨만-포드란? 💡</button>
            {/* Example tabs */}
            <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
              {(['ex1', 'ex2'] as BFExample[]).map(ex => (
                <button
                  key={ex}
                  onClick={() => handleExampleChange(ex)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    example === ex
                      ? 'bg-white dark:bg-accent shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >{ex === 'ex1' ? '기본 예제 (음수 간선)' : '음수 사이클 예제'}</button>
              ))}
            </div>
          </div>
          <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
            step.type === 'NEGATIVE_CYCLE' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' :
            step.type === 'RELAX'   ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700' :
            step.type === 'DONE'    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' :
            step.type === 'ROUND_START' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
            'bg-muted text-muted-foreground border-border'
          }`}>{step.type}</div>
        </div>

        {/* Banner */}
        <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${bannerClass}`}>
          {step.description}
        </div>

        <div className="flex-1 flex flex-col bg-muted/5 divide-y divide-border overflow-hidden min-h-0 relative">
          <div className="w-full flex-1 flex flex-col relative overflow-y-auto group border-b">
            <BFGraphCanvas step={step} nodes={nodes} edges={edges} />
          </div>
          <div className="w-full p-3 xl:p-5 overflow-auto">
            <BFDistanceTable step={step} />
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
      </div>

      <RightPanel>
        <BFCodeViewer codeLine={step.codeLine} />
        <BFProblemList />
        <BFExtraInfo step={step} />
      </RightPanel>

      <BFInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); }}
      />
    </div>
  );
}

/* ─────────────── Floyd-Warshall Page ─────────────── */

function FloydWarshallPage() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pathFrom, setPathFrom] = useState<number>(0);
  const [pathTo, setPathTo] = useState<number>(FW_N - 1);
  const [showPath, setShowPath] = useState(false);

  const steps = useMemo<FloydWarshallStep[]>(() => generateFloydWarshallSteps(), []);
  const step = steps[currentStepIdx] ?? steps[0];
  const isDone = step.type === 'DONE';

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 700);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const pathNodes = useMemo(() => {
    if (!showPath || !isDone) return [];
    return reconstructPath(step.nextMatrix, pathFrom, pathTo);
  }, [showPath, isDone, step.nextMatrix, pathFrom, pathTo]);

  const bannerClass =
    step.type === 'NEGATIVE_CYCLE'
      ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-100 dark:border-red-900/50'
      : step.type === 'DONE'
        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-100 dark:border-emerald-900/50'
        : step.isUpdate
          ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-100 dark:border-yellow-900/50'
          : 'bg-zinc-100 dark:bg-accent/50 text-zinc-700 dark:text-muted-foreground border-zinc-200 dark:border-accent';

  const nodeOptions = Array.from({ length: FW_N }, (_, i) => i);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      <div className="flex-1 min-w-[600px] border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

        {/* Header */}
        <div className="p-3 lg:p-4 border-b flex justify-between items-center bg-muted/30 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold text-base lg:text-lg tracking-tight">플로이드-워셜 최단경로 시각화</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
            >플로이드-워셜이란? 💡</button>
          </div>
          <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
            step.type === 'NEGATIVE_CYCLE' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' :
            step.type === 'DONE'           ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
            step.type === 'UPDATE'         ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' :
            step.type === 'ROUND_START'    ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700' :
            'bg-muted text-muted-foreground border-border'
          }`}>{step.type}</div>
        </div>

        {/* Banner */}
        <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${bannerClass}`}>
          {step.description}
        </div>

        {/* Path reconstruction controls (shown only when done) */}
        {isDone && (
          <div className="px-4 py-2.5 border-b bg-violet-50/50 dark:bg-violet-900/10 flex items-center gap-3 flex-wrap text-sm">
            <span className="font-semibold text-violet-700 dark:text-violet-400 text-xs">경로 탐색:</span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">출발</label>
              <select
                value={pathFrom}
                onChange={e => { setPathFrom(Number(e.target.value)); setShowPath(false); }}
                className="text-xs border rounded px-2 py-1 bg-card text-foreground"
              >
                {nodeOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">도착</label>
              <select
                value={pathTo}
                onChange={e => { setPathTo(Number(e.target.value)); setShowPath(false); }}
                className="text-xs border rounded px-2 py-1 bg-card text-foreground"
              >
                {nodeOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button
              onClick={() => setShowPath(p => !p)}
              disabled={pathFrom === pathTo}
              className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors disabled:opacity-40 ${
                showPath
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-card border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30'
              }`}
            >
              {showPath ? '경로 숨기기' : '경로 보기'}
            </button>
            {showPath && pathNodes.length > 0 && (
              <span className="text-xs font-mono text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 px-2 py-1 rounded">
                {pathNodes.join(' → ')}
                {' '}(거리: {step.distMatrix[pathFrom]?.[pathTo] >= 1e9 ? '∞' : step.distMatrix[pathFrom]?.[pathTo]})
              </span>
            )}
            {showPath && pathNodes.length === 0 && (
              <span className="text-xs text-red-500">경로 없음</span>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col bg-muted/5 divide-y divide-border overflow-hidden min-h-0 relative">
          {/* Graph canvas - top */}
          <div className="w-full flex-1 flex flex-col relative overflow-y-auto group border-b min-h-[260px]">
            <FWGraphCanvas step={step} pathNodes={pathNodes} />
          </div>
          {/* Distance matrix - bottom, full width */}
          <div className="w-full p-3 xl:p-5 overflow-auto">
            <FWDistMatrix step={step} />
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
      </div>

      <RightPanel>
        <FWCodeViewer codeLine={step.codeLine} />
        <FWProblemList />
      </RightPanel>

      <FWInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); }}
      />
    </div>
  );
}

/* ─────────────── Topological Sort Page ─────────────── */

type TopoAlgoMode = 'Kahn' | 'DFS';
type TopoExample  = 'dag'  | 'cycle';

function TopologicalPage() {
  const [algoMode, setAlgoMode]         = useState<TopoAlgoMode>('Kahn');
  const [example, setExample]           = useState<TopoExample>('dag');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isModalOpen, setIsModalOpen]   = useState(false);

  const { nodes, edges, N } = example === 'dag'
    ? { nodes: TOPO_NODES,  edges: TOPO_EDGES,  N: TOPO_N  }
    : { nodes: CYCLE_NODES, edges: CYCLE_EDGES, N: CYCLE_N };

  const steps = useMemo<(KahnStep | DFSTopoStep)[]>(() => {
    return algoMode === 'Kahn'
      ? generateKahnSteps(nodes, edges, N)
      : generateDFSTopoSteps(nodes, edges, N);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algoMode, example]);

  const step = (steps[currentStepIdx] ?? steps[0]) as KahnStep & DFSTopoStep;

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 700);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const handleAlgoChange = (mode: TopoAlgoMode) => {
    setAlgoMode(mode);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const handleExampleChange = (ex: TopoExample) => {
    setExample(ex);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const stepType = step.type as string;
  const bannerClass =
    step.hasCycle
      ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-100 dark:border-red-900/50'
      : stepType === 'DONE'
        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-100 dark:border-emerald-900/50'
        : stepType === 'DEQUEUE' || stepType === 'VISIT'
          ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 border-blue-100 dark:border-blue-900/30'
          : 'bg-zinc-100 dark:bg-accent/50 text-zinc-700 dark:text-muted-foreground border-zinc-200 dark:border-accent';

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      <div className="flex-1 min-w-[600px] flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden min-h-[650px] lg:h-[calc(100vh-140px)]">

        {/* Algorithm Tabs */}
        <div className="flex border-b bg-muted/20 px-4 py-2 gap-4">
          <button
            onClick={() => handleAlgoChange('Kahn')}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${algoMode === 'Kahn' ? 'bg-white dark:bg-zinc-800 shadow-sm text-violet-600 dark:text-violet-400' : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'}`}
          >
            칸의 알고리즘 (Kahn)
          </button>
          <button
            onClick={() => handleAlgoChange('DFS')}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${algoMode === 'DFS' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'}`}
          >
            DFS 방식
          </button>
        </div>

        {/* Header */}
        <div className="p-3 lg:p-4 border-b flex justify-between items-center bg-muted/30 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold text-base lg:text-lg tracking-tight">
              위상정렬 시각화 — {algoMode === 'Kahn' ? '칸의 알고리즘' : 'DFS 방식'}
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
            >위상정렬이란? 💡</button>
            {/* Example tabs */}
            <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
              {(['dag', 'cycle'] as TopoExample[]).map(ex => (
                <button
                  key={ex}
                  onClick={() => handleExampleChange(ex)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    example === ex
                      ? 'bg-white dark:bg-accent shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >{ex === 'dag' ? '수강신청 예제 (DAG)' : '사이클 예제'}</button>
              ))}
            </div>
          </div>
          <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
            stepType === 'CYCLE_DETECTED' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' :
            stepType === 'DONE'    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
            stepType === 'DEQUEUE' || stepType === 'VISIT' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
            stepType === 'DECREASE' || stepType === 'FINISH' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' :
            'bg-muted text-muted-foreground border-border'
          }`}>{stepType}</div>
        </div>

        {/* Banner */}
        <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${bannerClass}`}>
          {step.description}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col bg-muted/5 divide-y divide-border overflow-hidden min-h-0 relative">
          {algoMode === 'Kahn' ? (
            <>
              <div className="w-full flex-1 flex flex-col relative overflow-hidden border-b">
                <TopoGraphCanvas step={step} mode={algoMode} nodes={nodes} edges={edges} />
              </div>
              <div className="w-full p-3 xl:p-4 overflow-auto">
                <InDegreeDisplay step={step as KahnStep} nodes={nodes} />
              </div>
            </>
          ) : (
            <>
              {/* DFS: 그래프(좌) + 스택(우) 나란히 */}
              <div className="flex-1 flex flex-row min-h-0 divide-x divide-border">
                <div className="flex-1 flex flex-col relative overflow-hidden">
                  <TopoGraphCanvas step={step} mode={algoMode} nodes={nodes} edges={edges} />
                </div>
                <div className="w-[310px] h-full p-3 overflow-y-auto bg-card/30">
                  <QueueStackDisplay
                    step={{ stack: (step as DFSTopoStep).stack.map((nodeId, i) => ({ id: `${nodeId}-${i}`, value: nodeId } as DataItem)) } as unknown as BaseStep}
                    mode="DFS"
                  />
                </div>
              </div>
              {/* DFS: 하단 결과 순서 */}
              <div className="h-[120px] p-3 bg-card/10 border-t shrink-0 overflow-auto">
                <ResultOrder step={step} mode={algoMode} nodes={nodes} />
              </div>
            </>
          )}
        </div>

        <StepController
          currentStep={currentStepIdx} totalSteps={steps.length} isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(p => !p)}
          onNext={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.min(steps.length - 1, p + 1)); }}
          onPrev={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.max(0, p - 1)); }}
          onFirst={() => { setIsPlaying(false); setCurrentStepIdx(0); }}
          onLast={() => { setIsPlaying(false); setCurrentStepIdx(steps.length - 1); }}
        />
      </div>

      <RightPanel>
        <TopoCodeViewer codeLine={step.codeLine} mode={algoMode} />
        <ResultOrder step={step} mode={algoMode} nodes={nodes} />
        <TopoProblemList />
      </RightPanel>

      <TopoInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); }}
      />
    </div>
  );
}

/* ─────────────── Kruskal Page ─────────────── */

type KruskalPrimTab = 'kruskal' | 'prim';

function KruskalPage() {
  const [tab, setTab]                         = useState<KruskalPrimTab>('kruskal');
  const [kruskalIdx, setKruskalIdx]           = useState(0);
  const [primIdx, setPrimIdx]                 = useState(0);
  const [isPlaying, setIsPlaying]             = useState(false);
  const [isKruskalModalOpen, setKruskalModal] = useState(false);
  const [isPrimModalOpen, setPrimModal]       = useState(false);

  const kruskalSteps = useMemo<KruskalStep[]>(
    () => generateKruskalSteps(KRUSKAL_NODES, KRUSKAL_EDGES, KRUSKAL_N), [],
  );
  const primSteps = useMemo<PrimStep[]>(
    () => generatePrimSteps(KRUSKAL_NODES, KRUSKAL_EDGES, KRUSKAL_N), [],
  );

  const steps           = tab === 'kruskal' ? kruskalSteps : primSteps;
  const currentStepIdx  = tab === 'kruskal' ? kruskalIdx   : primIdx;
  const setCurrentStepIdx = tab === 'kruskal' ? setKruskalIdx : setPrimIdx;

  const kStep = kruskalSteps[kruskalIdx] ?? kruskalSteps[0];
  const pStep = primSteps[primIdx]       ?? primSteps[0];

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 800);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (newTab: KruskalPrimTab) => {
    setTab(newTab);
    setIsPlaying(false);
  };

  /* ── Kruskal badge / banner ── */
  const kType = kStep.type as string;
  const kruskalBadgeClass =
    kType === 'REJECT'   ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' :
    kType === 'ACCEPT'   ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
    kType === 'FIND'     ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
    kType === 'CONSIDER' ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700' :
    kType === 'DONE'     ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700' :
    'bg-muted text-muted-foreground border-border';
  const kruskalBannerClass =
    kType === 'REJECT' ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
    kType === 'ACCEPT' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200' :
    kType === 'DONE'   ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200' :
    'bg-zinc-100 dark:bg-accent/50 text-zinc-700 dark:text-muted-foreground';

  /* ── Prim badge / banner ── */
  const pType = pStep.type as string;
  const primBadgeClass =
    pType === 'ADD_TO_MST'     ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
    pType === 'UPDATE'         ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' :
    pType === 'EXTRACT_MIN'    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
    pType === 'ALREADY_IN_MST' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700' :
    pType === 'DONE'           ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700' :
    'bg-muted text-muted-foreground border-border';
  const primBannerClass =
    pType === 'ADD_TO_MST'     ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200' :
    pType === 'UPDATE'         ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' :
    pType === 'ALREADY_IN_MST' ? 'bg-zinc-100 dark:bg-accent/50 text-zinc-600 dark:text-muted-foreground' :
    pType === 'DONE'           ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200' :
    'bg-zinc-100 dark:bg-accent/50 text-zinc-700 dark:text-muted-foreground';

  /* ── MST summary (shared) ── */
  const activeMstEdges = tab === 'kruskal' ? kStep.mstEdges : pStep.mstEdges;
  const activeTotalCost = tab === 'kruskal' ? kStep.totalCost : pStep.totalCost;
  const isDone = tab === 'kruskal' ? kType === 'DONE' : pType === 'DONE';

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      <div className="flex-1 min-w-[600px] border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

        {/* ── Tab bar ── */}
        <div className="flex border-b bg-muted/20 px-4 py-2 gap-2">
          <button
            onClick={() => handleTabChange('kruskal')}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
              tab === 'kruskal'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            크루스칼 (Kruskal)
          </button>
          <button
            onClick={() => handleTabChange('prim')}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
              tab === 'prim'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-sky-600 dark:text-sky-400'
                : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            프림 (Prim)
          </button>
        </div>

        {/* ── Header ── */}
        <div className="p-3 lg:p-4 border-b flex justify-between items-center bg-muted/30 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {tab === 'kruskal' ? (
              <>
                <h2 className="font-semibold text-base lg:text-lg tracking-tight">크루스칼 MST 시각화</h2>
                <button
                  onClick={() => setKruskalModal(true)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                >크루스칼이란? 💡</button>
              </>
            ) : (
              <>
                <h2 className="font-semibold text-base lg:text-lg tracking-tight">프림 MST 시각화</h2>
                <button
                  onClick={() => setPrimModal(true)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
                >프림이란? 💡</button>
              </>
            )}
          </div>
          {/* Status badge */}
          {tab === 'kruskal' ? (
            <div className={`text-xs font-bold px-3 py-1 rounded-full border ${kruskalBadgeClass}`}>{kType}</div>
          ) : (
            <div className={`text-xs font-bold px-3 py-1 rounded-full border ${primBadgeClass}`}>{pType}</div>
          )}
        </div>

        {/* ── Banner ── */}
        <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${
          tab === 'kruskal' ? kruskalBannerClass : primBannerClass
        }`}>
          {tab === 'kruskal' ? kStep.description : pStep.description}
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">

          {tab === 'kruskal' ? (
            <>
              {/* Top: Graph + EdgeList */}
              <div className="flex-1 flex flex-row divide-x divide-border overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <KruskalGraphCanvas step={kStep} nodes={KRUSKAL_NODES} edges={KRUSKAL_EDGES} />
                </div>
                <div className="w-[260px] shrink-0 overflow-y-auto p-3">
                  <KruskalEdgeList step={kStep} />
                </div>
              </div>
              {/* Bottom: UnionFind + MST summary */}
              <div className="h-[270px] shrink-0 flex flex-row divide-x divide-border border-t overflow-hidden">
                <div className="flex-1 overflow-auto p-3">
                  <UnionFindDisplay step={kStep} N={KRUSKAL_N} />
                </div>
                <div className="w-[200px] shrink-0 p-3 overflow-y-auto bg-card/30 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">MST 결과</p>
                  {activeMstEdges.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">아직 간선 없음...</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {activeMstEdges.map((e, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded px-2 py-1">
                          <span className="font-mono font-semibold">{e.u} – {e.v}</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">w={e.weight}</span>
                        </div>
                      ))}
                      <div className="mt-1 pt-1 border-t flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">총 비용</span>
                        <span className="text-emerald-700 dark:text-emerald-300">{activeTotalCost}</span>
                      </div>
                    </div>
                  )}
                  {isDone && (
                    <div className="mt-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full text-center">
                      ✓ MST 완성
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Top: Graph (full width) */}
              <div className="h-[240px] shrink-0 flex flex-col overflow-hidden">
                <PrimGraphCanvas step={pStep} nodes={KRUSKAL_NODES} edges={KRUSKAL_EDGES} />
              </div>

              {/* Bottom: Key/Parent + PQ (left) | MST 결과 (right) */}
              <div className="h-[370px] shrink-0 flex flex-row divide-x divide-border border-t overflow-hidden">
                {/* 하단 좌측: Key/Parent 배열 + 우선순위 큐 */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                  <PrimKeyTable step={pStep} N={KRUSKAL_N} />

                  {/* Priority Queue */}
                  <div className="border rounded-xl overflow-hidden shadow-sm shrink-0">
                    <div className="p-2.5 border-b bg-muted/30">
                      <h3 className="font-semibold text-xs">우선순위 큐 (Priority Queue)</h3>
                    </div>
                    <div className="p-2.5 flex flex-wrap gap-1.5 items-center">
                      {(() => {
                        const dedupedPQ = [...pStep.pq]
                          .sort((a, b) => a.key - b.key)
                          .filter((item, _, arr) => arr.find(x => x.node === item.node) === item);
                        return dedupedPQ.length === 0
                          ? <span className="text-[11px] text-muted-foreground italic">비어있음</span>
                          : dedupedPQ.map((item, idx) => (
                            <div key={`${item.node}-${item.key}`}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold ${
                                idx === 0
                                  ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                                  : 'bg-card border-border text-muted-foreground'
                              }`}
                            >
                              <span className="font-mono">{item.key >= 1e9 ? '∞' : item.key}</span>
                              <span className="opacity-40">·</span>
                              <span className="font-mono">노드{item.node}</span>
                              {idx === 0 && <span className="text-[8px] text-blue-500 font-bold ml-0.5">↑next</span>}
                            </div>
                          ));
                      })()}
                    </div>
                    <div className="px-2.5 pb-1.5 text-[9px] text-muted-foreground">key 오름차순</div>
                  </div>
                </div>

                {/* 하단 우측: MST 결과 */}
                <div className="w-[200px] shrink-0 p-3 overflow-y-auto bg-card/30 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">MST 결과</p>
                  {activeMstEdges.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">아직 간선 없음...</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {activeMstEdges.map((e, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded px-2 py-1">
                          <span className="font-mono font-semibold">{e.u} – {e.v}</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">w={e.weight}</span>
                        </div>
                      ))}
                      <div className="mt-1 pt-1 border-t flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">총 비용</span>
                        <span className="text-emerald-700 dark:text-emerald-300">{activeTotalCost}</span>
                      </div>
                      {isDone && (
                        <div className="mt-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full text-center">
                          ✓ 크루스칼과 동일
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <StepController
          currentStep={currentStepIdx} totalSteps={steps.length} isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(p => !p)}
          onNext={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.min(steps.length - 1, p + 1)); }}
          onPrev={() => { setIsPlaying(false); setCurrentStepIdx(p => Math.max(0, p - 1)); }}
          onFirst={() => { setIsPlaying(false); setCurrentStepIdx(0); }}
          onLast={() => { setIsPlaying(false); setCurrentStepIdx(steps.length - 1); }}
        />
      </div>

      <RightPanel>
        {tab === 'kruskal' ? (
          <>
            <KruskalCodeViewer codeLine={kStep.codeLine} />
            <KruskalProblemList />
          </>
        ) : (
          <>
            <PrimCodeViewer codeLine={pStep.codeLine} />
            <PrimProblemList />
          </>
        )}
      </RightPanel>

      <KruskalInfoModal
        isOpen={isKruskalModalOpen}
        onClose={() => setKruskalModal(false)}
        onStartVisualization={() => { setKruskalIdx(0); setIsPlaying(true); }}
      />
      <PrimInfoModal
        isOpen={isPrimModalOpen}
        onClose={() => setPrimModal(false)}
        onStartVisualization={() => { setPrimIdx(0); setIsPlaying(true); }}
      />
    </div>
  );
}

/* ─────────────── Router ─────────────── */
export default function AlgorithmPage() {
  const { slug } = useParams();
  if (slug === 'tsp')           return <TSPPage />;
  if (slug === 'dijkstra')      return <DijkstraPage />;
  if (slug === 'astar')         return <AStarPage />;
  if (slug === 'bfsdfs')        return <BFSDFSPage />;
  if (slug === 'bellmanford')   return <BellmanFordPage />;
  if (slug === 'floyd-warshall') return <FloydWarshallPage />;
  if (slug === 'topological')   return <TopologicalPage />;
  if (slug === 'kruskal')       return <KruskalPage />;
  return <div className="p-8 text-center text-muted-foreground">알고리즘을 찾을 수 없습니다.</div>;
}


import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import StepController from '../components/algorithm/StepController';

// TSP
import TSPGraphCanvas from '../algorithms/tsp/GraphCanvas';
import TSPCodeViewer  from '../algorithms/tsp/CodeViewer';
import TSPProblemList from '../algorithms/tsp/ProblemList';
import TSPDPTable     from '../algorithms/tsp/DPTable';
import TSPInfoModal   from '../algorithms/tsp/TSPInfoModal';
import { generateTSPStepsTopDown }  from '../algorithms/tsp/solverTopDown';
import { generateTSPStepsBottomUp } from '../algorithms/tsp/solverBottomUp';

// Dijkstra
import DijkstraGraphCanvas from '../algorithms/dijkstra/GraphCanvas';
import DijkstraCodeViewer  from '../algorithms/dijkstra/CodeViewer';
import DijkstraProblemList from '../algorithms/dijkstra/ProblemList';
import DijkstraDistTable   from '../algorithms/dijkstra/DistanceTable';
import DijkstraInfoModal   from '../algorithms/dijkstra/InfoModal';
import { generateDijkstraSteps } from '../algorithms/dijkstra/solver';
import type { DijkstraStep } from '../algorithms/dijkstra/types';

/* ─────────────── TSP page ─────────────── */
type SolverType = 'topDown' | 'bottomUp';

function TSPPage() {
  const [solverType, setSolverType] = useState<SolverType>('topDown');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = useMemo(() =>
    solverType === 'topDown' ? generateTSPStepsTopDown() : generateTSPStepsBottomUp(),
  [solverType]);

  useEffect(() => { setCurrentStepIdx(0); setIsPlaying(false); }, [steps]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) { setIsPlaying(false); return; }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 700);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const step = steps[currentStepIdx];

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
          <div className="flex bg-card p-1 rounded-lg border shadow-sm gap-0.5">
            {(['topDown', 'bottomUp'] as SolverType[]).map(t => (
              <button key={t}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  solverType === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                onClick={() => setSolverType(t)}
              >{t === 'topDown' ? 'Top-down (재귀)' : 'Bottom-up (반복문)'}</button>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${
          step.description.startsWith('[종료]')
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-900/50'
            : step.isImprovement
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
              : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
        }`}>{step.description}</div>

        {/* Graph + DP Table */}
        <div className="flex-1 flex flex-col xl:flex-row bg-muted/5 divide-y xl:divide-y-0 xl:divide-x divide-border overflow-hidden min-h-0">
          <div className="w-full xl:w-2/5 flex flex-col relative overflow-y-auto">
            <TSPGraphCanvas currentMask={step.mask} currentCity={step.currentCity} nextCity={step.nextCity} activeEdge={step.activeEdge} />
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
      </div>

      <div className="w-full lg:w-[440px] flex flex-col gap-6">
        <TSPCodeViewer codeLine={step.codeLine} solverType={solverType} />
        <TSPProblemList />
      </div>

      <TSPInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); }} />
    </div>
  );
}

/* ─────────────── Dijkstra page ─────────────── */

// 방문 확정된 간선을 추적하는 유틸
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

function DijkstraPage() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = useMemo(() => generateDijkstraSteps(), []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) { setIsPlaying(false); return; }
    const t = window.setTimeout(() => setCurrentStepIdx(p => p + 1), 800);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIdx, steps.length]);

  const step = steps[currentStepIdx];
  const shortestEdges = useMemo(
    () => computeShortestEdges(steps, currentStepIdx),
    [steps, currentStepIdx]
  );

  const bannerClass = step.type === 'DONE'
    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-900/50'
    : step.type === 'VISITED'
      ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
      : step.isImprovement
        ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
        : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

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
          {/* Step type badge */}
          <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
            step.type === 'DEQUEUE' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
            step.type === 'RELAX'   ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700' :
            step.type === 'VISITED' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' :
            step.type === 'DONE'    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' :
                                      'bg-muted text-muted-foreground border-border'
          }`}>
            {step.type}
          </div>
        </div>

        {/* Banner */}
        <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${bannerClass}`}>
          {step.description}
        </div>

        {/* Graph + Distance Table */}
        <div className="flex-1 flex flex-col xl:flex-row bg-muted/5 divide-y xl:divide-y-0 xl:divide-x divide-border overflow-hidden min-h-0">
          <div className="w-full xl:w-2/5 flex flex-col relative overflow-y-auto">
            <DijkstraGraphCanvas step={step} shortestEdges={shortestEdges} />
          </div>
          <div className="w-full xl:w-3/5 flex-1 p-3 xl:p-5 overflow-auto min-h-[300px]">
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
      </div>

      <div className="w-full lg:w-[440px] flex flex-col gap-6">
        <DijkstraCodeViewer codeLine={step.codeLine} />
        <DijkstraProblemList />
      </div>

      <DijkstraInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setCurrentStepIdx(0); setIsPlaying(true); }} />
    </div>
  );
}

/* ─────────────── Router ─────────────── */
export default function AlgorithmPage() {
  const { slug } = useParams();
  if (slug === 'tsp')       return <TSPPage />;
  if (slug === 'dijkstra')  return <DijkstraPage />;
  return <div className="p-8 text-center text-muted-foreground">알고리즘을 찾을 수 없습니다.</div>;
}

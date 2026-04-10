import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import StepController from '../components/algorithm/StepController';
import GraphCanvas from '../algorithms/tsp/GraphCanvas';
import CodeViewer from '../algorithms/tsp/CodeViewer';
import ProblemList from '../algorithms/tsp/ProblemList';
import DPTable from '../algorithms/tsp/DPTable';
import { generateTSPStepsTopDown } from '../algorithms/tsp/solverTopDown';
import { generateTSPStepsBottomUp } from '../algorithms/tsp/solverBottomUp';

type SolverType = 'topDown' | 'bottomUp';

export default function AlgorithmPage() {
  const { slug } = useParams();
  const [solverType, setSolverType] = useState<SolverType>('topDown');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate steps synchronously via useMemo — avoids useEffect setState cascade
  const steps = useMemo(() => {
    if (slug !== 'tsp') return [];
    return solverType === 'topDown'
      ? generateTSPStepsTopDown()
      : generateTSPStepsBottomUp();
  }, [slug, solverType]);

  // Reset whenever steps change (solver / slug change)
  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [steps]);

  // Auto-play ticker
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setCurrentStepIdx(prev => prev + 1);
    }, 700);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, steps.length]);

  const handleSolverChange = (type: SolverType) => {
    setSolverType(type); // steps/reset handled by useMemo + useEffect
  };

  if (steps.length === 0) return (
    <div className="p-8 text-center text-muted-foreground w-full">Loading algorithm...</div>
  );

  const currentStep = steps[currentStepIdx];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      {/* Left panel: Graph + DP Table */}
      <div className="flex-1 border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">

        {/* Header with solver toggle */}
        <div className="p-3 lg:p-4 border-b flex justify-between items-center bg-muted/30 flex-wrap gap-3">
          <h2 className="font-semibold text-base lg:text-lg tracking-tight">TSP 비트마스크 DP 시각화</h2>
          <div className="flex bg-card p-1 rounded-lg border shadow-sm gap-0.5">
            <button
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                solverType === 'topDown'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
              onClick={() => handleSolverChange('topDown')}
            >
              Top-down (재귀)
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                solverType === 'bottomUp'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
              onClick={() => handleSolverChange('bottomUp')}
            >
              Bottom-up (반복문)
            </button>
          </div>
        </div>

        {/* Status banner — green: improvement, blue: final answer, gray: no change */}
        <div className={`px-4 py-2.5 border-b font-medium text-sm text-center min-h-[42px] flex items-center justify-center transition-colors ${
          currentStep.description.startsWith('[종료]')
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-900/50'
            : currentStep.isImprovement
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50'
              : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
        }`}>
          {currentStep.description}
        </div>

        {/* Graph (left) + DP Table (right) */}
        <div className="flex-1 flex flex-col xl:flex-row bg-muted/5 divide-y xl:divide-y-0 xl:divide-x divide-border overflow-hidden min-h-0">
          <div className="w-full xl:w-2/5 flex flex-col relative overflow-y-auto">
            <GraphCanvas
              currentMask={currentStep.mask}
              currentCity={currentStep.currentCity}
              nextCity={currentStep.nextCity}
              activeEdge={currentStep.activeEdge}
            />
          </div>
          <div className="w-full xl:w-3/5 flex-1 p-2 xl:p-4 overflow-hidden relative min-h-[300px]">
            <DPTable
              dpTable={currentStep.dpTable}
              currentCity={currentStep.currentCity}
              currentMask={currentStep.mask}
            />
          </div>
        </div>

        <StepController
          currentStep={currentStepIdx}
          totalSteps={steps.length}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(p => !p)}
          onNext={() => { setIsPlaying(false); setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1)); }}
          onPrev={() => { setIsPlaying(false); setCurrentStepIdx(prev => Math.max(0, prev - 1)); }}
          onFirst={() => { setIsPlaying(false); setCurrentStepIdx(0); }}
          onLast={() => { setIsPlaying(false); setCurrentStepIdx(steps.length - 1); }}
        />
      </div>

      {/* Right panel: Code viewer + Problem list */}
      <div className="w-full lg:w-[440px] flex flex-col gap-6">
        <CodeViewer codeLine={currentStep.codeLine} solverType={solverType} />
        <ProblemList />
      </div>
    </div>
  );
}

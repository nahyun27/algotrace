import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StepController from '../components/algorithm/StepController';
import GraphCanvas from '../algorithms/tsp/GraphCanvas';
import CodeViewer from '../algorithms/tsp/CodeViewer';
import ProblemList from '../algorithms/tsp/ProblemList';
import DPTable from '../algorithms/tsp/DPTable';
import { generateTSPSteps, type TSPStep } from '../algorithms/tsp/solver';

export default function AlgorithmPage() {
  const { slug } = useParams();
  const [steps, setSteps] = useState<TSPStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (slug === 'tsp') {
      const generated = generateTSPSteps();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps
      setSteps(generated);
      // eslint-disable-next-line
      setCurrentStepIdx(0);
      // eslint-disable-next-line
      setIsPlaying(false);
    } else {
      // eslint-disable-next-line
      setSteps([]);
    }
  }, [slug]);

  useEffect(() => {
    let timer: number;
    if (isPlaying && steps.length > 0 && currentStepIdx < steps.length - 1) {
      timer = window.setTimeout(() => {
        setCurrentStepIdx(prev => prev + 1);
      }, 700); // 700ms animation speed
    } else if (currentStepIdx >= steps.length - 1) {
      // eslint-disable-next-line
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, steps.length]);

  if (steps.length === 0) return <div className="p-8 text-center text-muted-foreground w-full">Loading algorithm...</div>;

  const currentStep = steps[currentStepIdx];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6">
      {/* Left side: Graph / Visualization */}
      <div className="flex-1 border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[650px] lg:min-h-0">
        <div className="p-4 border-b flex justify-between items-center bg-muted/30">
          <h2 className="font-semibold text-lg tracking-tight">TSP 비트마스크 DP 시각화 ({slug})</h2>
        </div>
        
        {/* Status description banner */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-b border-blue-100 dark:border-blue-900/50 flex flex-col items-center justify-center font-semibold text-sm text-center">
           {currentStep.description}
        </div>
        
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
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={() => setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1))}
          onPrev={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
          onFirst={() => setCurrentStepIdx(0)}
          onLast={() => setCurrentStepIdx(steps.length - 1)}
        />
      </div>

      {/* Right side: Code viewer and problem list */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <CodeViewer codeLine={currentStep.codeLine} />
        <ProblemList />
      </div>
    </div>
  );
}

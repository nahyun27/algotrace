import { useState, useMemo, useCallback } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader, { BackToVisualizationButton, EditGraphButton } from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, SegmentedControl, type Tone } from '../../components/ui';
import GraphEditor from '../../components/GraphEditor';
import type { GraphData } from '../../types/graph';
import { TSP_DEFAULT_GRAPH } from '../../types/graph';
import TSPGraphCanvas from '../../algorithms/tsp/GraphCanvas';
import TSPCodeViewer from '../../algorithms/tsp/CodeViewer';
import TSPProblemList from '../../algorithms/tsp/ProblemList';
import TSPDPTable from '../../algorithms/tsp/DPTable';
import TSPInfoModal from '../../algorithms/tsp/TSPInfoModal';
import { generateTSPStepsTopDown } from '../../algorithms/tsp/solverTopDown';
import { generateTSPStepsBottomUp } from '../../algorithms/tsp/solverBottomUp';
import type { TSPStep, TSPStepType } from '../../algorithms/tsp/shared';
import { graphDataToTSP } from './graphConvert';
import { useLang, useTr } from '../../i18n';

type PageMode = 'example' | 'editor';
type SolverType = 'topDown' | 'bottomUp';

const STEP_TONE: Record<TSPStepType, Tone> = {
  INIT: 'neutral',
  CALL: 'current',
  BASE: 'candidate',
  MEMO: 'visited',
  EXPLORE: 'current',
  MOVE: 'candidate',
  COMPARE: 'visited',
  SAVE: 'visited',
  STATE: 'current',
  UPDATE: 'visited',
  RETURN: 'candidate',
  BEST: 'visited',
  DONE: 'path',
};

function stepTone(step: TSPStep): Tone {
  // A comparison that didn't improve anything is just informational
  if ((step.type === 'COMPARE' || step.type === 'UPDATE') && !step.isImprovement) return 'neutral';
  return STEP_TONE[step.type];
}

export default function TSPPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [mode, setMode]               = useState<PageMode>('example');
  const [solverType, setSolverType]   = useState<SolverType>('topDown');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGraph, setCustomGraph] = useState<ReturnType<typeof graphDataToTSP> | null>(null);

  const steps = useMemo(() => {
    const generate = solverType === 'topDown' ? generateTSPStepsTopDown : generateTSPStepsBottomUp;
    return customGraph ? generate(customGraph.W, customGraph.N, lang) : generate(undefined, undefined, lang);
  }, [solverType, customGraph, lang]);

  const pb = usePlayback(steps.length);
  const step = steps[pb.index];

  const markers = useMemo(
    () => steps.flatMap((s, i) =>
      s.type === 'DONE' ? [{ index: i, tone: 'path' as Tone }]
        : s.type === 'BEST' || (s.type === 'SAVE' && s.isImprovement) ? [{ index: i, tone: 'visited' as Tone }]
        : []),
    [steps],
  );

  const resetPlayback = pb.reset;
  const handleRun = useCallback((data: GraphData): string | null => {
    setCustomGraph(graphDataToTSP(data));
    resetPlayback();
    setMode('example');
    return null;
  }, [resetPlayback]);

  const changeSolver = (type: SolverType) => {
    setSolverType(type);
    pb.reset();
  };

  const binMask = step.mask.toString(2).padStart(step.dpTable[0]?.length ?? 4, '0');

  return (
    <>
      <AlgorithmLayout
        isEditorMode={mode === 'editor'}
        header={
          <AlgorithmHeader
            title={tr('TSP 비트마스크 DP', 'TSP bitmask DP')}
            onInfo={() => setIsModalOpen(true)}
            tabs={mode === 'example' && (
              <SegmentedControl
                id="tsp-solver"
                value={solverType}
                onChange={changeSolver}
                options={[
                  { value: 'topDown', label: tr('Top-down (메모이제이션)', 'Top-down (memoization)') },
                  { value: 'bottomUp', label: tr('Bottom-up (테이블)', 'Bottom-up (tabulation)') },
                ]}
              />
            )}
            controls={mode === 'editor' && <BackToVisualizationButton onClick={() => setMode('example')} />}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={stepTone(step)}
              badge={step.type}
              description={step.description}
              aside={
                <>
                  <Badge className="font-mono">mask {binMask}</Badge>
                  <Badge tone="current" className="font-mono">curr {step.currentCity}</Badge>
                </>
              }
            />
            <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-border border-b border-border">
              <div className="w-full xl:w-2/5 relative min-h-[280px]">
                <TSPGraphCanvas
                  currentMask={step.mask}
                  currentCity={step.currentCity}
                  nextCity={step.nextCity}
                  activeEdge={step.activeEdge}
                  isFinal={step.type === 'DONE'}
                  customNodes={customGraph?.nodePositions}
                  customW={customGraph?.W}
                />
                <EditGraphButton onClick={() => { setMode('editor'); pb.setIsPlaying(false); }} />
              </div>
              <div className="w-full xl:w-3/5 p-3 sm:p-5 min-h-[280px]">
                <TSPDPTable dpTable={step.dpTable} currentCity={step.currentCity} currentMask={step.mask} />
              </div>
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        editor={
          <GraphEditor
            initialData={TSP_DEFAULT_GRAPH}
            maxNodes={6}
            algorithmType="tsp"
            onRun={handleRun}
            presets={[{ label: tr('TSP 예제 (4도시)', 'TSP example (4 cities)'), data: TSP_DEFAULT_GRAPH }]}
          />
        }
        rightPanel={
          <RightPanel
            code={<TSPCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} solverType={solverType} />}
            problems={<TSPProblemList />}
          />
        }
      />
      <TSPInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setMode('example'); pb.reset(true); }}
      />
    </>
  );
}

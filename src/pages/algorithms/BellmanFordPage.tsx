import { useState, useMemo } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { useUrlState } from '../../components/algorithm/useUrlState';
import { Badge, SegmentedControl, type Tone } from '../../components/ui';
import BFGraphCanvas from '../../algorithms/bellmanford/GraphCanvas';
import BFCodeViewer from '../../algorithms/bellmanford/CodeViewer';
import BFProblemList from '../../algorithms/bellmanford/ProblemList';
import BFDistanceTable from '../../algorithms/bellmanford/DistanceTable';
import BFExtraInfo from '../../algorithms/bellmanford/ExtraInfo';
import BFInfoModal from '../../algorithms/bellmanford/InfoModal';
import { generateBellmanFordSteps } from '../../algorithms/bellmanford/solver';
import { EXAMPLE1_N, EXAMPLE1_EDGES, EXAMPLE1_NODES, EXAMPLE2_N, EXAMPLE2_EDGES, EXAMPLE2_NODES } from '../../algorithms/bellmanford/types';
import type { BFStepType } from '../../algorithms/bellmanford/types';
import { useLang, useTr } from '../../i18n';

/* ─────────────── Bellman-Ford Page ─────────────── */

type BFExample = 'ex1' | 'ex2';

const EXAMPLES = {
  ex1: { nodes: EXAMPLE1_NODES, edges: EXAMPLE1_EDGES, N: EXAMPLE1_N },
  ex2: { nodes: EXAMPLE2_NODES, edges: EXAMPLE2_EDGES, N: EXAMPLE2_N },
};

const STEP_TONE: Record<BFStepType, Tone> = {
  INIT: 'neutral',
  ROUND_START: 'current',
  RELAX: 'candidate',
  ROUND_END: 'primary',
  NEGATIVE_CYCLE: 'danger',
  DONE: 'path',
};

export default function BellmanFordPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [example, setExample] = useUrlState<BFExample>('example', ['ex1', 'ex2'], 'ex1');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { nodes, edges, N } = EXAMPLES[example];

  const steps = useMemo(() => generateBellmanFordSteps(edges, N, lang), [edges, N, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index];

  const markers = useMemo(
    () => steps.flatMap((s, i) =>
      s.type === 'ROUND_END' ? [{ index: i, tone: 'primary' as Tone }]
        : s.type === 'NEGATIVE_CYCLE' ? [{ index: i, tone: 'danger' as Tone }]
        : []),
    [steps],
  );

  const handleExampleChange = (ex: BFExample) => {
    setExample(ex);
    pb.reset();
  };

  const tone: Tone = step.type === 'RELAX' && !step.isImprovement ? 'neutral' : STEP_TONE[step.type];

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('벨만-포드 최단 경로', 'Bellman-Ford shortest path')}
            onInfo={() => setIsModalOpen(true)}
            controls={
              <SegmentedControl
                id="bf-example"
                value={example}
                onChange={handleExampleChange}
                options={[
                  { value: 'ex1', label: tr('기본 예제', 'Basic example') },
                  { value: 'ex2', label: tr('음수 사이클', 'Negative cycle') },
                ]}
              />
            }
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={tone}
              badge={step.type}
              description={step.description}
              aside={step.round > 0 && step.round <= step.totalRounds && (
                <Badge tone="current" outline>{tr(`라운드 ${step.round}/${step.totalRounds}`, `Round ${step.round}/${step.totalRounds}`)}</Badge>
              )}
            />
            <div className="relative min-h-[280px] border-b border-border">
              <BFGraphCanvas step={step} nodes={nodes} edges={edges} />
            </div>
            <div className="p-3 sm:p-5">
              <BFDistanceTable step={step} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<BFCodeViewer codeLine={step.codeLine} />}
            problems={<BFProblemList />}
            extra={<BFExtraInfo step={step} />}
            extraLabel={tr('분석', 'Insights')}
          />
        }
      />
      <BFInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStartVisualization={() => pb.reset(true)} />
    </>
  );
}

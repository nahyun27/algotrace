import { useState, useMemo } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { useUrlState } from '../../components/algorithm/useUrlState';
import { SegmentedControl, type Tone } from '../../components/ui';
import QueueStackDisplay from '../../algorithms/bfsdfs/QueueStackDisplay';
import type { BaseStep, DataItem } from '../../algorithms/bfsdfs/types';
import TopoGraphCanvas from '../../algorithms/topological/GraphCanvas';
import TopoCodeViewer from '../../algorithms/topological/CodeViewer';
import TopoProblemList from '../../algorithms/topological/ProblemList';
import InDegreeDisplay from '../../algorithms/topological/InDegreeDisplay';
import ResultOrder from '../../algorithms/topological/ResultOrder';
import TopoInfoModal from '../../algorithms/topological/InfoModal';
import { generateKahnSteps } from '../../algorithms/topological/solverKahn';
import { generateDFSTopoSteps } from '../../algorithms/topological/solverDFS';
import { TOPO_EXAMPLES, localizeNodes } from '../../algorithms/topological/types';
import type { KahnStep, DFSTopoStep, KahnStepType, DFSTopoStepType, TopoExampleId } from '../../algorithms/topological/types';
import { useLang, useTr } from '../../i18n';

type TopoAlgoMode = 'Kahn' | 'DFS';

const STEP_TONE: Record<KahnStepType | DFSTopoStepType, Tone> = {
  INIT: 'neutral',
  ENQUEUE: 'candidate',
  DEQUEUE: 'current',
  DECREASE: 'candidate',
  VISIT: 'current',
  FINISH: 'visited',
  CYCLE_DETECTED: 'danger',
  DONE: 'path',
};

export default function TopologicalPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [algoMode, setAlgoMode] = useUrlState<TopoAlgoMode>('algo', ['Kahn', 'DFS'], 'Kahn');
  const [example, setExample] = useUrlState<TopoExampleId>('example', Object.keys(TOPO_EXAMPLES) as TopoExampleId[], 'dag');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { edges, N } = TOPO_EXAMPLES[example];
  const nodes = useMemo(() => localizeNodes(TOPO_EXAMPLES[example].nodes, lang), [example, lang]);

  const steps = useMemo<(KahnStep | DFSTopoStep)[]>(
    () => (algoMode === 'Kahn' ? generateKahnSteps(nodes, edges, N, lang) : generateDFSTopoSteps(nodes, edges, N, lang)),
    [algoMode, nodes, edges, N, lang],
  );

  const pb = usePlayback(steps.length);
  const step = steps[pb.index] as KahnStep & DFSTopoStep;

  const markers = useMemo(
    () => steps.flatMap((s, i) => {
      if (s.type === 'CYCLE_DETECTED') return [{ index: i, tone: 'danger' as Tone }];
      if (s.type === 'DEQUEUE' || s.type === 'FINISH') return [{ index: i, tone: 'visited' as Tone }];
      return [];
    }),
    [steps],
  );

  const handleAlgoChange = (next: TopoAlgoMode) => {
    setAlgoMode(next);
    pb.reset();
  };

  const handleExampleChange = (next: TopoExampleId) => {
    setExample(next);
    pb.reset();
  };

  const tone: Tone = step.hasCycle ? 'danger' : STEP_TONE[step.type];
  const labelOf = (id: number) => nodes[id]?.label ?? id;

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={algoMode === 'Kahn'
              ? tr('위상정렬 — 칸의 알고리즘', "Topological sort — Kahn's algorithm")
              : tr('위상정렬 — DFS 방식', 'Topological sort — DFS')}
            onInfo={() => setIsModalOpen(true)}
            tabs={
              <SegmentedControl
                id="topo-algo"
                value={algoMode}
                onChange={handleAlgoChange}
                options={[
                  { value: 'Kahn', label: tr('칸의 알고리즘 (Kahn)', "Kahn's algorithm") },
                  { value: 'DFS', label: tr('DFS 방식', 'DFS-based') },
                ]}
              />
            }
            controls={
              <SegmentedControl
                id="topo-example"
                value={example}
                onChange={handleExampleChange}
                options={(Object.keys(TOPO_EXAMPLES) as TopoExampleId[]).map(id => ({
                  value: id,
                  label: TOPO_EXAMPLES[id].name[lang],
                }))}
              />
            }
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner tone={tone} badge={step.type} description={step.description} />
            <div className="relative min-h-[300px] border-b border-border">
              <TopoGraphCanvas step={step} mode={algoMode} nodes={nodes} edges={edges} />
            </div>
            {algoMode === 'Kahn' ? (
              <div className="p-3 sm:p-5 flex flex-col gap-3">
                <InDegreeDisplay step={step} nodes={nodes} />
                <ResultOrder step={step} mode={algoMode} nodes={nodes} />
              </div>
            ) : (
              <div className="p-3 sm:p-5 flex flex-col lg:flex-row gap-3 lg:gap-4">
                <div className="flex-1 min-w-0">
                  <QueueStackDisplay
                    step={{ stack: step.stack.map((nodeId, i) => ({ id: `${nodeId}-${i}`, value: nodeId } as DataItem)) } as unknown as BaseStep}
                    mode="DFS"
                    title={tr('📚 스택 (완료 순서)', '📚 Stack (finish order)')}
                    formatItem={labelOf}
                    highlightNext={false}
                  />
                </div>
                <div className="flex-1 min-w-0"><ResultOrder step={step} mode={algoMode} nodes={nodes} /></div>
              </div>
            )}
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<TopoCodeViewer codeLine={step.codeLine} mode={algoMode} />}
            problems={<TopoProblemList />}
          />
        }
      />
      <TopoInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

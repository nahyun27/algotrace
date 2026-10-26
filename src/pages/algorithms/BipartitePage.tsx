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
import QueueStackDisplay from '../../algorithms/bfsdfs/QueueStackDisplay';
import type { BFSStep } from '../../algorithms/bfsdfs/types';
import BipartiteGraphCanvas from '../../algorithms/bipartite/GraphCanvas';
import GroupsDisplay from '../../algorithms/bipartite/GroupsDisplay';
import BipartiteCodeViewer from '../../algorithms/bipartite/CodeViewer';
import BipartiteProblemList from '../../algorithms/bipartite/ProblemList';
import BipartiteInfoModal from '../../algorithms/bipartite/InfoModal';
import { generateBipartiteSteps } from '../../algorithms/bipartite/solver';
import { EXAMPLES, graphToInput, type ExampleKey, type StepType } from '../../algorithms/bipartite/types';
import { useLang, useTr } from '../../i18n';

type PageMode = 'example' | 'editor';
type ExampleChoice = ExampleKey | 'custom';

const STEP_TONE: Record<StepType, Tone> = {
  INIT: 'neutral',
  START: 'current',
  DEQUEUE: 'current',
  COLOR: 'candidate',
  CHECK: 'visited',
  CONFLICT: 'danger',
  DONE: 'path',
};

export default function BipartitePage() {
  const { lang } = useLang();
  const tr = useTr();
  const [mode, setMode] = useState<PageMode>('example');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [example, setExample] = useState<ExampleKey>('yes');
  const [customGraph, setCustomGraph] = useState<GraphData | null>(null);

  const graph = customGraph ?? EXAMPLES[example];
  const input = useMemo(() => graphToInput(graph), [graph]);
  const positions = useMemo(
    () => [...graph.nodes].sort((a, b) => a.id - b.id).map((nd, i) => ({ id: i, x: nd.x, y: nd.y })),
    [graph],
  );

  const steps = useMemo(() => generateBipartiteSteps(input.n, input.edges, lang), [input, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index];
  const { reset } = pb;

  // QueueStackDisplay reads `queue` from a BFS step; only the queue matters here
  const queueStep = useMemo<BFSStep>(() => ({
    type: 'DEQUEUE', description: step.description, codeLine: step.codeLine,
    currentNode: step.currentNode, neighborNode: step.neighborNode, activeEdge: step.activeEdge,
    visitedNodes: [], visitedSet: [], treeEdges: step.treeEdges, isImprovement: false, queue: step.queue,
  }), [step]);

  const markers = useMemo(
    () => steps.flatMap((s, i) =>
      s.type === 'START' ? [{ index: i, tone: 'current' as Tone }]
      : s.type === 'CONFLICT' ? [{ index: i, tone: 'danger' as Tone }]
      : []),
    [steps],
  );

  const handleRun = useCallback((data: GraphData): string | null => {
    if (data.nodes.length === 0) return tr('노드를 하나 이상 추가해 주세요.', 'Add at least one node.');
    setCustomGraph(data);
    reset(true);
    setMode('example');
    return null;
  }, [reset, tr]);

  const handleExample = (next: ExampleChoice) => {
    if (next === 'custom') return;
    setExample(next);
    setCustomGraph(null);
    reset();
  };

  const tone: Tone = step.type === 'DONE' ? (step.isBipartite ? 'path' : 'danger') : STEP_TONE[step.type];

  const exampleOptions: { value: ExampleChoice; label: string }[] = [
    { value: 'yes', label: tr('이분 그래프', 'Bipartite') },
    { value: 'no', label: tr('이분 그래프 아님', 'Not bipartite') },
    ...(customGraph ? [{ value: 'custom' as const, label: tr('직접 만든 그래프', 'Custom graph') }] : []),
  ];

  return (
    <>
      <AlgorithmLayout
        isEditorMode={mode === 'editor'}
        header={
          <AlgorithmHeader
            title={tr('이분 그래프 판별', 'Bipartite check')}
            onInfo={() => setIsModalOpen(true)}
            tabs={
              <SegmentedControl
                id="bipartite-example"
                value={customGraph ? 'custom' : example}
                onChange={handleExample}
                options={exampleOptions}
              />
            }
            controls={mode === 'editor' && <BackToVisualizationButton onClick={() => setMode('example')} />}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={tone}
              badge={step.type}
              description={step.description}
              aside={step.isBipartite !== null && (
                <Badge tone={step.isBipartite ? 'path' : 'danger'} outline>{step.isBipartite ? 'YES' : 'NO'}</Badge>
              )}
            />
            <div className="relative min-h-[300px] border-b border-border">
              <BipartiteGraphCanvas step={step} nodes={positions} edges={input.edges} />
              <EditGraphButton onClick={() => { setMode('editor'); pb.setIsPlaying(false); }} />
            </div>
            <div className="p-3 sm:p-5 flex flex-col lg:flex-row gap-3 lg:gap-4">
              <div className="flex-1 min-w-0"><QueueStackDisplay step={queueStep} mode="BFS" title={tr('큐 (Queue)', 'Queue')} /></div>
              <div className="flex-1 min-w-0"><GroupsDisplay step={step} /></div>
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        editor={
          <GraphEditor
            initialData={graph}
            maxNodes={10}
            algorithmType="bfsdfs"
            onRun={handleRun}
            presets={[
              { label: tr('이분 그래프 (8노드)', 'Bipartite (8 nodes)'), data: EXAMPLES.yes },
              { label: tr('홀수 사이클 (6노드)', 'Odd cycle (6 nodes)'), data: EXAMPLES.no },
            ]}
          />
        }
        rightPanel={
          <RightPanel
            code={<BipartiteCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} />}
            problems={<BipartiteProblemList />}
          />
        }
      />
      <BipartiteInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setMode('example'); pb.reset(true); }}
      />
    </>
  );
}

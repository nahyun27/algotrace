import { useState, useMemo, useCallback } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader, { BackToVisualizationButton, EditGraphButton } from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { useUrlState } from '../../components/algorithm/useUrlState';
import { SegmentedControl, type Tone } from '../../components/ui';
import GraphEditor from '../../components/GraphEditor';
import type { GraphData } from '../../types/graph';
import BFSDFSGraphCanvas from '../../algorithms/bfsdfs/GraphCanvas';
import BFSDFSCodeViewer from '../../algorithms/bfsdfs/CodeViewer';
import BFSDFSProblemList from '../../algorithms/bfsdfs/ProblemList';
import QueueStackDisplay from '../../algorithms/bfsdfs/QueueStackDisplay';
import VisitOrderDisplay from '../../algorithms/bfsdfs/VisitOrderDisplay';
import BFSDFSInfoModal from '../../algorithms/bfsdfs/InfoModal';
import { generateBFSSteps } from '../../algorithms/bfsdfs/solverBFS';
import { generateDFSSteps } from '../../algorithms/bfsdfs/solverDFS';
import { BFS_DFS_DEFAULT_GRAPH } from '../../algorithms/bfsdfs/types';
import type { BaseStep } from '../../algorithms/bfsdfs/types';
import { graphDataToBFSDFS } from './graphConvert';
import { useLang, useTr } from '../../i18n';

type PageMode = 'example' | 'editor';
type BFSDFSMode = 'BFS' | 'DFS';

interface CustomGraph {
  edges: [number, number, number][];
  N: number;
  nodePositions: { id: number; x: number; y: number }[];
}

const STEP_TONE: Record<BaseStep['type'], Tone> = {
  INIT: 'neutral',
  DEQUEUE: 'current',
  POP: 'current',
  DISCOVER: 'candidate',
  ENQUEUE: 'candidate',
  PUSH: 'candidate',
  DONE: 'path',
};

export default function BFSDFSPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [algoMode, setAlgoMode] = useUrlState<BFSDFSMode>('mode', ['BFS', 'DFS'], 'BFS');
  const [mode, setMode] = useState<PageMode>('example');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGraph, setCustomGraph] = useState<CustomGraph | null>(null);

  const steps = useMemo<BaseStep[]>(() => {
    const gen = algoMode === 'BFS' ? generateBFSSteps : generateDFSSteps;
    return customGraph ? gen(customGraph.edges, customGraph.N, lang) : gen(undefined, undefined, lang);
  }, [algoMode, customGraph, lang]);

  const pb = usePlayback(steps.length);
  const step = steps[pb.index];
  const { reset } = pb;
  const numNodes = customGraph?.N ?? BFS_DFS_DEFAULT_GRAPH.nodes.length;

  // Mark the steps where a node's place in the visit order is fixed
  const markers = useMemo(
    () => steps.flatMap((s, i) =>
      i > 0 && s.visitedNodes.length > steps[i - 1].visitedNodes.length ? [{ index: i, tone: 'visited' as Tone }] : []),
    [steps],
  );

  const handleRun = useCallback((data: GraphData): string | null => {
    const { edges, N } = graphDataToBFSDFS(data);
    const sorted = [...data.nodes].sort((a, b) => a.id - b.id);
    setCustomGraph({ edges, N, nodePositions: sorted.map((n, i) => ({ id: i, x: n.x, y: n.y })) });
    reset(true);
    setMode('example');
    return null;
  }, [reset]);

  const handleAlgorithmChange = (next: BFSDFSMode) => {
    setAlgoMode(next);
    pb.reset();
  };

  return (
    <>
      <AlgorithmLayout
        isEditorMode={mode === 'editor'}
        header={
          <AlgorithmHeader
            title={algoMode === 'BFS' ? tr('너비 우선 탐색 (BFS)', 'Breadth-first search (BFS)') : tr('깊이 우선 탐색 (DFS)', 'Depth-first search (DFS)')}
            onInfo={() => setIsModalOpen(true)}
            tabs={
              <SegmentedControl
                id="bfsdfs-mode"
                value={algoMode}
                onChange={handleAlgorithmChange}
                options={[
                  { value: 'BFS', label: tr('BFS (너비 우선)', 'BFS (breadth-first)') },
                  { value: 'DFS', label: tr('DFS (깊이 우선)', 'DFS (depth-first)') },
                ]}
              />
            }
            controls={mode === 'editor' && <BackToVisualizationButton onClick={() => setMode('example')} />}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner tone={STEP_TONE[step.type]} badge={step.type} description={step.description} />
            <div className="relative min-h-[300px] border-b border-border">
              <BFSDFSGraphCanvas
                step={step}
                mode={algoMode}
                customNodes={customGraph?.nodePositions}
                customEdges={customGraph?.edges}
              />
              <EditGraphButton onClick={() => { setMode('editor'); pb.setIsPlaying(false); }} />
            </div>
            <div className="p-3 sm:p-5 flex flex-col lg:flex-row gap-3 lg:gap-4">
              <div className="flex-1 min-w-0"><QueueStackDisplay step={step} mode={algoMode} /></div>
              <div className="flex-1 min-w-0"><VisitOrderDisplay step={step} totalNodes={numNodes} /></div>
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        editor={
          <GraphEditor
            initialData={BFS_DFS_DEFAULT_GRAPH}
            maxNodes={10}
            algorithmType="bfsdfs"
            onRun={handleRun}
            presets={[{ label: tr('트리 예제 (7노드)', 'Tree example (7 nodes)'), data: BFS_DFS_DEFAULT_GRAPH }]}
          />
        }
        rightPanel={
          <RightPanel
            code={<BFSDFSCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} mode={algoMode} />}
            problems={<BFSDFSProblemList />}
          />
        }
      />
      <BFSDFSInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={algoMode}
        onStartVisualization={() => { setMode('example'); pb.reset(true); }}
      />
    </>
  );
}

import { useState, useMemo, useCallback } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader, { BackToVisualizationButton, EditGraphButton } from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import type { Tone } from '../../components/ui';
import GraphEditor from '../../components/GraphEditor';
import type { GraphData } from '../../types/graph';
import { DIJKSTRA_DEFAULT_GRAPH } from '../../types/graph';
import DijkstraGraphCanvas from '../../algorithms/dijkstra/GraphCanvas';
import DijkstraCodeViewer from '../../algorithms/dijkstra/CodeViewer';
import DijkstraProblemList from '../../algorithms/dijkstra/ProblemList';
import DijkstraDistTable from '../../algorithms/dijkstra/DistanceTable';
import DijkstraInfoModal from '../../algorithms/dijkstra/InfoModal';
import { generateDijkstraSteps } from '../../algorithms/dijkstra/solver';
import { buildDijkstraQuiz } from '../../algorithms/dijkstra/quiz';
import type { DijkstraStep, StepType } from '../../algorithms/dijkstra/types';
import { graphDataToDijkstra } from './graphConvert';
import { useLang, useTr } from '../../i18n';

type PageMode = 'example' | 'editor';

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

const STEP_TONE: Record<StepType, Tone> = {
  INIT: 'neutral',
  DEQUEUE: 'current',
  RELAX: 'candidate',
  VISITED: 'visited',
  DONE: 'path',
};

export default function DijkstraPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [mode, setMode] = useState<PageMode>('example');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGraph, setCustomGraph] = useState<ReturnType<typeof graphDataToDijkstra> | null>(null);

  const steps = useMemo(
    () => customGraph
      ? generateDijkstraSteps(customGraph.edges, customGraph.N, lang)
      : generateDijkstraSteps(undefined, undefined, lang),
    [customGraph, lang],
  );
  const quiz = useMemo(() => buildDijkstraQuiz(steps, lang), [steps, lang]);
  const pb = usePlayback(steps.length, { quiz });
  const step = steps[pb.index];

  const shortestEdges = useMemo(() => computeShortestEdges(steps, pb.index), [steps, pb.index]);
  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'VISITED' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [steps],
  );

  const resetPlayback = pb.reset;
  const handleRun = useCallback((data: GraphData): string | null => {
    setCustomGraph(graphDataToDijkstra(data));
    resetPlayback();
    setMode('example');
    return null;
  }, [resetPlayback]);

  const tone = step.type === 'RELAX' && !step.isImprovement ? 'neutral' : STEP_TONE[step.type];

  return (
    <>
      <AlgorithmLayout
        isEditorMode={mode === 'editor'}
        header={
          <AlgorithmHeader
            title={tr('다익스트라 최단 경로', 'Dijkstra shortest path')}
            onInfo={() => setIsModalOpen(true)}
            controls={mode === 'editor' && <BackToVisualizationButton onClick={() => setMode('example')} />}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner tone={tone} badge={step.type} description={step.description} />
            <div className="relative min-h-[300px] border-b border-border">
              <DijkstraGraphCanvas
                step={step}
                shortestEdges={shortestEdges}
                customNodes={customGraph?.nodePositions}
                customEdges={customGraph?.edges}
              />
              <EditGraphButton onClick={() => { setMode('editor'); pb.setIsPlaying(false); }} />
            </div>
            <div className="p-3 sm:p-5">
              <DijkstraDistTable step={step} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        editor={
          <GraphEditor
            initialData={DIJKSTRA_DEFAULT_GRAPH}
            maxNodes={8}
            algorithmType="dijkstra"
            onRun={handleRun}
            presets={[{ label: tr('다익스트라 예제 (5노드)', 'Dijkstra example (5 nodes)'), data: DIJKSTRA_DEFAULT_GRAPH }]}
          />
        }
        rightPanel={
          <RightPanel
            code={<DijkstraCodeViewer codeLine={mode === 'example' ? step.codeLine : 0} />}
            problems={<DijkstraProblemList />}
          />
        }
      />
      <DijkstraInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => { setMode('example'); pb.reset(true); }}
      />
    </>
  );
}

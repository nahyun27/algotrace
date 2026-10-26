import { useState, useMemo } from 'react';
import { Route } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, cn, type Tone } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import FWGraphCanvas from '../../algorithms/floydwarshall/GraphCanvas';
import FWCodeViewer from '../../algorithms/floydwarshall/CodeViewer';
import FWProblemList from '../../algorithms/floydwarshall/ProblemList';
import FWDistMatrix from '../../algorithms/floydwarshall/DistMatrix';
import FWInfoModal from '../../algorithms/floydwarshall/InfoModal';
import { generateFloydWarshallSteps, reconstructPath } from '../../algorithms/floydwarshall/solver';
import { FW_N, INF } from '../../algorithms/floydwarshall/types';
import type { FWStepType } from '../../algorithms/floydwarshall/types';
import { useLang, useTr } from '../../i18n';

/* ─────────────── Floyd-Warshall Page ─────────────── */

const STEP_TONE: Record<FWStepType, Tone> = {
  INIT: 'neutral',
  ROUND_START: 'current',
  UPDATE: 'candidate',
  NO_UPDATE: 'neutral',
  NEGATIVE_CYCLE: 'danger',
  DONE: 'path',
};

const nodeOptions = Array.from({ length: FW_N }, (_, i) => i);

const selectClass = 'h-8 rounded-lg border border-border bg-card px-2 text-xs font-mono font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40';

export default function FloydWarshallPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pathFrom, setPathFrom] = useState<number>(0);
  const [pathTo, setPathTo] = useState<number>(FW_N - 1);
  const [showPath, setShowPath] = useState(false);

  const steps = useMemo(() => generateFloydWarshallSteps(lang), [lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index];
  const isDone = step.type === 'DONE';

  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'ROUND_START' ? [{ index: i, tone: 'current' as Tone }] : [])),
    [steps],
  );

  const pathNodes = useMemo(() => {
    if (!showPath || !isDone) return [];
    return reconstructPath(step.nextMatrix, pathFrom, pathTo);
  }, [showPath, isDone, step.nextMatrix, pathFrom, pathTo]);

  const pathDist = step.distMatrix[pathFrom]?.[pathTo];

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('플로이드-워셜 최단 경로', 'Floyd-Warshall shortest paths')}
            onInfo={() => setIsModalOpen(true)}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={step.currentK !== null && <Badge tone="current" outline>k = {step.currentK}</Badge>}
            />
            {isDone && (
              <div className="px-4 sm:px-5 py-2.5 border-b border-border bg-state-path/5 flex items-center gap-3 flex-wrap text-sm">
                <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold', toneText.path)}>
                  <Route className="w-3.5 h-3.5" />
                  {tr('경로 탐색', 'Path finder')}
                </span>
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  {tr('출발', 'From')}
                  <select
                    value={pathFrom}
                    onChange={e => { setPathFrom(Number(e.target.value)); setShowPath(false); }}
                    className={selectClass}
                  >
                    {nodeOptions.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  {tr('도착', 'To')}
                  <select
                    value={pathTo}
                    onChange={e => { setPathTo(Number(e.target.value)); setShowPath(false); }}
                    className={selectClass}
                  >
                    {nodeOptions.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <Button
                  variant={showPath ? 'primary' : 'soft'}
                  onClick={() => setShowPath(p => !p)}
                  disabled={pathFrom === pathTo}
                >
                  {showPath ? tr('경로 숨기기', 'Hide path') : tr('경로 보기', 'Show path')}
                </Button>
                {showPath && pathNodes.length > 0 && (
                  <Badge tone="path" outline className="font-mono text-xs">
                    {pathNodes.join(' → ')}
                    <span className="font-sans font-semibold opacity-80">
                      ({tr('거리', 'distance')}: {pathDist >= INF ? '∞' : pathDist})
                    </span>
                  </Badge>
                )}
                {showPath && pathNodes.length === 0 && (
                  <Badge tone="danger" outline className="text-xs">{tr('경로 없음', 'No path')}</Badge>
                )}
              </div>
            )}
            <div className="relative min-h-[260px] border-b border-border">
              <FWGraphCanvas step={step} pathNodes={pathNodes} />
            </div>
            <div className="p-3 sm:p-5">
              <FWDistMatrix step={step} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<FWCodeViewer codeLine={step.codeLine} />}
            problems={<FWProblemList />}
          />
        }
      />
      <FWInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStartVisualization={() => pb.reset(true)} />
    </>
  );
}

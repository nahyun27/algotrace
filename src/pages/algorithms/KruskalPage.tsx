import { useState, useMemo } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, SegmentedControl, type Tone } from '../../components/ui';
import KruskalGraphCanvas from '../../algorithms/kruskal/GraphCanvas';
import KruskalCodeViewer from '../../algorithms/kruskal/CodeViewer';
import KruskalProblemList from '../../algorithms/kruskal/ProblemList';
import UnionFindDisplay from '../../algorithms/kruskal/UnionFindDisplay';
import KruskalEdgeList from '../../algorithms/kruskal/EdgeList';
import KruskalInfoModal from '../../algorithms/kruskal/InfoModal';
import MstResult from '../../algorithms/kruskal/MstResult';
import { generateKruskalSteps } from '../../algorithms/kruskal/solver';
import { KRUSKAL_N, KRUSKAL_NODES, KRUSKAL_EDGES } from '../../algorithms/kruskal/types';
import type { KruskalStepType } from '../../algorithms/kruskal/types';
import PrimGraphCanvas from '../../algorithms/prim/GraphCanvas';
import PrimCodeViewer from '../../algorithms/prim/CodeViewer';
import PrimProblemList from '../../algorithms/prim/ProblemList';
import PrimKeyTable from '../../algorithms/prim/KeyTable';
import PrimPriorityQueue from '../../algorithms/prim/PriorityQueue';
import PrimInfoModal from '../../algorithms/prim/InfoModal';
import { generatePrimSteps } from '../../algorithms/prim/solver';
import type { PrimStepType } from '../../algorithms/prim/types';
import { useLang, useTr } from '../../i18n';

type KruskalPrimTab = 'kruskal' | 'prim';

const KRUSKAL_TONE: Record<KruskalStepType, Tone> = {
  INIT: 'neutral',
  CONSIDER: 'candidate',
  FIND: 'current',
  ACCEPT: 'visited',
  REJECT: 'danger',
  DONE: 'path',
};

const PRIM_TONE: Record<PrimStepType, Tone> = {
  INIT: 'neutral',
  EXTRACT_MIN: 'current',
  ALREADY_IN_MST: 'neutral',
  ADD_TO_MST: 'visited',
  UPDATE: 'candidate',
  DONE: 'path',
};

export default function KruskalPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [tab, setTab] = useState<KruskalPrimTab>('kruskal');
  const [isKruskalModalOpen, setKruskalModal] = useState(false);
  const [isPrimModalOpen, setPrimModal] = useState(false);

  const kruskalSteps = useMemo(() => generateKruskalSteps(KRUSKAL_NODES, KRUSKAL_EDGES, KRUSKAL_N, lang), [lang]);
  const primSteps = useMemo(() => generatePrimSteps(KRUSKAL_NODES, KRUSKAL_EDGES, KRUSKAL_N, lang), [lang]);

  // Separate playback (and step index) per tab
  const kPb = usePlayback(kruskalSteps.length);
  const pPb = usePlayback(primSteps.length);
  const kStep = kruskalSteps[kPb.index];
  const pStep = primSteps[pPb.index];

  const kMarkers = useMemo(
    () => kruskalSteps.flatMap((s, i) =>
      s.type === 'ACCEPT' ? [{ index: i, tone: 'visited' as Tone }]
        : s.type === 'REJECT' ? [{ index: i, tone: 'danger' as Tone }]
        : []),
    [kruskalSteps],
  );
  const pMarkers = useMemo(
    () => primSteps.flatMap((s, i) => (s.type === 'ADD_TO_MST' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [primSteps],
  );

  const handleTabChange = (newTab: KruskalPrimTab) => {
    setTab(newTab);
    kPb.setIsPlaying(false);
    pPb.setIsPlaying(false);
  };

  const isKruskal = tab === 'kruskal';

  const header = (
    <AlgorithmHeader
      title={isKruskal ? tr('크루스칼 MST', "Kruskal's MST") : tr('프림 MST', "Prim's MST")}
      onInfo={() => (isKruskal ? setKruskalModal(true) : setPrimModal(true))}
      tabs={
        <SegmentedControl
          id="kruskal-prim-tab"
          value={tab}
          onChange={handleTabChange}
          options={[
            { value: 'kruskal', label: tr('크루스칼', 'Kruskal') },
            { value: 'prim', label: tr('프림', 'Prim') },
          ]}
        />
      }
    />
  );

  const kruskalMst = (
    <MstResult edges={kStep.mstEdges} totalCost={kStep.totalCost} isDone={kStep.type === 'DONE'} />
  );

  const kruskalView = (
    <div className="flex flex-col">
      <StepBanner
        tone={KRUSKAL_TONE[kStep.type]}
        badge={kStep.type}
        description={kStep.description}
        aside={<Badge tone="path">{tr('비용', 'cost')} <span className="font-mono">{kStep.totalCost}</span></Badge>}
      />
      <div className="flex flex-col 2xl:flex-row border-b border-border">
        <div className="flex-1 min-w-0 min-h-[300px]">
          <KruskalGraphCanvas step={kStep} nodes={KRUSKAL_NODES} edges={KRUSKAL_EDGES} />
        </div>
        <div className="hidden 2xl:block w-[280px] shrink-0 p-3 border-l border-border max-h-[480px]">
          <KruskalEdgeList step={kStep} />
        </div>
      </div>
      <div className="p-3 sm:p-5 flex flex-col gap-3 2xl:flex-row 2xl:gap-4">
        <div className="flex-1 min-w-0 min-h-[240px]">
          <UnionFindDisplay step={kStep} N={KRUSKAL_N} />
        </div>
        <div className="hidden 2xl:block w-[220px] shrink-0">{kruskalMst}</div>
        <div className="2xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="max-h-[300px] min-h-0 flex flex-col"><KruskalEdgeList step={kStep} /></div>
          <div className="max-h-[300px] min-h-0 flex flex-col">{kruskalMst}</div>
        </div>
      </div>
    </div>
  );

  const primView = (
    <div className="flex flex-col">
      <StepBanner
        tone={PRIM_TONE[pStep.type]}
        badge={pStep.type}
        description={pStep.description}
        aside={<Badge tone="path">{tr('비용', 'cost')} <span className="font-mono">{pStep.totalCost}</span></Badge>}
      />
      <div className="min-h-[300px] border-b border-border">
        <PrimGraphCanvas step={pStep} nodes={KRUSKAL_NODES} edges={KRUSKAL_EDGES} />
      </div>
      <div className="p-3 sm:p-5 flex flex-col gap-3 lg:flex-row lg:gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <PrimKeyTable step={pStep} N={KRUSKAL_N} />
          <PrimPriorityQueue pq={pStep.pq} />
        </div>
        <div className="w-full lg:w-[220px] shrink-0">
          <MstResult
            edges={pStep.mstEdges}
            totalCost={pStep.totalCost}
            isDone={pStep.type === 'DONE'}
            doneLabel={tr('크루스칼과 동일', 'Same as Kruskal')}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AlgorithmLayout
        header={header}
        scrollable={isKruskal ? kruskalView : primView}
        stepController={
          isKruskal
            ? <StepController {...kPb.controller} markers={kMarkers} />
            : <StepController {...pPb.controller} markers={pMarkers} />
        }
        rightPanel={
          <RightPanel
            code={isKruskal ? <KruskalCodeViewer codeLine={kStep.codeLine} /> : <PrimCodeViewer codeLine={pStep.codeLine} />}
            problems={isKruskal ? <KruskalProblemList /> : <PrimProblemList />}
          />
        }
      />
      <KruskalInfoModal
        isOpen={isKruskalModalOpen}
        onClose={() => setKruskalModal(false)}
        onStartVisualization={() => kPb.reset(true)}
      />
      <PrimInfoModal
        isOpen={isPrimModalOpen}
        onClose={() => setPrimModal(false)}
        onStartVisualization={() => pPb.reset(true)}
      />
    </>
  );
}

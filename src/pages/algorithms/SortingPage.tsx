import { useState, useMemo } from 'react';
import { Scale, Shuffle, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, SegmentedControl, type Tone } from '../../components/ui';
import SortingArrayCanvas from '../../algorithms/sorting/ArrayCanvas';
import SortingCodeViewer from '../../algorithms/sorting/CodeViewer';
import SortingProblemList from '../../algorithms/sorting/ProblemList';
import { SortAlgoModal, SortCompareModal } from '../../algorithms/sorting/InfoModal';
import { DEFAULT_ARRAY, SORT_LABELS } from '../../algorithms/sorting/types';
import type { SortStep, SortAlgorithm, SortStepType } from '../../algorithms/sorting/types';
import { generateBubbleSortSteps } from '../../algorithms/sorting/bubbleSort';
import { generateSelectionSortSteps } from '../../algorithms/sorting/selectionSort';
import { generateInsertionSortSteps } from '../../algorithms/sorting/insertionSort';
import { generateMergeSortSteps } from '../../algorithms/sorting/mergeSort';
import { generateQuickSortSteps } from '../../algorithms/sorting/quickSort';
import { generateHeapSortSteps } from '../../algorithms/sorting/heapSort';
import { useLang, useTr, type Lang } from '../../i18n';

/* ─────────────── Sorting Page ─────────────── */

const SORT_TABS: SortAlgorithm[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'];

const SORT_GENERATORS: Record<SortAlgorithm, (arr: number[], lang: Lang) => SortStep[]> = {
  bubble: generateBubbleSortSteps,
  selection: generateSelectionSortSteps,
  insertion: generateInsertionSortSteps,
  merge: generateMergeSortSteps,
  quick: generateQuickSortSteps,
  heap: generateHeapSortSteps,
};

const STEP_TONE: Record<SortStepType, Tone> = {
  INIT: 'neutral',
  COMPARE: 'candidate',
  SWAP: 'danger',
  SET: 'candidate',
  PIVOT: 'current',
  SORTED: 'visited',
  DONE: 'path',
};

export default function SortingPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [algorithm, setAlgorithm] = useState<SortAlgorithm>('bubble');
  const [isAlgoModalOpen, setAlgoModalOpen] = useState(false);
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);
  const [inputArray, setInputArray] = useState<number[]>(DEFAULT_ARRAY);
  const [inputText, setInputText] = useState('');

  const steps = useMemo<SortStep[]>(
    () => SORT_GENERATORS[algorithm](inputArray, lang),
    [algorithm, inputArray, lang],
  );
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'SORTED' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [steps],
  );

  const handleAlgorithmChange = (algo: SortAlgorithm) => {
    setAlgorithm(algo);
    pb.reset();
  };

  const loadArray = (arr: number[]) => {
    setInputArray(arr);
    pb.reset();
  };

  const handleRandomArray = () => {
    loadArray(Array.from({ length: 12 }, () => Math.floor(Math.random() * 90) + 5));
  };

  const handleReversed = () => {
    loadArray(Array.from({ length: 12 }, (_, i) => 12 - i).map(v => v * 7));
  };

  const handleNearlySorted = () => {
    loadArray([3, 7, 9, 10, 15, 27, 29, 38, 52, 43, 64, 82]); // almost sorted
  };

  const handleCustomInput = () => {
    const parsed = inputText.split(/[,\s]+/).map(Number).filter(v => !isNaN(v) && v > 0);
    if (parsed.length >= 2 && parsed.length <= 20) {
      loadArray(parsed);
      setInputText('');
    }
  };

  const label = SORT_LABELS[algorithm][lang];

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={label}
            onInfo={() => setAlgoModalOpen(true)}
            tabs={
              <SegmentedControl
                id="sorting-algorithm"
                value={algorithm}
                onChange={handleAlgorithmChange}
                options={SORT_TABS.map(algo => ({ value: algo, label: SORT_LABELS[algo][lang] }))}
              />
            }
            controls={
              <Button variant="secondary" onClick={() => setCompareModalOpen(true)}>
                <Scale className="w-3.5 h-3.5" />
                {tr('정렬 비교', 'Compare sorts')}
              </Button>
            }
          />
        }
        editor={
          <div className="flex flex-col h-full min-h-0">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={
                <>
                  <Badge tone="candidate" className="font-mono">{tr('비교', 'Cmp')} {step.compares}</Badge>
                  <Badge tone="danger" className="font-mono">{tr('교환', 'Swap')} {step.swaps}</Badge>
                </>
              }
            />
            {/* Array canvas — grows to fill all remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden border-y border-border">
              <SortingArrayCanvas step={step} />
            </div>
            {/* Array controls */}
            <div className="shrink-0 px-3 sm:px-5 py-2.5 flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={handleRandomArray}>
                <Shuffle className="w-3.5 h-3.5" />
                {tr('랜덤', 'Random')}
              </Button>
              <Button variant="secondary" onClick={handleReversed}>
                <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                {tr('역순', 'Reversed')}
              </Button>
              <Button variant="secondary" onClick={handleNearlySorted}>
                <ArrowUpNarrowWide className="w-3.5 h-3.5" />
                {tr('거의 정렬', 'Nearly sorted')}
              </Button>
              <form
                className="flex items-center gap-2 ml-auto"
                onSubmit={e => { e.preventDefault(); handleCustomInput(); }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="3, 7, 1, 9, ..."
                  aria-label={tr('직접 입력 (2~20개, 쉼표로 구분)', 'Custom array (2–20 numbers, comma-separated)')}
                  title={tr('직접 입력 (2~20개, 쉼표로 구분)', 'Custom array (2–20 numbers, comma-separated)')}
                  className="h-8 w-32 sm:w-40 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
              </form>
            </div>
            {/* Step controller fixed at bottom */}
            <div className="shrink-0 border-t border-border">
              <StepController {...pb.controller} markers={markers} />
            </div>
          </div>
        }
        isEditorMode={true}
        rightPanel={
          <RightPanel
            code={<SortingCodeViewer codeLine={step.codeLine} algorithm={algorithm} />}
            problems={<SortingProblemList />}
          />
        }
      />
      <SortAlgoModal
        isOpen={isAlgoModalOpen}
        onClose={() => setAlgoModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
        algorithm={algorithm}
      />
      <SortCompareModal isOpen={isCompareModalOpen} onClose={() => setCompareModalOpen(false)} />
    </>
  );
}

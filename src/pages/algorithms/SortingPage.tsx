import { useState, useMemo } from 'react';
import { Scale, Shuffle, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { useUrlState } from '../../components/algorithm/useUrlState';
import { Badge, Button, SegmentedControl, cn, type Tone } from '../../components/ui';
import { toneSoft, toneText } from '../../components/ui/tone';
import SortingArrayCanvas from '../../algorithms/sorting/ArrayCanvas';
import SortingCodeViewer from '../../algorithms/sorting/CodeViewer';
import SortingProblemList from '../../algorithms/sorting/ProblemList';
import { SortAlgoModal, SortCompareModal } from '../../algorithms/sorting/InfoModal';
import SortingDistributionView from '../../algorithms/sorting/DistributionView';
import { COUNTING_MAX, DEFAULT_ARRAY, DISTRIBUTION_SORTS, SORT_LABELS, sanitizeInput } from '../../algorithms/sorting/types';
import type { SortStep, SortAlgorithm, SortStepType } from '../../algorithms/sorting/types';
import { generateBubbleSortSteps } from '../../algorithms/sorting/bubbleSort';
import { buildBubbleQuiz } from '../../algorithms/sorting/quiz';
import { generateSelectionSortSteps } from '../../algorithms/sorting/selectionSort';
import { generateInsertionSortSteps } from '../../algorithms/sorting/insertionSort';
import { generateMergeSortSteps } from '../../algorithms/sorting/mergeSort';
import { generateQuickSortSteps } from '../../algorithms/sorting/quickSort';
import { generateHeapSortSteps } from '../../algorithms/sorting/heapSort';
import { generateCountingSortSteps } from '../../algorithms/sorting/countingSort';
import { generateRadixSortSteps } from '../../algorithms/sorting/radixSort';
import { useLang, useTr, type Lang } from '../../i18n';

/* ─────────────── Sorting Page ─────────────── */

const SORT_TABS: SortAlgorithm[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'counting', 'radix'];

const SORT_GENERATORS: Record<SortAlgorithm, (arr: number[], lang: Lang) => SortStep[]> = {
  bubble: generateBubbleSortSteps,
  selection: generateSelectionSortSteps,
  insertion: generateInsertionSortSteps,
  merge: generateMergeSortSteps,
  quick: generateQuickSortSteps,
  heap: generateHeapSortSteps,
  counting: generateCountingSortSteps,
  radix: generateRadixSortSteps,
};

const STEP_TONE: Record<SortStepType, Tone> = {
  INIT: 'neutral',
  COMPARE: 'candidate',
  SWAP: 'danger',
  SET: 'candidate',
  PIVOT: 'current',
  SORTED: 'visited',
  DONE: 'path',
  COUNT: 'candidate',
  PREFIX: 'candidate',
  PLACE: 'current',
  DIGIT_PASS: 'current',
  BUCKET: 'candidate',
  COLLECT: 'current',
};

const MARKER_TONE: Partial<Record<SortStepType, Tone>> = {
  SORTED: 'visited',
  DIGIT_PASS: 'current',
};

export default function SortingPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [algorithm, setAlgorithm] = useUrlState<SortAlgorithm>('algo', Object.keys(SORT_GENERATORS) as SortAlgorithm[], 'bubble');
  const [isAlgoModalOpen, setAlgoModalOpen] = useState(false);
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);
  const [inputArray, setInputArray] = useState<number[]>(DEFAULT_ARRAY);
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState(false);
  const isDistribution = DISTRIBUTION_SORTS.includes(algorithm);

  const sanitized = useMemo(() => sanitizeInput(algorithm, inputArray), [algorithm, inputArray]);
  const steps = useMemo<SortStep[]>(
    () => SORT_GENERATORS[algorithm](sanitized.array, lang),
    [algorithm, sanitized, lang],
  );
  const quiz = useMemo(() => (algorithm === 'bubble' ? buildBubbleQuiz(steps, lang) : undefined), [algorithm, steps, lang]);
  const pb = usePlayback(steps.length, { quiz });
  const step = steps[pb.index] ?? steps[0];

  const markers = useMemo(
    () => steps.flatMap((s, i) => {
      // counting sort: mark where the prefix-sum and placing phases begin
      const phaseStart = (s.type === 'PREFIX' || s.type === 'PLACE') && steps[i - 1]?.type !== s.type;
      const tone = MARKER_TONE[s.type] ?? (phaseStart ? 'candidate' : undefined);
      return tone ? [{ index: i, tone }] : [];
    }),
    [steps],
  );

  const handleAlgorithmChange = (algo: SortAlgorithm) => {
    setAlgorithm(algo);
    setInputError(false);
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
    if (isDistribution) {
      // counting / radix sort need non-negative integers (counting: 0..COUNTING_MAX)
      const tokens = inputText.split(/[,\s]+/).filter(Boolean);
      const values = tokens.map(Number);
      const hi = algorithm === 'counting' ? COUNTING_MAX : 999_999;
      const ok = values.length >= 2 && values.length <= 20 && values.every(v => Number.isInteger(v) && v >= 0 && v <= hi);
      setInputError(!ok);
      if (ok) {
        loadArray(values);
        setInputText('');
      }
      return;
    }
    const parsed = inputText.split(/[,\s]+/).map(Number).filter(v => !isNaN(v) && v > 0);
    if (parsed.length >= 2 && parsed.length <= 20) {
      loadArray(parsed);
      setInputText('');
    }
  };

  const label = SORT_LABELS[algorithm][lang];
  const inputHint = algorithm === 'counting'
    ? tr(`직접 입력 (0~${COUNTING_MAX} 정수 2~20개, 쉼표로 구분)`, `Custom array (2 to 20 integers from 0 to ${COUNTING_MAX}, comma-separated)`)
    : algorithm === 'radix'
      ? tr('직접 입력 (0 이상 정수 2~20개, 쉼표로 구분)', 'Custom array (2 to 20 non-negative integers, comma-separated)')
      : tr('직접 입력 (2~20개, 쉼표로 구분)', 'Custom array (2~20 numbers, comma-separated)');

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
                options={SORT_TABS.map(algo => ({ value: algo, label: SORT_LABELS[algo][lang].replace(/ (sort|정렬)$/, '') }))}
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
                  <Badge tone="danger" className="font-mono">
                    {isDistribution ? tr('이동', 'Moves') : tr('교환', 'Swap')} {step.swaps}
                  </Badge>
                </>
              }
            />
            {isDistribution && sanitized.adjusted && (
              <p role="status" className={cn('shrink-0 px-3 sm:px-5 py-1.5 text-xs font-medium border-t border-border', toneSoft.candidate)}>
                {algorithm === 'counting'
                  ? tr(`계수 정렬은 0~${COUNTING_MAX} 정수만 다뤄서, 값을 그 범위의 정수로 맞췄어요.`, `Counting sort only handles integers from 0 to ${COUNTING_MAX}, so values were rounded and clamped into that range.`)
                  : tr('기수 정렬은 0 이상의 정수만 다뤄서, 값을 정수로 맞췄어요.', 'Radix sort only handles non-negative integers, so values were rounded.')}
              </p>
            )}
            {isDistribution ? (
              <div className="flex-1 min-h-0 flex flex-col border-y border-border overflow-hidden">
                {/* Bars keep their height (with legend); the count array / buckets shrink and scroll below them */}
                <div className="flex-1 min-h-[220px] sm:min-h-[260px]">
                  <SortingArrayCanvas step={step} algorithm={algorithm} />
                </div>
                <div className="min-h-[96px] max-h-[58%] overflow-y-auto border-t border-border bg-card">
                  <SortingDistributionView step={step} algorithm={algorithm} />
                </div>
              </div>
            ) : (
              /* Array canvas: grows to fill all remaining space */
              <div className="flex-1 min-h-0 overflow-hidden border-y border-border">
                <SortingArrayCanvas step={step} />
              </div>
            )}
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
                  onChange={e => { setInputText(e.target.value); setInputError(false); }}
                  placeholder="3, 7, 1, 9, ..."
                  aria-label={inputHint}
                  aria-invalid={inputError}
                  title={inputHint}
                  className="h-8 w-32 sm:w-40 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
              </form>
              {inputError && (
                <p role="alert" className={cn('basis-full text-xs font-medium sm:text-right', toneText.danger)}>
                  {algorithm === 'counting'
                    ? tr(`계수 정렬은 0~${COUNTING_MAX} 사이의 정수를 2~20개 넣어 주세요. 예: 4, 0, 7, 4, 2`, `Counting sort needs 2 to 20 whole numbers between 0 and ${COUNTING_MAX}, e.g. 4, 0, 7, 4, 2`)
                    : tr('기수 정렬은 0 이상의 정수를 2~20개 넣어 주세요. 예: 170, 45, 75, 90, 802', 'Radix sort needs 2 to 20 non-negative whole numbers, e.g. 170, 45, 75, 90, 802')}
                </p>
              )}
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

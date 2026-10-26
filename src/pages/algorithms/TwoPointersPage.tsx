import { useState, useMemo } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, SegmentedControl, type Tone } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { SumStage, MatchList, WindowStage, WindowSums } from '../../algorithms/two-pointers/WindowCanvas';
import TwoPointersCodeViewer from '../../algorithms/two-pointers/CodeViewer';
import TwoPointersProblemList from '../../algorithms/two-pointers/ProblemList';
import TwoPointersInfoModal from '../../algorithms/two-pointers/InfoModal';
import { generateSubarraySumSteps, generateSlidingWindowSteps } from '../../algorithms/two-pointers/solver';
import {
  DEFAULT_SUM, DEFAULT_WINDOW,
  type SumStepType, type TPVariant, type WindowStepType,
} from '../../algorithms/two-pointers/types';
import { useLang, useTr } from '../../i18n';

const SUM_TONE: Record<SumStepType, Tone> = {
  INIT: 'neutral',
  EXPAND: 'current',
  SHRINK: 'candidate',
  MATCH: 'path',
  DONE: 'path',
};

const WINDOW_TONE: Record<WindowStepType, Tone> = {
  INIT: 'neutral',
  SLIDE: 'candidate',
  BEST: 'path',
  DONE: 'path',
};

interface SumInput { arr: number[]; m: number }
interface WindowInput { arr: number[]; k: number }

const parseNums = (text: string) => text.split(/[,\s]+/).filter(Boolean).map(Number);

const inputClass =
  'h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

/** Array + one number input. Keyed by variant so the drafts reset when switching tabs. */
function InputBar({ arr, num, numLabel, hint, validate, onApply }: {
  arr: number[];
  num: number;
  numLabel: string;
  hint: string;
  validate: (arr: number[], num: number) => string | null;
  onApply: (arr: number[], num: number) => void;
}) {
  const tr = useTr();
  const [arrText, setArrText] = useState(arr.join(', '));
  const [numText, setNumText] = useState(String(num));
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const nums = parseNums(arrText);
    const n = Number(numText);
    const err = validate(nums, n);
    setError(err);
    if (!err) onApply(nums, n);
  };

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); apply(); }}>
      <label className="text-xs font-semibold text-muted-foreground">{tr('배열', 'Array')}</label>
      <input
        type="text"
        value={arrText}
        onChange={e => setArrText(e.target.value)}
        aria-label={tr('배열 (쉼표로 구분)', 'Array (comma-separated)')}
        className={`${inputClass} flex-1 min-w-[180px]`}
      />
      <label className="text-xs font-semibold text-muted-foreground">{numLabel}</label>
      <input
        type="text"
        inputMode="numeric"
        value={numText}
        onChange={e => setNumText(e.target.value)}
        aria-label={numLabel}
        className={`${inputClass} w-16`}
      />
      <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
      <p className={`w-full text-[11px] ${error ? `${toneText.danger} font-semibold` : 'text-hint'}`}>{error ?? hint}</p>
    </form>
  );
}

export default function TwoPointersPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [variant, setVariant] = useState<TPVariant>('sum');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sumInput, setSumInput] = useState<SumInput>(DEFAULT_SUM);
  const [windowInput, setWindowInput] = useState<WindowInput>(DEFAULT_WINDOW);

  const sumSteps = useMemo(() => generateSubarraySumSteps(sumInput.arr, sumInput.m, lang), [sumInput, lang]);
  const windowSteps = useMemo(() => generateSlidingWindowSteps(windowInput.arr, windowInput.k, lang), [windowInput, lang]);
  const total = variant === 'sum' ? sumSteps.length : windowSteps.length;
  const pb = usePlayback(total);
  const i = Math.min(pb.index, total - 1);
  const sumStep = sumSteps[Math.min(i, sumSteps.length - 1)];
  const windowStep = windowSteps[Math.min(i, windowSteps.length - 1)];
  const step = variant === 'sum' ? sumStep : windowStep;
  const tone = variant === 'sum' ? SUM_TONE[sumStep.type] : WINDOW_TONE[windowStep.type];

  const markers = useMemo(
    () => variant === 'sum'
      ? sumSteps.flatMap((s, idx) => (s.type === 'MATCH' ? [{ index: idx, tone: 'path' as Tone }] : []))
      : windowSteps.flatMap((s, idx) => (s.type === 'BEST' ? [{ index: idx, tone: 'path' as Tone }] : [])),
    [variant, sumSteps, windowSteps],
  );

  const changeVariant = (v: TPVariant) => { setVariant(v); pb.reset(); };

  const validateSum = (arr: number[], m: number) => {
    if (arr.length < 1 || arr.length > 14 || arr.some(v => !Number.isInteger(v) || v < 1 || v > 99)) {
      return tr('배열은 1~99 사이 양의 정수 1~14개로 입력해 주세요.', 'Enter 1 to 14 positive integers between 1 and 99.');
    }
    if (!Number.isInteger(m) || m < 1 || m > 9999) return tr('M은 1 이상의 정수로 입력해 주세요.', 'M must be a positive integer.');
    return null;
  };
  const validateWindow = (arr: number[], k: number) => {
    if (arr.length < 1 || arr.length > 14 || arr.some(v => !Number.isInteger(v) || Math.abs(v) > 99)) {
      return tr('배열은 -99~99 사이 정수 1~14개로 입력해 주세요.', 'Enter 1 to 14 integers between -99 and 99.');
    }
    if (!Number.isInteger(k) || k < 1 || k > arr.length) {
      return tr(`k는 1 이상 ${arr.length} 이하 정수여야 해요.`, `k must be an integer from 1 to ${arr.length}.`);
    }
    return null;
  };

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('투 포인터', 'Two pointers')}
            onInfo={() => setIsModalOpen(true)}
            tabs={
              <SegmentedControl
                id="two-pointers-variant"
                value={variant}
                onChange={changeVariant}
                options={[
                  { value: 'sum', label: tr('구간 합', 'Subarray sum') },
                  { value: 'window', label: tr('슬라이딩 윈도우', 'Sliding window') },
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
              aside={variant === 'sum' ? (
                <>
                  <Badge tone="candidate" className="font-mono">{tr('합', 'Sum')} {sumStep.total}</Badge>
                  <Badge tone="path" className="font-mono">{tr('찾음', 'Found')} {sumStep.count}</Badge>
                </>
              ) : (
                <>
                  <Badge tone="candidate" className="font-mono">{tr('합', 'Sum')} {windowStep.total}</Badge>
                  <Badge tone="path" className="font-mono">{tr('최댓값', 'Best')} {windowStep.best}</Badge>
                </>
              )}
            />
            <div className="border-b border-border">
              {variant === 'sum'
                ? <SumStage step={sumStep} arr={sumInput.arr} />
                : <WindowStage step={windowStep} arr={windowInput.arr} />}
            </div>
            <div className="p-3 sm:p-5 flex flex-col gap-4">
              {variant === 'sum'
                ? <MatchList step={sumStep} arr={sumInput.arr} m={sumInput.m} />
                : <WindowSums step={windowStep} k={windowInput.k} />}
              {variant === 'sum' ? (
                <InputBar
                  key="sum"
                  arr={sumInput.arr}
                  num={sumInput.m}
                  numLabel="M"
                  hint={tr('BOJ 2003 수들의 합 2: 합이 정확히 M인 연속 구간의 개수를 세요.', 'BOJ 2003: count contiguous subarrays whose sum is exactly M.')}
                  validate={validateSum}
                  onApply={(arr, m) => { setSumInput({ arr, m }); pb.reset(); }}
                />
              ) : (
                <InputBar
                  key="window"
                  arr={windowInput.arr}
                  num={windowInput.k}
                  numLabel="k"
                  hint={tr('BOJ 2559 수열: 연속 k개의 합 중 최댓값을 구해요.', 'BOJ 2559: find the maximum sum of k consecutive elements.')}
                  validate={validateWindow}
                  onApply={(arr, k) => { setWindowInput({ arr, k }); pb.reset(); }}
                />
              )}
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<TwoPointersCodeViewer codeLine={step.codeLine} variant={variant} />}
            problems={<TwoPointersProblemList />}
          />
        }
      />
      <TwoPointersInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

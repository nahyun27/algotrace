import { useState, useMemo, type ReactNode } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, SegmentedControl, cn, type Tone } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { QuadraticView, FastView } from '../../algorithms/lis/LISView';
import LISCodeViewer from '../../algorithms/lis/CodeViewer';
import LISProblemList from '../../algorithms/lis/ProblemList';
import LISInfoModal from '../../algorithms/lis/InfoModal';
import { generateFastSteps, generateQuadraticSteps, parseArray } from '../../algorithms/lis/solver';
import { DEFAULT_ARRAY, MAX_ABS, MAX_LEN } from '../../algorithms/lis/types';
import type { FastStep, FastStepType, LISVariant, QuadStep, QuadStepType } from '../../algorithms/lis/types';
import { useLang, useTr } from '../../i18n';

const QUAD_TONE: Record<QuadStepType, Tone> = {
  INIT: 'neutral',
  NEXT_I: 'current',
  COMPARE: 'candidate',
  UPDATE: 'visited',
  BACKTRACK: 'path',
  DONE: 'path',
};

const FAST_TONE: Record<FastStepType, Tone> = {
  INIT: 'neutral',
  SEARCH: 'candidate',
  REPLACE: 'current',
  APPEND: 'visited',
  BACKTRACK: 'path',
  DONE: 'path',
};

type Steps = { variant: 'quadratic'; steps: QuadStep[] } | { variant: 'fast'; steps: FastStep[] };

export default function LISPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [variant, setVariant] = useState<LISVariant>('quadratic');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [input, setInput] = useState<number[]>(DEFAULT_ARRAY);
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState(false);

  const run = useMemo<Steps>(
    () => variant === 'quadratic'
      ? { variant, steps: generateQuadraticSteps(input, lang) }
      : { variant, steps: generateFastSteps(input, lang) },
    [variant, input, lang],
  );
  const pb = usePlayback(run.steps.length);
  const index = Math.min(pb.index, run.steps.length - 1);

  const markers = useMemo(
    () => run.variant === 'quadratic'
      ? run.steps.flatMap((s, i) => (s.type === 'UPDATE' ? [{ index: i, tone: 'visited' as Tone }] : []))
      : run.steps.flatMap((s, i) => (s.type === 'APPEND' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [run],
  );

  const changeVariant = (v: LISVariant) => {
    setVariant(v);
    pb.reset();
  };

  const loadArray = (arr: number[]) => {
    setInput(arr);
    setInputError(false);
    pb.reset();
  };

  const handleCustomInput = () => {
    const parsed = parseArray(inputText, MAX_LEN, MAX_ABS);
    if (!parsed) {
      setInputError(true);
      return;
    }
    loadArray(parsed);
    setInputText('');
  };

  const handleRandom = () => {
    const n = 8 + Math.floor(Math.random() * 5);
    loadArray(Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 60)));
  };

  let tone: Tone;
  let banner: { type: string; description: string; aside: ReactNode };
  let view: ReactNode;
  if (run.variant === 'quadratic') {
    const step = run.steps[index];
    tone = step.type === 'COMPARE' && !step.isImprovement ? 'neutral' : QUAD_TONE[step.type];
    banner = {
      type: step.type,
      description: step.description,
      aside: <Badge tone="path" className="font-mono">{tr('최장', 'Best')} {step.best}</Badge>,
    };
    view = <QuadraticView step={step} a={input} />;
  } else {
    const step = run.steps[index];
    tone = FAST_TONE[step.type];
    banner = {
      type: step.type,
      description: step.description,
      aside: <Badge tone="visited" className="font-mono">len(tails) {step.tails.length}</Badge>,
    };
    view = <FastView step={step} a={input} />;
  }
  const codeLine = run.steps[index].codeLine;

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('최장 증가 부분 수열 (LIS)', 'Longest increasing subsequence')}
            onInfo={() => setIsModalOpen(true)}
            tabs={
              <SegmentedControl
                id="lis-variant"
                value={variant}
                onChange={changeVariant}
                options={[
                  { value: 'quadratic', label: tr('O(n²) DP', 'O(n²) DP') },
                  { value: 'fast', label: tr('O(n log n) 이분 탐색', 'O(n log n) binary search') },
                ]}
              />
            }
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner tone={tone} badge={banner.type} description={banner.description} aside={banner.aside} />
            <div className="border-t border-border">{view}</div>
            <div className="px-3 sm:px-5 py-2.5 flex flex-wrap items-center gap-2 border-b border-border">
              <Button variant="secondary" onClick={() => loadArray(DEFAULT_ARRAY)}>
                <RotateCcw className="w-3.5 h-3.5" />
                {tr('기본 예제', 'Default example')}
              </Button>
              <Button variant="secondary" onClick={handleRandom}>
                <Shuffle className="w-3.5 h-3.5" />
                {tr('랜덤', 'Random')}
              </Button>
              <form
                className="flex items-center gap-2 ml-auto"
                onSubmit={e => { e.preventDefault(); handleCustomInput(); }}
              >
                {inputError && (
                  <span className={cn('text-xs font-semibold', toneText.danger)}>
                    {tr(`정수 1~${MAX_LEN}개 (|값| ≤ ${MAX_ABS})`, `1 to ${MAX_LEN} integers (|value| ≤ ${MAX_ABS})`)}
                  </span>
                )}
                <input
                  type="text"
                  value={inputText}
                  onChange={e => { setInputText(e.target.value); setInputError(false); }}
                  placeholder="10, 20, 10, 30, ..."
                  aria-label={tr(`직접 입력 (최대 ${MAX_LEN}개, 쉼표로 구분)`, `Custom array (up to ${MAX_LEN} numbers, comma-separated)`)}
                  title={tr(`직접 입력 (최대 ${MAX_LEN}개, 쉼표로 구분)`, `Custom array (up to ${MAX_LEN} numbers, comma-separated)`)}
                  className="h-8 w-36 sm:w-44 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
              </form>
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<LISCodeViewer codeLine={codeLine} variant={run.variant} />}
            problems={<LISProblemList />}
          />
        }
      />
      <LISInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

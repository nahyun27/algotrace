import { useState, useMemo } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, SegmentedControl, type Tone } from '../../components/ui';
import { SearchArrayStage, HeightAxis, TreeCutPanel } from '../../algorithms/binary-search/SearchCanvas';
import BinarySearchCodeViewer from '../../algorithms/binary-search/CodeViewer';
import BinarySearchProblemList from '../../algorithms/binary-search/ProblemList';
import BinarySearchInfoModal from '../../algorithms/binary-search/InfoModal';
import { generateFindSteps, generateLowerBoundSteps, generateParametricSteps } from '../../algorithms/binary-search/solver';
import { DEFAULT_FIND, DEFAULT_LOWER, DEFAULT_PARAM, type BSStepType, type BSVariant } from '../../algorithms/binary-search/types';
import { useLang, useTr } from '../../i18n';

const STEP_TONE: Record<BSStepType, Tone> = {
  INIT: 'neutral',
  MID: 'current',
  CHECK: 'current',
  GO_LEFT: 'candidate',
  GO_RIGHT: 'candidate',
  FOUND: 'path',
  NOT_FOUND: 'danger',
  DONE: 'path',
};

interface ArrayInput { arr: number[]; target: number }
interface ParamInput { trees: number[]; m: number }

const parseNums = (text: string) =>
  text.split(/[,\s]+/).filter(Boolean).map(Number);

const inputClass =
  'h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

/* ─────────────── input bars (keyed by variant so drafts reset) ─────────────── */

function ArrayInputBar({ value, onApply }: { value: ArrayInput; onApply: (v: ArrayInput) => void }) {
  const tr = useTr();
  const [arrText, setArrText] = useState(value.arr.join(', '));
  const [targetText, setTargetText] = useState(String(value.target));
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const nums = parseNums(arrText);
    const target = Number(targetText);
    if (nums.length < 1 || nums.length > 15 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 999)) {
      setError(tr('배열은 정수 1~15개 (절댓값 999 이하)로 입력해 주세요.', 'Enter 1 to 15 integers (|x| ≤ 999).'));
      return;
    }
    if (targetText.trim() === '' || !Number.isInteger(target)) {
      setError(tr('찾을 값은 정수로 입력해 주세요.', 'The target must be an integer.'));
      return;
    }
    const sorted = [...nums].sort((a, b) => a - b);
    setArrText(sorted.join(', '));
    setError(null);
    onApply({ arr: sorted, target });
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
      <label className="text-xs font-semibold text-muted-foreground">target</label>
      <input
        type="text"
        inputMode="numeric"
        value={targetText}
        onChange={e => setTargetText(e.target.value)}
        aria-label="target"
        className={`${inputClass} w-16`}
      />
      <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
      <p className={`w-full text-[11px] ${error ? 'text-state-danger font-semibold' : 'text-hint'}`}>
        {error ?? tr('입력한 배열은 오름차순으로 정렬해서 사용해요.', 'The array is sorted in ascending order before searching.')}
      </p>
    </form>
  );
}

function ParamInputBar({ value, onApply }: { value: ParamInput; onApply: (v: ParamInput) => void }) {
  const tr = useTr();
  const [treesText, setTreesText] = useState(value.trees.join(', '));
  const [mText, setMText] = useState(String(value.m));
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const trees = parseNums(treesText);
    const m = Number(mText);
    if (trees.length < 1 || trees.length > 8 || trees.some(t => !Number.isInteger(t) || t < 1 || t > 30)) {
      setError(tr('나무 높이는 1~30 사이 정수 1~8개로 입력해 주세요.', 'Enter 1 to 8 tree heights, integers from 1 to 30.'));
      return;
    }
    const total = trees.reduce((s, t) => s + t, 0);
    if (!Number.isInteger(m) || m < 1 || m > total) {
      setError(tr(`M은 1 이상 ${total} 이하 정수여야 해요 (나무 높이의 합).`, `M must be an integer from 1 to ${total} (the sum of heights).`));
      return;
    }
    setError(null);
    onApply({ trees, m });
  };

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); apply(); }}>
      <label className="text-xs font-semibold text-muted-foreground">{tr('나무 높이', 'Tree heights')}</label>
      <input
        type="text"
        value={treesText}
        onChange={e => setTreesText(e.target.value)}
        aria-label={tr('나무 높이 (쉼표로 구분)', 'Tree heights (comma-separated)')}
        className={`${inputClass} flex-1 min-w-[160px]`}
      />
      <label className="text-xs font-semibold text-muted-foreground">M</label>
      <input
        type="text"
        inputMode="numeric"
        value={mText}
        onChange={e => setMText(e.target.value)}
        aria-label="M"
        className={`${inputClass} w-16`}
      />
      <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
      <p className={`w-full text-[11px] ${error ? 'text-state-danger font-semibold' : 'text-hint'}`}>
        {error ?? tr('BOJ 2805 나무 자르기: 나무를 M 이상 가져가는 절단기의 최대 높이를 구해요.', 'BOJ 2805: find the highest cutter height that still yields at least M wood.')}
      </p>
    </form>
  );
}

/* ─────────────── page ─────────────── */

export default function BinarySearchPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [variant, setVariant] = useState<BSVariant>('find');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [findInput, setFindInput] = useState<ArrayInput>(DEFAULT_FIND);
  const [lowerInput, setLowerInput] = useState<ArrayInput>(DEFAULT_LOWER);
  const [paramInput, setParamInput] = useState<ParamInput>(DEFAULT_PARAM);

  const steps = useMemo(() => {
    if (variant === 'find') return generateFindSteps(findInput.arr, findInput.target, lang);
    if (variant === 'lower') return generateLowerBoundSteps(lowerInput.arr, lowerInput.target, lang);
    return generateParametricSteps(paramInput.trees, paramInput.m, lang);
  }, [variant, findInput, lowerInput, paramInput, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const probes = useMemo(
    () => steps.slice(0, pb.index + 1).filter(s => s.type === 'MID' || s.type === 'CHECK').length,
    [steps, pb.index],
  );

  const changeVariant = (v: BSVariant) => { setVariant(v); pb.reset(); };

  const tabs: { value: BSVariant; label: string }[] = [
    { value: 'find', label: tr('값 찾기', 'Find a value') },
    { value: 'lower', label: 'lower bound' },
    { value: 'param', label: tr('파라메트릭 서치', 'Parametric search') },
  ];

  const arrayInput = variant === 'lower' ? lowerInput : findInput;

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('이분 탐색', 'Binary search')}
            onInfo={() => setIsModalOpen(true)}
            tabs={<SegmentedControl id="binary-search-variant" value={variant} onChange={changeVariant} options={tabs} />}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={
                <>
                  <Badge tone="current" className="font-mono">{tr('비교', 'Probes')} {probes}</Badge>
                  {variant === 'param' && step.best !== null && (
                    <Badge tone="visited" className="font-mono">{tr('최선', 'Best')} H = {step.best}</Badge>
                  )}
                </>
              }
            />
            {variant === 'param' ? (
              <>
                <div className="border-b border-border">
                  <HeightAxis step={step} max={Math.max(...paramInput.trees)} />
                </div>
                <div className="p-3 sm:p-5 flex flex-col gap-4">
                  <TreeCutPanel step={step} trees={paramInput.trees} m={paramInput.m} />
                  <ParamInputBar
                    key="param"
                    value={paramInput}
                    onApply={v => { setParamInput(v); pb.reset(); }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-border">
                  <SearchArrayStage step={step} arr={arrayInput.arr} variant={variant} />
                </div>
                <div className="p-3 sm:p-5">
                  <ArrayInputBar
                    key={variant}
                    value={arrayInput}
                    onApply={v => { (variant === 'lower' ? setLowerInput : setFindInput)(v); pb.reset(); }}
                  />
                </div>
              </>
            )}
          </div>
        }
        stepController={<StepController {...pb.controller} />}
        rightPanel={
          <RightPanel
            code={<BinarySearchCodeViewer codeLine={step.codeLine} variant={variant} />}
            problems={<BinarySearchProblemList />}
          />
        }
      />
      <BinarySearchInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

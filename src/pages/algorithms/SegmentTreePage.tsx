import { useState, useMemo } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, SegmentedControl, type Tone } from '../../components/ui';
import SegTreeCanvas from '../../algorithms/segment-tree/SegTreeCanvas';
import FenwickView from '../../algorithms/segment-tree/FenwickView';
import SegmentTreeCodeViewer from '../../algorithms/segment-tree/CodeViewer';
import SegmentTreeProblemList from '../../algorithms/segment-tree/ProblemList';
import SegmentTreeInfoModal from '../../algorithms/segment-tree/InfoModal';
import { generateFenwickSteps, generateSegmentSteps } from '../../algorithms/segment-tree/solver';
import {
  DEFAULT_INPUT, MAX_N,
  type FenStep, type FenStepType, type Operation, type SegInput, type SegStep, type SegStepType, type Structure,
} from '../../algorithms/segment-tree/types';
import { useLang, useTr } from '../../i18n';

const SEG_TONE: Record<SegStepType, Tone> = {
  BUILD: 'neutral',
  VISIT: 'current',
  FULL: 'path',
  PARTIAL: 'candidate',
  OUTSIDE: 'neutral',
  UPDATE: 'visited',
  DONE: 'path',
};

const FEN_TONE: Record<FenStepType, Tone> = {
  BUILD: 'neutral',
  QUERY: 'primary',
  PREFIX: 'current',
  COLLECT: 'path',
  PREFIX_DONE: 'visited',
  SET: 'primary',
  UPDATE: 'visited',
  DONE: 'path',
};

const parseNums = (text: string) => text.split(/[,\s]+/).filter(Boolean).map(Number);

const inputClass =
  'h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

function InputBar({ value, op, onApply }: { value: SegInput; op: Operation; onApply: (v: SegInput) => void }) {
  const tr = useTr();
  const [arrText, setArrText] = useState(value.arr.join(', '));
  const [aText, setAText] = useState(String(op === 'query' ? value.l : value.idx));
  const [bText, setBText] = useState(String(op === 'query' ? value.r : value.val));
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const arr = parseNums(arrText);
    if (arr.length < 1 || arr.length > MAX_N || arr.some(v => !Number.isInteger(v) || Math.abs(v) > 999)) {
      setError(tr(`배열은 정수 1~${MAX_N}개 (절댓값 999 이하)로 입력해 주세요.`, `Enter 1 to ${MAX_N} integers (|x| ≤ 999).`));
      return;
    }
    const n = arr.length;
    const a = Number(aText), b = Number(bText);
    if (aText.trim() === '' || bText.trim() === '' || !Number.isInteger(a) || !Number.isInteger(b)) {
      setError(tr('입력값은 정수여야 해요.', 'Inputs must be integers.'));
      return;
    }
    if (op === 'query') {
      if (a < 0 || b >= n || a > b) {
        setError(tr(`0 ≤ l ≤ r ≤ ${n - 1}이어야 해요.`, `Need 0 ≤ l ≤ r ≤ ${n - 1}.`));
        return;
      }
      setError(null);
      onApply({ ...value, arr, l: a, r: b, idx: Math.min(value.idx, n - 1) });
    } else {
      if (a < 0 || a >= n || Math.abs(b) > 999) {
        setError(tr(`idx는 0~${n - 1}, 값은 절댓값 999 이하 정수예요.`, `idx must be in 0..${n - 1} and |value| ≤ 999.`));
        return;
      }
      setError(null);
      const l = Math.min(value.l, n - 1);
      onApply({ ...value, arr, idx: a, val: b, l, r: Math.min(Math.max(value.r, l), n - 1) });
    }
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
      <label className="text-xs font-semibold text-muted-foreground">{op === 'query' ? 'l' : 'idx'}</label>
      <input type="text" inputMode="numeric" value={aText} onChange={e => setAText(e.target.value)} aria-label={op === 'query' ? 'l' : 'idx'} className={`${inputClass} w-14`} />
      <label className="text-xs font-semibold text-muted-foreground">{op === 'query' ? 'r' : tr('값', 'value')}</label>
      <input type="text" inputMode="numeric" value={bText} onChange={e => setBText(e.target.value)} aria-label={op === 'query' ? 'r' : tr('새 값', 'New value')} className={`${inputClass} w-14`} />
      <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
      <p className={`w-full text-[11px] ${error ? 'text-state-danger font-semibold' : 'text-hint'}`}>
        {error ?? (op === 'query'
          ? tr('인덱스는 0부터 세요. [l, r]은 양 끝을 포함해요.', 'Indices start at 0. [l, r] includes both ends.')
          : tr('arr[idx]를 새 값으로 바꿔요 (더하기가 아니라 바꾸기).', 'arr[idx] is replaced by the new value (not added to).'))}
      </p>
    </form>
  );
}

export default function SegmentTreePage() {
  const { lang } = useLang();
  const tr = useTr();
  const [structure, setStructure] = useState<Structure>('segment');
  const [op, setOp] = useState<Operation>('query');
  const [input, setInput] = useState<SegInput>(DEFAULT_INPUT);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = useMemo<(SegStep | FenStep)[]>(
    () => (structure === 'segment' ? generateSegmentSteps(input, op, lang) : generateFenwickSteps(input, op, lang)),
    [structure, op, input, lang],
  );
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'FULL' || s.type === 'COLLECT' ? [{ index: i, tone: 'path' as Tone }] : [])),
    [steps],
  );

  const tone = structure === 'segment' ? SEG_TONE[(step as SegStep).type] : FEN_TONE[(step as FenStep).type];

  const aside = (() => {
    if (structure === 'segment') {
      const s = step as SegStep;
      if (s.type === 'DONE') return <Badge tone="path" className="font-mono">{op === 'query' ? `sum = ${s.result}` : `total = ${s.result}`}</Badge>;
      if (s.acc !== null) return <Badge tone="path" className="font-mono">{tr('합', 'Sum')} {s.acc}</Badge>;
      return null;
    }
    const f = step as FenStep;
    return (
      <>
        {f.s !== null && <Badge tone="current" className="font-mono">s = {f.s}</Badge>}
        {f.prefR !== null && <Badge tone="path" className="font-mono">P({input.r + 1}) = {f.prefR}</Badge>}
        {f.prefL !== null && <Badge tone="candidate" className="font-mono">P({input.l}) = {f.prefL}</Badge>}
      </>
    );
  })();

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('세그먼트 트리 · 펜윅 트리', 'Segment tree · Fenwick tree')}
            onInfo={() => setIsModalOpen(true)}
            tabs={
              <SegmentedControl
                id="segment-tree-structure"
                value={structure}
                onChange={v => { setStructure(v); pb.reset(); }}
                options={[
                  { value: 'segment', label: tr('세그먼트 트리', 'Segment tree') },
                  { value: 'fenwick', label: tr('펜윅 트리', 'Fenwick tree') },
                ]}
              />
            }
            controls={
              <SegmentedControl
                id="segment-tree-op"
                value={op}
                onChange={v => { setOp(v); pb.reset(); }}
                options={[
                  { value: 'query', label: tr('구간 합', 'Range query') },
                  { value: 'update', label: tr('값 바꾸기', 'Point update') },
                ]}
              />
            }
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner tone={tone} badge={step.type} description={step.description} aside={aside} />
            <div className="border-b border-border">
              {structure === 'segment'
                ? <SegTreeCanvas step={step as SegStep} op={op} input={input} />
                : <FenwickView step={step as FenStep} op={op} input={input} />}
            </div>
            <div className="p-3 sm:p-5">
              <InputBar
                key={op}
                value={input}
                op={op}
                onApply={v => { setInput(v); pb.reset(); }}
              />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<SegmentTreeCodeViewer codeLine={step.codeLine} structure={structure} />}
            problems={<SegmentTreeProblemList />}
          />
        }
      />
      <SegmentTreeInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

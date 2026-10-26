import { useState, useMemo } from 'react';
import { ArrowDownToLine, History, Layers, Plus, RotateCcw } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, Panel, SegmentedControl, cn, type Tone } from '../../components/ui';
import { toneSoft, toneText } from '../../components/ui/tone';
import TreeView, { type TreeNode } from '../../components/viz/TreeView';
import ArrayView from '../../components/viz/ArrayView';
import type { VizState } from '../../components/viz/palette';
import HeapCodeViewer from '../../algorithms/heap/CodeViewer';
import HeapProblemList from '../../algorithms/heap/ProblemList';
import HeapInfoModal from '../../algorithms/heap/InfoModal';
import { applyOp, generateOpSteps } from '../../algorithms/heap/solver';
import { DEFAULT_VALUES, MAX_ABS_VALUE, MAX_HEAP_SIZE, type HeapOp, type HeapOpKind, type HeapStep, type HeapStepType } from '../../algorithms/heap/types';
import { useLang, useTr } from '../../i18n';

const STEP_TONE: Record<HeapStepType, Tone> = {
  INIT: 'neutral',
  APPEND: 'current',
  COMPARE: 'candidate',
  SWAP: 'danger',
  SETTLE: 'visited',
  REMOVE_ROOT: 'path',
  MOVE_LAST: 'current',
  DONE: 'path',
};

const DEFAULT_OPS: HeapOp[] = [{ kind: 'build', values: DEFAULT_VALUES }];

const inputClass =
  'h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

/** Array heap → binary tree whose node ids are array indices */
function toTree(heap: number[], i = 0): TreeNode | null {
  if (i >= heap.length) return null;
  const l = toTree(heap, 2 * i + 1);
  const r = toTree(heap, 2 * i + 2);
  return { id: i, label: String(heap[i]), sublabel: String(i), children: l || r ? [l, r] : undefined };
}

function stateOf(step: HeapStep, i: number): VizState {
  if (step.removed === i) return 'path';
  if (step.swapped?.includes(i)) return 'danger';
  if (step.current === i) return 'current';
  if (step.compare.includes(i)) return 'candidate';
  if (step.settled.includes(i)) return 'visited';
  return 'idle';
}

function edgeStateOf(step: HeapStep, parent: number, child: number): VizState {
  const pair = (a: number, b: number) => (parent === a && child === b) || (parent === b && child === a);
  if (step.swapped && pair(step.swapped[0], step.swapped[1])) return 'danger';
  if (step.current !== null && step.compare.some(c => pair(step.current!, c))) return 'candidate';
  return 'idle';
}

const parseNums = (text: string) => text.split(/[,\s]+/).filter(Boolean).map(Number);
const validValue = (v: number) => Number.isInteger(v) && Math.abs(v) <= MAX_ABS_VALUE;

export default function HeapPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMax, setIsMax] = useState(false);
  const [tab, setTab] = useState<HeapOpKind>('build');
  const [ops, setOps] = useState<HeapOp[]>(DEFAULT_OPS);
  const [buildText, setBuildText] = useState(DEFAULT_VALUES.join(', '));
  const [insertText, setInsertText] = useState('0');
  const [error, setError] = useState<string | null>(null);

  /** Heap before the latest operation, the heap after all of them, and the values extracted before the latest one */
  const history = useMemo(() => {
    let heap: number[] = [];
    let base: number[] = [];
    const outputs: (number | null)[] = [];
    ops.forEach((op, k) => {
      base = heap;
      const r = applyOp(heap, op, isMax);
      heap = r.heap;
      if (op.kind === 'extract' && k < ops.length - 1) outputs.push(r.extracted);
    });
    return { base, final: heap, outputs };
  }, [ops, isMax]);

  const lastOp = ops[ops.length - 1];
  const steps = useMemo(() => generateOpSteps(history.base, lastOp, isMax, lang), [history.base, lastOp, isMax, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'SWAP' ? [{ index: i, tone: 'danger' as Tone }] : [])),
    [steps],
  );

  const tree = useMemo(() => toTree(step.heap), [step.heap]);
  const size = history.final.length;
  const rootWord = isMax ? tr('최댓값', 'max') : tr('최솟값', 'min');

  const run = (next: HeapOp[]) => {
    setOps(next);
    setError(null);
    pb.reset(true);
  };

  const handleBuild = () => {
    const values = parseNums(buildText);
    if (values.length < 1 || values.length > MAX_HEAP_SIZE || !values.every(validValue)) {
      setError(tr(
        `정수 1~${MAX_HEAP_SIZE}개를 쉼표로 구분해 넣어 주세요 (절댓값 ${MAX_ABS_VALUE} 이하).`,
        `Enter 1 to ${MAX_HEAP_SIZE} comma-separated integers (|x| ≤ ${MAX_ABS_VALUE}).`,
      ));
      return;
    }
    run([{ kind: 'build', values }]);
  };

  const handleInsert = () => {
    const value = Number(insertText);
    if (insertText.trim() === '' || !validValue(value)) {
      setError(tr(`넣을 값은 절댓값 ${MAX_ABS_VALUE} 이하의 정수예요.`, `The value must be an integer with |x| ≤ ${MAX_ABS_VALUE}.`));
      return;
    }
    run([...ops, { kind: 'insert', value }]);
  };

  const handleExtract = () => run([...ops, { kind: 'extract' }]);

  const handleReset = () => {
    setBuildText(DEFAULT_VALUES.join(', '));
    run(DEFAULT_OPS);
  };

  const changeKind = (kind: 'min' | 'max') => {
    setIsMax(kind === 'max');
    pb.reset();
  };

  const opLabel = (op: HeapOp) =>
    op.kind === 'build' ? tr('힙 만들기', 'Build') : op.kind === 'insert' ? `${tr('삽입', 'Insert')} ${op.value}` : tr(`${rootWord} 꺼내기`, `Extract ${rootWord}`);

  const tabs: { value: HeapOpKind; label: string }[] = [
    { value: 'insert', label: tr('삽입', 'Insert') },
    { value: 'extract', label: tr(`${rootWord} 꺼내기`, `Extract ${rootWord}`) },
    { value: 'build', label: tr('힙 만들기', 'Build heap') },
  ];

  const outputs = step.extracted !== null || (lastOp.kind === 'extract' && step.type === 'DONE')
    ? [...history.outputs, step.extracted]
    : history.outputs;

  const legend = [
    { state: 'current' as const, label: tr('이동 중인 값', 'Moving value') },
    { state: 'candidate' as const, label: tr('비교 대상', 'Compared') },
    { state: 'danger' as const, label: tr('교환', 'Swap') },
    { state: 'visited' as const, label: tr('자리 확정', 'Settled') },
    { state: 'path' as const, label: tr('꺼낸 루트', 'Removed root') },
  ];

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('힙 (우선순위 큐)', 'Heap (priority queue)')}
            onInfo={() => setIsModalOpen(true)}
            tabs={<SegmentedControl id="heap-op" value={tab} onChange={t => { setTab(t); setError(null); }} options={tabs} />}
            controls={
              <SegmentedControl
                id="heap-kind"
                value={isMax ? 'max' : 'min'}
                onChange={changeKind}
                options={[
                  { value: 'min', label: tr('최소 힙', 'Min-heap') },
                  { value: 'max', label: tr('최대 힙', 'Max-heap') },
                ]}
              />
            }
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
                  <Badge tone="candidate" className="font-mono">{tr('비교', 'Cmp')} {step.compares}</Badge>
                  <Badge tone="danger" className="font-mono">{tr('교환', 'Swap')} {step.swaps}</Badge>
                </>
              }
            />
            <div className="border-b border-border">
              <TreeView
                root={tree}
                stateOf={id => stateOf(step, Number(id))}
                edgeStateOf={(p, c) => edgeStateOf(step, Number(p), Number(c))}
                emptyText={tr('힙이 비어 있어요.', 'The heap is empty.')}
                className="min-h-[220px]"
              />
            </div>
            {step.heap.length > 0 && (
              <div className="border-b border-border">
                <ArrayView
                  variant="cells"
                  values={step.heap}
                  stateOf={i => stateOf(step, i)}
                  compact={step.heap.length > 7}
                  pointers={step.current !== null ? [{ index: step.current, label: 'i', tone: 'current' }] : []}
                  legend={legend}
                />
              </div>
            )}

            <div className="p-3 sm:p-5 flex flex-col gap-4">
              <OperationBar
                tab={tab}
                isMax={isMax}
                size={size}
                nextRoot={history.final[0]}
                buildText={buildText}
                setBuildText={t => { setBuildText(t); setError(null); }}
                insertText={insertText}
                setInsertText={t => { setInsertText(t); setError(null); }}
                onBuild={handleBuild}
                onInsert={handleInsert}
                onExtract={handleExtract}
                onReset={handleReset}
                error={error}
              />

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                <Panel title={tr('꺼낸 값', 'Extracted')} icon={ArrowDownToLine} iconTone="path" bodyClassName="p-3">
                  {outputs.length === 0 ? (
                    <p className="text-xs text-hint">{tr('아직 꺼낸 값이 없어요.', 'Nothing extracted yet.')}</p>
                  ) : (
                    <ol className="flex flex-wrap gap-1.5" aria-label={tr('꺼낸 순서', 'Extraction order')}>
                      {outputs.map((v, k) => {
                        const latest = k === outputs.length - 1 && lastOp.kind === 'extract';
                        return (
                          <li
                            key={k}
                            className={cn(
                              'min-w-9 h-9 px-2 rounded-xl flex items-center justify-center font-mono font-bold text-sm tabular-nums',
                              latest ? cn(toneSoft.path, 'ring-2 ring-state-path/50') : 'bg-muted text-muted-foreground',
                            )}
                            title={v === null ? tr('빈 힙 (BOJ 1927은 0 출력)', 'Empty heap (BOJ 1927 prints 0)') : undefined}
                          >
                            {v ?? '∅'}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </Panel>
                <Panel title={tr('연산 기록', 'History')} icon={History} bodyClassName="p-3">
                  <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    {ops.map((op, k) => (
                      <li key={k} className="flex items-center gap-1.5">
                        {k > 0 && <span className="text-hint" aria-hidden>→</span>}
                        <span className={cn('rounded-lg px-2 py-1', k === ops.length - 1 ? toneSoft.current : 'bg-muted text-muted-foreground')}>
                          {opLabel(op)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </Panel>
              </div>
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<HeapCodeViewer codeLine={step.codeLine} isMax={isMax} />}
            problems={<HeapProblemList />}
          />
        }
      />
      <HeapInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

interface OperationBarProps {
  tab: HeapOpKind;
  isMax: boolean;
  size: number;
  nextRoot: number | undefined;
  buildText: string;
  setBuildText: (t: string) => void;
  insertText: string;
  setInsertText: (t: string) => void;
  onBuild: () => void;
  onInsert: () => void;
  onExtract: () => void;
  onReset: () => void;
  error: string | null;
}

function OperationBar(p: OperationBarProps) {
  const tr = useTr();
  const full = p.size >= MAX_HEAP_SIZE;
  const rootWord = p.isMax ? tr('최댓값', 'max') : tr('최솟값', 'min');

  const hint =
    p.tab === 'build'
      ? tr('배열을 통째로 힙으로 바꿔요. 지금까지의 기록은 지워져요.', 'Turns the whole array into a heap. This clears the history.')
      : p.tab === 'insert'
        ? full
          ? tr(`힙에는 최대 ${MAX_HEAP_SIZE}개까지 넣을 수 있어요.`, `The heap holds at most ${MAX_HEAP_SIZE} values here.`)
          : tr('현재 힙(마지막 연산이 끝난 상태)에 값을 하나 넣어요.', 'Adds one value to the current heap (after the latest operation).')
        : p.nextRoot === undefined
          ? tr('힙이 비어 있어요. 값을 먼저 넣어 주세요.', 'The heap is empty. Insert a value first.')
          : tr(`다음에 꺼낼 ${rootWord}: ${p.nextRoot}`, `Next ${rootWord} to come out: ${p.nextRoot}`);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {p.tab === 'build' && (
          <form className="flex flex-1 flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); p.onBuild(); }}>
            <label htmlFor="heap-build" className="text-xs font-semibold text-muted-foreground">{tr('배열', 'Array')}</label>
            <input
              id="heap-build"
              type="text"
              value={p.buildText}
              onChange={e => p.setBuildText(e.target.value)}
              className={cn(inputClass, 'flex-1 min-w-[160px]')}
            />
            <Button type="submit" variant="primary">
              <Layers className="w-3.5 h-3.5" />
              {tr('힙 만들기', 'Build heap')}
            </Button>
          </form>
        )}
        {p.tab === 'insert' && (
          <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); p.onInsert(); }}>
            <label htmlFor="heap-insert" className="text-xs font-semibold text-muted-foreground">{tr('넣을 값', 'Value')}</label>
            <input
              id="heap-insert"
              type="text"
              inputMode="numeric"
              value={p.insertText}
              onChange={e => p.setInsertText(e.target.value)}
              className={cn(inputClass, 'w-20')}
            />
            <Button type="submit" variant="primary" disabled={full}>
              <Plus className="w-3.5 h-3.5" />
              {tr('삽입', 'Insert')}
            </Button>
          </form>
        )}
        {p.tab === 'extract' && (
          <Button variant="primary" onClick={p.onExtract} disabled={p.nextRoot === undefined}>
            <ArrowDownToLine className="w-3.5 h-3.5" />
            {tr(`${rootWord} 꺼내기`, `Extract ${rootWord}`)}
          </Button>
        )}
        <Button variant="secondary" onClick={p.onReset} className="ml-auto">
          <RotateCcw className="w-3.5 h-3.5" />
          {tr('처음 예제로', 'Reset example')}
        </Button>
      </div>
      <p className={cn('text-[11px]', p.error ? cn(toneText.danger, 'font-semibold') : 'text-hint')}>{p.error ?? hint}</p>
    </div>
  );
}

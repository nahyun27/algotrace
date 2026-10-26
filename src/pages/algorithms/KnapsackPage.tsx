import { useState, useMemo } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, IconButton, type Tone } from '../../components/ui';
import KnapsackGrid from '../../algorithms/knapsack/KnapsackGrid';
import ItemsPanel from '../../algorithms/knapsack/ItemsPanel';
import KnapsackCodeViewer from '../../algorithms/knapsack/CodeViewer';
import KnapsackProblemList from '../../algorithms/knapsack/ProblemList';
import KnapsackInfoModal from '../../algorithms/knapsack/InfoModal';
import { generateKnapsackSteps } from '../../algorithms/knapsack/solver';
import {
  DEFAULT_INPUT, MAX_ITEMS, MAX_K, MAX_VALUE, MAX_WEIGHT,
  type KnapsackInput, type KnapsackStepType,
} from '../../algorithms/knapsack/types';
import { useLang, useTr } from '../../i18n';

const STEP_TONE: Record<KnapsackStepType, Tone> = {
  INIT: 'neutral',
  CONSIDER: 'candidate',
  SKIP: 'neutral',
  TAKE: 'visited',
  BACKTRACK: 'path',
  DONE: 'path',
};

const inputClass = 'h-8 w-12 rounded-lg border border-border bg-card px-1.5 text-center text-xs font-mono text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

type Draft = { w: string; v: string }[];

const toInt = (s: string, lo: number, hi: number) => {
  const n = Number(s);
  return Number.isInteger(n) && n >= lo && n <= hi ? n : null;
};

/** Editable item list + capacity; remounted (via key) whenever the applied input changes. */
function ItemsEditor({ input, onApply }: { input: KnapsackInput; onApply: (next: KnapsackInput) => void }) {
  const tr = useTr();
  const [draft, setDraft] = useState<Draft>(input.items.map(it => ({ w: String(it.weight), v: String(it.value) })));
  const [k, setK] = useState(String(input.K));

  const parsedItems = draft.map(d => ({ weight: toInt(d.w, 1, MAX_WEIGHT), value: toInt(d.v, 1, MAX_VALUE) }));
  const parsedK = toInt(k, 1, MAX_K);
  const valid = parsedK !== null && draft.length > 0 && parsedItems.every(it => it.weight !== null && it.value !== null);

  const update = (idx: number, field: 'w' | 'v', value: string) =>
    setDraft(prev => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={e => {
        e.preventDefault();
        if (valid) onApply({ K: parsedK, items: parsedItems.map(it => ({ weight: it.weight!, value: it.value! })) });
      }}
    >
      {draft.map((d, idx) => (
        <div key={idx} className="flex items-center gap-1 rounded-xl bg-muted px-1.5 py-1">
          <span className="px-1 text-[11px] font-bold text-muted-foreground font-mono">{idx + 1}</span>
          <input
            type="number" min={1} max={MAX_WEIGHT} value={d.w} onChange={e => update(idx, 'w', e.target.value)}
            aria-label={tr(`물건 ${idx + 1} 무게 (1~${MAX_WEIGHT})`, `Item ${idx + 1} weight (1-${MAX_WEIGHT})`)}
            title={tr(`무게 (1~${MAX_WEIGHT})`, `Weight (1-${MAX_WEIGHT})`)}
            className={inputClass}
          />
          <span className="text-xs text-muted-foreground">/</span>
          <input
            type="number" min={1} max={MAX_VALUE} value={d.v} onChange={e => update(idx, 'v', e.target.value)}
            aria-label={tr(`물건 ${idx + 1} 가치 (1~${MAX_VALUE})`, `Item ${idx + 1} value (1-${MAX_VALUE})`)}
            title={tr(`가치 (1~${MAX_VALUE})`, `Value (1-${MAX_VALUE})`)}
            className={inputClass}
          />
          <IconButton
            label={tr(`물건 ${idx + 1} 삭제`, `Remove item ${idx + 1}`)}
            size="sm"
            type="button"
            disabled={draft.length <= 1}
            onClick={() => setDraft(prev => prev.filter((_, i) => i !== idx))}
          >
            <X className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        disabled={draft.length >= MAX_ITEMS}
        onClick={() => setDraft(prev => [...prev, { w: '1', v: '1' }])}
      >
        <Plus className="w-3.5 h-3.5" />
        {tr('물건', 'Item')}
      </Button>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        K
        <input
          type="number" min={1} max={MAX_K} value={k} onChange={e => setK(e.target.value)}
          aria-label={tr(`배낭 용량 K (1~${MAX_K})`, `Capacity K (1-${MAX_K})`)}
          title={tr(`배낭 용량 K (1~${MAX_K})`, `Capacity K (1-${MAX_K})`)}
          className={inputClass}
        />
      </label>
      <Button type="submit" variant="primary" disabled={!valid}>{tr('적용', 'Apply')}</Button>
      <Button type="button" variant="secondary" onClick={() => onApply(DEFAULT_INPUT)}>
        <RotateCcw className="w-3.5 h-3.5" />
        {tr('예제', 'Example')}
      </Button>
    </form>
  );
}

export default function KnapsackPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [input, setInput] = useState<KnapsackInput>(DEFAULT_INPUT);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = useMemo(() => generateKnapsackSteps(input, lang), [input, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'TAKE' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [steps],
  );

  const apply = (next: KnapsackInput) => { setInput(next); pb.reset(); };

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('0/1 배낭 문제', '0/1 knapsack')}
            onInfo={() => setIsModalOpen(true)}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={step.result !== null && (
                <Badge tone="path" className="font-mono">{tr('최대', 'best')} {step.result}</Badge>
              )}
            />
            <div className="px-3 sm:px-5 py-2.5 border-y border-border">
              <ItemsEditor key={JSON.stringify(input)} input={input} onApply={apply} />
            </div>
            <div className="p-3 sm:p-5 flex flex-col gap-4">
              <KnapsackGrid input={input} step={step} />
              <ItemsPanel input={input} step={step} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<KnapsackCodeViewer codeLine={step.codeLine} />}
            problems={<KnapsackProblemList />}
          />
        }
      />
      <KnapsackInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}

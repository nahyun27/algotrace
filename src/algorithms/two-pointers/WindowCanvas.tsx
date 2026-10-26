import ArrayView, { type ArrayPointer } from '../../components/viz/ArrayView';
import type { VizState } from '../../components/viz/palette';
import { Badge, Panel, cn } from '../../components/ui';
import { toneBorder, toneSoft } from '../../components/ui/tone';
import { useTr } from '../../i18n';
import type { SumStep, WindowStep } from './types';

const pointersFor = (l: number, r: number): ArrayPointer[] => [
  { index: l, label: 'l', tone: 'neutral' },
  ...(r >= 0 ? [{ index: r, label: 'r', tone: 'neutral' as const }] : []),
];

/* ─────────────── subarray sum ─────────────── */

export function SumStage({ step, arr }: { step: SumStep; arr: number[] }) {
  const tr = useTr();
  const inWindow = (i: number) => i >= step.l && i <= step.r;
  const stateOf = (i: number): VizState => {
    if (step.type === 'DONE') return step.matches.some(([a, b]) => i >= a && i <= b) ? 'path' : 'idle';
    if (step.type === 'MATCH' && inWindow(i)) return 'path';
    if (step.type === 'EXPAND' && i === step.changed) return 'current';
    if (inWindow(i)) return 'candidate';
    return 'idle';
  };
  return (
    <ArrayView
      values={arr}
      variant="cells"
      compact
      stateOf={stateOf}
      pointers={step.type === 'DONE' ? [] : pointersFor(step.l, step.r)}
      legend={[
        { state: 'candidate', label: tr('현재 구간 [l, r]', 'Window [l, r]'), kind: 'cell' },
        { state: 'current', label: tr('방금 더한 값', 'Just added'), kind: 'cell' },
        { state: 'path', label: tr('합 = M인 구간', 'Sum = M'), kind: 'cell' },
      ]}
    />
  );
}

export function MatchList({ step, arr, m }: { step: SumStep; arr: number[]; m: number }) {
  const tr = useTr();
  const latest = step.type === 'MATCH' ? step.matches.length - 1 : -1;
  return (
    <Panel
      title={tr(`합이 ${m}인 구간`, `Subarrays summing to ${m}`)}
      actions={<Badge tone="path" className="font-mono">{step.count}</Badge>}
      bodyClassName="p-3"
    >
      {step.matches.length === 0 ? (
        <p className="text-xs text-muted-foreground px-1">{tr('아직 찾은 구간이 없어요.', 'No matches yet.')}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {step.matches.map(([a, b], i) => (
            <li
              key={`${a}-${b}`}
              className={cn(
                'rounded-xl border px-3 py-1.5 font-mono text-xs font-semibold',
                toneSoft.path, toneBorder.path,
                i === latest && 'ring-2 ring-state-path/50',
              )}
            >
              [{a}, {b}] <span className="opacity-80">{arr.slice(a, b + 1).join(' + ')} = {m}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ─────────────── sliding window ─────────────── */

export function WindowStage({ step, arr }: { step: WindowStep; arr: number[] }) {
  const tr = useTr();
  const stateOf = (i: number): VizState => {
    const inWindow = i >= step.l && i <= step.r;
    if ((step.type === 'BEST' || step.type === 'DONE') && inWindow) return 'path';
    if (i === step.entered) return 'current';
    if (inWindow) return 'candidate';
    return 'idle';
  };
  return (
    <ArrayView
      values={arr}
      variant="cells"
      compact
      stateOf={stateOf}
      pointers={pointersFor(step.l, step.r)}
      legend={[
        { state: 'candidate', label: tr('현재 창', 'Window'), kind: 'cell' },
        { state: 'current', label: tr('새로 들어온 값', 'Entering value'), kind: 'cell' },
        { state: 'path', label: tr('최대 합 창', 'Best window'), kind: 'cell' },
      ]}
    />
  );
}

export function WindowSums({ step, k }: { step: WindowStep; k: number }) {
  const tr = useTr();
  const currentL = step.type === 'DONE' ? -1 : step.l;
  return (
    <Panel
      title={tr(`길이 ${k}인 창의 합`, `Sums of length-${k} windows`)}
      actions={<Badge tone="path" className="font-mono">{tr('최댓값', 'Best')} {step.best}</Badge>}
      bodyClassName="p-3"
    >
      <ul className="flex flex-wrap gap-2">
        {step.sums.map((s, l) => {
          const isBest = l === step.bestRange[0];
          const isCurrent = l === currentL;
          const tone = isBest ? 'path' : isCurrent ? 'candidate' : 'neutral';
          return (
            <li
              key={l}
              className={cn(
                'rounded-xl border px-3 py-1.5 font-mono text-xs font-semibold',
                toneSoft[tone], toneBorder[tone],
                isCurrent && 'ring-2 ring-state-candidate/50',
              )}
            >
              [{l}, {l + k - 1}] = {s}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

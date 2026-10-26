import DPGrid from '../../components/viz/DPGrid';
import Legend from '../../components/viz/Legend';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';
import type { KnapsackInput, KnapsackStep } from './types';

const same = (p: [number, number] | null, r: number, c: number) => p !== null && p[0] === r && p[1] === c;

export default function KnapsackGrid({ input, step }: { input: KnapsackInput; step: KnapsackStep }) {
  const tr = useTr();
  const onPath = new Set(step.path.map(([r, c]) => `${r},${c}`));
  const filling = step.type === 'CONSIDER' || step.type === 'SKIP' || step.type === 'TAKE';

  const cellState = (r: number, c: number): VizState => {
    if (same(step.cell, r, c)) return 'current';
    if (onPath.has(`${r},${c}`)) return 'path';
    if (same(step.source, r, c)) return 'candidate';
    return step.dp[r][c] === null ? 'idle' : 'visited';
  };

  return (
    <div className="flex flex-col gap-3">
      <DPGrid
        title={tr('DP 표: dp[i][c] = 최대 가치', 'DP table: dp[i][c] = best value')}
        corner={tr('물건 (w/v) \\ 용량', 'Item (w/v) \\ cap')}
        rowLabels={['0: ∅', ...input.items.map((it, k) => `${k + 1}: ${it.weight}/${it.value}`)]}
        colLabels={Array.from({ length: input.K + 1 }, (_, c) => c)}
        values={step.dp}
        cellState={cellState}
        deps={step.deps}
        rowState={r => (filling && step.cell?.[0] === r ? 'current' : undefined)}
      />
      <Legend
        items={[
          { state: 'current', label: tr('지금 채우는 칸', 'Cell being filled'), kind: 'cell' },
          { state: 'candidate', label: tr('선택된 후보 (점선 = 두 후보)', 'Winning candidate (dashed = both candidates)'), kind: 'cell' },
          { state: 'visited', label: tr('채운 칸', 'Filled'), kind: 'cell' },
          { state: 'path', label: tr('역추적 경로', 'Backtrack path'), kind: 'cell' },
        ]}
      />
    </div>
  );
}

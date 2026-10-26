import DPGrid from '../../components/viz/DPGrid';
import Legend from '../../components/viz/Legend';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';
import type { LCSMode, LCSStep } from './types';

interface LCSGridProps {
  mode: LCSMode;
  a: string;
  b: string;
  step: LCSStep;
}

const EMPTY = 'ε';
const same = (p: [number, number] | null, r: number, c: number) => p !== null && p[0] === r && p[1] === c;

export default function LCSGrid({ mode, a, b, step }: LCSGridProps) {
  const tr = useTr();
  const onPath = new Set(step.path.map(([r, c]) => `${r},${c}`));
  const filling = step.deps.length > 0;

  const cellState = (r: number, c: number): VizState => {
    if (same(step.cell, r, c)) return 'current';
    if (onPath.has(`${r},${c}`)) return 'path';
    if (same(step.source, r, c)) return 'candidate';
    return step.dp[r][c] === null ? 'idle' : 'visited';
  };

  return (
    <div className="flex flex-col gap-3">
      <DPGrid
        title={mode === 'lcs' ? tr('DP 표: dp[i][j] = LCS 길이', 'DP table: dp[i][j] = LCS length') : tr('DP 표: dp[i][j] = 편집 거리', 'DP table: dp[i][j] = edit distance')}
        corner="A \ B"
        rowLabels={[EMPTY, ...a]}
        colLabels={[EMPTY, ...b]}
        values={step.dp}
        cellState={cellState}
        deps={step.deps}
        rowState={r => (filling && step.cell?.[0] === r ? 'current' : undefined)}
      />
      <Legend
        items={[
          { state: 'current', label: tr('지금 채우는 칸', 'Cell being filled'), kind: 'cell' },
          { state: 'candidate', label: tr('값을 가져온 칸 (점선 = 참조하는 칸)', 'Chosen source (dashed = cells read)'), kind: 'cell' },
          { state: 'visited', label: tr('채운 칸', 'Filled'), kind: 'cell' },
          { state: 'path', label: tr('역추적 경로', 'Backtrack path'), kind: 'cell' },
        ]}
      />
    </div>
  );
}

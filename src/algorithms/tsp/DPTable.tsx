import { useState } from 'react';
import DPGrid from '../../components/viz/DPGrid';
import { useTr } from '../../i18n';

interface DPTableProps {
  dpTable: number[][];
  currentMask: number;
  currentCity: number;
}

const INF = 1e9;

export default function DPTable({ dpTable, currentMask, currentCity }: DPTableProps) {
  const tr = useTr();
  const N = dpTable[0]?.length ?? 4;
  const [hideUnreachable, setHideUnreachable] = useState(false);
  // Every tour starts at city 0, so masks without bit 0 can never be reached
  const isUnreachable = (mask: number) => (mask & 1) === 0;

  return (
    <DPGrid
      title={tr('DP 테이블: dp[mask][curr]', 'DP table: dp[mask][curr]')}
      actions={
        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
          <input
            type="checkbox"
            className="rounded border-border accent-primary cursor-pointer w-3.5 h-3.5"
            checked={hideUnreachable}
            onChange={(e) => setHideUnreachable(e.target.checked)}
          />
          {tr('불가능 상태(짝수) 숨기기', 'Hide impossible states (even masks)')}
        </label>
      }
      corner={tr('마스크 \\ 도시', 'Mask \\ City')}
      rowLabels={dpTable.map((_, mask) => mask.toString(2).padStart(N, '0'))}
      colLabels={Array.from({ length: N }, (_, i) => i)}
      values={dpTable}
      cellState={(mask, city) =>
        mask === currentMask && city === currentCity ? 'candidate' : dpTable[mask][city] !== INF ? 'visited' : 'idle'}
      rowState={mask => (mask === currentMask ? 'current' : isUnreachable(mask) ? 'dim' : undefined)}
      hideRow={mask => hideUnreachable && isUnreachable(mask)}
    />
  );
}

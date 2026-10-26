import { useState } from 'react';
import { Panel, cn } from '../../components/ui';
import { toneSoft, toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface DPTableProps {
  dpTable: number[][];
  currentMask: number;
  currentCity: number;
}

export default function DPTable({ dpTable, currentMask, currentCity }: DPTableProps) {
  const tr = useTr();
  const N = dpTable[0]?.length ?? 4;
  const [hideUnreachable, setHideUnreachable] = useState(false);

  return (
    <Panel
      className="h-full w-full flex flex-col"
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
      bodyClassName="flex-1 overflow-auto p-3 relative"
    >
      <div className="overflow-hidden rounded-xl border border-border inline-block min-w-full">
        <table className="w-full text-xs text-center border-collapse [border-spacing:0] bg-card">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="border-b border-border px-2 py-2 bg-muted font-semibold text-muted-foreground whitespace-nowrap">
                {tr('마스크 \\ 도시', 'Mask \\ City')}
              </th>
              {Array.from({ length: N }).map((_, i) => (
                <th key={i} className="border-b border-l border-border px-2 py-2 bg-muted font-bold text-muted-foreground w-16 font-mono">
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dpTable.map((row, mask) => {
              const isCurrentMaskRow = mask === currentMask;
              const isUnreachable = (mask & 1) === 0;

              if (hideUnreachable && isUnreachable) return null;

              return (
                <tr
                  key={mask}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    isCurrentMaskRow && 'bg-state-current/6',
                    isUnreachable && 'opacity-30 bg-muted/50',
                  )}
                >
                  <td className={cn('border-t border-border px-2 py-1.5 font-mono text-[11px]', isCurrentMaskRow ? `font-bold ${toneText.current}` : 'text-muted-foreground')}>
                    {mask.toString(2).padStart(N, '0')}
                  </td>
                  {row.map((val, c) => {
                    const isActive = mask === currentMask && c === currentCity;
                    const hasValue = val !== 1e9;
                    return (
                      <td key={c} className="border-l border-t border-border px-1.5 py-1 transition-all duration-300">
                        <span className={cn(
                          'inline-flex min-w-[36px] justify-center rounded-md px-1.5 py-0.5 font-mono transition-colors duration-300',
                          isActive ? `${toneSoft.candidate} font-bold ring-2 ring-state-candidate/50`
                            : hasValue ? `${toneSoft.visited} font-semibold`
                            : 'text-hint',
                        )}>
                          {val === 1e9 ? '∞' : val}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

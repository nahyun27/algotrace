import { useState } from 'react';

interface DPTableProps {
  dpTable: number[][];
  currentMask: number;
  currentCity: number;
}

export default function DPTable({ dpTable, currentMask, currentCity }: DPTableProps) {
  const N = dpTable[0]?.length ?? 4;
  const [hideUnreachable, setHideUnreachable] = useState(false);
  
  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col h-full w-full">
      <div className="p-3 border-b bg-muted/30 flex flex-wrap gap-2 items-center justify-between">
        <h2 className="font-semibold tracking-tight text-sm">DP Table: dp[mask][curr]</h2>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors bg-muted/50 px-2 py-1 rounded">
          <input 
            type="checkbox" 
            className="rounded border-border accent-primary cursor-pointer w-3.5 h-3.5"
            checked={hideUnreachable}
            onChange={(e) => setHideUnreachable(e.target.checked)}
          />
          불가능 상태(짝수) 숨기기
        </label>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-muted/5 relative">
        <div className="overflow-hidden border inline-block min-w-full">
          <table className="w-full text-xs text-center border-collapse [border-spacing:0] bg-card">
            <thead className="sticky top-0 z-20 outline outline-1 outline-border">
              <tr>
                <th className="border p-2 bg-muted/80 font-semibold text-muted-foreground whitespace-nowrap shadow-sm backdrop-blur-sm">Mask \\ City</th>
                {Array.from({length: N}).map((_, i) => (
                  <th key={i} className="border p-2 bg-muted/80 font-semibold text-muted-foreground w-16 shadow-sm backdrop-blur-sm">
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
                  <tr key={mask} className={`${isCurrentMaskRow ? 'bg-primary/5' : ''} ${isUnreachable ? 'opacity-30 dark:opacity-20 grayscale bg-muted/50' : ''} hover:bg-muted/30 transition-colors `}>
                    <td className={`border-t p-2 font-mono text-[11px] ${isCurrentMaskRow ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                      {mask.toString(2).padStart(N, '0')}
                    </td>
                    {row.map((val, c) => {
                      const isActive = mask === currentMask && c === currentCity;
                      const hasValue = val !== 1e9; 
                      return (
                        <td key={c} className={`border-l border-t p-2 transition-all duration-300 border-collapse ${
                          isActive ? 'bg-yellow-200 dark:bg-yellow-500/30 font-bold outline outline-2 outline-yellow-400 dark:outline-yellow-500 z-10 relative'
                            : hasValue ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium'
                            : 'text-muted-foreground/50'
                        }`}>
                          {val === 1e9 ? '∞' : val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

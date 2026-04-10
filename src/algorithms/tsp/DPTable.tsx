import { CITIES } from './solver';

interface DPTableProps {
  dpTable: number[][]; 
  currentMask: number;
  currentCity: number;
}

export default function DPTable({ dpTable, currentMask, currentCity }: DPTableProps) {
  const N = CITIES;
  
  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col lg:h-full">
      <div className="p-3 border-b bg-muted/30">
        <h2 className="font-semibold tracking-tight text-sm">DP Table: dp[mask][curr]</h2>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-muted/5">
        <div className="rounded-lg overflow-hidden border">
          <table className="w-full text-xs text-center border-collapse bg-card">
            <thead>
              <tr>
                <th className="border-b border-r p-2 bg-muted/30 font-semibold text-muted-foreground whitespace-nowrap">Mask \\ City</th>
                {Array.from({length: N}).map((_, i) => (
                  <th key={i} className="border-b border-r p-2 bg-muted/30 font-semibold text-muted-foreground w-16">
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dpTable.map((row, mask) => {
                const isCurrentMaskRow = mask === currentMask;
                return (
                  <tr key={mask} className={isCurrentMaskRow ? 'bg-primary/5' : ''}>
                    <td className={`border-b border-r p-2 font-mono text-[11px] ${isCurrentMaskRow ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                      {mask.toString(2).padStart(N, '0')}
                    </td>
                    {row.map((val, c) => {
                      const isActive = mask === currentMask && c === currentCity;
                      const hasValue = val !== 1e9; 
                      return (
                        <td key={c} className={`border-b border-r p-2 transition-all duration-300 ${
                          isActive ? 'bg-yellow-200 dark:bg-yellow-500/30 font-bold outline outline-2 outline-yellow-400 dark:outline-yellow-500 z-10 relative'
                            : hasValue ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium'
                            : 'text-muted-foreground/30'
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

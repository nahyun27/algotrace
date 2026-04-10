import type { DijkstraStep } from './types';
import { INF } from './types';

interface DistanceTableProps {
  step: DijkstraStep;
}

export default function DistanceTable({ step }: DistanceTableProps) {
  const { dist, visited, updatedCell, pq, type } = step;

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto p-1">
      {/* Distance array table */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">거리 배열 dist[]</h3>
          <span className="text-[10px] text-muted-foreground font-mono">출발 노드: 0</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/20">
                <th className="px-3 py-2 text-left text-xs text-muted-foreground font-semibold">노드</th>
                {dist.map((_, i) => (
                  <th key={i} className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground min-w-[64px]">{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-3 text-xs font-semibold text-muted-foreground">dist</td>
                {dist.map((d, i) => {
                  const isUpdated  = updatedCell === i;
                  const isConfirmed = visited[i];
                  let cellClass = 'bg-card';
                  if (isConfirmed) cellClass = 'bg-green-100 dark:bg-green-900/30';
                  if (isUpdated && type === 'RELAX') cellClass = 'bg-yellow-100 dark:bg-yellow-900/40 animate-pulse';
                  if (isUpdated && type === 'VISITED') cellClass = 'bg-green-100 dark:bg-green-900/30';

                  return (
                    <td key={i} className={`px-4 py-3 text-center font-mono font-bold text-sm border-l transition-colors duration-300 ${cellClass}`}>
                      <span className={isConfirmed ? 'text-green-700 dark:text-green-300' : isUpdated ? 'text-yellow-700 dark:text-yellow-300' : ''}>
                        {d >= INF ? '∞' : d}
                      </span>
                    </td>
                  );
                })}
              </tr>
              {/* Visited row */}
              <tr className="border-t">
                <td className="px-3 py-2 text-xs font-semibold text-muted-foreground">확정</td>
                {visited.map((v, i) => (
                  <td key={i} className="px-4 py-2 text-center text-xs border-l">
                    {v
                      ? <span className="inline-block w-4 h-4 rounded-full bg-green-500 mx-auto" title="방문 확정" />
                      : <span className="inline-block w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 mx-auto" title="미확정" />
                    }
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Queue */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">우선순위 큐 (Priority Queue)</h3>
        </div>
        <div className="p-3 min-h-[52px] flex flex-wrap gap-2 items-center">
          {pq.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">큐가 비어있습니다</span>
          ) : (
            pq.map((item, idx) => (
              <div key={idx}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold shadow-sm transition-all ${
                  idx === 0
                    ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                <span className="opacity-60">(</span>
                <span className={idx === 0 ? 'text-blue-700 dark:text-blue-300' : ''}>{item.cost}</span>
                <span className="opacity-60">, d{item.node})</span>
                {idx === 0 && <span className="ml-1 text-[9px] text-blue-600 dark:text-blue-400 font-bold">← next</span>}
              </div>
            ))
          )}
        </div>
        <div className="px-3 pb-2 text-[10px] text-muted-foreground">
          형식: (비용, 노드) — 비용 오름차순 정렬
        </div>
      </div>
    </div>
  );
}

import type { AStarStep } from './types';
import { Lock, Eye } from 'lucide-react';

export default function ScoreTable({ step }: { step: AStarStep }) {
  const N = step.f.length;
  const { currentProcessingNode, isImprovement, activeEdge, type } = step;

  // Reconstruct sorted Priority Queue based on openSet and f scores
  const pq = [...step.openSet]
    .map(node => ({ node, cost: step.f[node] }))
    .sort((a, b) => a.cost - b.cost);

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto p-1 text-sm">
      <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">비용 테이블 Score Table</h3>
          <div className="flex gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><Eye size={14} className="text-blue-500" /> Open Set</span>
            <span className="flex items-center gap-1.5"><Lock size={14} className="text-zinc-500" /> Closed Set</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/20 border-b">
                <th className="px-3 py-2 text-left text-xs text-muted-foreground font-semibold min-w-[50px]">노드</th>
                {Array.from({ length: N }).map((_, i) => (
                  <th key={i} className={`px-4 py-2 text-center text-xs font-semibold text-muted-foreground min-w-[64px] ${
                    currentProcessingNode === i ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : ''
                  }`}>{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* g(x) */}
              <tr>
                <td className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20">g(x)</td>
                {step.g.map((val, i) => {
                  const isUpdated = isImprovement && activeEdge && activeEdge[1] === i;
                  let cellClass = '';
                  if (isUpdated && type === 'RELAX') cellClass = 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold animate-pulse';
                  return (
                    <td key={i} className={`px-4 py-2 text-center font-mono text-xs border-l transition-colors duration-300 ${cellClass}`}>
                      {val === Infinity ? '∞' : val}
                    </td>
                  );
                })}
              </tr>
              {/* h(x) */}
              <tr className="border-t">
                <td className="px-3 py-2 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20">h(x)</td>
                {step.h.map((val, i) => (
                  <td key={i} className={`px-4 py-2 text-center font-mono text-xs border-l text-muted-foreground transition-colors duration-300`}>
                    {val === Infinity ? '∞' : val}
                  </td>
                ))}
              </tr>
              {/* f(x) */}
              <tr className="border-t">
                <td className="px-3 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20">f(x)</td>
                {step.f.map((val, i) => {
                  const isUpdated = isImprovement && activeEdge && activeEdge[1] === i;
                  let cellClass = '';
                  if (currentProcessingNode === i) cellClass = 'bg-blue-50/50 dark:bg-blue-900/20';
                  if (isUpdated && type === 'RELAX') cellClass = 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold';
                  return (
                    <td key={i} className={`px-4 py-2 text-center font-mono text-xs border-l transition-colors duration-300 ${cellClass}`}>
                      {val === Infinity ? '∞' : typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(1)) : val}
                    </td>
                  );
                })}
              </tr>
              {/* Sets */}
              <tr className="border-t">
                <td className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">상태</td>
                {Array.from({ length: N }).map((_, i) => (
                  <td key={i} className="px-4 py-2 text-center align-middle border-l">
                    {step.closedSet.includes(i) ? (
                      <Lock size={14} className="text-zinc-400 mx-auto" />
                    ) : step.openSet.includes(i) ? (
                      <Eye size={14} className="text-blue-500 mx-auto" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-1.5" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t bg-muted/10 text-[11px] text-muted-foreground flex flex-col gap-1">
          <div><span className="font-bold text-blue-600 dark:text-blue-400">g(x)</span>: 출발점에서 노드까지의 실 탐색 비용</div>
          <div><span className="font-bold text-orange-600 dark:text-orange-400">h(x)</span>: 노드에서 도착점까지의 예상 비용 (휴리스틱)</div>
          <div><span className="font-bold text-purple-600 dark:text-purple-400">f(x)</span>: 총 예상 비용 (g + h)</div>
        </div>
      </div>

      {/* Priority Queue (Open Set) */}
      <div className="border rounded-xl overflow-hidden shadow-sm bg-card mt-1">
        <div className="p-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">우선순위 큐 (Open Set)</h3>
        </div>
        <div className="p-3 min-h-[52px] flex flex-wrap gap-2 items-center">
          {pq.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">큐가 비어있습니다</span>
          ) : (
            pq.map((item, idx) => {
              const isFirst = idx === 0;
              return (
                <div key={item.node}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition-all ${
                    isFirst
                      ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200'
                      : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  <span className="opacity-50">(</span>
                  <span>f:&nbsp;</span>
                  <span className={`font-mono font-bold ${isFirst ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                    {typeof item.cost === 'number' && item.cost !== Infinity ? (item.cost % 1 === 0 ? item.cost : item.cost.toFixed(1)) : item.cost}
                  </span>
                  <span className="opacity-50">,</span>
                  <span>&nbsp;N:&nbsp;</span>
                  <span className={`font-mono font-bold ${isFirst ? 'text-purple-700 dark:text-purple-300' : ''}`}>{item.node}</span>
                  <span className="opacity-50">)</span>
                  {isFirst && <span className="ml-1 text-[9px] text-purple-600 dark:text-purple-400 font-bold">← next</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

import type { BellmanFordStep } from './types';
import { INF } from './types';

interface Props {
  step: BellmanFordStep;
}

export default function BFDistanceTable({ step }: Props) {
  const { dist, updatedCell, round, totalRounds, roundUpdatesHistory, type } = step;
  const isNegCycle = type === 'NEGATIVE_CYCLE';
  const maxUpdates = Math.max(...roundUpdatesHistory, 1);

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto p-1">

      {/* Distance table */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">거리 배열 dist[]</h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
            <span>출발: 0</span>
            {round > 0 && (
              <span className={`px-2 py-0.5 rounded-full font-bold border ${
                isNegCycle
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700'
                  : type === 'DONE'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700'
              }`}>
                {isNegCycle ? '음수 사이클!' : type === 'DONE' ? '완료' : `Round ${round} / ${totalRounds}`}
              </span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/20 border-b">
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
                  const isUpdated = updatedCell === i && type === 'RELAX';
                  const isDone = type === 'DONE' && d < INF;
                  let cellClass = 'bg-card';
                  if (isDone)    cellClass = 'bg-green-100 dark:bg-green-900/30';
                  if (isUpdated) cellClass = 'bg-yellow-100 dark:bg-yellow-900/40 animate-pulse';
                  if (isNegCycle) cellClass = 'bg-red-50 dark:bg-red-900/20';
                  return (
                    <td key={i} className={`px-4 py-3 text-center font-mono font-bold text-sm border-l transition-colors duration-300 ${cellClass}`}>
                      <span className={isDone ? 'text-green-700 dark:text-green-300' : isUpdated ? 'text-yellow-700 dark:text-yellow-300' : isNegCycle ? 'text-red-600 dark:text-red-400' : ''}>
                        {d >= INF ? '∞' : d}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Round update history bar chart */}
      {roundUpdatesHistory.length > 0 && (
        <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">라운드별 갱신 횟수</h3>
          </div>
          <div className="p-4 flex items-end gap-3 min-h-[100px]">
            {roundUpdatesHistory.map((cnt, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] font-bold text-muted-foreground">{cnt}</span>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${cnt > 0 ? 'bg-blue-500 dark:bg-blue-400' : 'bg-muted'}`}
                  style={{ height: `${Math.max(4, (cnt / maxUpdates) * 60)}px` }}
                />
                <span className="text-[10px] text-muted-foreground font-mono">R{i + 1}</span>
              </div>
            ))}
            {/* Placeholder for future rounds */}
            {Array.from({ length: Math.max(0, totalRounds - roundUpdatesHistory.length) }).map((_, i) => (
              <div key={`ph-${i}`} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] font-bold text-muted-foreground opacity-0">0</span>
                <div className="w-full rounded-t bg-muted/40 h-1" />
                <span className="text-[10px] text-muted-foreground font-mono opacity-40">R{roundUpdatesHistory.length + i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negative cycle warning */}
      {isNegCycle && (
        <div className="border border-red-300 dark:border-red-700 rounded-xl p-4 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
          <div className="font-bold mb-1 flex items-center gap-2">
            <span>⚠️ 음수 사이클 감지됨</span>
          </div>
          <p className="text-[12px] leading-relaxed">
            V번째 라운드에서 거리가 추가로 갱신되었습니다. 이 그래프에는 음수 사이클이 존재하여 최단 경로가 정의되지 않습니다.
            벨만-포드는 이를 감지하고 알림을 반환합니다.
          </p>
        </div>
      )}
    </div>
  );
}

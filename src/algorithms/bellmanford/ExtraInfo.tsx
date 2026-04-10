import type { BellmanFordStep } from './types';

interface Props {
  step: BellmanFordStep;
}

export default function BFExtraInfo({ step }: Props) {
  const { type } = step;

  return (
    <div className="flex flex-col gap-6">
      {/* Dijkstra vs BF comparison */}
      {type === 'DONE' && (
        <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">다익스트라 vs 벨만-포드</h3>
          </div>
          <div className="p-4 text-[12px] space-y-2 text-muted-foreground">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <span className="font-bold text-amber-700 dark:text-amber-400">다익스트라:</span>
              {' '}그리디 방식으로 음수 간선이 있으면 틀린 결과를 낼 수 있습니다.
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="font-bold text-blue-700 dark:text-blue-400">벨만-포드:</span>
              {' '}모든 간선을 V-1번 반복하여 음수 간선도 올바르게 처리합니다. O(VE)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

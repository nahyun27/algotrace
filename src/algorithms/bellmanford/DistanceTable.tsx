import { AlertTriangle } from 'lucide-react';
import type { BellmanFordStep } from './types';
import { INF } from './types';
import { Badge, Panel, cn } from '../../components/ui';
import { toneSoft, toneBorder } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  step: BellmanFordStep;
}

export default function BFDistanceTable({ step }: Props) {
  const tr = useTr();
  const { dist, updatedCell, round, totalRounds, roundUpdatesHistory, type } = step;
  const isNegCycle = type === 'NEGATIVE_CYCLE';
  const isDone = type === 'DONE';
  const maxUpdates = Math.max(...roundUpdatesHistory, 1);

  return (
    <div className="flex flex-col gap-4">

      {/* Distance table */}
      <Panel
        title={tr('거리 배열 dist[]', 'Distance array dist[]')}
        actions={
          <>
            <span className="text-xs text-muted-foreground font-mono">{tr('출발: 0', 'source: 0')}</span>
            {round > 0 && (
              <Badge tone={isNegCycle ? 'danger' : isDone ? 'visited' : 'current'} outline>
                {isNegCycle
                  ? tr('음수 사이클!', 'Negative cycle!')
                  : isDone
                    ? tr('완료', 'Done')
                    : tr(`라운드 ${round} / ${totalRounds}`, `Round ${round} / ${totalRounds}`)}
              </Badge>
            )}
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-xs text-muted-foreground font-semibold">{tr('노드', 'Node')}</th>
                {dist.map((_, i) => (
                  <th key={i} className="px-4 py-2 text-center text-xs font-bold text-muted-foreground min-w-[64px]">{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">dist</td>
                {dist.map((d, i) => {
                  const isUpdated = updatedCell === i && type === 'RELAX';
                  const isFinal = isDone && d < INF;
                  return (
                    <td key={i} className="px-2 py-2 text-center border-l border-border">
                      <span className={cn(
                        'inline-flex min-w-[44px] justify-center rounded-lg px-2 py-1.5 font-mono font-bold text-base transition-colors duration-300',
                        isUpdated ? `${toneSoft.candidate} ring-2 ring-state-candidate/50`
                          : isNegCycle ? toneSoft.danger
                          : isFinal ? toneSoft.visited
                          : '',
                      )}>
                        {d >= INF ? '∞' : d}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Round update history bar chart */}
      {roundUpdatesHistory.length > 0 && (
        <Panel
          title={tr('라운드별 갱신 횟수', 'Updates per round')}
          bodyClassName="p-4 flex items-end gap-3 min-h-[100px]"
        >
          {roundUpdatesHistory.map((cnt, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[11px] font-bold font-mono text-muted-foreground">{cnt}</span>
              <div
                className={cn('w-full rounded-t-md transition-all duration-500', cnt > 0 ? 'bg-state-current' : 'bg-muted')}
                style={{ height: `${Math.max(4, (cnt / maxUpdates) * 60)}px` }}
              />
              <span className="text-[11px] text-muted-foreground font-mono">R{i + 1}</span>
            </div>
          ))}
          {/* Placeholder for future rounds */}
          {Array.from({ length: Math.max(0, totalRounds - roundUpdatesHistory.length) }).map((_, i) => (
            <div key={`ph-${i}`} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[11px] font-bold text-muted-foreground opacity-0">0</span>
              <div className="w-full rounded-t-md bg-muted h-1" />
              <span className="text-[11px] text-hint font-mono">R{roundUpdatesHistory.length + i + 1}</span>
            </div>
          ))}
        </Panel>
      )}

      {/* Negative cycle warning */}
      {isNegCycle && (
        <div className={cn('rounded-2xl border p-4 text-sm', toneSoft.danger, toneBorder.danger)}>
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
            {tr('음수 사이클 감지됨', 'Negative cycle detected')}
          </div>
          <p className="text-[13px] leading-relaxed">
            {tr(
              'V번째 라운드에서 거리가 추가로 갱신되었습니다. 이 그래프에는 음수 사이클이 존재하여 최단 경로가 정의되지 않습니다. 벨만-포드는 이를 감지하고 알림을 반환합니다.',
              'A distance was still improved in round V. This graph contains a negative cycle, so shortest paths are undefined. Bellman-Ford detects this and reports it.',
            )}
          </p>
        </div>
      )}
    </div>
  );
}

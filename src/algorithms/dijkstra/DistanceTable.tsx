import type { DijkstraStep } from './types';
import { INF } from './types';
import { Panel, cn } from '../../components/ui';
import { toneSoft, toneSolid } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface DistanceTableProps {
  step: DijkstraStep;
}

export default function DistanceTable({ step }: DistanceTableProps) {
  const tr = useTr();
  const { dist, visited, updatedCell, pq, type } = step;

  return (
    <div className="flex flex-col gap-4">
      {/* Distance array */}
      <Panel
        title={tr('거리 배열 dist[]', 'Distance array dist[]')}
        actions={<span className="text-xs text-muted-foreground font-mono">{tr('출발 노드: 0', 'source: 0')}</span>}
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
                  const isConfirmed = visited[i];
                  return (
                    <td key={i} className="px-2 py-2 text-center border-l border-border">
                      <span className={cn(
                        'inline-flex min-w-[44px] justify-center rounded-lg px-2 py-1.5 font-mono font-bold text-base transition-colors duration-300',
                        isUpdated ? `${toneSoft.candidate} ring-2 ring-state-candidate/50` : isConfirmed ? toneSoft.visited : '',
                      )}>
                        {d >= INF ? '∞' : d}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-2 text-xs font-semibold text-muted-foreground">{tr('확정', 'Settled')}</td>
                {visited.map((v, i) => (
                  <td key={i} className="px-4 py-2 text-center border-l border-border">
                    <span
                      className={cn('inline-block w-3.5 h-3.5 rounded-full', v ? 'bg-state-visited' : 'bg-state-idle border-2 border-state-idle-stroke')}
                      title={v ? tr('방문 확정', 'Settled') : tr('미확정', 'Not settled')}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Priority queue */}
      <Panel
        title={tr('우선순위 큐', 'Priority queue')}
        actions={<span className="text-xs text-muted-foreground">{tr('비용 오름차순', 'sorted by cost')}</span>}
        bodyClassName="p-3 min-h-[56px] flex flex-wrap gap-2 items-center"
      >
        {pq.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">{tr('큐가 비어 있어요', 'The queue is empty')}</span>
        ) : (
          pq.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                idx === 0 ? `${toneSoft.current} border-state-current/40` : 'bg-card border-border text-muted-foreground',
              )}
            >
              <span>{tr('비용', 'cost')} <b className="font-mono text-sm">{item.cost}</b></span>
              <span className="opacity-40">·</span>
              <span>{tr('노드', 'node')} <b className="font-mono text-sm">{item.node}</b></span>
              {idx === 0 && <span className={cn('ml-0.5 rounded px-1.5 py-px text-[11px] font-bold', toneSolid.current)}>{tr('다음', 'next')}</span>}
            </div>
          ))
        )}
      </Panel>
    </div>
  );
}

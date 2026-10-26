import type { AStarStep } from './types';
import { Lock, Eye } from 'lucide-react';
import { Panel, cn } from '../../components/ui';
import { toneSoft, toneSolid, toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

const fmt = (v: number) => (v === Infinity ? '∞' : v % 1 === 0 ? String(v) : v.toFixed(1));

export default function ScoreTable({ step }: { step: AStarStep }) {
  const tr = useTr();
  const N = step.f.length;
  const { currentProcessingNode, isImprovement, activeEdge, type } = step;
  const updatedNode = type === 'RELAX' && isImprovement && activeEdge ? activeEdge[1] : null;

  // Reconstruct sorted priority queue from openSet and f scores
  const pq = [...step.openSet]
    .map(node => ({ node, cost: step.f[node] }))
    .sort((a, b) => a.cost - b.cost);

  const rows: { label: string; values: number[]; highlight: boolean }[] = [
    { label: 'g(x)', values: step.g, highlight: true },
    { label: 'h(x)', values: step.h, highlight: false },
    { label: 'f(x)', values: step.f, highlight: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={tr('비용 테이블', 'Cost table')}
        actions={
          <div className="flex gap-3 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><Eye className={cn('w-3.5 h-3.5', toneText.candidate)} /> Open Set</span>
            <span className="flex items-center gap-1.5"><Lock className={cn('w-3.5 h-3.5', toneText.visited)} /> Closed Set</span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-xs text-muted-foreground font-semibold min-w-[56px]">{tr('노드', 'Node')}</th>
                {Array.from({ length: N }).map((_, i) => (
                  <th
                    key={i}
                    className={cn(
                      'px-3 py-2 text-center text-xs font-bold min-w-[60px] transition-colors duration-300',
                      currentProcessingNode === i ? toneSoft.current : 'text-muted-foreground',
                    )}
                  >
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className="border-t border-border first:border-t-0">
                  <td className="px-4 py-2 text-xs font-semibold font-mono text-muted-foreground">{row.label}</td>
                  {row.values.map((val, i) => {
                    const isUpdated = row.highlight && updatedNode === i;
                    return (
                      <td key={i} className="px-2 py-1.5 text-center border-l border-border">
                        <span className={cn(
                          'inline-flex min-w-[40px] justify-center rounded-lg px-2 py-1 font-mono text-sm transition-colors duration-300',
                          isUpdated
                            ? `${toneSoft.candidate} ring-2 ring-state-candidate/50 font-bold`
                            : row.label === 'h(x)' ? 'text-muted-foreground' : 'font-semibold',
                        )}>
                          {fmt(val)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="px-4 py-2 text-xs font-semibold text-muted-foreground">{tr('상태', 'State')}</td>
                {Array.from({ length: N }).map((_, i) => (
                  <td key={i} className="px-3 py-2 text-center align-middle border-l border-border">
                    {step.closedSet.includes(i) ? (
                      <Lock className={cn('w-3.5 h-3.5 mx-auto', toneText.visited)} aria-label="closed" />
                    ) : step.openSet.includes(i) ? (
                      <Eye className={cn('w-3.5 h-3.5 mx-auto', toneText.candidate)} aria-label="open" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-state-idle border border-state-idle-stroke mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border bg-muted/40 text-xs text-muted-foreground flex flex-col gap-1">
          <div><span className="font-mono font-bold text-foreground">g(x)</span>: {tr('출발점에서 노드까지의 실제 탐색 비용', 'actual cost from the start to the node')}</div>
          <div><span className="font-mono font-bold text-foreground">h(x)</span>: {tr('노드에서 도착점까지의 예상 비용 (휴리스틱)', 'estimated cost from the node to the goal (heuristic)')}</div>
          <div><span className="font-mono font-bold text-foreground">f(x)</span>: {tr('총 예상 비용 (g + h)', 'total estimated cost (g + h)')}</div>
        </div>
      </Panel>

      <Panel
        title={tr('우선순위 큐 (Open Set)', 'Priority queue (open set)')}
        actions={<span className="text-xs text-muted-foreground">{tr('f 오름차순', 'sorted by f')}</span>}
        bodyClassName="p-3 min-h-[56px] flex flex-wrap gap-2 items-center"
      >
        {pq.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">{tr('큐가 비어 있어요', 'The queue is empty')}</span>
        ) : (
          pq.map((item, idx) => (
            <div
              key={item.node}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                idx === 0 ? `${toneSoft.current} border-state-current/40` : 'bg-card border-border text-muted-foreground',
              )}
            >
              <span>f <b className="font-mono text-sm">{fmt(item.cost)}</b></span>
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

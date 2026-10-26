import type { PQItem } from './types';
import { INF } from './types';
import { Panel, cn } from '../../components/ui';
import { toneSoft, toneSolid } from '../../components/ui/tone';
import { useTr } from '../../i18n';

/** Prim's priority queue, deduplicated per node and sorted by key. The head is the next node to pop. */
export default function PrimPriorityQueue({ pq }: { pq: PQItem[] }) {
  const tr = useTr();
  const items = [...pq]
    .sort((a, b) => a.key - b.key)
    .filter((item, _, arr) => arr.find(x => x.node === item.node) === item);

  return (
    <Panel
      title={tr('우선순위 큐', 'Priority queue')}
      actions={<span className="text-xs text-muted-foreground">{tr('key 오름차순', 'sorted by key')}</span>}
      bodyClassName="p-3 min-h-[56px] flex flex-wrap gap-2 items-center"
    >
      {items.length === 0 ? (
        <span className="text-xs text-muted-foreground italic">{tr('큐가 비어 있어요', 'The queue is empty')}</span>
      ) : (
        items.map((item, idx) => (
          <div
            key={`${item.node}-${item.key}`}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
              idx === 0 ? `${toneSoft.current} border-state-current/40` : 'bg-card border-border text-muted-foreground',
            )}
          >
            <span>key <b className="font-mono text-sm">{item.key >= INF ? '∞' : item.key}</b></span>
            <span className="opacity-40">·</span>
            <span>{tr('노드', 'node')} <b className="font-mono text-sm">{item.node}</b></span>
            {idx === 0 && <span className={cn('ml-0.5 rounded px-1.5 py-px text-[11px] font-bold', toneSolid.current)}>{tr('다음', 'next')}</span>}
          </div>
        ))
      )}
    </Panel>
  );
}

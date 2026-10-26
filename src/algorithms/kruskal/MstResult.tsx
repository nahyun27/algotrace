import { Badge, Panel, cn } from '../../components/ui';
import { toneSoft, toneBorder, toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';
import type { Edge } from './types';

interface MstResultProps {
  edges: Edge[];
  totalCost: number;
  isDone: boolean;
  /** Text of the "done" pill, defaults to "MST complete" */
  doneLabel?: string;
  className?: string;
}

/** Accepted MST edges + running total. Shared by the Kruskal and Prim tabs (desktop and mobile). */
export default function MstResult({ edges, totalCost, isDone, doneLabel, className }: MstResultProps) {
  const tr = useTr();
  return (
    <Panel
      title={tr('MST 결과', 'MST result')}
      actions={<Badge tone="path">{edges.length} {tr('간선', edges.length === 1 ? 'edge' : 'edges')}</Badge>}
      className={cn('h-full flex flex-col', className)}
      bodyClassName="p-3 flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto"
    >
      {edges.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{tr('아직 간선이 없어요', 'No edges yet')}</p>
      ) : (
        <>
          {edges.map((e, i) => (
            <div
              key={i}
              className={cn('flex items-center justify-between rounded-lg border px-2.5 py-1 text-xs', toneSoft.path, toneBorder.path)}
            >
              <span className="font-mono font-bold">{e.u}–{e.v}</span>
              <span className="font-mono font-bold">w={e.weight}</span>
            </div>
          ))}
          <div className="mt-1 pt-1.5 border-t border-border flex justify-between text-xs font-bold">
            <span className="text-muted-foreground">{tr('총 비용', 'Total cost')}</span>
            <span className={cn('font-mono text-sm', toneText.path)}>{totalCost}</span>
          </div>
        </>
      )}
      {isDone && (
        <Badge tone="path" outline className="mt-1 justify-center rounded-full">
          ✓ {doneLabel ?? tr('MST 완성', 'MST complete')}
        </Badge>
      )}
    </Panel>
  );
}

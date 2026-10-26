import type { KahnStep, TopoNode } from './types';
import { Panel, cn } from '../../components/ui';
import { toneSoft } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  step: KahnStep;
  nodes: TopoNode[];
}

export default function InDegreeDisplay({ step, nodes }: Props) {
  const tr = useTr();
  return (
    <Panel
      title={tr('진입차수 (In-degree)', 'In-degree')}
      actions={
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className={cn('w-3 h-3 rounded-[4px] ring-2 ring-state-candidate/60', toneSoft.candidate)} />
            {tr('방금 감소', 'Just decreased')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={cn('w-3 h-3 rounded-[4px]', toneSoft.candidate)} />
            {tr('0 → 큐 대기', '0 → in queue')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={cn('w-3 h-3 rounded-[4px]', toneSoft.visited)} />
            {tr('처리 완료', 'Processed')}
          </span>
        </div>
      }
      bodyClassName="p-3 sm:p-4 flex flex-wrap gap-2"
    >
      {nodes.map(node => {
        const deg = step.inDegree[node.id];
        const isDone = step.result.includes(node.id);
        const isDecreased = step.decreasedNode === node.id;
        const isZero = deg === 0 && !isDone;

        const cellCls = isDone ? toneSoft.visited
          : isDecreased ? `${toneSoft.candidate} ring-2 ring-state-candidate/60`
          : isZero ? toneSoft.candidate
          : 'bg-muted text-muted-foreground';

        return (
          <div
            key={node.id}
            className={cn('flex flex-col items-center min-w-[60px] rounded-xl px-3 py-2 transition-all duration-200', cellCls)}
          >
            <span className="text-[11px] font-semibold opacity-80">{node.label}</span>
            <span className="font-mono text-lg font-bold leading-tight">{isDone ? '✓' : deg}</span>
          </div>
        );
      })}
    </Panel>
  );
}

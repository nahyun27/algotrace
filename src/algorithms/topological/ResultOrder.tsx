import { motion, AnimatePresence } from 'framer-motion';
import type { KahnStep, DFSTopoStep, TopoNode } from './types';
import { Panel, Badge, cn } from '../../components/ui';
import { toneSoft, toneBorder, toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  step: KahnStep | DFSTopoStep;
  mode: 'Kahn' | 'DFS';
  nodes: TopoNode[];
  vertical?: boolean;
}

export default function ResultOrder({ step, mode, nodes, vertical = false }: Props) {
  const tr = useTr();
  const isDone = step.type === 'DONE';
  const isCycle = step.hasCycle;

  // Kahn: result is built incrementally.
  // DFS: result is only set on DONE; before that show the partial order from the stack.
  const dfsStep = step as DFSTopoStep;
  const displayList = mode === 'Kahn'
    ? (step as KahnStep).result
    : isDone
      ? dfsStep.result
      : [...dfsStep.stack].reverse();

  const chipCls = cn('border font-bold text-center', isDone ? `${toneSoft.path} ${toneBorder.path}` : `${toneSoft.visited} ${toneBorder.visited}`);
  const emptyText = isCycle ? tr('위상정렬 불가', 'No valid order') : tr('아직 결과가 없어요…', 'No result yet…');

  return (
    <Panel
      title={mode === 'Kahn'
        ? tr('위상정렬 결과', 'Topological order')
        : vertical ? tr('정렬 결과', 'Order') : tr('위상정렬 결과 (스택 역순)', 'Topological order (reversed stack)')}
      actions={
        <>
          {isDone && !isCycle && <Badge tone="path">{tr('✓ 완료', '✓ Done')}</Badge>}
          {isCycle && <Badge tone="danger">{tr('✗ 사이클', '✗ Cycle')}</Badge>}
        </>
      }
      className={vertical ? 'h-full' : undefined}
      bodyClassName={vertical ? 'p-3' : 'p-4'}
    >
      {vertical ? (
        <div className="flex flex-col items-center gap-1 overflow-y-auto flex-1 min-h-[120px]">
          <AnimatePresence mode="popLayout">
            {displayList.length === 0 ? (
              <motion.span key="empty-v" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={cn('text-xs italic mt-4', isCycle ? toneText.danger : 'text-muted-foreground')}>
                {emptyText}
              </motion.span>
            ) : (
              displayList.map((nodeId, i) => (
                <motion.div
                  key={`${nodeId}-${i}`}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground w-4 text-right">{i + 1}</span>
                    <div className={cn(chipCls, 'px-2 py-1 rounded-lg text-xs min-w-[32px]')}>
                      {nodes[nodeId]?.label ?? nodeId}
                    </div>
                  </div>
                  {i < displayList.length - 1 && (
                    <span className="text-muted-foreground text-[11px] leading-none my-0.5">↓</span>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap min-h-[52px]">
          <AnimatePresence mode="popLayout">
            {displayList.length === 0 ? (
              <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={cn('text-sm italic', isCycle ? toneText.danger : 'text-muted-foreground')}>
                {emptyText}
              </motion.span>
            ) : (
              displayList.map((nodeId, i) => (
                <motion.div
                  key={`${nodeId}-${i}`}
                  layout
                  initial={{ opacity: 0, x: -16, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-mono text-muted-foreground">{i + 1}</span>
                    <div className={cn(chipCls, 'px-2.5 py-1.5 rounded-xl text-sm')}>
                      {nodes[nodeId]?.label ?? nodeId}
                    </div>
                  </div>
                  {i < displayList.length - 1 && (
                    <span className="text-muted-foreground text-sm mt-4">→</span>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </Panel>
  );
}

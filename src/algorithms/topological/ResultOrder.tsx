import { motion, AnimatePresence } from 'framer-motion';
import type { KahnStep, DFSTopoStep, TopoNode } from './types';

interface Props {
  step: KahnStep | DFSTopoStep;
  mode: 'Kahn' | 'DFS';
  nodes: TopoNode[];
  vertical?: boolean;
}

export default function ResultOrder({ step, mode, nodes, vertical = false }: Props) {
  const isDone    = step.type === 'DONE';
  const isCycle   = step.hasCycle;

  // For Kahn: result is built incrementally
  // For DFS: result only set on DONE step; show stack order otherwise
  const kahnResult = mode === 'Kahn' ? (step as KahnStep).result : [];
  const dfsStep    = step as DFSTopoStep;
  const displayList = mode === 'Kahn'
    ? kahnResult
    : isDone
      ? dfsStep.result
      : [...dfsStep.stack].reverse(); // show partial order from stack

  return (
    <div className={`bg-card rounded-xl border shadow-sm flex flex-col gap-2 sm:gap-3 ${vertical ? 'p-2 sm:p-3 h-full' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-semibold text-xs sm:text-sm">
          {mode === 'Kahn' ? '위상정렬 결과' : (vertical ? '정렬 결과' : '위상정렬 결과 (스택 역순)')}
        </h3>
        {isDone && !isCycle && (
          <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 sm:px-2 py-0.5 rounded-full">
            ✓ 완료
          </span>
        )}
        {isCycle && (
          <span className="text-[9px] sm:text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-1.5 sm:px-2 py-0.5 rounded-full">
            ✗ 사이클
          </span>
        )}
      </div>

      {vertical ? (
        /* Vertical list for mobile (stacked one per row, top→bottom) */
        <div className="flex flex-col items-center gap-1 overflow-y-auto flex-1 min-h-[120px]">
          <AnimatePresence mode="popLayout">
            {displayList.length === 0 ? (
              <motion.span
                key="empty-v"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-muted-foreground italic mt-4"
              >
                {isCycle ? '위상정렬 불가' : '아직 결과 없음...'}
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
                    <span className="text-[9px] text-muted-foreground w-3 text-right">{i + 1}</span>
                    <div className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold min-w-[28px] text-center">
                      {nodes[nodeId]?.label ?? nodeId}
                    </div>
                  </div>
                  {i < displayList.length - 1 && (
                    <span className="text-muted-foreground text-[10px] leading-none my-0.5">↓</span>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Horizontal list for desktop */
        <div className="flex items-center gap-1.5 flex-wrap min-h-[48px]">
          <AnimatePresence mode="popLayout">
            {displayList.length === 0 ? (
              <motion.span
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground italic"
              >
                {isCycle ? '위상정렬 불가' : '아직 결과 없음...'}
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
                    <span className="text-[9px] text-muted-foreground">{i + 1}</span>
                    <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      {nodes[nodeId]?.label ?? nodes[nodeId]?.id ?? nodeId}
                    </div>
                  </div>
                  {i < displayList.length - 1 && (
                    <span className="text-muted-foreground text-xs mt-3">→</span>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

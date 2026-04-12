import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import type { BaseStep, BFSStep, DFSStep, DataItem } from './types';

interface QueueStackDisplayProps {
  step: BaseStep;
  mode: 'BFS' | 'DFS';
}

export default function QueueStackDisplay({ step, mode }: QueueStackDisplayProps) {
  const isBFS = mode === 'BFS';
  
  // Safely extract items
  const items = React.useMemo(() => {
    const isBFS_inner = mode === 'BFS';
    if (isBFS_inner && 'queue' in step) {
      return (step as BFSStep).queue;
    } else if (!isBFS_inner && 'stack' in step) {
      return (step as DFSStep).stack;
    }
    return [] as DataItem[];
  }, [step, mode]);

  return (
    <div className="bg-card rounded-xl border p-2 sm:p-4 shadow-sm flex flex-col w-full overflow-hidden">
      <div className="flex flex-col mb-2 sm:mb-4">
        <h3 className="font-semibold tracking-tight text-[13px] sm:text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          {isBFS ? (
            <>
              <span>📦 큐 (Queue)</span>
              <span className="text-[10px] sm:text-xs font-normal text-muted-foreground bg-muted px-1.5 sm:px-2 py-0.5 rounded sm:ml-2 w-fit">FIFO (First-In, First-Out)</span>
            </>
          ) : (
            <>
              <span>📚 스택 (Stack)</span>
              <span className="text-[10px] sm:text-xs font-normal text-muted-foreground bg-muted px-1.5 sm:px-2 py-0.5 rounded sm:ml-2 w-fit">LIFO (Last-In, First-Out)</span>
            </>
          )}
        </h3>
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted/20 border rounded-lg p-2 sm:p-6 overflow-x-auto min-h-[112px] sm:min-h-[140px] relative">
        {isBFS ? (
          // QUEUE VISUALIZATION (Horizontal, Enqueue Right, Dequeue Left)
          <div className="flex items-center gap-1 sm:gap-2 relative min-w-max">
            {/* Output arrow (Dequeue) */}
            <div className="flex flex-col items-center justify-center mr-1 sm:mr-2 text-muted-foreground">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase mb-0.5 sm:mb-1">Pop</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            {/* Container bounds — consistent size whether empty or filled */}
            <div className="flex items-center gap-1.5 sm:gap-2 border-y-2 border-l-0 border-r-0 border-zinc-300 dark:border-zinc-700 py-2 sm:py-3 px-2 min-w-[160px] sm:min-w-[200px] min-h-[56px] sm:min-h-[72px]">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty-queue"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] sm:text-xs text-muted-foreground italic w-full text-center"
                  >
                    큐가 비어있습니다
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 50, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="w-9 h-9 sm:w-12 sm:h-12 shrink-0 bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600 rounded-lg flex items-center justify-center font-bold text-[13px] sm:text-base text-sky-800 dark:text-sky-200 shadow-sm"
                    >
                      {item.value}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Input arrow (Enqueue) */}
            <div className="flex flex-col items-center justify-center ml-1 sm:ml-2 text-muted-foreground">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase mb-0.5 sm:mb-1">Push</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        ) : (
          // STACK VISUALIZATION (Vertical, Bottom up)
          <div className="flex flex-col items-center relative h-full">
            <div className="flex items-center gap-6 mb-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase">Push / Pop</span>
                <ArrowDown size={14} className="transform rotate-180" />
                <ArrowDown size={14} />
              </div>
            </div>

            {/* Container bounds */}
            <div className="flex flex-col-reverse items-center justify-start gap-1.5 border-x-2 border-b-2 border-t-0 border-zinc-300 dark:border-zinc-700 px-6 py-2 min-h-[220px] w-28 relative">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty-stack"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground italic w-full text-center mt-[80px]"
                  >
                    스택 비어있음
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -80, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="w-14 h-8 shrink-0 bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600 rounded flex items-center justify-center font-bold text-sky-800 dark:text-sky-200 text-xs shadow-sm"
                    >
                      {item.value}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

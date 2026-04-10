import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import type { BaseStep, BFSStep, DFSStep } from './types';

interface QueueStackDisplayProps {
  step: BaseStep;
  mode: 'BFS' | 'DFS';
}

export default function QueueStackDisplay({ step, mode }: QueueStackDisplayProps) {
  const isBFS = mode === 'BFS';
  
  // Safely extract items
  const items = React.useMemo(() => {
    if (isBFS && 'queue' in step) {
      return (step as BFSStep).queue;
    } else if (!isBFS && 'stack' in step) {
      return (step as DFSStep).stack;
    }
    return [];
  }, [step, mode, isBFS]);

  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm flex flex-col w-full overflow-hidden">
      <div className="flex flex-col mb-4">
        <h3 className="font-semibold tracking-tight text-sm flex items-center gap-2">
          {isBFS ? (
            <>
              📦 큐 (Queue) 상태
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded ml-2">FIFO (First-In, First-Out)</span>
            </>
          ) : (
            <>
              📚 스택 (Stack) 상태
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded ml-2">LIFO (Last-In, First-Out)</span>
            </>
          )}
        </h3>
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted/20 border rounded-lg p-6 overflow-x-auto min-h-[140px] relative">
        {isBFS ? (
          // QUEUE VISUALIZATION (Horizontal, Enqueue Right, Dequeue Left)
          <div className="flex items-center gap-2 relative min-w-max">
            {/* Output arrow (Dequeue) */}
            <div className="flex flex-col items-center justify-center mr-2 text-muted-foreground">
              <span className="text-[10px] font-bold uppercase mb-1">Pop</span>
              <ArrowRight size={16} />
            </div>

            {/* Container bounds */}
            <div className="flex items-center gap-2 border-y-2 border-l-0 border-r-0 border-zinc-300 dark:border-zinc-700 py-3 px-2 min-w-[200px]">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground italic w-full text-center"
                  >
                    큐가 비어있습니다
                  </motion.div>
                ) : (
                  items.map((node, i) => (
                    <motion.div
                      key={`queue-${node}-${items.length - i}`} // Unique key trick to maintain LTR motion
                      layout
                      initial={{ opacity: 0, x: 50, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="w-12 h-12 shrink-0 bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600 rounded-lg flex items-center justify-center font-bold text-sky-800 dark:text-sky-200 shadow-sm"
                    >
                      {node}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Input arrow (Enqueue) */}
            <div className="flex flex-col items-center justify-center ml-2 text-muted-foreground">
              <span className="text-[10px] font-bold uppercase mb-1">Push</span>
              <ArrowRight size={16} />
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
            <div className="flex flex-col-reverse items-center justify-start gap-2 border-x-2 border-b-2 border-t-0 border-zinc-300 dark:border-zinc-700 px-6 py-2 min-h-[180px] w-32 relative">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground italic w-full text-center mt-[80px]"
                  >
                    스택 비어있음
                  </motion.div>
                ) : (
                  items.map((node, i) => (
                    <motion.div
                      key={`stack-${node}-${i}`}
                      layout
                      initial={{ opacity: 0, y: -30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="w-16 h-10 shrink-0 bg-sky-100 dark:bg-sky-900/40 border-2 border-sky-300 dark:border-sky-600 rounded flex items-center justify-center font-bold text-sky-800 dark:text-sky-200 shadow-sm"
                    >
                      {node}
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

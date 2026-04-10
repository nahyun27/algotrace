import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { BaseStep } from './types';

interface VisitOrderDisplayProps {
  step: BaseStep;
  totalNodes: number;
}

export default function VisitOrderDisplay({ step, totalNodes }: VisitOrderDisplayProps) {
  const visited = step.visitedNodes;

  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm h-full flex flex-col">
      <h3 className="font-semibold tracking-tight text-sm mb-4">📍 방문 순서 (Visit Order)</h3>
      
      <div className="flex-1 flex items-center justify-start flex-wrap gap-y-4 px-2 min-h-[40px]">
        <AnimatePresence>
          {visited.map((node, i) => (
            <React.Fragment key={`visit-${node}-${i}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-600 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-300 shadow-sm"
              >
                {node}
              </motion.div>
              {i < visited.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-muted-foreground mx-1"
                >
                  <ArrowRight size={16} />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
        
        {visited.length === 0 && (
          <span className="text-sm text-muted-foreground italic pl-2">아직 방문한 노드가 없습니다.</span>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
          진행률: {visited.length} / {totalNodes}
        </span>
      </div>
    </div>
  );
}

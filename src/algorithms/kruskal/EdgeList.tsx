import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KruskalStep, Edge } from './types';

interface Props {
  step: KruskalStep;
}

function edgeKey(e: Edge) { return `${Math.min(e.u,e.v)}-${Math.max(e.u,e.v)}`; }

type EdgeStatus = 'pending' | 'current' | 'accepted' | 'rejected';

function getStatus(e: Edge, step: KruskalStep): EdgeStatus {
  const key = edgeKey(e);
  if (step.mstEdges.some(m => edgeKey(m) === key)) return 'accepted';
  if (step.rejectedEdges.some(r => edgeKey(r) === key)) return 'rejected';
  if (step.currentEdge && edgeKey(step.currentEdge) === key) return 'current';
  return 'pending';
}

const STATUS_STYLES: Record<EdgeStatus, string> = {
  pending:  'bg-card text-muted-foreground border-border',
  current:  'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  accepted: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  rejected: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800',
};

const STATUS_BADGE: Record<EdgeStatus, { label: string; cls: string }> = {
  pending:  { label: '대기',    cls: 'bg-muted text-muted-foreground' },
  current:  { label: '검토 중', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  accepted: { label: 'MST ✓',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  rejected: { label: '사이클', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

export default function KruskalEdgeList({ step }: Props) {
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [step.currentEdge]);

  return (
    <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden h-full">
      <div className="p-2 sm:p-3 border-b bg-muted/30 flex items-center gap-1.5 sm:gap-2">
        <h3 className="font-semibold text-xs sm:text-sm">정렬된 간선 목록</h3>
        <span className="text-[9px] sm:text-[11px] text-muted-foreground bg-muted px-1.5 sm:px-2 py-0.5 rounded-full">
          {step.mstEdges.length} / {step.sortedEdges.length} 처리
        </span>
      </div>

      <div className="overflow-y-auto flex-1 divide-y">
        <AnimatePresence initial={false}>
          {step.sortedEdges.map((e, i) => {
            const status = getStatus(e, step);
            const badge = STATUS_BADGE[status];
            const rowCls = STATUS_STYLES[status];
            const isCurrent = status === 'current';
            return (
              <motion.div
                key={`${e.u}-${e.v}`}
                ref={isCurrent ? currentRef : undefined}
                layout
                animate={{ backgroundColor: isCurrent ? 'rgba(59,130,246,0.08)' : 'transparent' }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2.5 border-l-4 transition-colors ${rowCls}`}
                style={{ borderLeftColor: isCurrent ? '#3b82f6' : status === 'accepted' ? '#22c55e' : status === 'rejected' ? '#ef4444' : 'transparent' }}
              >
                <span className="text-[9px] sm:text-xs text-muted-foreground w-3 sm:w-5 shrink-0 text-right">{i + 1}</span>
                <span className={`font-mono font-bold text-[11px] sm:text-sm ${status === 'rejected' ? 'line-through opacity-60' : ''}`}>
                  {e.u}–{e.v}
                </span>
                <span className="text-[9px] sm:text-xs font-semibold px-1 sm:px-2 py-0.5 rounded bg-muted/60 text-muted-foreground shrink-0">
                  w={e.weight}
                </span>
                <span className="ml-auto shrink-0">
                  <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpDown, Package, Layers } from 'lucide-react';
import type { BaseStep, BFSStep, DFSStep, DataItem } from './types';
import { Panel, Badge, cn } from '../../components/ui';
import { toneSoft, toneBorder } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface QueueStackDisplayProps {
  step: BaseStep;
  mode: 'BFS' | 'DFS';
  /** Optional panel title override (defaults to "Queue" / "Stack") */
  title?: ReactNode;
  /** Optional renderer for an item's value (e.g. a node label instead of its id) */
  formatItem?: (value: number) => ReactNode;
  /** Ring the item that comes out next (front of queue / top of stack). Default true. */
  highlightNext?: boolean;
}

export default function QueueStackDisplay({ step, mode, title, formatItem, highlightNext = true }: QueueStackDisplayProps) {
  const tr = useTr();
  const isBFS = mode === 'BFS';

  const items = useMemo<DataItem[]>(() => {
    if (isBFS && 'queue' in step) return (step as BFSStep).queue;
    if (!isBFS && 'stack' in step) return (step as DFSStep).stack;
    return [];
  }, [step, isBFS]);

  const render = (v: number) => (formatItem ? formatItem(v) : v);
  const itemCls = cn('shrink-0 border-2 flex items-center justify-center font-bold shadow-sm', toneSoft.candidate, toneBorder.candidate);

  return (
    <Panel
      title={title ?? (isBFS ? tr('큐 (Queue)', 'Queue') : tr('스택 (Stack)', 'Stack'))}
      icon={isBFS ? Package : Layers}
      iconTone="candidate"
      actions={<Badge>{isBFS ? 'FIFO' : 'LIFO'}</Badge>}
      bodyClassName="p-3 sm:p-4"
    >
      <div className="flex items-center justify-center rounded-xl bg-muted/40 p-3 sm:p-5 overflow-x-auto min-h-[120px]">
        {isBFS ? (
          // Queue: enqueue on the right, dequeue on the left
          <div className="flex items-center gap-2 min-w-max">
            <div className="flex flex-col items-center text-muted-foreground">
              <span className="text-[11px] font-bold uppercase mb-0.5">{tr('꺼냄', 'Out')}</span>
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-2 border-y-2 border-border py-2.5 px-2 min-w-[180px] min-h-[64px]">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty-queue"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground italic w-full text-center"
                  >
                    {tr('큐가 비어 있어요', 'The queue is empty')}
                  </motion.div>
                ) : (
                  items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 50, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={cn(itemCls, 'min-w-10 h-10 sm:min-w-11 sm:h-11 px-2 rounded-xl font-mono text-base', highlightNext && i === 0 && 'ring-2 ring-state-current/50')}
                    >
                      {render(item.value)}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center text-muted-foreground">
              <span className="text-[11px] font-bold uppercase mb-0.5">{tr('넣음', 'In')}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ) : (
          // Stack: grows bottom-up, push/pop at the top
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-2 text-muted-foreground">
              <span className="text-[11px] font-bold uppercase">Push / Pop</span>
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>

            <div className="flex flex-col-reverse items-center justify-start gap-1.5 border-x-2 border-b-2 border-border rounded-b-xl px-4 py-2 min-h-[200px] min-w-28">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty-stack"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground italic w-full text-center mt-[72px]"
                  >
                    {tr('스택이 비어 있어요', 'The stack is empty')}
                  </motion.div>
                ) : (
                  items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -80, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={cn(itemCls, 'min-w-16 h-8 px-2.5 rounded-lg text-xs', highlightNext && i === items.length - 1 && 'ring-2 ring-state-current/50')}
                    >
                      {render(item.value)}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

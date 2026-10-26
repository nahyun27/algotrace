import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import type { BaseStep } from './types';
import { Panel, Badge, cn } from '../../components/ui';
import { toneSoft, toneBorder } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface VisitOrderDisplayProps {
  step: BaseStep;
  totalNodes: number;
}

export default function VisitOrderDisplay({ step, totalNodes }: VisitOrderDisplayProps) {
  const tr = useTr();
  const visited = step.visitedNodes;
  const done = step.type === 'DONE';

  return (
    <Panel
      title={tr('방문 순서', 'Visit order')}
      icon={MapPin}
      iconTone="visited"
      actions={
        <Badge tone={done ? 'path' : 'neutral'}>
          <span className="font-mono">{visited.length} / {totalNodes}</span>
        </Badge>
      }
      className="h-full"
      bodyClassName="p-4 flex items-center flex-wrap gap-y-3 min-h-[88px]"
    >
      <AnimatePresence>
        {visited.map((node, i) => (
          <Fragment key={`visit-${node}-${i}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold shadow-sm',
                done ? `${toneSoft.path} ${toneBorder.path}` : `${toneSoft.visited} ${toneBorder.visited}`,
              )}
            >
              {node}
            </motion.div>
            {i < visited.length - 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-muted-foreground mx-1">
                <ArrowRight size={16} />
              </motion.div>
            )}
          </Fragment>
        ))}
      </AnimatePresence>

      {visited.length === 0 && (
        <span className="text-sm text-muted-foreground italic">{tr('아직 방문한 노드가 없어요.', 'No nodes visited yet.')}</span>
      )}
    </Panel>
  );
}

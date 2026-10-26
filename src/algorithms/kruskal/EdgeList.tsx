import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KruskalStep, Edge } from './types';
import { Badge, Panel, cn, type Tone } from '../../components/ui';
import { toneSoft } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  step: KruskalStep;
}

function edgeKey(e: Edge) { return `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`; }

type EdgeStatus = 'pending' | 'current' | 'accepted' | 'rejected';

function getStatus(e: Edge, step: KruskalStep): EdgeStatus {
  const key = edgeKey(e);
  if (step.mstEdges.some(m => edgeKey(m) === key)) return 'accepted';
  if (step.rejectedEdges.some(r => edgeKey(r) === key)) return 'rejected';
  if (step.currentEdge && edgeKey(step.currentEdge) === key) return 'current';
  return 'pending';
}

const STATUS_TONE: Record<EdgeStatus, Tone> = {
  pending: 'neutral',
  current: 'candidate',
  accepted: 'path',
  rejected: 'danger',
};

const STATUS_BORDER: Record<EdgeStatus, string> = {
  pending: 'border-l-transparent',
  current: 'border-l-state-candidate',
  accepted: 'border-l-state-path',
  rejected: 'border-l-state-danger',
};

export default function KruskalEdgeList({ step }: Props) {
  const tr = useTr();
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [step.currentEdge]);

  const label: Record<EdgeStatus, string> = {
    pending: tr('대기', 'Waiting'),
    current: tr('검토 중', 'Checking'),
    accepted: 'MST ✓',
    rejected: tr('사이클', 'Cycle'),
  };

  return (
    <Panel
      title={tr('정렬된 간선 목록', 'Sorted edges')}
      actions={
        <Badge>
          <span className="font-mono">{step.mstEdges.length} / {step.sortedEdges.length}</span>
          {tr('MST 채택', 'in the MST')}
        </Badge>
      }
      className="h-full flex flex-col"
      bodyClassName="flex-1 min-h-0 overflow-y-auto divide-y divide-border"
    >
      <AnimatePresence initial={false}>
        {step.sortedEdges.map((e, i) => {
          const status = getStatus(e, step);
          const isCurrent = status === 'current';
          return (
            <motion.div
              key={`${e.u}-${e.v}`}
              ref={isCurrent ? currentRef : undefined}
              layout
              transition={{ duration: 0.3 }}
              className={cn(
                'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border-l-4 transition-colors duration-300',
                STATUS_BORDER[status],
                status === 'pending' ? 'text-muted-foreground' : toneSoft[STATUS_TONE[status]],
              )}
            >
              <span className="text-[11px] sm:text-xs text-muted-foreground w-4 sm:w-5 shrink-0 text-right font-mono">{i + 1}</span>
              <span className={cn('font-mono font-bold text-sm', status === 'rejected' && 'line-through opacity-70')}>
                {e.u}–{e.v}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold font-mono px-1.5 py-0.5 rounded-md bg-card/70 text-muted-foreground shrink-0">
                w={e.weight}
              </span>
              <Badge tone={STATUS_TONE[status]} className="ml-auto shrink-0 rounded-full">
                {label[status]}
              </Badge>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Panel>
  );
}

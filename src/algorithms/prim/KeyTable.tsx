import { motion } from 'framer-motion';
import type { PrimStep } from './types';
import { INF } from './types';
import { Panel, cn } from '../../components/ui';
import { toneSoft, toneText } from '../../components/ui/tone';
import Legend from '../../components/viz/Legend';
import { useTr } from '../../i18n';

interface Props {
  step: PrimStep;
  N: number;
}

export default function PrimKeyTable({ step, N }: Props) {
  const tr = useTr();
  const { key, parent, visited, type, updatedNode, currentNode } = step;
  const nodes = Array.from({ length: N }, (_, i) => i);

  return (
    <Panel
      title={tr('Key / Parent 배열', 'Key / Parent arrays')}
      actions={<span className="text-xs text-muted-foreground font-mono">{tr('시작 노드: 0', 'start: 0')}</span>}
      bodyClassName="flex flex-col"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left text-xs text-muted-foreground font-semibold">{tr('노드', 'Node')}</th>
              {nodes.map(i => (
                <th key={i} className="px-4 py-2 text-center text-xs font-bold text-muted-foreground min-w-[56px]">{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* key[] row */}
            <tr>
              <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">key</td>
              {nodes.map(i => {
                const isUpdated   = type === 'UPDATE' && updatedNode === i;
                const isConfirmed = visited[i];
                const isCurr      = currentNode === i && !isConfirmed;
                return (
                  <td key={i} className="px-2 py-2 text-center border-l border-border">
                    <motion.span
                      key={`k-${i}-${key[i]}`}
                      initial={isUpdated ? { scale: 1.35 } : { scale: 1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        'inline-flex min-w-[44px] justify-center rounded-lg px-2 py-1.5 font-mono font-bold text-base transition-colors duration-300',
                        isUpdated ? `${toneSoft.candidate} ring-2 ring-state-candidate/50`
                          : isConfirmed ? toneSoft.visited
                          : isCurr ? `${toneSoft.current} ring-2 ring-state-current/40`
                          : '',
                      )}
                    >
                      {key[i] >= INF ? '∞' : key[i]}
                    </motion.span>
                  </td>
                );
              })}
            </tr>

            {/* parent[] row */}
            <tr className="border-t border-border">
              <td className="px-4 py-2 text-xs font-semibold text-muted-foreground">parent</td>
              {nodes.map(i => (
                <td key={i} className="px-4 py-2 text-center text-sm border-l border-border font-mono">
                  <span className={visited[i] ? cn(toneText.visited, 'font-bold') : 'text-muted-foreground'}>
                    {parent[i] === -1 ? '—' : parent[i]}
                  </span>
                </td>
              ))}
            </tr>

            {/* MST confirmed row */}
            <tr className="border-t border-border">
              <td className="px-4 py-2 text-xs font-semibold text-muted-foreground">MST</td>
              {nodes.map(i => (
                <td key={i} className="px-4 py-2 text-center border-l border-border">
                  <span
                    className={cn('inline-block w-3.5 h-3.5 rounded-full', visited[i] ? 'bg-state-visited' : 'bg-state-idle border-2 border-state-idle-stroke')}
                    title={visited[i] ? tr('MST 확정', 'In MST') : tr('미확정', 'Not yet')}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Legend
        className="justify-start px-4 py-2.5 border-t border-border"
        items={[
          { state: 'visited',   label: tr('MST 확정', 'In MST'), kind: 'cell' },
          { state: 'candidate', label: tr('방금 갱신', 'Just updated'), kind: 'cell' },
          { state: 'current',   label: tr('현재 처리 중', 'Processing'), kind: 'cell' },
        ]}
      />
    </Panel>
  );
}

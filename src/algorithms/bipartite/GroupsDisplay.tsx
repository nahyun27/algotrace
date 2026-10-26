import { motion, AnimatePresence } from 'framer-motion';
import type { BipartiteStep } from './types';
import { Panel, Badge, cn } from '../../components/ui';
import { toneSoft, toneBorder, toneText, type Tone } from '../../components/ui/tone';
import { useTr } from '../../i18n';

/** The two sides of the coloring: group A (path tone) and group B (visited tone). */
export default function GroupsDisplay({ step }: { step: BipartiteStep }) {
  const tr = useTr();
  const conflict: number[] = step.conflictEdge ?? [];

  const rows: { group: 0 | 1; tone: Tone; label: string }[] = [
    { group: 0, tone: 'path', label: tr('그룹 A', 'Group A') },
    { group: 1, tone: 'visited', label: tr('그룹 B', 'Group B') },
  ];
  const uncolored = step.color.flatMap((c, i) => (c === -1 ? [i] : []));

  const answer = step.isBipartite;

  return (
    <Panel
      title={tr('두 그룹', 'The two groups')}
      actions={
        answer === null
          ? <Badge>{tr(`연결 요소 ${Math.max(step.component + 1, 0)}개`, `${Math.max(step.component + 1, 0)} component(s)`)}</Badge>
          : <Badge tone={answer ? 'path' : 'danger'}>{answer ? 'YES' : 'NO'}</Badge>
      }
      className="h-full"
      bodyClassName="p-3 sm:p-4 flex flex-col gap-2.5"
    >
      {rows.map(({ group, tone, label }) => {
        const members = step.color.flatMap((c, i) => (c === group ? [i] : []));
        return (
          <div key={group} className={cn('flex items-center gap-3 rounded-xl border px-3 py-2 min-h-[52px]', toneSoft[tone], toneBorder[tone])}>
            <span className={cn('w-16 shrink-0 text-xs font-bold', toneText[tone])}>{label}</span>
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence>
                {members.map(v => (
                  <motion.span
                    key={v}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 bg-card flex items-center justify-center font-mono text-sm font-bold',
                      conflict.includes(v) ? `${toneBorder.danger} ${toneText.danger} ring-2 ring-state-danger/50`
                        : step.currentNode === v ? `${toneBorder[tone]} ring-2 ring-state-current/60`
                        : toneBorder[tone],
                    )}
                  >
                    {v}
                  </motion.span>
                ))}
              </AnimatePresence>
              {members.length === 0 && <span className="text-xs text-muted-foreground italic self-center">{tr('비어 있어요', 'empty')}</span>}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-3 px-3 text-xs text-muted-foreground">
        <span className="w-16 shrink-0 font-semibold">{tr('미색칠', 'Uncolored')}</span>
        <span className="font-mono">{uncolored.length ? uncolored.join(', ') : tr('없음', 'none')}</span>
      </div>
    </Panel>
  );
}

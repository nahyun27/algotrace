import { motion } from 'framer-motion';
import type { SortStep } from './types';
import { NODE_COLORS, type VizState } from '../../components/viz/palette';
import Legend from '../../components/viz/Legend';
import { useTr } from '../../i18n';

interface Props {
  step: SortStep;
}

function getBarState(idx: number, step: SortStep): VizState {
  if (step.sorted.includes(idx)) return 'visited';
  if (step.swapping.includes(idx)) return 'danger';
  if (step.pivot === idx) return 'current';
  if (step.comparing.includes(idx)) return 'candidate';
  return 'idle';
}

export default function ArrayCanvas({ step }: Props) {
  const tr = useTr();
  const { array } = step;
  const maxVal = Math.max(...array, 1);
  const n = array.length;
  const showValues = n <= 20;

  return (
    <div className="viz-surface w-full h-full flex flex-col">
      {/* Bars */}
      <div className="flex-1 flex items-end justify-center gap-[2px] sm:gap-1 px-2 sm:px-4 pt-4 pb-1 min-h-[180px]">
        {array.map((val, idx) => {
          const heightPct = (val / maxVal) * 100;
          const state = getBarState(idx, step);
          const c = NODE_COLORS[state];
          const isActive = state === 'candidate' || state === 'danger' || state === 'current';

          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[48px] h-full">
              {showValues && (
                <motion.span
                  className="text-[11px] sm:text-xs font-bold mb-0.5 tabular-nums"
                  style={{ color: state === 'idle' ? 'var(--muted-foreground)' : c.stroke }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {val}
                </motion.span>
              )}
              <div className="flex-1 w-full flex items-end">
                <motion.div
                  className="w-full rounded-t-md border-2 border-b-0 transition-colors duration-200"
                  style={{ backgroundColor: c.fill, borderColor: c.stroke }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Index labels */}
      {showValues && (
        <div className="flex justify-center gap-[2px] sm:gap-1 px-2 sm:px-4 pt-1 pb-1 border-t border-border">
          {array.map((_, idx) => (
            <div key={idx} className="flex-1 max-w-[48px] text-center text-[11px] font-mono text-hint tabular-nums">
              {idx}
            </div>
          ))}
        </div>
      )}

      <Legend
        className="px-3 py-2"
        items={[
          { state: 'candidate', label: tr('비교 중', 'Comparing'), kind: 'cell' },
          { state: 'danger', label: tr('교환 / 이동', 'Swap / shift'), kind: 'cell' },
          { state: 'current', label: tr('피벗', 'Pivot'), kind: 'cell' },
          { state: 'visited', label: tr('정렬 완료', 'Sorted'), kind: 'cell' },
          { state: 'idle', label: tr('미정렬', 'Unsorted'), kind: 'cell' },
        ]}
      />
    </div>
  );
}

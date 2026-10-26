import { motion } from 'framer-motion';
import { cn } from '../ui';
import { toneText, type Tone } from '../ui/tone';
import { NODE_COLORS, type VizState } from './palette';
import Legend, { type LegendItem } from './Legend';

export interface ArrayPointer {
  index: number;
  /** Short label shown under the element, e.g. 'lo', 'mid', 'r' */
  label: string;
  tone: Tone;
}

interface ArrayViewProps {
  values: (number | string)[];
  /** Visual state of each index (default: idle) */
  stateOf?: (index: number) => VizState;
  /** bars = height encodes value (sorting); cells = boxes showing the value (searching, DP) */
  variant?: 'bars' | 'cells';
  /** Labelled markers under elements */
  pointers?: ArrayPointer[];
  /** Inclusive [lo, hi]; elements outside it are faded */
  range?: [number, number] | null;
  /** Show the index row (default: when there are at most 20 elements) */
  showIndices?: boolean;
  legend?: LegendItem[];
  className?: string;
}

/**
 * One-dimensional array visualization shared by sorting, searching and DP pages.
 * Colors follow the --state-* tokens through NODE_COLORS.
 */
export default function ArrayView({
  values,
  stateOf = () => 'idle',
  variant = 'bars',
  pointers = [],
  range,
  showIndices,
  legend,
  className,
}: ArrayViewProps) {
  const n = values.length;
  const withIndices = showIndices ?? n <= 20;
  const numeric = values.map(v => (typeof v === 'number' ? v : 0));
  const maxVal = Math.max(...numeric, 1);
  const outOfRange = (i: number) => !!range && (i < range[0] || i > range[1]);
  const pointersAt = (i: number) => pointers.filter(p => p.index === i);
  const hasPointers = pointers.length > 0;

  return (
    <div className={cn('viz-surface w-full h-full flex flex-col', className)}>
      {variant === 'bars' ? (
        <div className="flex-1 flex items-end justify-center gap-[2px] sm:gap-1 px-2 sm:px-4 pt-4 pb-1 min-h-[180px]">
          {values.map((val, idx) => {
            const state = stateOf(idx);
            const c = NODE_COLORS[state];
            const isActive = state === 'candidate' || state === 'danger' || state === 'current';
            const heightPct = (numeric[idx] / maxVal) * 100;
            return (
              <div key={idx} className={cn('flex flex-col items-center flex-1 max-w-[48px] h-full transition-opacity', outOfRange(idx) && 'opacity-35')}>
                {withIndices && (
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
      ) : (
        <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-6 min-h-[120px] overflow-x-auto">
          <div className="flex gap-1 sm:gap-1.5">
            {values.map((val, idx) => {
              const state = stateOf(idx);
              const c = NODE_COLORS[state];
              return (
                <motion.div
                  key={idx}
                  animate={{ scale: state === 'current' ? 1.08 : 1, y: state === 'current' ? -3 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-sm sm:text-base tabular-nums transition-colors duration-200',
                    outOfRange(idx) && 'opacity-35',
                  )}
                  style={{ backgroundColor: c.fill, borderColor: c.stroke, color: c.text }}
                >
                  {val}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {(withIndices || hasPointers) && (
        <div className={cn('flex justify-center px-2 sm:px-4 pt-1 pb-1 border-t border-border', variant === 'bars' ? 'gap-[2px] sm:gap-1' : 'gap-1 sm:gap-1.5')}>
          {values.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'flex flex-col items-center text-center',
                variant === 'bars' ? 'flex-1 max-w-[48px]' : 'w-10 sm:w-12 shrink-0',
              )}
            >
              {withIndices && <span className="text-[11px] font-mono text-hint tabular-nums">{idx}</span>}
              {pointersAt(idx).map(p => (
                <span key={p.label} className={cn('text-[11px] font-bold leading-tight', toneText[p.tone])}>
                  ▲<br />{p.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {legend && <Legend className="px-3 py-2" items={legend} />}
    </div>
  );
}

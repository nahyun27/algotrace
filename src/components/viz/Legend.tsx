import { cn } from '../ui';
import { NODE_COLORS, EDGE_COLORS, type VizState } from './palette';

export interface LegendItem {
  state: VizState;
  label: string;
  /** node = circle swatch (default), edge = line swatch, cell = square swatch */
  kind?: 'node' | 'edge' | 'cell';
}

/** Compact legend shown under a visualization. */
export default function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground', className)}>
      {items.map(({ state, label, kind = 'node' }) => {
        const c = NODE_COLORS[state];
        return (
          <span key={label} className="inline-flex items-center gap-1.5">
            {kind === 'edge' ? (
              <span className="w-5 h-[3px] rounded-full" style={{ background: EDGE_COLORS[state] }} />
            ) : (
              <span
                className={cn('w-3.5 h-3.5 border-2', kind === 'cell' ? 'rounded-[4px]' : 'rounded-full')}
                style={{ background: c.fill, borderColor: c.stroke }}
              />
            )}
            {label}
          </span>
        );
      })}
    </div>
  );
}

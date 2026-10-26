import type { ReactNode } from 'react';
import { cn } from '../ui';
import { NODE_COLORS, type VizState } from './palette';

export interface Token {
  label: string;
  /** Small text next to the label, e.g. an edge weight */
  sub?: string;
  state?: VizState;
}

interface TokenRowProps {
  /** Name of the row, e.g. "큐" / "Queue" */
  title: ReactNode;
  items: Token[];
  /** Shown when there are no items */
  emptyText?: ReactNode;
  /** Small hint before / after the items, e.g. "나감 ←" */
  before?: ReactNode;
  after?: ReactNode;
  className?: string;
}

/**
 * A one-line row of small chips (a queue, a stack, a result order, a sorted edge list)
 * drawn under a MiniGraph in concept storyboards. Colors follow the viz state tokens.
 */
export default function TokenRow({ title, items, emptyText, before, after, className }: TokenRowProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-semibold', className)}>
      <span className="text-muted-foreground font-bold mr-0.5">{title}</span>
      {before && <span className="text-muted-foreground">{before}</span>}
      {items.length === 0 ? (
        <span className="text-muted-foreground italic px-1">{emptyText}</span>
      ) : (
        <span className="inline-flex flex-wrap items-center justify-center gap-1">
          {items.map((t, i) => {
            const c = NODE_COLORS[t.state ?? 'idle'];
            return (
              <span
                key={`${t.label}-${i}`}
                className="inline-flex items-baseline gap-1 rounded-lg border-2 px-2 py-0.5 font-mono font-extrabold text-[13px] leading-5 transition-colors"
                style={{ background: c.fill, borderColor: c.stroke, color: c.text }}
              >
                {t.label}
                {t.sub && <span className="text-[11px] font-bold opacity-80">{t.sub}</span>}
              </span>
            );
          })}
        </span>
      )}
      {after && <span className="text-muted-foreground">{after}</span>}
    </div>
  );
}

/** Picture + chip row stacked inside a storyboard frame. */
export function GraphWithRow({ graph, row }: { graph: ReactNode; row: ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col items-center gap-2">
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">{graph}</div>
      {row}
    </div>
  );
}

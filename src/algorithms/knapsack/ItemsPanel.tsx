import { Badge, Panel, cn } from '../../components/ui';
import { toneSoft, toneSolid } from '../../components/ui/tone';
import { useTr } from '../../i18n';
import type { KnapsackInput, KnapsackStep } from './types';

/** Item cards: the item being processed, then the chosen items with totals once backtracking starts. */
export default function ItemsPanel({ input, step }: { input: KnapsackInput; step: KnapsackStep }) {
  const tr = useTr();
  const chosen = new Set(step.chosen);
  const filling = step.type === 'CONSIDER' || step.type === 'SKIP' || step.type === 'TAKE';
  const activeItem = filling && step.cell ? step.cell[0] - 1 : -1;
  const backtracking = step.type === 'BACKTRACK' || step.type === 'DONE';
  const totalW = step.chosen.reduce((s, k) => s + input.items[k].weight, 0);
  const totalV = step.chosen.reduce((s, k) => s + input.items[k].value, 0);

  return (
    <Panel
      title={backtracking ? tr('고른 물건', 'Chosen items') : tr('물건', 'Items')}
      actions={backtracking && (
        <>
          <Badge tone="path" className="font-mono">{tr('무게', 'weight')} {totalW} / {input.K}</Badge>
          <Badge tone="path" className="font-mono">{tr('가치', 'value')} {totalV}</Badge>
        </>
      )}
      bodyClassName="p-3 sm:p-4 flex flex-wrap gap-2"
    >
      {input.items.map((it, k) => {
        const isChosen = chosen.has(k);
        return (
          <div
            key={k}
            className={cn(
              'flex flex-col items-center rounded-xl border px-3 py-1.5 min-w-20 transition-colors duration-300',
              isChosen ? cn(toneSolid.path, 'border-transparent')
                : k === activeItem ? cn(toneSoft.current, 'border-transparent ring-2 ring-state-current/50')
                  : step.type === 'DONE' ? 'bg-muted border-border text-muted-foreground opacity-60'
                    : 'bg-card border-border',
            )}
          >
            <span className="text-[11px] font-bold opacity-80">{tr(`물건 ${k + 1}`, `Item ${k + 1}`)}</span>
            <span className="font-mono text-sm font-bold">w {it.weight} · v {it.value}</span>
          </div>
        );
      })}
    </Panel>
  );
}

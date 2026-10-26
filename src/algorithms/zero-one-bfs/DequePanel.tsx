import { Panel, cn } from '../../components/ui';
import { toneSoft, toneSolid } from '../../components/ui/tone';
import { useTr } from '../../i18n';
import type { ZeroOneStep } from './types';

/** The deque as one row with explicit FRONT / BACK ends; the item just pushed shows which end it went to. */
export default function DequePanel({ step }: { step: ZeroOneStep }) {
  const tr = useTr();
  const { deque, pushedTo, done } = step;
  const pushedIndex = pushedTo === 'front' ? 0 : pushedTo === 'back' ? deque.length - 1 : -1;

  const endLabel = (text: string) => (
    <span className="shrink-0 self-stretch flex items-center px-2 rounded-lg bg-muted text-[11px] font-extrabold tracking-wider text-muted-foreground">
      {text}
    </span>
  );

  return (
    <Panel
      title={tr('덱 (deque)', 'Deque')}
      actions={<span className="text-xs text-muted-foreground font-mono">{tr(`${deque.length}개`, `size ${deque.length}`)}</span>}
      bodyClassName="p-3"
    >
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
        {endLabel('FRONT')}
        <div className="flex items-end gap-1.5 min-h-[58px] flex-1">
          {deque.length === 0 ? (
            <span className="self-center text-xs text-muted-foreground italic">{tr('비어 있어요', 'Empty')}</span>
          ) : deque.map((it, i) => {
            const pushed = i === pushedIndex;
            const stale = done[it.r]?.[it.c] && !pushed;
            return (
              <div key={`${it.r}-${it.c}-${i}`} className="flex flex-col items-center gap-1 shrink-0">
                <span
                  className={cn(
                    'text-[11px] leading-[14px] font-bold px-1.5 rounded-md whitespace-nowrap',
                    pushed ? toneSolid.candidate : 'invisible',
                  )}
                >
                  {pushedTo === 'front' ? tr('← 앞에 넣음', '← pushed front') : tr('뒤에 넣음 →', 'pushed back →')}
                </span>
                <span
                  className={cn(
                    'flex flex-col items-center px-2 py-1 rounded-lg border font-mono text-xs min-w-[52px]',
                    pushed
                      ? `${toneSoft.candidate} border-state-candidate/60 ring-2 ring-state-candidate/50 font-bold`
                      : stale
                        ? 'bg-card border-dashed border-border text-hint line-through'
                        : 'bg-card border-border text-foreground',
                  )}
                  title={stale ? tr('이미 확정된 칸이라 꺼낼 때 건너뛰어요', 'Already settled, so it is skipped when popped') : undefined}
                >
                  <span className="font-semibold">({it.r},{it.c})</span>
                  <span className="text-[11px] opacity-75">d={it.d}</span>
                </span>
              </div>
            );
          })}
        </div>
        {endLabel('BACK')}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {tr(
          '꺼낼 때는 항상 FRONT에서. 비용 0인 이웃은 FRONT에, 비용 1인 이웃은 BACK에 넣어요.',
          'Always pop from the FRONT. 0-cost neighbours go to the FRONT, 1-cost neighbours to the BACK.',
        )}
      </p>
    </Panel>
  );
}

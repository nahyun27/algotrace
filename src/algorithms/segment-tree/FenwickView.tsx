import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import Legend, { type LegendItem } from '../../components/viz/Legend';
import { NODE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';
import { lowbit, type FenStep, type Operation, type SegInput } from './types';

/**
 * Fenwick tree drawn as the classic staircase: every BIT cell tree[i] is a bar over the array positions it is
 * responsible for (i − lowbit(i) + 1 .. i, 1-based). Under the array, each index i is shown in binary with its
 * lowest set bit emphasized: that bit is the bar's width and the jump size.
 */
export default function FenwickView({ step, op, input }: { step: FenStep; op: Operation; input: SegInput }) {
  const tr = useTr();
  const n = step.arr.length;
  const width = n.toString(2).length;
  const levels = Math.floor(Math.log2(n));
  const building = step.type === 'BUILD';
  const done = step.type === 'DONE';
  const idx = Array.from({ length: n }, (_, k) => k + 1);

  const barState = (i: number): VizState => {
    if (i === step.i) return 'current';
    if (building) return i < step.built ? 'visited' : 'idle';
    if (step.plus.includes(i)) return 'path';
    if (step.minus.includes(i)) return 'candidate';
    if (step.updated.includes(i)) return done ? 'path' : 'visited';
    return 'idle';
  };
  const barFaded = (i: number) => building && i > step.built;

  const covers = (i: number, pos: number) => i - lowbit(i) < pos && pos <= i;
  const cellState = (pos: number): VizState => {
    if (step.i !== null && covers(step.i, pos)) return 'current';
    if (op === 'update') return pos === input.idx + 1 ? (done ? 'path' : 'candidate') : 'idle';
    if (building) return 'idle';
    if (step.minus.some(i => covers(i, pos))) return 'candidate';
    if (step.plus.some(i => covers(i, pos))) return 'path';
    return 'idle';
  };
  const cellFaded = (pos: number) => !building && op === 'query' && (pos - 1 < input.l || pos - 1 > input.r);

  const legend: LegendItem[] = building
    ? [
      { state: 'current', label: tr('지금 칸', 'Current cell'), kind: 'cell' },
      { state: 'visited', label: tr('완성된 칸', 'Finished cell'), kind: 'cell' },
    ]
    : op === 'query'
      ? [
        { state: 'current', label: tr('지금 칸', 'Current cell'), kind: 'cell' },
        { state: 'path', label: tr('prefix_sum(r + 1)에 더함', 'Added in prefix_sum(r + 1)'), kind: 'cell' },
        { state: 'candidate', label: tr('prefix_sum(l)로 뺌', 'Subtracted via prefix_sum(l)'), kind: 'cell' },
      ]
      : [
        { state: 'current', label: tr('지금 칸', 'Current cell'), kind: 'cell' },
        { state: 'visited', label: tr('delta를 더한 칸', 'Cell updated with delta'), kind: 'cell' },
      ];

  const rowLabel = 'text-[11px] font-semibold text-muted-foreground pr-2 flex items-center justify-end whitespace-nowrap';

  return (
    <div className="viz-surface w-full flex flex-col gap-3 p-3 sm:p-4">
      <div className="overflow-x-auto">
        <div
          className="grid gap-x-1 gap-y-1.5 mx-auto"
          style={{ gridTemplateColumns: `auto repeat(${n}, minmax(30px, 52px))`, width: '100%', minWidth: 'min-content', maxWidth: n * 56 + 48 }}
        >
          {/* bars: widest responsibility on top */}
          {Array.from({ length: levels + 1 }, (_, r) => levels - r).map((level, r) => (
            <div key={`lv-${level}`} className="contents">
              <div className={rowLabel} style={{ gridRow: r + 1, gridColumn: 1 }}>
                {r === 0 ? 'tree' : ''}
              </div>
              {idx.filter(i => lowbit(i) === 1 << level).map(i => {
                const s = barState(i);
                const c = NODE_COLORS[s];
                const span = lowbit(i);
                return (
                  <div
                    key={i}
                    title={`tree[${i}] = a[${i - span}..${i - 1}]`}
                    className={cn(
                      'h-9 rounded-lg border-2 flex items-center px-1.5 font-mono min-w-0 transition-all duration-300',
                      span > 1 ? 'justify-between' : 'justify-center',
                      barFaded(i) && 'opacity-40',
                    )}
                    style={{ gridRow: r + 1, gridColumn: `${i - span + 2} / ${i + 2}`, backgroundColor: c.fill, borderColor: c.stroke, color: c.text }}
                  >
                    {span > 1 && <span className={cn('text-[11px] font-semibold opacity-80', span === 2 && 'hidden sm:inline')}>tree[{i}]</span>}
                    <span className="text-sm font-extrabold tabular-nums">{step.tree[i]}</span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* array a (0-based index under the value) */}
          <div className={rowLabel} style={{ gridRow: levels + 2, gridColumn: 1 }}>a</div>
          {idx.map(pos => {
            const s = cellState(pos);
            const c = NODE_COLORS[s];
            return (
              <div
                key={pos}
                className={cn(
                  'mt-2 h-12 rounded-xl border-2 flex flex-col items-center justify-center font-mono transition-all duration-300',
                  cellFaded(pos) && 'opacity-35',
                )}
                style={{ gridRow: levels + 2, gridColumn: pos + 1, backgroundColor: c.fill, borderColor: c.stroke, color: c.text }}
              >
                <span className="text-sm font-bold tabular-nums leading-tight">{step.arr[pos - 1]}</span>
                <span className="text-[11px] opacity-70 leading-tight">[{pos - 1}]</span>
              </div>
            );
          })}

          {/* BIT index i in binary, lowest set bit emphasized */}
          <div className={rowLabel} style={{ gridRow: levels + 3, gridColumn: 1 }}>i</div>
          {idx.map(i => {
            const bits = i.toString(2).padStart(width, '0');
            const low = bits.length - 1 - Math.log2(lowbit(i));
            const active = i === step.i;
            return (
              <div
                key={i}
                className={cn('flex flex-col items-center rounded-lg py-0.5', active && 'bg-state-current/12')}
                style={{ gridRow: levels + 3, gridColumn: i + 1 }}
              >
                <span className={cn('text-xs font-bold tabular-nums', active ? toneText.current : 'text-foreground')}>{i}</span>
                <span className="text-[11px] font-mono tracking-tight">
                  {bits.split('').map((b, k) => (
                    <span key={k} className={k === low ? cn('font-extrabold underline underline-offset-2', toneText.current) : 'text-hint'}>{b}</span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Legend items={legend} />
      <p className="text-center text-[11px] text-hint">
        {tr(
          '막대 하나가 tree[i] 한 칸이에요. 폭은 i의 가장 낮은 1비트(i & -i)와 같아요.',
          'Each bar is one cell tree[i]. Its width equals the lowest set bit of i (i & -i).',
        )}
      </p>
    </div>
  );
}

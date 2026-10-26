import type { ReactNode } from 'react';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, type VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneSoft, toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';
import type { SortAlgorithm, SortStep } from './types';
import { digitAt } from './types';

/** Extra structure shown under the bars for counting sort (count[] + output) and radix sort (buckets). */
export default function DistributionView({ step, algorithm }: { step: SortStep; algorithm: SortAlgorithm }) {
  if (algorithm === 'counting') return <CountingView step={step} />;
  if (algorithm === 'radix') return <RadixView step={step} />;
  return null;
}

function SectionTitle({ title, hint }: { title: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 mb-1.5">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      {hint && <span className="text-[11px] text-hint">{hint}</span>}
    </div>
  );
}

/* ─────────────── Counting sort ─────────────── */

/** Small index-labelled cell; wraps onto several rows so up to 100 count cells stay compact. */
function MiniCell({ index, value, state, faded, wide }: { index: number; value: number | string; state: VizState; faded?: boolean; wide?: boolean }) {
  const col = NODE_COLORS[state];
  return (
    <div className={cn('flex flex-col items-center', wide ? 'w-9 sm:w-10' : 'w-7 sm:w-8', faded && 'opacity-45')}>
      <span className={cn('text-[11px] font-mono tabular-nums leading-tight', state === 'idle' ? 'text-hint' : toneText[state])}>{index}</span>
      <span
        className="w-full h-6 sm:h-7 rounded-md border-2 flex items-center justify-center font-mono font-bold text-xs tabular-nums transition-colors duration-200"
        style={{ backgroundColor: col.fill, borderColor: col.stroke, color: col.text }}
      >
        {value}
      </span>
    </div>
  );
}

function CountingView({ step }: { step: SortStep }) {
  const tr = useTr();
  const counts = step.counts ?? [];
  const output = step.output ?? step.array.map(() => null);
  const range = step.countRange;
  const done = step.type === 'DONE';

  const countState = (i: number): VizState => {
    if (done) return 'idle';
    if (step.countIndex === i) return 'current';
    if (range && i >= range[0] && i <= range[1]) return 'candidate';
    return 'idle';
  };

  const outState = (i: number): VizState => {
    if (output[i] === null) return 'idle';
    if (!done && step.outputIndex === i) return 'current';
    return 'visited';
  };

  return (
    <div className="px-3 sm:px-5 py-2.5 space-y-2.5">
      <section>
        <SectionTitle
          title="output"
          hint={tr('오른쪽 원소부터 count[x]-1 자리에 써서 같은 값의 순서를 지켜요', 'Writing from the right into slot count[x]-1 keeps equal values in order')}
        />
        <div className="flex flex-wrap gap-1">
          {output.map((v, i) => (
            <MiniCell key={i} index={i} value={v ?? ''} state={outState(i)} wide />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title={<>count[0..{counts.length - 1}]</>}
          hint={step.type === 'COUNT' || step.type === 'INIT'
            ? tr('칸 번호 = 값, 칸 안 = 등장 횟수', 'index = value, cell = how many times it appears')
            : tr('칸 안 = 그 값 이하인 원소 수 (누적합)', 'cell = how many values are ≤ index (prefix sum)')}
        />
        <div className="flex flex-wrap gap-1">
          {counts.map((c, i) => (
            <MiniCell key={i} index={i} value={c} state={countState(i)} faded={countState(i) === 'idle' && c === 0} />
          ))}
        </div>
      </section>

      <Legend
        items={[
          { state: 'current', label: tr('지금 읽고 쓰는 칸', 'Cell read / written now'), kind: 'cell' },
          { state: 'candidate', label: tr('누적 중인 구간', 'Cells being accumulated'), kind: 'cell' },
          { state: 'visited', label: tr('출력에 놓인 값', 'Placed in output'), kind: 'cell' },
        ]}
      />
    </div>
  );
}

/* ─────────────── Radix sort ─────────────── */

/** Value with leading zeros up to `width` digits; the digit at `pos` is emphasized. */
function DigitValue({ value, width, pos, strong }: { value: number; width: number; pos?: number; strong?: boolean }) {
  const text = String(value).padStart(width, '0');
  const lead = text.length - String(value).length;
  return (
    <span className="font-mono tabular-nums">
      {text.split('').map((ch, j) => {
        const p = text.length - 1 - j;
        const isDigit = pos === p;
        return (
          <span
            key={j}
            className={cn(
              j < lead && !isDigit && 'opacity-40',
              isDigit && 'underline decoration-2 underline-offset-2 font-extrabold',
              isDigit && !strong && toneText.current,
            )}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

function RadixView({ step }: { step: SortStep }) {
  const tr = useTr();
  const buckets = step.buckets ?? Array.from({ length: 10 }, () => []);
  const width = Math.max(1, step.digitCount ?? 1);
  const pos = step.digit;
  const collecting = step.type === 'COLLECT' || step.type === 'DONE';
  const done = step.type === 'DONE';
  const placeName = (p: number) =>
    p === 0 ? tr('1의 자리', 'ones digit') : p === 1 ? tr('10의 자리', 'tens digit') : p === 2 ? tr('100의 자리', 'hundreds digit') : tr(`10^${p}의 자리`, `10^${p} digit`);

  const bucketState = (b: number): VizState => {
    if (done) return 'idle';
    if (step.bucketIndex === b) return 'current';
    if (collecting && b < (step.collectedUpTo ?? 0)) return 'visited';
    return 'idle';
  };

  return (
    <div className="px-3 sm:px-5 py-3 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {pos !== undefined ? (
          <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold', toneSoft.current)}>
            {tr(`패스 ${pos + 1}/${width}`, `Pass ${pos + 1}/${width}`)} · {placeName(pos)} (exp = {10 ** pos})
          </span>
        ) : (
          <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 font-semibold', toneSoft.neutral)}>
            {tr('버킷 0~9 (기수 10)', 'Buckets 0 to 9 (base 10)')}
          </span>
        )}
        {step.type === 'BUCKET' && step.currentValue != null && pos !== undefined && (
          <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold', toneSoft.candidate)}>
            x = <DigitValue value={step.currentValue} width={width} pos={pos} strong />
            → {tr(`버킷 ${digitAt(step.currentValue, pos)}`, `bucket ${digitAt(step.currentValue, pos)}`)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
        {buckets.map((items, b) => {
          const s = bucketState(b);
          const col = NODE_COLORS[s];
          return (
            <div
              key={b}
              className={cn('rounded-xl border-2 flex flex-col min-h-[88px] overflow-hidden transition-colors duration-200', s === 'idle' && 'border-border')}
              style={s === 'idle' ? undefined : { borderColor: col.stroke }}
            >
              <div
                className="text-center text-xs font-bold font-mono py-0.5 transition-colors duration-200"
                style={s === 'idle' ? { color: 'var(--muted-foreground)' } : { backgroundColor: col.fill, color: col.text }}
              >
                {b}
              </div>
              <div className="flex-1 flex flex-col items-stretch gap-1 p-1">
                {items.map((v, j) => {
                  const isNew = step.type === 'BUCKET' && step.bucketIndex === b && j === items.length - 1;
                  return (
                    <span
                      key={j}
                      className={cn(
                        'rounded-md border text-center text-xs py-0.5 transition-colors',
                        isNew ? 'border-transparent' : 'border-border bg-card text-foreground',
                      )}
                      style={isNew ? { backgroundColor: NODE_COLORS.current.fill, color: NODE_COLORS.current.text } : undefined}
                    >
                      <DigitValue value={v} width={width} pos={pos} strong={isNew} />
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Legend
        items={[
          { state: 'current', label: tr('담거나 꺼내는 버킷', 'Bucket being filled / collected'), kind: 'cell' },
          { state: 'visited', label: tr('꺼내기 끝난 버킷', 'Already collected'), kind: 'cell' },
        ]}
      />
      <p className="text-[11px] text-hint text-center">
        {tr('밑줄 친 숫자가 이번 패스에서 보는 자릿수예요', 'The underlined digit is the one this pass looks at')}
      </p>
    </div>
  );
}

import { Check, X } from 'lucide-react';
import ArrayView,{ type ArrayPointer } from '../../components/viz/ArrayView';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, type VizState } from '../../components/viz/palette';
import { Badge, Panel, cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';
import type { BSStep } from './types';

/* ─────────────── find / lower bound: the sorted array ─────────────── */

interface ArrayStageProps {
  step: BSStep;
  arr: number[];
  variant: 'find' | 'lower';
}

export function SearchArrayStage({ step, arr, variant }: ArrayStageProps) {
  const tr = useTr();
  const isLower = variant === 'lower';
  // lower bound may answer "the end" (index n), shown as an extra ∞ cell
  const values: (number | string)[] = isLower ? [...arr, '∞'] : arr;
  const terminal = step.type === 'FOUND' || step.type === 'NOT_FOUND' || step.type === 'DONE';

  const stateOf = (i: number): VizState => {
    if (step.type === 'FOUND' && i === step.mid) return 'path';
    if (step.type === 'DONE' && i === step.result) return 'path';
    if (!terminal && i === step.mid) return 'current';
    if (isLower && !terminal && i === step.hi) return 'candidate';
    return 'idle';
  };

  const pointers: ArrayPointer[] = [];
  if (step.type !== 'NOT_FOUND') {
    pointers.push({ index: step.lo, label: 'lo', tone: 'neutral' });
    if (!terminal && step.mid !== null) pointers.push({ index: step.mid, label: 'mid', tone: 'current' });
    pointers.push({ index: step.hi, label: 'hi', tone: 'neutral' });
  }

  // find: answer lies in [lo, hi]; lower bound: answer lies in [lo, hi] too (hi itself is a candidate)
  const range: [number, number] | null = terminal && step.type !== 'NOT_FOUND' ? null : [step.lo, step.hi];

  return (
    <ArrayView
      values={values}
      variant="cells"
      compact
      stateOf={stateOf}
      pointers={pointers}
      range={range}
      legend={[
        { state: 'current', label: tr('mid (비교 중)', 'mid (comparing)'), kind: 'cell' },
        ...(isLower ? [{ state: 'candidate' as VizState, label: tr('답 후보 (hi)', 'Candidate (hi)'), kind: 'cell' as const }] : []),
        { state: 'path', label: isLower ? tr('lower bound', 'Lower bound') : tr('찾은 위치', 'Found'), kind: 'cell' },
        { state: 'idle', label: tr('흐림 = 버린 구간', 'Faded = discarded'), kind: 'cell' },
      ]}
    />
  );
}

/* ─────────────── parametric search: answer axis + trees ─────────────── */

function axisState(step: BSStep, h: number): VizState {
  if (step.type === 'DONE') return h === step.result ? 'path' : h <= step.result! ? 'visited' : 'danger';
  if (h === step.mid) return 'current';
  if (h < step.lo) return 'visited';
  if (h > step.hi) return 'danger';
  return 'idle';
}

export function HeightAxis({ step, max }: { step: BSStep; max: number }) {
  const tr = useTr();
  const hs = Array.from({ length: max + 1 }, (_, h) => h);
  const dense = hs.length > 16;
  const pointers = (h: number) => {
    if (step.type === 'DONE') return [];
    const out: { label: string; tone: 'neutral' | 'current' }[] = [];
    if (h === step.lo) out.push({ label: 'lo', tone: 'neutral' });
    if (h === step.mid) out.push({ label: 'mid', tone: 'current' });
    if (h === step.hi) out.push({ label: 'hi', tone: 'neutral' });
    return out;
  };
  return (
    <div className="viz-surface px-3 sm:px-5 pt-5 pb-2">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        {tr('답 후보: 절단기 높이 H', 'Answer candidates: cutter height H')}
      </p>
      <div className="flex gap-[2px] sm:gap-1">
        {hs.map(h => {
          const s = axisState(step, h);
          const c = NODE_COLORS[s];
          const out = step.type !== 'DONE' && (h < step.lo || h > step.hi);
          return (
            <div
              key={h}
              className={cn(
                'flex-1 min-w-0 h-9 rounded-md border-2 flex items-center justify-center font-mono text-[11px] font-bold tabular-nums transition-colors duration-200',
                out && 'opacity-60',
              )}
              style={{ backgroundColor: c.fill, borderColor: c.stroke, color: c.text }}
            >
              <span className={cn(dense && h % 5 !== 0 && h !== step.mid && 'hidden sm:inline')}>{h}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-[2px] sm:gap-1 min-h-[30px] pt-0.5">
        {hs.map(h => (
          <div key={h} className="flex-1 min-w-0 flex flex-col items-center">
            {pointers(h).map(p => (
              <span key={p.label} className={cn('text-[11px] font-bold leading-tight text-center', toneText[p.tone])}>
                ▲<br />{p.label}
              </span>
            ))}
          </div>
        ))}
      </div>
      <Legend
        className="pt-1"
        items={[
          { state: 'current', label: tr('검사 중인 H', 'H being checked'), kind: 'cell' },
          { state: 'visited', label: tr('충분히 얻음', 'Enough wood'), kind: 'cell' },
          { state: 'danger', label: tr('부족', 'Not enough'), kind: 'cell' },
          { state: 'path', label: tr('정답', 'Answer'), kind: 'cell' },
        ]}
      />
    </div>
  );
}

export function TreeCutPanel({ step, trees, m }: { step: BSStep; trees: number[]; m: number }) {
  const tr = useTr();
  const h = step.type === 'DONE' ? step.result : step.mid;
  const maxT = Math.max(...trees, 1);
  const cuts = trees.map(t => (h === null ? 0 : Math.max(0, t - h)));
  const wood = cuts.reduce((s, c) => s + c, 0);
  const ok = wood >= m;
  const lineState: VizState = step.type === 'DONE' ? 'path' : 'current';

  return (
    <Panel
      title={h === null ? tr('나무들', 'Trees') : tr(`높이 H = ${h}에서 자르기`, `Cut at H = ${h}`)}
      actions={h !== null && (
        <Badge tone={ok ? 'visited' : 'danger'} className="font-mono">
          {ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} {wood} {ok ? '≥' : '<'} M = {m}
        </Badge>
      )}
      bodyClassName="p-4"
    >
      <div className="relative h-40 flex items-end justify-center gap-3 sm:gap-6">
        {trees.map((t, i) => {
          const cut = cuts[i];
          return (
            <div key={i} className="h-full w-10 sm:w-14 flex flex-col justify-end items-center">
              <span className={cn('text-[11px] font-bold font-mono mb-0.5', cut > 0 ? toneText.candidate : 'text-hint')}>
                {cut > 0 ? `+${cut}` : '·'}
              </span>
              <div className="w-full flex flex-col rounded-t-md overflow-hidden" style={{ height: `${(t / maxT) * 85}%` }}>
                {cut > 0 && (
                  <div
                    className="w-full border-2 border-b-0 rounded-t-md transition-all duration-300"
                    style={{ height: `${(cut / t) * 100}%`, backgroundColor: NODE_COLORS.candidate.fill, borderColor: NODE_COLORS.candidate.stroke }}
                  />
                )}
                <div
                  className={cn('w-full flex-1 border-2 transition-all duration-300', cut === 0 && 'rounded-t-md')}
                  style={{ backgroundColor: NODE_COLORS.idle.fill, borderColor: NODE_COLORS.idle.stroke }}
                />
              </div>
            </div>
          );
        })}
        {h !== null && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed pointer-events-none transition-all duration-300"
            style={{ bottom: `${(h / maxT) * 85}%`, borderColor: NODE_COLORS[lineState].fill }}
          >
            <span
              className={cn('absolute -top-5 left-0 text-[11px] font-bold font-mono', toneText[lineState === 'path' ? 'path' : 'current'])}
            >
              H = {h}
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3 sm:gap-6 border-t border-border pt-1">
        {trees.map((t, i) => (
          <span key={i} className="w-10 sm:w-14 text-center font-mono text-xs font-semibold text-muted-foreground">{t}</span>
        ))}
      </div>
      {h !== null && (
        <p className="mt-3 text-xs font-mono text-muted-foreground text-center">
          wood = {cuts.filter(c => c > 0).join(' + ') || '0'} = <span className={cn('font-bold', toneText[ok ? 'visited' : 'danger'])}>{wood}</span>
        </p>
      )}
    </Panel>
  );
}

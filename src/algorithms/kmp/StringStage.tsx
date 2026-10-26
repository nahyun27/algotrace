import { motion } from 'framer-motion';
import { cn } from '../../components/ui';
import { toneText, type Tone } from '../../components/ui/tone';
import { NODE_COLORS, type VizState } from '../../components/viz/palette';
import Legend from '../../components/viz/Legend';
import { useIsNarrow } from '../../hooks/useIsNarrow';
import { useTr } from '../../i18n';
import type { KMPStep } from './types';

const show = (c: string) => (c === ' ' ? '␣' : c);

function Cell({ c, state, size, faded }: { c: string; state: VizState; size: number; faded?: boolean }) {
  const col = NODE_COLORS[state];
  return (
    <div
      className={cn(
        'shrink-0 border-2 rounded-lg flex items-center justify-center font-mono font-bold transition-colors duration-200',
        faded && 'opacity-35',
      )}
      style={{ width: size, height: size + 4, fontSize: size > 28 ? 15 : 13, backgroundColor: col.fill, borderColor: col.stroke, color: col.text }}
    >
      {show(c)}
    </div>
  );
}

function Pointer({ label, tone, x, pitch }: { label: string; tone: Tone; x: number; pitch: number }) {
  return (
    <motion.span
      className={cn('absolute top-0 text-[11px] font-bold leading-tight text-center', toneText[tone])}
      style={{ width: pitch }}
      initial={false}
      animate={{ x: x * pitch }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      ▲<br />{label}
    </motion.span>
  );
}

/**
 * The scanned string (text, or the pattern itself while building pi) with the pattern drawn under it at its
 * current shift. Both rows share one scroll container so their cells stay aligned; after a fallback the
 * pattern row slides right.
 */
export default function StringStage({ step, text, pattern }: { step: KMPStep; text: string; pattern: string }) {
  const tr = useTr();
  const narrow = useIsNarrow(640);
  const pitch = narrow ? 26 : 34;
  const size = pitch - 4;

  const scanned = step.phase === 'pi' ? pattern : text;
  const n = scanned.length, m = pattern.length;
  const isFound = step.type === 'FOUND';
  const isDone = step.type === 'DONE';
  const cols = Math.max(n, step.shift + m);
  const inWindow = (k: number) => k >= step.shift && k < step.shift + step.matched;
  const inFound = (k: number) => step.phase === 'search' && step.found.some(s => k >= s && k < s + m);

  const topState = (k: number): VizState => {
    if (isFound && step.hit !== null) return k >= step.hit && k < step.hit + m ? 'path' : inFound(k) ? 'path' : 'idle';
    if (isDone) return inFound(k) ? 'path' : 'idle';
    if (k === step.i) {
      if (step.cmp) return step.cmp.ok ? 'candidate' : 'danger';
      if (step.type !== 'PI_SET') return 'current';
    }
    if (inWindow(k)) return 'visited';
    return inFound(k) ? 'path' : 'idle';
  };

  const patState = (k: number): VizState => {
    if (isFound) return 'path';
    if (step.cmp && k === step.cmp.j) return step.cmp.ok ? 'candidate' : 'danger';
    return k < step.matched ? 'visited' : 'idle';
  };

  const jIndex = step.cmp ? step.cmp.j : step.matched;
  const showJ = !isDone && !isFound && jIndex < m;
  const showI = !isDone && step.i < n;
  const topLabel = step.phase === 'pi' ? 'p' : 't';

  return (
    <div className="viz-surface w-full flex flex-col gap-3 py-5">
      <div className="flex justify-center">
        <span className={cn('rounded-full px-3 py-1 text-xs font-bold', step.phase === 'pi' ? 'bg-state-current/12' : 'bg-state-visited/12', step.phase === 'pi' ? toneText.current : toneText.visited)}>
          {step.phase === 'pi'
            ? tr('1단계: 패턴을 자기 자신과 비교해 pi 만들기', 'Phase 1: match the pattern against itself to build pi')
            : tr('2단계: 텍스트에서 패턴 찾기', 'Phase 2: search the text for the pattern')}
        </span>
      </div>

      <div className="overflow-x-auto px-3 sm:px-5">
        <div className="mx-auto w-max flex gap-2">
          {/* row labels */}
          <div className="flex flex-col font-mono text-xs font-bold text-muted-foreground text-right" style={{ width: 16 }}>
            <span style={{ height: 16 }} />
            <span className="flex items-center justify-end" style={{ height: size + 4 }}>{topLabel}</span>
            <span style={{ height: 34 }} />
            <span className="flex items-center justify-end" style={{ height: size + 4 }}>p</span>
          </div>

          <div className="flex flex-col" style={{ width: cols * pitch }}>
            {/* indices */}
            <div className="flex" style={{ height: 16 }}>
              {Array.from(scanned, (_, k) => (
                <span key={k} className="text-[11px] font-mono text-hint tabular-nums text-center" style={{ width: pitch }}>{k}</span>
              ))}
            </div>
            {/* scanned string */}
            <div className="flex" style={{ gap: pitch - size }}>
              {Array.from(scanned, (c, k) => {
                const s = topState(k);
                return <Cell key={k} c={c} state={s} size={size} faded={s === 'idle' && k < step.shift && !isDone} />;
              })}
            </div>
            {/* i pointer */}
            <div className="relative" style={{ height: 34 }}>
              {showI && <Pointer label="i" tone="current" x={step.i} pitch={pitch} />}
            </div>
            {/* pattern at its shift */}
            <motion.div
              className="flex"
              style={{ gap: pitch - size }}
              initial={false}
              animate={{ x: step.shift * pitch, opacity: isDone ? 0 : 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {Array.from(pattern, (c, k) => <Cell key={k} c={c} state={patState(k)} size={size} />)}
            </motion.div>
            {/* j pointer */}
            <div className="relative" style={{ height: 34 }}>
              {showJ && <Pointer label="j" tone="candidate" x={step.shift + jIndex} pitch={pitch} />}
            </div>
          </div>
        </div>
      </div>

      <Legend
        className="px-3"
        items={[
          { state: 'current', label: tr('현재 위치 i', 'Current i'), kind: 'cell' },
          { state: 'candidate', label: tr('비교 중 (일치)', 'Comparing (match)'), kind: 'cell' },
          { state: 'danger', label: tr('불일치', 'Mismatch'), kind: 'cell' },
          { state: 'visited', label: tr('이미 맞은 글자', 'Matched so far'), kind: 'cell' },
          { state: 'path', label: tr('찾은 패턴', 'Found match'), kind: 'cell' },
        ]}
      />
    </div>
  );
}

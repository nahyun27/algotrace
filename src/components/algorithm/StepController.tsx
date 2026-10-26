import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Keyboard, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, IconButton, Kbd } from '../ui';
import { toneVar, type Tone } from '../ui/tone';
import { useTr } from '../../i18n';

const SPEEDS = [0.5, 1, 2, 4];

export interface StepMarker {
  index: number;
  tone: Tone;
}

export interface StepControllerProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek?: (step: number) => void;
  /** Optional ticks on the timeline for notable steps (updates, results, …) */
  markers?: StepMarker[];
}

export default function StepController({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPlayPause,
  onNext,
  onPrev,
  onFirst,
  onLast,
  onSpeedChange,
  onSeek,
  markers,
}: StepControllerProps) {
  const tr = useTr();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const last = Math.max(0, totalSteps - 1);
  const progress = last > 0 ? currentStep / last : 0;
  const atEnd = currentStep >= last;

  /* ── Keyboard shortcuts ── */
  const handleKey = useCallback((e: KeyboardEvent) => {
    const el = e.target as HTMLElement | null;
    const tag = el?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowLeft':  e.preventDefault(); onPrev(); break;
      case 'ArrowRight': e.preventDefault(); onNext(); break;
      case ' ':          e.preventDefault(); onPlayPause(); break;
      case 'Home':       e.preventDefault(); onFirst(); break;
      case 'End':        e.preventDefault(); onLast(); break;
    }
  }, [onPrev, onNext, onPlayPause, onFirst, onLast]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="w-full shrink-0 border-t border-border bg-card px-3 sm:px-5 pt-2.5 pb-2.5">
      {/* Timeline */}
      <div className="relative h-5 flex items-center">
        {markers && last > 0 && (
          <div className="absolute inset-x-0 top-0 h-1 pointer-events-none">
            {markers.map(m => (
              <span
                key={m.index}
                className="absolute top-0 w-1 h-1 rounded-full -translate-x-1/2"
                style={{ left: `${(m.index / last) * 100}%`, background: toneVar[m.tone] }}
              />
            ))}
          </div>
        )}
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={currentStep}
          disabled={!onSeek || last === 0}
          onChange={e => onSeek?.(Number(e.target.value))}
          aria-label={tr('단계 이동', 'Seek step')}
          className="scrubber w-full"
          style={{ ['--progress' as string]: `${progress * 100}%` }}
        />
      </div>

      <div className="mt-1 flex items-center gap-2">
        {/* Step count */}
        <div className="w-20 sm:w-28 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          <span className="hidden sm:inline">{tr('단계', 'Step')} </span>
          <span className="text-foreground">{currentStep + 1}</span>
          <span className="opacity-50"> / {totalSteps}</span>
        </div>

        {/* Playback buttons */}
        <div className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1">
          <IconButton label={tr('처음으로 (Home)', 'First (Home)')} onClick={onFirst} disabled={currentStep === 0} className="hidden sm:inline-flex">
            <ChevronsLeft className="w-[18px] h-[18px]" />
          </IconButton>
          <IconButton label={tr('이전 (←)', 'Previous (←)')} onClick={onPrev} disabled={currentStep === 0}>
            <ChevronLeft className="w-5 h-5" />
          </IconButton>

          <button
            onClick={onPlayPause}
            aria-label={isPlaying ? tr('일시정지 (Space)', 'Pause (Space)') : tr('재생 (Space)', 'Play (Space)')}
            className="mx-1.5 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:brightness-110 active:scale-95 flex items-center justify-center transition-all"
          >
            {isPlaying
              ? <Pause className="w-[18px] h-[18px]" fill="currentColor" />
              : atEnd && totalSteps > 1
                ? <RotateCcw className="w-[18px] h-[18px]" />
                : <Play className="w-[18px] h-[18px] translate-x-px" fill="currentColor" />}
          </button>

          <IconButton label={tr('다음 (→)', 'Next (→)')} onClick={onNext} disabled={atEnd}>
            <ChevronRight className="w-5 h-5" />
          </IconButton>
          <IconButton label={tr('마지막으로 (End)', 'Last (End)')} onClick={onLast} disabled={atEnd} className="hidden sm:inline-flex">
            <ChevronsRight className="w-[18px] h-[18px]" />
          </IconButton>
        </div>

        {/* Speed + shortcuts */}
        <div className="w-20 sm:w-28 shrink-0 flex items-center justify-end gap-1">
          <div className="hidden sm:flex items-center rounded-lg bg-muted p-0.5" role="group" aria-label={tr('재생 속도', 'Playback speed')}>
            {SPEEDS.map(s => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                aria-pressed={speed === s}
                className={cn(
                  'px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums transition-colors',
                  speed === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {s}×
              </button>
            ))}
          </div>
          <button
            onClick={() => onSpeedChange(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1)}
            className="sm:hidden px-2 py-1 rounded-lg bg-muted text-xs font-bold tabular-nums"
            aria-label={tr('재생 속도', 'Playback speed')}
          >
            {speed}×
          </button>

          <div className="relative hidden md:block">
            <IconButton size="sm" label={tr('키보드 단축키', 'Keyboard shortcuts')} onClick={() => setShowShortcuts(p => !p)} active={showShortcuts}>
              <Keyboard className="w-4 h-4" />
            </IconButton>
            <AnimatePresence>
              {showShortcuts && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowShortcuts(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full right-0 mb-2 z-50 w-56 rounded-2xl border border-border bg-popover p-3.5 text-xs shadow-xl"
                  >
                    <p className="font-bold text-foreground mb-2.5">{tr('키보드 단축키', 'Keyboard shortcuts')}</p>
                    <div className="space-y-2 text-muted-foreground">
                      <ShortcutRow keys={['←', '→']} label={tr('이전 / 다음', 'Prev / Next')} />
                      <ShortcutRow keys={['Space']} label={tr('재생 / 정지', 'Play / Pause')} />
                      <ShortcutRow keys={['Home', 'End']} label={tr('처음 / 끝', 'First / Last')} />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex gap-1">{keys.map(k => <Kbd key={k}>{k}</Kbd>)}</span>
      <span>{label}</span>
    </div>
  );
}

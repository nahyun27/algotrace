import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, FastForward, Rewind, Keyboard } from 'lucide-react';

const SPEEDS = [0.25, 0.5, 1, 2, 4];

interface StepControllerProps {
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
}: StepControllerProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const speedIdx = SPEEDS.indexOf(speed);

  /* ── Keyboard shortcuts ── */
  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
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
    <div className="fixed bottom-0 left-0 nw:left-[260px] right-0 z-50 border-t bg-card/95 backdrop-blur-md text-card-foreground shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">

        {/* Left: step count */}
        <div className="text-[11px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0">
          {currentStep + 1} / {totalSteps}
        </div>

        {/* Center: playback buttons */}
        <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5">
          <button onClick={onFirst} disabled={currentStep === 0} aria-label="처음으로"
            className="p-2 sm:p-1.5 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center">
            <Rewind className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>
          <button onClick={onPrev} disabled={currentStep === 0} aria-label="이전 (←)"
            className="p-2 sm:p-1.5 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center">
            <SkipBack className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>
          <button onClick={onPlayPause} aria-label={isPlaying ? '일시정지 (Space)' : '재생 (Space)'}
            className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] mx-0.5 sm:mx-1 rounded-full hover:bg-primary/90 bg-primary text-primary-foreground shadow flex items-center justify-center transition-all">
            {isPlaying ? <Pause className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <Play className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          </button>
          <button onClick={onNext} disabled={currentStep === totalSteps - 1} aria-label="다음 (→)"
            className="p-2 sm:p-1.5 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center">
            <SkipForward className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>
          <button onClick={onLast} disabled={currentStep === totalSteps - 1} aria-label="마지막으로 (End)"
            className="p-2 sm:p-1.5 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center">
            <FastForward className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        {/* Right: speed slider + shortcut button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Speed */}
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1">
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold tabular-nums w-6 text-right">
              {speed}x
            </span>
            <input
              type="range"
              min={0}
              max={SPEEDS.length - 1}
              step={1}
              value={speedIdx >= 0 ? speedIdx : 2}
              onChange={(e) => onSpeedChange(SPEEDS[Number(e.target.value)])}
              className="w-14 sm:w-16 h-1 accent-primary cursor-pointer"
              aria-label="재생 속도"
            />
          </div>

          {/* Shortcut info */}
          <div className="relative">
            <button
              onClick={() => setShowShortcuts(p => !p)}
              aria-label="키보드 단축키"
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {showShortcuts && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowShortcuts(false)} />
                <div className="absolute bottom-full right-0 mb-2 z-50 w-48 bg-popover border rounded-lg shadow-xl p-2.5 text-[11px]">
                  <p className="font-semibold text-foreground mb-1.5">키보드 단축키</p>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span><kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">←</kbd> <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">→</kbd></span>
                      <span>이전 / 다음</span>
                    </div>
                    <div className="flex justify-between">
                      <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Space</kbd>
                      <span>재생 / 정지</span>
                    </div>
                    <div className="flex justify-between">
                      <span><kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Home</kbd> <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">End</kbd></span>
                      <span>처음 / 끝</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

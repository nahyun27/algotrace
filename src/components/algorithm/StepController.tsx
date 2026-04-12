import { Play, Pause, SkipForward, SkipBack, FastForward, Rewind } from 'lucide-react';

interface StepControllerProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
}

export default function StepController({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onFirst,
  onLast,
}: StepControllerProps) {
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 border-t bg-card text-card-foreground">
      <div className="text-xs sm:text-sm font-medium text-muted-foreground">
        Step {currentStep + 1} of {totalSteps}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onFirst}
          disabled={currentStep === 0}
          aria-label="처음으로"
          className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded hover:bg-muted disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <Rewind className="w-5 h-5" />
        </button>
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          aria-label="이전"
          className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded hover:bg-muted disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? '일시정지' : '재생'}
          className="p-3.5 sm:p-3 min-w-[52px] min-h-[52px] sm:min-w-0 sm:min-h-0 mx-1 sm:mx-2 rounded-full hover:bg-primary/90 bg-primary text-primary-foreground shadow flex items-center justify-center transition-all"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          aria-label="다음"
          className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded hover:bg-muted disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <button
          onClick={onLast}
          disabled={currentStep === totalSteps - 1}
          aria-label="마지막으로"
          className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded hover:bg-muted disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <FastForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

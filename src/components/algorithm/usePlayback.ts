import { useCallback, useEffect, useState } from 'react';
import type { StepControllerProps } from './StepController';

/**
 * Step playback state shared by every algorithm page.
 *
 *   const pb = usePlayback(steps.length);
 *   const step = steps[pb.index];
 *   <StepController {...pb.controller} />
 *
 * Call `pb.reset()` whenever the step list is regenerated (new example, new solver, custom graph).
 */
export function usePlayback(totalSteps: number) {
  const [rawIndex, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const last = Math.max(0, totalSteps - 1);
  const index = Math.min(rawIndex, last);

  useEffect(() => {
    if (!isPlaying) return;
    if (index >= last) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setIndex(i => Math.min(i + 1, last)), 1000 / speed);
    return () => clearTimeout(t);
  }, [isPlaying, index, last, speed]);

  /** Jump back to the first step; optionally start playing right away. */
  const reset = useCallback((autoplay = false) => {
    setIndex(0);
    setIsPlaying(autoplay);
  }, []);

  const goTo = useCallback((i: number) => {
    setIsPlaying(false);
    setIndex(Math.max(0, Math.min(i, last)));
  }, [last]);

  const controller: StepControllerProps = {
    currentStep: index,
    totalSteps,
    isPlaying,
    speed,
    onSpeedChange: setSpeed,
    onPlayPause: () => {
      // Pressing play on the last step restarts from the beginning
      if (!isPlaying && index >= last) setIndex(0);
      setIsPlaying(p => !p);
    },
    onNext: () => goTo(index + 1),
    onPrev: () => goTo(index - 1),
    onFirst: () => goTo(0),
    onLast: () => goTo(last),
    onSeek: goTo,
  };

  return { index, setIndex, isPlaying, setIsPlaying, speed, setSpeed, reset, goTo, controller };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { StepControllerProps } from './StepController';
import { useQueryPatcher } from './useUrlState';
import { encodeStep, parseStepParam } from './urlState';
import { markCompleted } from '../../progress/useProgress';

export interface PlaybackOptions {
  /** Step to start on. Defaults to `?step=` from the URL when `syncUrl` is on, else 0. Clamped to the step count. */
  initialIndex?: number;
  /**
   * Mirror the current step to `?step=` (replace, no history spam). Default true.
   * Pass false (or a condition) when a page has several playbacks, so only the visible one owns the URL.
   */
  syncUrl?: boolean;
}

/**
 * Step playback state shared by every algorithm page.
 *
 *   const pb = usePlayback(steps.length);
 *   const step = steps[pb.index];
 *   <StepController {...pb.controller} />
 *
 * Call `pb.reset()` whenever the step list is regenerated (new example, new solver, custom graph).
 *
 * The current step is shared through the URL (`?step=12` opens on step 13), and reaching the last step marks
 * the page's algorithm (route `:slug`) as completed in the learning progress.
 */
export function usePlayback(totalSteps: number, { initialIndex, syncUrl = true }: PlaybackOptions = {}) {
  const [searchParams] = useSearchParams();
  const { slug } = useParams();
  const [startIndex] = useState(() => initialIndex ?? (syncUrl ? parseStepParam(searchParams.get('step')) : 0));
  const [rawIndex, setIndex] = useState(startIndex);
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

  // Mirror the step to the URL (only once there are steps, so a clamped/empty list never wipes a shared link)
  const patchQuery = useQueryPatcher();
  useEffect(() => {
    if (syncUrl && totalSteps > 0) patchQuery({ step: encodeStep(index) });
  }, [syncUrl, totalSteps, index, patchQuery]);

  // Learning progress: the user played/stepped through to the end (opening a link on the last step doesn't count)
  const moved = useRef(false);
  useEffect(() => {
    if (index !== Math.min(startIndex, last)) moved.current = true;
    if (slug && moved.current && totalSteps > 1 && index >= last) markCompleted(slug);
  }, [index, last, totalSteps, startIndex, slug]);

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

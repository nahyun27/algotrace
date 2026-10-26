import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { StepControllerProps } from './StepController';
import type { QuizState } from './QuizCard';
import { useQuizMode, type QuizFn } from './quiz';
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
  /**
   * Prediction quiz (see `quiz.ts`). When given, the controller shows a quiz mode toggle; with quiz mode on,
   * moving past a step that has a question opens the question first. Pages without a quiz behave as before.
   */
  quiz?: QuizFn;
}

interface PendingQuiz {
  /** Step the question was asked on (it is about step `at + 1`) */
  at: number;
  picked: string | null;
  /** Resume autoplay after "continue" */
  resume: boolean;
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
export function usePlayback(totalSteps: number, { initialIndex, syncUrl = true, quiz }: PlaybackOptions = {}) {
  const [searchParams] = useSearchParams();
  const { slug } = useParams();
  const [startIndex] = useState(() => initialIndex ?? (syncUrl ? parseStepParam(searchParams.get('step')) : 0));
  const [rawIndex, setIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const last = Math.max(0, totalSteps - 1);
  const index = Math.min(rawIndex, last);

  /* ── Prediction quiz ── */
  const [quizOn, setQuizOn] = useQuizMode();
  const quizActive = !!quiz && quizOn;
  const [pending, setPending] = useState<PendingQuiz | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  /** Steps whose question was already answered (asked once per run of the step list) */
  const answered = useRef(new Set<number>());
  const questionAt = useCallback(
    (i: number) => (quizActive && i < last && !answered.current.has(i) ? quiz(i) : null),
    [quizActive, quiz, last],
  );
  const openQuiz = pending && quizActive && pending.at === index ? pending : null;
  const question = openQuiz && quizActive ? quiz(openQuiz.at) : null;

  useEffect(() => {
    if (!isPlaying) return;
    if (index >= last) {
      const t = window.setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      // Quiz mode: stop at a decision step and ask before revealing the next step
      if (questionAt(index)) {
        setIsPlaying(false);
        setPending({ at: index, picked: null, resume: true });
        return;
      }
      setIndex(i => Math.min(i + 1, last));
    }, 1000 / speed);
    return () => clearTimeout(t);
  }, [isPlaying, index, last, speed, questionAt]);

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
    setPending(null);
    answered.current = new Set();
  }, []);

  const goTo = useCallback((i: number) => {
    setIsPlaying(false);
    setPending(null);
    setIndex(Math.max(0, Math.min(i, last)));
  }, [last]);

  /** Answer the open question with the step after it revealed; resumes autoplay when the quiz interrupted it. */
  const continueQuiz = () => {
    if (!openQuiz) return;
    setPending(null);
    setIndex(Math.min(openQuiz.at + 1, last));
    if (openQuiz.resume) setIsPlaying(true);
  };

  /** Next / play: open the question first if this step has one. Returns true when the quiz took over. */
  const quizIntercept = (resume: boolean) => {
    if (question) {
      if (openQuiz?.picked) continueQuiz();
      return true;
    }
    if (questionAt(index)) {
      setIsPlaying(false);
      setPending({ at: index, picked: null, resume });
      return true;
    }
    return false;
  };

  const quizState: QuizState | undefined = quiz && {
    enabled: quizOn,
    onToggle: () => { setPending(null); setQuizOn(!quizOn); },
    score,
    question,
    picked: openQuiz?.picked ?? null,
    onPick: (id: string) => {
      if (!openQuiz || !question || openQuiz.picked) return;
      answered.current.add(openQuiz.at);
      setPending({ ...openQuiz, picked: id });
      setScore(s => ({ correct: s.correct + (id === question.answerId ? 1 : 0), total: s.total + 1 }));
    },
    onContinue: continueQuiz,
    onDismiss: () => setPending(null),
  };

  const controller: StepControllerProps = {
    currentStep: index,
    totalSteps,
    isPlaying,
    speed,
    onSpeedChange: setSpeed,
    onPlayPause: () => {
      if (!isPlaying && quizIntercept(true)) return;
      // Pressing play on the last step restarts from the beginning
      if (!isPlaying && index >= last) setIndex(0);
      setIsPlaying(p => !p);
    },
    onNext: () => {
      if (quizIntercept(false)) return;
      goTo(index + 1);
    },
    onPrev: () => goTo(index - 1),
    onFirst: () => goTo(0),
    onLast: () => goTo(last),
    onSeek: goTo,
    quiz: quizState,
  };

  return { index, setIndex, isPlaying, setIsPlaying, speed, setSpeed, reset, goTo, controller };
}

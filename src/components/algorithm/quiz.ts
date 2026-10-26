import { useCallback, useSyncExternalStore } from 'react';

/*
 * Prediction quiz: at "decision" steps the playback pauses and asks the learner what happens next.
 *
 * A page builds a `QuizFn` from its steps (a pure builder, see e.g. `algorithms/dijkstra/quiz.ts`) and passes it
 * to `usePlayback(steps.length, { quiz })`. `quiz(i)` is asked when moving from step i to step i + 1, so the
 * question is about step i + 1. Return null for steps without a question.
 */

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  question: string;
  /** 2 to 4 options (number keys 1-4 pick one) */
  options: QuizOption[];
  answerId: string;
  explanation?: string;
}

export type QuizFn = (stepIndex: number) => QuizQuestion | null;

/** Most options a question shows (number keys 1-4). */
export const MAX_QUIZ_OPTIONS = 4;

/**
 * Pick up to MAX_QUIZ_OPTIONS candidates that always include the answer, preferring candidates listed first
 * (e.g. the queue front), then sort them by `order` so the option position doesn't give the answer away.
 */
export function pickOptions<T>(candidates: T[], answer: T, order: (a: T, b: T) => number): T[] {
  const unique = [...new Set(candidates)];
  const others = unique.filter(c => c !== answer).slice(0, MAX_QUIZ_OPTIONS - 1);
  return [answer, ...others].sort(order);
}

/* ── Quiz mode on/off: remembered in localStorage, shared by every page ── */

export const QUIZ_MODE_KEY = 'algotrace.quizMode';

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readQuizMode(): boolean {
  try {
    return getStorage()?.getItem(QUIZ_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

let quizMode = readQuizMode();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== QUIZ_MODE_KEY) return;
  quizMode = readQuizMode();
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = () => quizMode;

export function setQuizMode(on: boolean) {
  if (on === quizMode) return;
  quizMode = on;
  try {
    getStorage()?.setItem(QUIZ_MODE_KEY, on ? '1' : '0');
  } catch {
    // storage full or blocked: keep the in-memory value
  }
  emit();
}

/** `[on, setOn]`: whether prediction quiz mode is enabled (off by default). */
export function useQuizMode(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const set = useCallback((v: boolean) => setQuizMode(v), []);
  return [on, set];
}

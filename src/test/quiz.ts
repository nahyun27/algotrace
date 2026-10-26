import { expect } from 'vitest';
import { MAX_QUIZ_OPTIONS, type QuizFn, type QuizQuestion } from '../components/algorithm/quiz';

/** Every question of a step list as [stepIndex, question], each checked for a well-formed shape. */
export function collectQuizzes(quiz: QuizFn, stepCount: number): [number, QuizQuestion][] {
  const out: [number, QuizQuestion][] = [];
  for (let i = 0; i < stepCount; i++) {
    const q = quiz(i);
    if (!q) continue;
    expect(i).toBeLessThan(stepCount - 1);
    expect(q.question.length).toBeGreaterThan(0);
    expect(q.options.length).toBeGreaterThanOrEqual(2);
    expect(q.options.length).toBeLessThanOrEqual(MAX_QUIZ_OPTIONS);
    const ids = q.options.map(o => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(q.answerId);
    out.push([i, q]);
  }
  return out;
}

/** Korean and English quizzes ask at the same steps with the same answers. */
export function expectQuizLangIndependent(ko: QuizFn, en: QuizFn, stepCount: number): void {
  const pick = (f: QuizFn) => collectQuizzes(f, stepCount).map(([i, q]) => [i, q.answerId, q.options.map(o => o.id)]);
  expect(pick(en)).toEqual(pick(ko));
}

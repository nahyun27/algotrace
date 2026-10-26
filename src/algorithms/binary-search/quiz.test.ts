import { describe, it, expect } from 'vitest';
import { generateFindSteps } from './solver';
import { buildFindQuiz } from './quiz';
import { DEFAULT_FIND } from './types';
import { SEEDS, mulberry32, randInt, randomArray } from '../../test/utils';
import { collectQuizzes, expectQuizLangIndependent } from '../../test/quiz';

const NEXT: Record<string, string> = { GO_LEFT: 'left', GO_RIGHT: 'right', FOUND: 'found' };

function check(arr: number[], target: number) {
  const steps = generateFindSteps(arr, target, 'en');
  const qs = collectQuizzes(buildFindQuiz(steps, arr, target, 'en'), steps.length);
  const firstMid = steps.findIndex(s => s.type === 'MID');
  for (const [i, q] of qs) {
    expect(steps[i].type).toBe('MID');
    expect(i).not.toBe(firstMid);
    expect(NEXT[steps[i + 1].type]).toBe(q.answerId);
    const v = arr[steps[i].mid!];
    expect(q.answerId).toBe(v === target ? 'found' : v < target ? 'right' : 'left');
  }
  // every MID step but the first has a question
  expect(qs.length).toBe(Math.max(0, steps.filter(s => s.type === 'MID').length - 1));
  return qs;
}

describe('binary search quiz', () => {
  it('asks on every MID step after the first on the default example', () => {
    const { arr, target } = DEFAULT_FIND;
    expect(check(arr, target).length).toBeGreaterThanOrEqual(1);
    const steps = generateFindSteps(arr, target, 'en');
    expectQuizLangIndependent(
      buildFindQuiz(generateFindSteps(arr, target), arr, target, 'ko'),
      buildFindQuiz(steps, arr, target, 'en'),
      steps.length,
    );
  });

  it('answers match the next step on 20 seeded random arrays (present and missing targets)', () => {
    for (const seed of SEEDS) {
      const rng = mulberry32(seed);
      const arr = randomArray(rng, randInt(rng, 1, 15), 1, 60).sort((a, b) => a - b);
      check(arr, arr[randInt(rng, 0, arr.length - 1)]);
      check(arr, randInt(rng, 0, 61));
    }
  });
});

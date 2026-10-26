import { describe, it, expect } from 'vitest';
import { generateBubbleSortSteps } from './bubbleSort';
import { buildBubbleQuiz } from './quiz';
import { DEFAULT_ARRAY } from './types';
import { SEEDS, mulberry32, randInt, randomArray } from '../../test/utils';
import { collectQuizzes, expectQuizLangIndependent } from '../../test/quiz';

function check(input: number[]) {
  const steps = generateBubbleSortSteps(input, 'en');
  const qs = collectQuizzes(buildBubbleQuiz(steps, 'en'), steps.length);
  for (const [i, q] of qs) {
    expect(steps[i].type).toBe('COMPARE');
    expect(q.answerId).toBe(steps[i + 1].type === 'SWAP' ? 'yes' : 'no');
    const [j, k] = steps[i].comparing;
    expect(q.answerId).toBe(steps[i].array[j] > steps[i].array[k] ? 'yes' : 'no');
  }
  expect(qs.length).toBe(steps.filter(s => s.type === 'COMPARE').length);
  return qs;
}

describe('bubble sort quiz', () => {
  it('asks on every comparison of the default example', () => {
    const qs = check(DEFAULT_ARRAY);
    expect(qs.some(([, q]) => q.answerId === 'yes')).toBe(true);
    expect(qs.some(([, q]) => q.answerId === 'no')).toBe(true);
    const steps = generateBubbleSortSteps(DEFAULT_ARRAY, 'en');
    expectQuizLangIndependent(buildBubbleQuiz(generateBubbleSortSteps(DEFAULT_ARRAY), 'ko'), buildBubbleQuiz(steps, 'en'), steps.length);
  });

  it('answers match the next step on 20 seeded random arrays', () => {
    for (const seed of SEEDS) {
      const rng = mulberry32(seed);
      check(randomArray(rng, randInt(rng, 2, 12), 1, 20));
    }
  });
});

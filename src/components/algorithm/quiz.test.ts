import { describe, it, expect } from 'vitest';
import { MAX_QUIZ_OPTIONS, pickOptions } from './quiz';

describe('pickOptions', () => {
  it('keeps the answer, prefers early candidates, dedupes and sorts', () => {
    const byNum = (a: number, b: number) => a - b;
    expect(pickOptions([5, 3, 3, 1], 3, byNum)).toEqual([1, 3, 5]);
    const many = pickOptions([9, 8, 7, 6, 5, 4], 4, byNum);
    expect(many).toHaveLength(MAX_QUIZ_OPTIONS);
    expect(many).toEqual([4, 7, 8, 9]);
  });
});

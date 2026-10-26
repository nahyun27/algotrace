import { describe, it, expect } from 'vitest';
import { generateFastSteps, generateQuadraticSteps, parseArray } from './solver';
import { DEFAULT_ARRAY, MAX_ABS, MAX_LEN } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt, randomArray } from '../../test/utils';

/** Brute force: longest strictly increasing subsequence length over all subsets. */
function bruteLIS(a: number[]): number {
  let best = 0;
  for (let mask = 1; mask < 1 << a.length; mask++) {
    let last = -Infinity, len = 0, ok = true;
    for (let i = 0; i < a.length && ok; i++) {
      if (!(mask & (1 << i))) continue;
      if (a[i] <= last) ok = false;
      last = a[i];
      len++;
    }
    if (ok) best = Math.max(best, len);
  }
  return best;
}

const isValidLIS = (a: number[], idx: number[]) =>
  idx.every((x, t) => t === 0 || (idx[t - 1] < x && a[idx[t - 1]] < a[x]));

const RANDOM = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const n = randInt(rng, 1, 14);
  // small value range → plenty of duplicates
  return randomArray(rng, n, -5, randInt(rng, 3, 40));
});

const CASES: number[][] = [
  DEFAULT_ARRAY,
  [5],
  [3, 3, 3],
  [9, 7, 5, 3, 1],
  [1, 2, 3, 4, 5, 6],
  [2, 5, 3, 7, 11, 8, 10, 13, 6],
  ...RANDOM,
];

const GENERATORS = { quadratic: generateQuadraticSteps, fast: generateFastSteps };

describe('LIS', () => {
  it('default example (BOJ 11053) gives length 4', () => {
    for (const gen of Object.values(GENERATORS)) {
      const last = gen(DEFAULT_ARRAY, 'en').at(-1)!;
      expect(last.lis.length).toBe(4);
      expect(last.lis.map(i => DEFAULT_ARRAY[i])).toEqual([10, 20, 30, 50]);
    }
  });

  it('matches brute force on edge cases and 20 seeded random arrays', () => {
    for (const a of CASES) {
      const want = bruteLIS(a);
      const quad = generateQuadraticSteps(a, 'en').at(-1)!;
      expect(quad.lis.length).toBe(want);
      expect(Math.max(...quad.dp)).toBe(want);
      expect(isValidLIS(a, quad.lis)).toBe(true);

      const fast = generateFastSteps(a, 'en').at(-1)!;
      expect(fast.tails.length).toBe(want);
      expect(fast.lis.length).toBe(want);
      expect(isValidLIS(a, fast.lis)).toBe(true);
    }
  });

  it('keeps tails strictly increasing and binary search ranges valid', () => {
    for (const a of CASES) {
      for (const s of generateFastSteps(a, 'en')) {
        for (let t = 1; t < s.tails.length; t++) expect(s.tails[t - 1]).toBeLessThan(s.tails[t]);
        if (s.type === 'SEARCH' && s.mid >= 0) {
          expect(s.lo).toBeLessThanOrEqual(s.mid);
          expect(s.mid).toBeLessThan(s.hi);
          expect(s.hi).toBeLessThanOrEqual(s.tails.length);
        }
      }
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    for (const a of CASES) {
      expectStepInvariants(generateQuadraticSteps(a, 'ko'), ['DONE']);
      expectStepInvariants(generateFastSteps(a, 'ko'), ['DONE']);
    }
  });

  it('produces the same step structure in ko and en', () => {
    for (const a of CASES) {
      expectLangIndependent(generateQuadraticSteps(a, 'ko'), generateQuadraticSteps(a, 'en'));
      expectLangIndependent(generateFastSteps(a, 'ko'), generateFastSteps(a, 'en'));
    }
  });

  it('parses user input', () => {
    expect(parseArray('10, 20 10,30', MAX_LEN, MAX_ABS)).toEqual([10, 20, 10, 30]);
    expect(parseArray('-3 4', MAX_LEN, MAX_ABS)).toEqual([-3, 4]);
    expect(parseArray('', MAX_LEN, MAX_ABS)).toBeNull();
    expect(parseArray('1 x 2', MAX_LEN, MAX_ABS)).toBeNull();
    expect(parseArray('1.5', MAX_LEN, MAX_ABS)).toBeNull();
    expect(parseArray('1000', MAX_LEN, MAX_ABS)).toBeNull();
    expect(parseArray(Array(MAX_LEN + 1).fill(1).join(' '), MAX_LEN, MAX_ABS)).toBeNull();
  });
});

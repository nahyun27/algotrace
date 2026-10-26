import { describe, it, expect } from 'vitest';
import { generateSubarraySumSteps, generateSlidingWindowSteps } from './solver';
import { DEFAULT_SUM, DEFAULT_WINDOW } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt, randomArray } from '../../test/utils';

const sum = (a: number[], l: number, r: number) => a.slice(l, r + 1).reduce((s, v) => s + v, 0);

/** Every closed interval [l, r] with sum m (brute force). */
const matchRef = (a: number[], m: number) => {
  const out: [number, number][] = [];
  for (let l = 0; l < a.length; l++) for (let r = l; r < a.length; r++) if (sum(a, l, r) === m) out.push([l, r]);
  return out;
};
const windowRef = (a: number[], k: number) => {
  let best = -Infinity;
  for (let l = 0; l + k <= a.length; l++) best = Math.max(best, sum(a, l, l + k - 1));
  return best;
};
const byPair = (x: [number, number], y: [number, number]) => x[0] - y[0] || x[1] - y[1];

const RANDOM = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const pos = randomArray(rng, randInt(rng, 1, 14), 1, 9);
  const m = randInt(rng, 1, 15);
  const signed = randomArray(rng, randInt(rng, 1, 14), -20, 20);
  const k = randInt(rng, 1, signed.length);
  return { pos, m, signed, k };
});

describe('Two pointers: subarray sum (BOJ 2003)', () => {
  it('BOJ 2003 sample gives 3', () => {
    const last = generateSubarraySumSteps(DEFAULT_SUM.arr, DEFAULT_SUM.m, 'en').at(-1)!;
    expect(last.count).toBe(3);
    expect(last.matches).toEqual([[1, 2], [5, 5], [6, 8]]);
  });

  it('finds exactly the brute-force intervals on 20 seeded random inputs', () => {
    for (const { pos, m } of RANDOM) {
      const steps = generateSubarraySumSteps(pos, m, 'en');
      const last = steps.at(-1)!;
      const ref = matchRef(pos, m);
      expect(last.count).toBe(ref.length);
      expect([...last.matches].sort(byPair)).toEqual(ref.sort(byPair));
      // window sum is always consistent, pointers never move backwards, linear step count
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        expect(s.total).toBe(s.r >= s.l ? sum(pos, s.l, s.r) : 0);
        if (i > 0) {
          expect(s.l).toBeGreaterThanOrEqual(steps[i - 1].l);
          expect(s.r).toBeGreaterThanOrEqual(steps[i - 1].r);
        }
      }
      expect(steps.filter(s => s.type === 'EXPAND' || s.type === 'SHRINK').length).toBeLessThanOrEqual(2 * pos.length);
    }
  });

  it('step invariants and ko/en structure', () => {
    for (const { arr, m } of [DEFAULT_SUM, ...RANDOM.map(c => ({ arr: c.pos, m: c.m }))]) {
      const en = generateSubarraySumSteps(arr, m, 'en');
      expectStepInvariants(en, ['DONE']);
      expectLangIndependent(generateSubarraySumSteps(arr, m, 'ko'), en);
    }
  });
});

describe('Two pointers: sliding window (BOJ 2559)', () => {
  it('BOJ 2559 sample gives 21 (and 28 for k = 3)', () => {
    expect(generateSlidingWindowSteps(DEFAULT_WINDOW.arr, DEFAULT_WINDOW.k, 'en').at(-1)!.best).toBe(21);
    expect(generateSlidingWindowSteps(DEFAULT_WINDOW.arr, 3, 'en').at(-1)!.best).toBe(28);
  });

  it('matches brute force on 20 seeded random inputs', () => {
    for (const { signed, k } of RANDOM) {
      const steps = generateSlidingWindowSteps(signed, k, 'en');
      const last = steps.at(-1)!;
      expect(last.best).toBe(windowRef(signed, k));
      expect(sum(signed, last.bestRange[0], last.bestRange[1])).toBe(last.best);
      for (const s of steps) {
        expect(s.r - s.l + 1).toBe(k);
        expect(s.total).toBe(sum(signed, s.l, s.r));
      }
      expect(last.sums.length).toBe(signed.length - k + 1);
    }
  });

  it('step invariants and ko/en structure', () => {
    for (const { arr, k } of [DEFAULT_WINDOW, ...RANDOM.map(c => ({ arr: c.signed, k: c.k }))]) {
      const en = generateSlidingWindowSteps(arr, k, 'en');
      expectStepInvariants(en, ['DONE']);
      expectLangIndependent(generateSlidingWindowSteps(arr, k, 'ko'), en);
    }
  });
});

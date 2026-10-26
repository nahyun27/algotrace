import { describe, it, expect } from 'vitest';
import { generateFindSteps, generateLowerBoundSteps, generateParametricSteps, woodAt } from './solver';
import { DEFAULT_FIND, DEFAULT_LOWER, DEFAULT_PARAM, type BSStep } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt, randomArray } from '../../test/utils';

const lowerRef = (arr: number[], t: number) => {
  const i = arr.findIndex(v => v >= t);
  return i === -1 ? arr.length : i;
};
const paramRef = (trees: number[], m: number) => {
  let best = 0;
  for (let h = 0; h <= Math.max(...trees); h++) if (woodAt(trees, h) >= m) best = h;
  return best;
};

const RANDOM = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const arr = randomArray(rng, randInt(rng, 1, 15), 1, 40).sort((a, b) => a - b);
  const target = randInt(rng, 0, 42);
  const trees = randomArray(rng, randInt(rng, 1, 8), 1, 40);
  const total = trees.reduce((s, t) => s + t, 0);
  return { arr, target, trees, m: randInt(rng, 1, total) };
});

/** Number of loop iterations (MID / CHECK steps) must be logarithmic. */
const probes = (steps: BSStep[]) => steps.filter(s => s.type === 'MID' || s.type === 'CHECK').length;

describe('Binary search: find', () => {
  it('default example finds 23 at index 5', () => {
    const last = generateFindSteps(DEFAULT_FIND.arr, DEFAULT_FIND.target, 'en').at(-1)!;
    expect(last.type).toBe('FOUND');
    expect(last.result).toBe(5);
  });

  it('matches includes() on 20 seeded random inputs', () => {
    for (const { arr, target } of RANDOM) {
      const steps = generateFindSteps(arr, target, 'en');
      const last = steps.at(-1)!;
      if (arr.includes(target)) {
        expect(last.type).toBe('FOUND');
        expect(arr[last.result!]).toBe(target);
      } else {
        expect(last.type).toBe('NOT_FOUND');
        expect(last.result).toBe(-1);
      }
      expect(probes(steps)).toBeLessThanOrEqual(Math.floor(Math.log2(arr.length)) + 1);
    }
  });

  it('range only shrinks and invariants hold', () => {
    for (const { arr, target } of [DEFAULT_FIND, ...RANDOM]) {
      const steps = generateFindSteps(arr, target, 'ko');
      expectStepInvariants(steps, ['FOUND', 'NOT_FOUND']);
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].lo).toBeGreaterThanOrEqual(steps[i - 1].lo);
        expect(steps[i].hi).toBeLessThanOrEqual(steps[i - 1].hi);
      }
    }
  });

  it('same structure in ko and en', () => {
    for (const { arr, target } of [DEFAULT_FIND, ...RANDOM]) {
      expectLangIndependent(generateFindSteps(arr, target, 'ko'), generateFindSteps(arr, target, 'en'));
    }
  });
});

describe('Binary search: lower bound', () => {
  it('default example: first 16 is at index 4', () => {
    const last = generateLowerBoundSteps(DEFAULT_LOWER.arr, DEFAULT_LOWER.target, 'en').at(-1)!;
    expect(last.result).toBe(4);
  });

  it('matches a linear scan on 20 seeded random inputs (+ edges)', () => {
    const cases = [...RANDOM, { arr: [1, 2, 3], target: 99 }, { arr: [5, 6], target: 0 }];
    for (const { arr, target } of cases) {
      const steps = generateLowerBoundSteps(arr, target, 'en');
      expect(steps.at(-1)!.result).toBe(lowerRef(arr, target));
      expect(probes(steps)).toBeLessThanOrEqual(Math.ceil(Math.log2(arr.length + 1)));
      expectStepInvariants(steps, ['DONE']);
      expectLangIndependent(generateLowerBoundSteps(arr, target, 'ko'), steps);
    }
  });
});

describe('Binary search: parametric (BOJ 2805)', () => {
  it('BOJ 2805 sample gives 15', () => {
    const last = generateParametricSteps(DEFAULT_PARAM.trees, DEFAULT_PARAM.m, 'en').at(-1)!;
    expect(last.type).toBe('DONE');
    expect(last.result).toBe(15);
  });

  it('matches brute force on 20 seeded random inputs', () => {
    for (const { trees, m } of RANDOM) {
      const steps = generateParametricSteps(trees, m, 'en');
      expect(steps.at(-1)!.result).toBe(paramRef(trees, m));
      for (const s of steps.filter(s => s.type === 'CHECK')) {
        expect(s.wood).toBe(woodAt(trees, s.mid!));
        expect(s.ok).toBe(s.wood! >= m);
      }
      expectStepInvariants(steps, ['DONE']);
      expectLangIndependent(generateParametricSteps(trees, m, 'ko'), steps);
    }
  });
});

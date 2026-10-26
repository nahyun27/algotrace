import { describe, it, expect } from 'vitest';
import { generateKnapsackSteps } from './solver';
import { DEFAULT_INPUT, type KnapsackInput } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

/** Brute force over every subset (N ≤ 6) */
function bruteForce({ items, K }: KnapsackInput): number {
  let best = 0;
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let w = 0, v = 0;
    items.forEach((it, k) => { if (mask & (1 << k)) { w += it.weight; v += it.value; } });
    if (w <= K) best = Math.max(best, v);
  }
  return best;
}

const RANDOM: KnapsackInput[] = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const n = randInt(rng, 1, 6);
  return {
    K: randInt(rng, 1, 15),
    items: Array.from({ length: n }, () => ({ weight: randInt(rng, 1, 15), value: randInt(rng, 1, 99) })),
  };
});

const CASES: KnapsackInput[] = [
  DEFAULT_INPUT,
  { K: 3, items: [{ weight: 5, value: 10 }] }, // nothing fits
  { K: 10, items: [{ weight: 5, value: 10 }, { weight: 5, value: 10 }] },
  ...RANDOM,
];

describe('0/1 knapsack', () => {
  it('default example reproduces BOJ 12865 (N=4, K=7 → 14)', () => {
    const last = generateKnapsackSteps(DEFAULT_INPUT, 'en').at(-1)!;
    expect(last.result).toBe(14);
    expect(last.chosen).toEqual([1, 2]); // items 2 and 3: weight 4 + 3, value 8 + 6
  });

  it('matches brute force and the chosen items are feasible and optimal', () => {
    for (const input of CASES) {
      const steps = generateKnapsackSteps(input, 'en');
      const last = steps.at(-1)!;
      const best = bruteForce(input);
      expect(last.result).toBe(best);
      const w = last.chosen.reduce((s, k) => s + input.items[k].weight, 0);
      const v = last.chosen.reduce((s, k) => s + input.items[k].value, 0);
      expect(w).toBeLessThanOrEqual(input.K);
      expect(v).toBe(best);
      expect(new Set(last.chosen).size).toBe(last.chosen.length);
      // each cell gets exactly one decision
      expect(steps.filter(s => s.type === 'SKIP' || s.type === 'TAKE').length).toBe(input.items.length * (input.K + 1));
      // backtrack ends in row 0
      expect(last.path[0]).toEqual([input.items.length, input.K]);
      expect(last.path.at(-1)![0]).toBe(0);
    }
  });

  it('TAKE only happens when the item fits', () => {
    for (const input of CASES) {
      for (const s of generateKnapsackSteps(input, 'en')) {
        if (s.type === 'TAKE') expect(input.items[s.cell![0] - 1].weight).toBeLessThanOrEqual(s.cell![1]);
      }
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    for (const input of CASES) expectStepInvariants(generateKnapsackSteps(input, 'ko'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const input of CASES) expectLangIndependent(generateKnapsackSteps(input, 'ko'), generateKnapsackSteps(input, 'en'));
  });
});

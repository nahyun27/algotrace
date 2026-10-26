import { describe, it, expect } from 'vitest';
import { DEFAULT_ARRAY, type SortStep } from './types';
import { generateBubbleSortSteps } from './bubbleSort';
import { generateSelectionSortSteps } from './selectionSort';
import { generateInsertionSortSteps } from './insertionSort';
import { generateMergeSortSteps } from './mergeSort';
import { generateQuickSortSteps } from './quickSort';
import { generateHeapSortSteps } from './heapSort';
import type { Lang } from '../../i18n';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt, randomArray } from '../../test/utils';

type Generator = (input: number[], lang?: Lang) => SortStep[];

const GENERATORS: [string, Generator][] = [
  ['bubble', generateBubbleSortSteps],
  ['selection', generateSelectionSortSteps],
  ['insertion', generateInsertionSortSteps],
  ['merge', generateMergeSortSteps],
  ['quick', generateQuickSortSteps],
  ['heap', generateHeapSortSteps],
];

const FIXED_INPUTS: number[][] = [
  DEFAULT_ARRAY,
  [1, 2, 3, 4, 5],          // already sorted
  [5, 4, 3, 2, 1],          // reversed
  [7, 7, 7, 7],             // all equal
  [3, 1, 3, 1, 2, 2],       // duplicates
  [42],                     // single element
  [2, 1],                   // two elements
];

const RANDOM_INPUTS: number[][] = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  return randomArray(rng, randInt(rng, 2, 16), 1, 30);
});

const ref = (a: number[]) => [...a].sort((x, y) => x - y);

describe.each(GENERATORS)('%s sort', (name, gen) => {
  it('sorts the default and edge-case inputs', () => {
    for (const input of FIXED_INPUTS) {
      const steps = gen(input, 'en');
      expect(steps[steps.length - 1].array).toEqual(ref(input));
    }
  });

  it('sorts 20 seeded random arrays', () => {
    for (const input of RANDOM_INPUTS) {
      const steps = gen(input, 'en');
      expect(steps[steps.length - 1].array).toEqual(ref(input));
    }
  });

  it('does not mutate its input', () => {
    const input = [...DEFAULT_ARRAY];
    gen(input);
    expect(input).toEqual(DEFAULT_ARRAY);
  });

  it('marks every index sorted in the final step', () => {
    for (const input of [...FIXED_INPUTS, ...RANDOM_INPUTS]) {
      const last = gen(input, 'en').at(-1)!;
      expect([...last.sorted].sort((a, b) => a - b)).toEqual(input.map((_, i) => i));
    }
  });

  // Insertion sort (shift) and merge sort (write-back) intentionally show
  // transient duplicate values mid-step, so only swap-based sorts are checked.
  const swapBased = !['insertion', 'merge'].includes(name);
  if (swapBased) it('every step keeps the array a permutation of the input', () => {
    for (const input of [DEFAULT_ARRAY, ...RANDOM_INPUTS.slice(0, 5)]) {
      for (const s of gen(input, 'en')) expect(ref(s.array)).toEqual(ref(input));
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    for (const input of [...FIXED_INPUTS, ...RANDOM_INPUTS]) {
      expectStepInvariants(gen(input, 'ko'), ['DONE']);
      expectStepInvariants(gen(input, 'en'), ['DONE']);
    }
  });

  it('produces the same step structure in ko and en', () => {
    for (const input of [DEFAULT_ARRAY, ...RANDOM_INPUTS]) {
      expectLangIndependent(gen(input, 'ko'), gen(input, 'en'));
    }
  });
});

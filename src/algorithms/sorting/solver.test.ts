import { describe, it, expect } from 'vitest';
import { DEFAULT_ARRAY, digitAt, sanitizeInput, type SortStep } from './types';
import { generateBubbleSortSteps } from './bubbleSort';
import { generateSelectionSortSteps } from './selectionSort';
import { generateInsertionSortSteps } from './insertionSort';
import { generateMergeSortSteps } from './mergeSort';
import { generateQuickSortSteps } from './quickSort';
import { generateHeapSortSteps } from './heapSort';
import { generateCountingSortSteps } from './countingSort';
import { generateRadixSortSteps, radixPasses } from './radixSort';
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
  ['counting', generateCountingSortSteps],
  ['radix', generateRadixSortSteps],
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

  // Insertion sort (shift), merge sort (write-back) and radix sort (collect) intentionally show
  // transient duplicate values mid-step, so only swap-based sorts are checked.
  const swapBased = !['insertion', 'merge', 'radix'].includes(name);
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

/* ─────────────── Counting sort / radix sort specifics ─────────────── */

const count = (a: number[], v: number) => a.filter(x => x === v).length;

describe('counting sort', () => {
  const inputs = [...FIXED_INPUTS, [0, 0, 0], [0, 99, 50, 0, 99], ...RANDOM_INPUTS];

  it('never compares and uses only COUNT / PREFIX / PLACE between INIT and DONE', () => {
    for (const input of inputs) {
      const steps = generateCountingSortSteps(input, 'en');
      expect(steps.every(s => s.compares === 0)).toBe(true);
      expect(steps[0].type).toBe('INIT');
      const types = steps.slice(1, -1).map(s => s.type);
      // phases appear in order: all COUNT, then PREFIX, then PLACE
      const order = types.map(t => ['COUNT', 'PREFIX', 'PLACE'].indexOf(t));
      expect(order.every(o => o >= 0)).toBe(true);
      expect([...order].sort((a, b) => a - b)).toEqual(order);
      expect(types.filter(t => t === 'COUNT')).toHaveLength(input.length);
      expect(types.filter(t => t === 'PLACE')).toHaveLength(input.length);
    }
  });

  it('count[] holds occurrences after counting and "≤ v" totals after prefix sums', () => {
    for (const input of inputs) {
      const steps = generateCountingSortSteps(input, 'en');
      const k = Math.max(...input) + 1;
      const lastCount = steps.filter(s => s.type === 'COUNT').at(-1)!;
      expect(lastCount.counts).toEqual(Array.from({ length: k }, (_, v) => count(input, v)));
      const lastPrefix = steps.filter(s => s.type === 'PREFIX').at(-1)!;
      expect(lastPrefix.counts).toEqual(Array.from({ length: k }, (_, v) => input.filter(x => x <= v).length));
    }
  });

  it('places right-to-left into the slot count[x] points at, and is stable', () => {
    for (const input of inputs) {
      const places = generateCountingSortSteps(input, 'en').filter(s => s.type === 'PLACE');
      expect(places.map(s => s.pivot)).toEqual(input.map((_, i) => input.length - 1 - i));
      const slotOf = new Map<number, number>();
      for (const s of places) {
        const i = s.pivot!;
        expect(s.output![s.outputIndex!]).toBe(input[i]);
        expect(s.counts![input[i]]).toBe(s.outputIndex);
        slotOf.set(i, s.outputIndex!);
      }
      // stability: equal values keep their original relative order
      for (let i = 0; i < input.length; i++)
        for (let j = i + 1; j < input.length; j++)
          if (input[i] === input[j]) expect(slotOf.get(i)!).toBeLessThan(slotOf.get(j)!);
      expect(places.at(-1)!.output).toEqual(ref(input));
    }
  });

  it('clamps out-of-range input into integers 0–99', () => {
    expect(sanitizeInput('counting', [-3, 4.6, 150, 7])).toEqual({ array: [0, 5, 99, 7], adjusted: true });
    expect(sanitizeInput('counting', [1, 2])).toEqual({ array: [1, 2], adjusted: false });
    expect(sanitizeInput('bubble', [150, 4.5]).array).toEqual([150, 4.5]);
    expect(generateCountingSortSteps([150, -2, 30]).at(-1)!.array).toEqual([0, 30, 99]);
  });
});

describe('radix sort', () => {
  const inputs = [...FIXED_INPUTS, [170, 45, 75, 90, 802, 24, 2, 66], [0, 0], [100, 1, 10, 0], ...RANDOM_INPUTS];

  it('makes one DIGIT_PASS per digit of the maximum and never compares', () => {
    for (const input of inputs) {
      const steps = generateRadixSortSteps(input, 'en');
      expect(steps.every(s => s.compares === 0)).toBe(true);
      const passes = steps.filter(s => s.type === 'DIGIT_PASS');
      expect(passes.map(s => s.digit)).toEqual(Array.from({ length: radixPasses(Math.max(...input)) }, (_, p) => p));
      expect(steps.filter(s => s.type === 'BUCKET')).toHaveLength(input.length * passes.length);
    }
    expect(radixPasses(0)).toBe(0);
    expect(radixPasses(9)).toBe(1);
    expect(radixPasses(802)).toBe(3);
  });

  it('puts each element into the bucket of its current digit and collects buckets in order (stable pass)', () => {
    for (const input of inputs) {
      const steps = generateRadixSortSteps(input, 'en');
      let arr = [...input];
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        if (s.type === 'BUCKET') {
          expect(s.currentValue).toBe(arr[s.pivot!]);
          expect(s.bucketIndex).toBe(digitAt(s.currentValue!, s.digit!));
          expect(s.buckets![s.bucketIndex!].at(-1)).toBe(s.currentValue);
        }
        // end of a pass: the array is the previous array stably sorted by this digit
        if (s.type === 'COLLECT' && steps[i + 1]?.type !== 'COLLECT') {
          const p = s.digit!;
          const expected = [...arr].map((v, idx) => ({ v, idx }))
            .sort((a, b) => digitAt(a.v, p) - digitAt(b.v, p) || a.idx - b.idx)
            .map(e => e.v);
          expect(s.array).toEqual(expected);
          expect(s.buckets!.flat()).toEqual(expected);
          arr = s.array;
        }
      }
      expect(arr).toEqual(ref(input));
    }
  });

  it('rounds negative / fractional input to non-negative integers', () => {
    expect(sanitizeInput('radix', [-5, 2.4, 1000])).toEqual({ array: [0, 2, 1000], adjusted: true });
    expect(generateRadixSortSteps([-5, 12, 3]).at(-1)!.array).toEqual([0, 3, 12]);
  });
});

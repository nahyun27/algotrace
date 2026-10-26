import { describe, it, expect } from 'vitest';
import { applyOp, generateBuildSteps, generateExtractSteps, generateInsertSteps, generateOpSteps } from './solver';
import { DEFAULT_VALUES, type HeapOp, type HeapStep } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt, randomArray } from '../../test/utils';

const isHeap = (h: number[], isMax = false) =>
  h.every((v, i) => i === 0 || (isMax ? h[(i - 1) >> 1] >= v : h[(i - 1) >> 1] <= v));
const sorted = (a: number[]) => [...a].sort((x, y) => x - y);

/** BOJ 1927 / 11279 style: x = 0 prints (and removes) the root, 0 when empty; otherwise insert x. */
function runBoj(cmds: number[], isMax: boolean): number[] {
  let heap: number[] = [];
  const out: number[] = [];
  for (const x of cmds) {
    const op: HeapOp = x === 0 ? { kind: 'extract' } : { kind: 'insert', value: x };
    const r = applyOp(heap, op, isMax);
    heap = r.heap;
    if (x === 0) out.push(r.extracted ?? 0);
  }
  return out;
}

/** Random op sequences for both heap kinds */
const RANDOM = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const init = randomArray(rng, randInt(rng, 0, 12), -50, 50);
  const ops: HeapOp[] = Array.from({ length: randInt(rng, 3, 15) }, () =>
    rng() < 0.55 ? { kind: 'insert', value: randInt(rng, -50, 50) } : { kind: 'extract' });
  return { init, ops, isMax: rng() < 0.5 };
});

const allStepLists = (): HeapStep[][] => {
  const lists: HeapStep[][] = [generateBuildSteps(DEFAULT_VALUES, false, 'en'), generateBuildSteps([], false, 'en'), generateBuildSteps([5], true, 'en')];
  for (const { init, ops, isMax } of RANDOM) {
    let heap = generateBuildSteps(init, isMax, 'en').at(-1)!.heap;
    for (const op of ops) {
      const steps = generateOpSteps(heap, op, isMax, 'en');
      lists.push(steps);
      heap = steps.at(-1)!.heap;
    }
  }
  return lists;
};

describe('Heap', () => {
  it('default build-heap gives a valid min-heap of the same values', () => {
    const last = generateBuildSteps(DEFAULT_VALUES, false, 'en').at(-1)!;
    expect(isHeap(last.heap)).toBe(true);
    expect(sorted(last.heap)).toEqual(sorted(DEFAULT_VALUES));
    expect(last.heap).toEqual([1, 3, 2, 4, 8, 7, 6, 9, 5]);
  });

  it('reproduces the BOJ 1927 and 11279 sample outputs', () => {
    expect(runBoj([0, 12345678, 1, 2, 0, 0, 0, 0, 32], false)).toEqual([0, 1, 2, 12345678, 0]);
    expect(runBoj([0, 1, 2, 0, 0, 3, 2, 1, 0, 0, 0, 0, 0], true)).toEqual([0, 2, 1, 3, 2, 1, 0, 0]);
  });

  it('build, insert and extract match a sorted-list reference on 20 seeded random sequences', () => {
    for (const { init, ops, isMax } of RANDOM) {
      let heap = generateBuildSteps(init, isMax, 'en').at(-1)!.heap;
      expect(isHeap(heap, isMax)).toBe(true);
      expect(sorted(heap)).toEqual(sorted(init));
      let ref = sorted(init);
      for (const op of ops) {
        const r = applyOp(heap, op, isMax);
        if (op.kind === 'insert') {
          ref = sorted([...ref, op.value]);
          expect(r.extracted).toBeNull();
        } else {
          const want = ref.length === 0 ? null : isMax ? ref[ref.length - 1] : ref[0];
          expect(r.extracted).toBe(want);
          if (ref.length) ref = isMax ? ref.slice(0, -1) : ref.slice(1);
        }
        heap = r.heap;
        expect(isHeap(heap, isMax)).toBe(true);
        expect(sorted(heap)).toEqual(ref);
      }
    }
  });

  it('insert and extract stay within O(log n) comparisons', () => {
    const big = generateBuildSteps(Array.from({ length: 15 }, (_, i) => 15 - i), false, 'en').at(-1)!.heap;
    expect(generateInsertSteps(big, -1, false, 'en').at(-1)!.compares).toBeLessThanOrEqual(4);
    expect(generateExtractSteps(big, false, 'en').at(-1)!.compares).toBeLessThanOrEqual(2 * 4);
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateBuildSteps(DEFAULT_VALUES, false, 'ko'), ['DONE']);
    for (const steps of allStepLists()) {
      expectStepInvariants(steps, ['DONE']);
      for (const s of steps) {
        for (const i of [s.current, ...s.compare, ...(s.swapped ?? []), ...s.settled]) {
          if (i !== null) expect(i).toBeLessThan(s.heap.length);
        }
      }
    }
  });

  it('produces the same step structure in ko and en', () => {
    expectLangIndependent(generateBuildSteps(DEFAULT_VALUES, false, 'ko'), generateBuildSteps(DEFAULT_VALUES, false, 'en'));
    for (const { init, ops, isMax } of RANDOM) {
      let heap = applyOp([], { kind: 'build', values: init }, isMax).heap;
      for (const op of ops) {
        expectLangIndependent(generateOpSteps(heap, op, isMax, 'ko'), generateOpSteps(heap, op, isMax, 'en'));
        heap = applyOp(heap, op, isMax).heap;
      }
    }
  });
});

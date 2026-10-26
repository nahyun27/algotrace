import { describe, it, expect } from 'vitest';
import { generateFenwickSteps, generateSegmentSteps } from './solver';
import { DEFAULT_INPUT, lowbit, type Operation, type SegInput } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt, randomArray } from '../../test/utils';

const rangeSum = (a: number[], l: number, r: number) => a.slice(l, r + 1).reduce((x, y) => x + y, 0);

/** Reference segment tree built from scratch (sums by heap index). */
function refTree(a: number[]) {
  const t: (number | null)[] = Array(4 * a.length).fill(null);
  const build = (node: number, s: number, e: number): number => {
    if (s === e) return (t[node] = a[s]);
    const m = (s + e) >> 1;
    return (t[node] = build(node * 2, s, m) + build(node * 2 + 1, m + 1, e));
  };
  build(1, 0, a.length - 1);
  return t;
}

/** Reference BIT: tree[i] = sum of a[i - lowbit(i) .. i - 1]. */
const refBit = (a: number[]) => [0, ...a.map((_, k) => rangeSum(a, k + 1 - lowbit(k + 1), k))];

const RANDOM: SegInput[] = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const n = randInt(rng, 1, 12);
  const arr = randomArray(rng, n, -20, 50);
  const l = randInt(rng, 0, n - 1);
  const r = randInt(rng, l, n - 1);
  return { arr, l, r, idx: randInt(rng, 0, n - 1), val: randInt(rng, -20, 50) };
});
const CASES: SegInput[] = [DEFAULT_INPUT, { arr: [7], l: 0, r: 0, idx: 0, val: 3 }, { ...DEFAULT_INPUT, l: 0, r: 7 }, ...RANDOM];
const OPS: Operation[] = ['query', 'update'];

describe('Segment tree', () => {
  it('default example: sum [2, 6] = 20, update arr[3] = 10 gives total 46', () => {
    expect(generateSegmentSteps(DEFAULT_INPUT, 'query', 'en').at(-1)!.result).toBe(20);
    const last = generateSegmentSteps(DEFAULT_INPUT, 'update', 'en').at(-1)!;
    expect(last.arr).toEqual([5, 8, 6, 10, 2, 7, 2, 6]);
    expect(last.result).toBe(46);
  });

  it('BOJ 2042 sample: 17 then 12', () => {
    const a = [1, 2, 3, 4, 5];
    const u1 = generateSegmentSteps({ arr: a, l: 0, r: 0, idx: 2, val: 6 }, 'update', 'en').at(-1)!.arr;
    expect(generateSegmentSteps({ arr: u1, l: 1, r: 4, idx: 0, val: 0 }, 'query', 'en').at(-1)!.result).toBe(17);
    const u2 = generateSegmentSteps({ arr: u1, l: 0, r: 0, idx: 4, val: 2 }, 'update', 'en').at(-1)!.arr;
    expect(generateSegmentSteps({ arr: u2, l: 2, r: 4, idx: 0, val: 0 }, 'query', 'en').at(-1)!.result).toBe(12);
  });

  it('matches the reference on edge cases and 20 seeded random inputs', () => {
    for (const c of CASES) {
      const q = generateSegmentSteps(c, 'query', 'en');
      expect(q.at(-1)!.result).toBe(rangeSum(c.arr, c.l, c.r));
      // the tree after BUILD equals a fresh build; FULL nodes are disjoint and cover exactly [l, r]
      expect(q.at(-1)!.tree).toEqual(refTree(c.arr));
      const fullSum = q.filter(s => s.type === 'FULL').reduce((x, s) => x + s.tree[s.node!]!, 0);
      expect(fullSum).toBe(rangeSum(c.arr, c.l, c.r));
      const covered = q.filter(s => s.type === 'FULL').reduce((x, s) => x + s.span![1] - s.span![0] + 1, 0);
      expect(covered).toBe(c.r - c.l + 1);

      const u = generateSegmentSteps(c, 'update', 'en').at(-1)!;
      const next = c.arr.map((v, i) => (i === c.idx ? c.val : v));
      expect(u.arr).toEqual(next);
      expect(u.tree).toEqual(refTree(next));
    }
  });

  it('visits O(log n) nodes per query (at most 4 per level)', () => {
    for (const c of CASES) {
      const visits = generateSegmentSteps(c, 'query', 'en').filter(s => ['FULL', 'PARTIAL', 'OUTSIDE'].includes(s.type)).length;
      expect(visits).toBeLessThanOrEqual(4 * (Math.ceil(Math.log2(c.arr.length)) + 1));
    }
  });

  it('satisfies step invariants and ends with DONE; ko and en match', () => {
    for (const c of CASES) {
      for (const op of OPS) {
        expectStepInvariants(generateSegmentSteps(c, op, 'ko'), ['DONE']);
        expectLangIndependent(generateSegmentSteps(c, op, 'ko'), generateSegmentSteps(c, op, 'en'));
      }
    }
  });
});

describe('Fenwick tree', () => {
  it('default example: sum [2, 6] = 20; BOJ 11659-style prefix differences', () => {
    const q = generateFenwickSteps(DEFAULT_INPUT, 'query', 'en');
    expect(q.at(-1)!.result).toBe(20);
    expect(q.at(-1)!.prefR).toBe(33);
    expect(q.at(-1)!.prefL).toBe(13);
    // BOJ 11659 sample: 5 4 3 2 1 → (1,3) 12, (2,4) 9, (5,5) 1
    const a = [5, 4, 3, 2, 1];
    const ask = (l: number, r: number) => generateFenwickSteps({ arr: a, l, r, idx: 0, val: 0 }, 'query', 'en').at(-1)!.result;
    expect([ask(0, 2), ask(1, 3), ask(4, 4)]).toEqual([12, 9, 1]);
  });

  it('matches the reference on edge cases and 20 seeded random inputs', () => {
    for (const c of CASES) {
      const q = generateFenwickSteps(c, 'query', 'en');
      expect(q.at(-1)!.result).toBe(rangeSum(c.arr, c.l, c.r));
      expect(q.at(-1)!.tree).toEqual(refBit(c.arr));
      // prefix sums walk i -= i & -i: at most bit-length(n) cells each
      const bits = c.arr.length.toString(2).length;
      expect(q.at(-1)!.plus.length).toBeLessThanOrEqual(bits);
      expect(q.at(-1)!.minus.length).toBeLessThanOrEqual(bits);

      const u = generateFenwickSteps(c, 'update', 'en').at(-1)!;
      const next = c.arr.map((v, i) => (i === c.idx ? c.val : v));
      expect(u.arr).toEqual(next);
      expect(u.tree).toEqual(refBit(next));
      // touched cells follow i += i & -i
      let i = c.idx + 1;
      const walk: number[] = [];
      while (i <= c.arr.length) { walk.push(i); i += lowbit(i); }
      expect(u.updated).toEqual(walk);
    }
  });

  it('satisfies step invariants and ends with DONE; ko and en match', () => {
    for (const c of CASES) {
      for (const op of OPS) {
        expectStepInvariants(generateFenwickSteps(c, op, 'ko'), ['DONE']);
        expectLangIndependent(generateFenwickSteps(c, op, 'ko'), generateFenwickSteps(c, op, 'en'));
      }
    }
  });
});

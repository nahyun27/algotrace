import { describe, it, expect } from 'vitest';
import { generateEditSteps, generateLCSSteps } from './solver';
import { DEFAULT_INPUT } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

/** Plain O(nm) references */
function lcsRef(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
}

function editRef(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), dp[i - 1][j] + 1, dp[i][j - 1] + 1);
  return dp[a.length][b.length];
}

/** True if `sub` is a subsequence of `s` */
const isSubsequence = (sub: string, s: string) => {
  let k = 0;
  for (const ch of s) if (k < sub.length && ch === sub[k]) k++;
  return k === sub.length;
};

const randomString = (rng: () => number, len: number, alphabet = 'ABCD') =>
  Array.from({ length: len }, () => alphabet[randInt(rng, 0, alphabet.length - 1)]).join('');

const RANDOM = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  return { a: randomString(rng, randInt(rng, 1, 10)), b: randomString(rng, randInt(rng, 1, 10)) };
});

const CASES = [
  DEFAULT_INPUT.lcs,
  DEFAULT_INPUT.edit,
  { a: 'A', b: 'B' },
  { a: 'ABC', b: 'ABC' },
  { a: 'AAAA', b: 'A' },
  ...RANDOM,
];

describe('LCS', () => {
  it('default example reproduces BOJ 9251 (ACAYKP / CAPCAK → 4)', () => {
    const last = generateLCSSteps('ACAYKP', 'CAPCAK', 'en').at(-1)!;
    expect(last.result).toBe(4);
    expect(last.matchA.map(i => 'ACAYKP'[i]).join('')).toBe('ACAK');
  });

  it('matches the reference and backtracks to a real common subsequence', () => {
    for (const { a, b } of CASES) {
      const steps = generateLCSSteps(a, b, 'en');
      const last = steps.at(-1)!;
      expect(last.result).toBe(lcsRef(a, b));
      expect(last.dp[a.length][b.length]).toBe(lcsRef(a, b));
      const lcs = last.matchA.map(i => a[i]).join('');
      expect(lcs).toBe(last.matchB.map(j => b[j]).join(''));
      expect(lcs.length).toBe(last.result);
      expect(isSubsequence(lcs, a) && isSubsequence(lcs, b)).toBe(true);
      // every cell is filled exactly once
      expect(steps.filter(s => s.type === 'MATCH' || s.type === 'MISMATCH').length).toBe(a.length * b.length);
      // path starts at (n, m) and moves one step towards the origin each time
      expect(last.path[0]).toEqual([a.length, b.length]);
      for (let k = 1; k < last.path.length; k++) {
        const [r0, c0] = last.path[k - 1], [r1, c1] = last.path[k];
        expect(r0 - r1 + c0 - c1).toBeGreaterThanOrEqual(1);
        expect(r0 - r1).toBeLessThanOrEqual(1);
        expect(c0 - c1).toBeLessThanOrEqual(1);
      }
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    for (const { a, b } of CASES) expectStepInvariants(generateLCSSteps(a, b, 'ko'), ['DONE']);
    expectStepInvariants(generateLCSSteps('', 'AB', 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { a, b } of CASES) expectLangIndependent(generateLCSSteps(a, b, 'ko'), generateLCSSteps(a, b, 'en'));
  });
});

describe('Edit distance', () => {
  it('default example: kitten → sitting = 3', () => {
    const last = generateEditSteps('kitten', 'sitting', 'en').at(-1)!;
    expect(last.result).toBe(3);
  });

  it('matches the reference and the edit script transforms A into B with result-many edits', () => {
    for (const { a, b } of [...CASES, { a: '', b: 'AB' }, { a: 'AB', b: '' }]) {
      const steps = generateEditSteps(a, b, 'en');
      const last = steps.at(-1)!;
      expect(last.result).toBe(editRef(a, b));
      expect(last.script.filter(o => o.op !== 'MATCH').length).toBe(last.result);
      expect(last.script.map(o => o.a ?? '').join('')).toBe(a);
      expect(last.script.map(o => o.b ?? '').join('')).toBe(b);
      for (const o of last.script) {
        if (o.op === 'MATCH') expect(o.a).toBe(o.b);
        if (o.op === 'REPLACE') expect(o.a).not.toBe(o.b);
      }
      expect(last.path.at(-1)).toEqual([0, 0]);
      // each filled cell reports which operation won
      expect(steps.filter(s => ['MATCH', 'REPLACE', 'INSERT', 'DELETE'].includes(s.type)).length).toBe(a.length * b.length);
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    for (const { a, b } of CASES) expectStepInvariants(generateEditSteps(a, b, 'ko'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { a, b } of CASES) expectLangIndependent(generateEditSteps(a, b, 'ko'), generateEditSteps(a, b, 'en'));
  });
});

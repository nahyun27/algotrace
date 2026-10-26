import { describe, it, expect } from 'vitest';
import { generateKMPSteps } from './solver';
import { DEFAULT_PATTERN, DEFAULT_TEXT } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

/** Naive O(nm) reference: every start index where the pattern occurs. */
const naiveFind = (t: string, p: string) => {
  const out: number[] = [];
  if (p.length === 0) return out;
  for (let s = 0; s + p.length <= t.length; s++) if (t.slice(s, s + p.length) === p) out.push(s);
  return out;
};

/** Naive failure table: longest proper prefix of p[0..k] that is also a suffix. */
const naivePi = (p: string) =>
  Array.from(p, (_, k) => {
    const s = p.slice(0, k + 1);
    for (let len = k; len > 0; len--) if (s.slice(0, len) === s.slice(k + 1 - len)) return len;
    return 0;
  });

const randomString = (rng: () => number, len: number, alphabet: string) =>
  Array.from({ length: len }, () => alphabet[randInt(rng, 0, alphabet.length - 1)]).join('');

const RANDOM = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const alphabet = rng() < 0.5 ? 'AB' : 'ABC'; // small alphabets give many partial matches and fallbacks
  return { text: randomString(rng, randInt(rng, 1, 30), alphabet), pattern: randomString(rng, randInt(rng, 1, 6), alphabet) };
});

const CASES = [
  { text: DEFAULT_TEXT, pattern: DEFAULT_PATTERN },
  { text: 'ABC ABCDAB ABCDABCDABDE', pattern: 'ABCDABD' }, // BOJ 1786 sample
  { text: 'AAAAAA', pattern: 'AA' },
  { text: 'AB', pattern: 'ABC' },
  { text: 'ABC', pattern: 'X' },
  ...RANDOM,
];

describe('KMP', () => {
  it('default example: failure table and match position', () => {
    const last = generateKMPSteps(DEFAULT_TEXT, DEFAULT_PATTERN, 'en').at(-1)!;
    expect(last.pi).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4]);
    expect(last.found).toEqual([10]);
  });

  it('reproduces the BOJ 1786 sample (1 match at position 16)', () => {
    const last = generateKMPSteps('ABC ABCDAB ABCDABCDABDE', 'ABCDABD', 'en').at(-1)!;
    expect(last.found.length).toBe(1);
    expect(last.found.map(x => x + 1)).toEqual([16]);
  });

  it('matches the naive search and naive pi on edge cases and 20 seeded random inputs', () => {
    for (const { text, pattern } of CASES) {
      const steps = generateKMPSteps(text, pattern, 'en');
      const last = steps.at(-1)!;
      expect(last.found).toEqual(naiveFind(text, pattern));
      expect(last.pi).toEqual(naivePi(pattern));
      expect(steps.filter(s => s.type === 'FOUND').map(s => s.hit)).toEqual(naiveFind(text, pattern));
    }
  });

  it('runs in linear time: comparisons ≤ 2(n + m)', () => {
    for (const { text, pattern } of CASES) {
      const cmps = generateKMPSteps(text, pattern, 'en').filter(s => s.cmp !== null || s.type === 'PI_SET').length;
      expect(cmps).toBeLessThanOrEqual(2 * (text.length + pattern.length));
    }
  });

  it('every comparison step shows the right characters and alignment', () => {
    for (const { text, pattern } of CASES) {
      for (const s of generateKMPSteps(text, pattern, 'en')) {
        if (!s.cmp) continue;
        const scanned = s.phase === 'pi' ? pattern : text;
        expect(s.shift + s.cmp.j).toBe(s.i);
        expect(s.cmp.ok).toBe(scanned[s.i] === pattern[s.cmp.j]);
        // the matched prefix really matches at this shift
        expect(scanned.slice(s.shift, s.shift + s.matched)).toBe(pattern.slice(0, s.matched));
      }
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateKMPSteps(DEFAULT_TEXT, DEFAULT_PATTERN, 'ko'), ['DONE']);
    for (const { text, pattern } of CASES) expectStepInvariants(generateKMPSteps(text, pattern, 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { text, pattern } of CASES) {
      expectLangIndependent(generateKMPSteps(text, pattern, 'ko'), generateKMPSteps(text, pattern, 'en'));
    }
  });
});

import { describe, it, expect } from 'vitest';
import { generateTrieSteps, trieLookup } from './solver';
import { DEFAULT_QUERY, DEFAULT_WORDS, type TrieMode } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

const prefixesOf = (words: string[]) => new Set(words.flatMap(w => Array.from({ length: w.length + 1 }, (_, k) => w.slice(0, k))));
const refLookup = (words: string[], q: string, mode: TrieMode) =>
  mode === 'search' ? words.includes(q) : words.some(w => w.startsWith(q));

const randomWord = (rng: () => number, maxLen: number) =>
  Array.from({ length: randInt(rng, 1, maxLen) }, () => 'abc'[randInt(rng, 0, 2)]).join('');

const RANDOM = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const words = Array.from({ length: randInt(rng, 1, 8) }, () => randomWord(rng, 5));
  // half the queries are prefixes of stored words, so FOUND is exercised too
  const query = rng() < 0.5 ? words[randInt(rng, 0, words.length - 1)].slice(0, randInt(rng, 1, 5)) || 'a' : randomWord(rng, 5);
  return { words, query };
});

const CASES = [
  { words: DEFAULT_WORDS, query: DEFAULT_QUERY },
  { words: DEFAULT_WORDS, query: 'algo' },
  { words: DEFAULT_WORDS, query: 'tri' },
  { words: DEFAULT_WORDS, query: 'xyz' },
  { words: DEFAULT_WORDS, query: 'trees' },
  { words: ['a', 'a', 'ab'], query: 'a' },
  ...RANDOM,
];

describe('Trie', () => {
  it('default example: "al" is a prefix but not a stored word', () => {
    expect(trieLookup(DEFAULT_WORDS, DEFAULT_QUERY, 'search')).toBe(false);
    expect(trieLookup(DEFAULT_WORDS, DEFAULT_QUERY, 'prefix')).toBe(true);
    const last = generateTrieSteps(DEFAULT_WORDS, DEFAULT_QUERY, 'search', 'en').at(-1)!;
    // root + t,tr,tre,tree,tri,trie + a,al,alg,algo,as,ass,asso,assoc,all,als,also
    expect(last.nodes.length).toBe(18);
  });

  it('reproduces the BOJ 14425 sample (4 words in the set)', () => {
    const S = ['baekjoononlinejudge', 'startlink', 'codeplus', 'sundaycoding', 'codingsh'];
    const Q = ['baekjoon', 'codeplus', 'codeminus', 'startlink', 'starlink', 'sundaycoding', 'codingsh', 'codinghs', 'sondaycoding', 'startrink', 'icerink'];
    expect(Q.filter(q => trieLookup(S, q, 'search')).length).toBe(4);
  });

  it('reproduces the BOJ 14426 sample (7 prefixes)', () => {
    const S = ['baekjoononlinejudge', 'startlink', 'codeplus', 'sundaycoding', 'codingsh'];
    const Q = ['baekjoon', 'star', 'start', 'code', 'sunday', 'coding', 'cod', 'online', 'judge', 'plus'];
    expect(Q.filter(q => trieLookup(S, q, 'prefix')).length).toBe(7);
  });

  it('matches a naive lookup on edge cases and 20 seeded random inputs, both modes', () => {
    for (const { words, query } of CASES) {
      for (const mode of ['search', 'prefix'] as TrieMode[]) {
        const steps = generateTrieSteps(words, query, mode, 'en');
        const last = steps.at(-1)!;
        expect(last.result).toBe(refLookup(words, query, mode));
        // node set = every distinct prefix; end nodes = the distinct words
        expect(new Set(last.nodes.map(n => n.id))).toEqual(prefixesOf(words));
        expect(new Set(last.nodes.filter(n => n.end).map(n => n.id))).toEqual(new Set(words));
        expect(last.inserted).toEqual(words);
        // one CREATE per non-root node
        expect(steps.filter(s => s.type === 'CREATE').length).toBe(prefixesOf(words).size - 1);
      }
    }
  });

  it('every walk step stays on a node that exists and spells the word so far', () => {
    for (const { words, query } of CASES) {
      for (const s of generateTrieSteps(words, query, 'search', 'en')) {
        expect(s.nodes.some(n => n.id === s.node)).toBe(true);
        if (s.type === 'VISIT' || s.type === 'CREATE' || s.type === 'SEARCH_STEP') expect(s.node).toBe(s.word.slice(0, s.depth));
      }
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateTrieSteps(DEFAULT_WORDS, DEFAULT_QUERY, 'search', 'ko'), ['DONE']);
    for (const { words, query } of CASES) expectStepInvariants(generateTrieSteps(words, query, 'prefix', 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { words, query } of CASES) {
      for (const mode of ['search', 'prefix'] as TrieMode[]) {
        expectLangIndependent(generateTrieSteps(words, query, mode, 'ko'), generateTrieSteps(words, query, mode, 'en'));
      }
    }
  });
});

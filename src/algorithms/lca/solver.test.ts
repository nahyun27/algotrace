import { describe, it, expect } from 'vitest';
import { generateLCASteps } from './solver';
import { BOJ_SAMPLE_QUERIES, DEFAULT_TREE, PRESET_QUERIES, logOf, parseTree, type TreeInput } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

/** Naive LCA: collect u's ancestors, then walk up from v until one is hit. */
function refLCA(tree: TreeInput, u: number, v: number): number {
  const adj: number[][] = Array.from({ length: tree.n + 1 }, () => []);
  for (const [a, b] of tree.edges) { adj[a].push(b); adj[b].push(a); }
  const parent = Array(tree.n + 1).fill(0);
  const seen = new Set([1]);
  const queue = [1];
  while (queue.length) {
    const x = queue.shift()!;
    for (const y of adj[x]) if (!seen.has(y)) { seen.add(y); parent[y] = x; queue.push(y); }
  }
  const anc = new Set<number>();
  for (let x = u; x !== 0; x = parent[x]) anc.add(x);
  let y = v;
  while (!anc.has(y)) y = parent[y];
  return y;
}

function randomTree(seed: number): TreeInput {
  const rng = mulberry32(seed);
  const n = randInt(rng, 2, 16);
  // random labels so node 1 is not always a "nice" root shape
  const perm = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 1; i--) { const j = randInt(rng, 1, i); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const edges: [number, number][] = [];
  for (let i = 1; i < n; i++) edges.push([perm[randInt(rng, 0, i - 1)], perm[i]]);
  return { n, edges };
}

const lcaOf = (tree: TreeInput, u: number, v: number, lang: 'ko' | 'en' = 'en') =>
  generateLCASteps(tree, u, v, lang).at(-1)!.lca;

describe('LCA (binary lifting)', () => {
  it('BOJ 11437 sample: all six queries give 2, 4, 2, 1, 3, 1', () => {
    expect(BOJ_SAMPLE_QUERIES.map(([u, v]) => lcaOf(DEFAULT_TREE, u, v))).toEqual([2, 4, 2, 1, 3, 1]);
    for (const [u, v, ans] of BOJ_SAMPLE_QUERIES) expect(refLCA(DEFAULT_TREE, u, v)).toBe(ans);
  });

  it('preset queries: different depths and different subtrees', () => {
    const [depthQ, subtreeQ] = PRESET_QUERIES;
    expect(lcaOf(DEFAULT_TREE, depthQ.u, depthQ.v)).toBe(2);
    expect(lcaOf(DEFAULT_TREE, subtreeQ.u, subtreeQ.v)).toBe(1);
    const types = generateLCASteps(DEFAULT_TREE, subtreeQ.u, subtreeQ.v, 'en').map(s => s.type);
    expect(types).toContain('LIFT');
    expect(types).toContain('JUMP_BOTH');
    expect(types).toContain('SKIP_JUMP');
  });

  it('matches the naive LCA on every pair of 20 seeded random trees', () => {
    for (const seed of SEEDS) {
      const tree = randomTree(seed);
      for (let u = 1; u <= tree.n; u++) {
        for (let v = 1; v <= tree.n; v++) expect(lcaOf(tree, u, v)).toBe(refLCA(tree, u, v));
      }
    }
  });

  it('builds a correct up table and depth array', () => {
    for (const tree of [DEFAULT_TREE, ...SEEDS.map(randomTree)]) {
      const last = generateLCASteps(tree, 1, 1, 'en').at(-1)!;
      const LOG = logOf(tree.n);
      expect(last.up).toHaveLength(LOG);
      for (let x = 1; x <= tree.n; x++) {
        expect(last.depth[x]).not.toBeNull();
        // climbing 2^k one parent at a time gives up[k][x]
        for (let k = 0; k < LOG; k++) {
          let y = x;
          for (let i = 0; i < 1 << k; i++) y = last.up[0][y]!;
          expect(last.up[k][x]).toBe(y);
        }
      }
    }
  });

  it('step counts: N DFS visits, N(LOG-1) table fills, one LIFT per set bit', () => {
    const steps = generateLCASteps(DEFAULT_TREE, 15, 6, 'en');
    const count = (t: string) => steps.filter(s => s.type === t).length;
    expect(count('DFS_VISIT')).toBe(15);
    expect(count('TABLE_FILL')).toBe(15 * (logOf(15) - 1));
    expect(count('LIFT')).toBe(1); // depth 4 vs 2: diff = 2 = 0b10
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateLCASteps(undefined, undefined, undefined, 'ko'), ['DONE']);
    for (const seed of SEEDS) {
      const tree = randomTree(seed);
      expectStepInvariants(generateLCASteps(tree, tree.n, 1, 'en'), ['DONE']);
    }
  });

  it('produces the same step structure in ko and en', () => {
    for (const [u, v] of BOJ_SAMPLE_QUERIES) {
      expectLangIndependent(generateLCASteps(DEFAULT_TREE, u, v, 'ko'), generateLCASteps(DEFAULT_TREE, u, v, 'en'));
    }
    for (const seed of SEEDS) {
      const tree = randomTree(seed);
      expectLangIndependent(generateLCASteps(tree, tree.n, 2, 'ko'), generateLCASteps(tree, tree.n, 2, 'en'));
    }
  });

  it('parses edge lists and rejects non-trees', () => {
    expect(parseTree('1 2, 1 3\n3 4')).toEqual({ n: 4, edges: [[1, 2], [1, 3], [3, 4]] });
    expect(parseTree('1-2, 2-3')).toEqual({ n: 3, edges: [[1, 2], [2, 3]] });
    expect(parseTree('1 2, 2 1')).toEqual({ error: 'notTree' });
    expect(parseTree('1 2, 3 9')).toEqual({ error: 'range' });
    expect(parseTree('1 2 3')).toEqual({ error: 'format' });
    expect(parseTree('')).toEqual({ error: 'size' });
  });
});

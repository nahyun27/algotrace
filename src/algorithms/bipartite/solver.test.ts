import { describe, it, expect } from 'vitest';
import { generateBipartiteSteps } from './solver';
import { BIPARTITE_NO_GRAPH, BIPARTITE_YES_GRAPH, graphToInput } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt, randomUndirectedEdges } from '../../test/utils';

type Edges = [number, number][];

/** Reference: a graph is bipartite iff it has no odd cycle; check with DFS parity on each component. */
function isBipartiteRef(n: number, edges: Edges): boolean {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const side = Array(n).fill(-1);
  for (let s = 0; s < n; s++) {
    if (side[s] !== -1) continue;
    side[s] = 0;
    const stack = [s];
    while (stack.length) {
      const u = stack.pop()!;
      for (const v of adj[u]) {
        if (side[v] === -1) { side[v] = side[u] ^ 1; stack.push(v); }
        else if (side[v] === side[u]) return false;
      }
    }
  }
  return true;
}

/** BOJ 1707 sample input, converted to 0-based nodes. Expected output: YES, NO. */
const BOJ_SAMPLE: { n: number; edges: Edges; answer: boolean }[] = [
  { n: 3, edges: [[0, 2], [1, 2]], answer: true },
  { n: 4, edges: [[0, 1], [1, 2], [2, 3], [3, 1]], answer: false },
];

const YES = graphToInput(BIPARTITE_YES_GRAPH);
const NO = graphToInput(BIPARTITE_NO_GRAPH);

const RANDOM: { n: number; edges: Edges }[] = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const n = randInt(rng, 1, 9);
  return { n, edges: randomUndirectedEdges(rng, n, randInt(rng, 1, 4) / 10).map(([u, v]) => [u, v] as [number, number]) };
});

const CASES = [YES, NO, ...BOJ_SAMPLE, { n: 1, edges: [] as Edges }, { n: 0, edges: [] as Edges }, ...RANDOM];

describe('Bipartite check', () => {
  it('reproduces the BOJ 1707 sample (YES, NO)', () => {
    for (const { n, edges, answer } of BOJ_SAMPLE) {
      expect(generateBipartiteSteps(n, edges, 'en').at(-1)!.isBipartite).toBe(answer);
    }
  });

  it('default examples: bipartite (2 components) and not bipartite (odd cycle)', () => {
    const yes = generateBipartiteSteps(YES.n, YES.edges, 'en');
    expect(yes.at(-1)!.isBipartite).toBe(true);
    expect(yes.filter(s => s.type === 'START')).toHaveLength(2);
    expect(yes.at(-1)!.color).toEqual([0, 1, 0, 1, 0, 1, 0, 1]);

    const no = generateBipartiteSteps(NO.n, NO.edges, 'en');
    expect(no.at(-1)!.isBipartite).toBe(false);
    expect(no.at(-1)!.conflictEdge).toEqual([3, 4]);
  });

  it('answer matches the reference on edge cases and 20 seeded random graphs', () => {
    for (const { n, edges } of CASES) {
      const steps = generateBipartiteSteps(n, edges, 'en');
      const last = steps.at(-1)!;
      const ref = isBipartiteRef(n, edges);
      expect(last.isBipartite).toBe(ref);
      expect(steps.some(s => s.type === 'CONFLICT')).toBe(!ref);
      if (ref) {
        // a valid 2-coloring of every node
        expect(last.color.every(c => c === 0 || c === 1)).toBe(true);
        for (const [u, v] of edges) expect(last.color[u]).not.toBe(last.color[v]);
      } else {
        const [u, v] = last.conflictEdge!;
        expect(last.color[u]).toBe(last.color[v]);
        expect(last.color[u]).not.toBe(-1);
      }
    }
  });

  it('a self-loop makes the graph non-bipartite', () => {
    expect(generateBipartiteSteps(2, [[0, 1], [1, 1]], 'en').at(-1)!.isBipartite).toBe(false);
  });

  it('COLOR always assigns the opposite color; CHECK only on consistent edges', () => {
    for (const { n, edges } of CASES) {
      for (const s of generateBipartiteSteps(n, edges, 'en')) {
        if (s.type === 'COLOR' || s.type === 'CHECK') {
          const [u, v] = s.activeEdge!;
          expect(s.color[v]).toBe(1 - s.color[u]);
        }
      }
    }
  });

  it('starts one BFS per connected component when bipartite', () => {
    for (const { n, edges } of CASES) {
      const steps = generateBipartiteSteps(n, edges, 'en');
      if (!steps.at(-1)!.isBipartite) continue;
      const parent = Array.from({ length: n }, (_, i) => i);
      const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
      for (const [u, v] of edges) parent[find(u)] = find(v);
      const comps = new Set(Array.from({ length: n }, (_, i) => find(i))).size;
      expect(steps.filter(s => s.type === 'START')).toHaveLength(comps);
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateBipartiteSteps(YES.n, YES.edges, 'ko'), ['DONE']);
    for (const { n, edges } of CASES) expectStepInvariants(generateBipartiteSteps(n, edges, 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { n, edges } of CASES) {
      expectLangIndependent(generateBipartiteSteps(n, edges, 'ko'), generateBipartiteSteps(n, edges, 'en'));
    }
  });
});

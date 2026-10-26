import { describe, it, expect } from 'vitest';
import { generateBFSSteps } from './solverBFS';
import { generateDFSSteps } from './solverDFS';
import { BFS_DFS_DEFAULT_GRAPH } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt, randomUndirectedEdges } from '../../test/utils';

type Edges = [number, number, number][];

const DEFAULT_N = BFS_DFS_DEFAULT_GRAPH.nodes.length;
const DEFAULT_EDGES: Edges = BFS_DFS_DEFAULT_GRAPH.edges.map(e => [e.from, e.to, e.weight]);

/** Undirected adjacency with ascending neighbour order (same order the solvers use). */
function adjacency(n: number, edges: Edges): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  for (const a of adj) a.sort((x, y) => x - y);
  return adj;
}

function bfsRef(n: number, edges: Edges): number[] {
  const adj = adjacency(n, edges);
  const seen = new Set([0]);
  const order: number[] = [];
  const q = [0];
  while (q.length) {
    const u = q.shift()!;
    order.push(u);
    for (const v of adj[u]) if (!seen.has(v)) { seen.add(v); q.push(v); }
  }
  return order;
}

/** Recursive pre-order DFS, smallest neighbour first. */
function dfsRef(n: number, edges: Edges): number[] {
  const adj = adjacency(n, edges);
  const seen = new Set<number>();
  const order: number[] = [];
  const go = (u: number) => {
    seen.add(u);
    order.push(u);
    for (const v of adj[u]) if (!seen.has(v)) go(v);
  };
  go(0);
  return order;
}

const RANDOM_GRAPHS: { n: number; edges: Edges }[] = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const n = randInt(rng, 2, 9);
  return { n, edges: randomUndirectedEdges(rng, n, 0.35) };
});

const CASES = [
  { n: DEFAULT_N, edges: DEFAULT_EDGES },
  { n: 5, edges: [[0, 1, 1], [1, 2, 1], [2, 0, 1], [3, 4, 1]] as Edges }, // cycle + separate component
  { n: 1, edges: [] as Edges },
  ...RANDOM_GRAPHS,
];

describe('BFS', () => {
  it('default graph visits level by level', () => {
    const last = generateBFSSteps(undefined, undefined, 'en').at(-1)!;
    expect(last.visitedNodes).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('visit order matches reference BFS (default, edge cases, 20 seeded graphs)', () => {
    for (const { n, edges } of CASES) {
      const last = generateBFSSteps(edges, n, 'en').at(-1)!;
      expect(last.visitedNodes).toEqual(bfsRef(n, edges));
      expect(last.queue).toEqual([]);
      expect(last.treeEdges.length).toBe(Math.max(0, last.visitedNodes.length - 1));
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateBFSSteps(undefined, undefined, 'ko'), ['DONE']);
    for (const { n, edges } of CASES) expectStepInvariants(generateBFSSteps(edges, n, 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { n, edges } of CASES) expectLangIndependent(generateBFSSteps(edges, n, 'ko'), generateBFSSteps(edges, n, 'en'));
  });
});

describe('DFS', () => {
  it('default graph visits depth-first, smallest neighbour first', () => {
    const last = generateDFSSteps(undefined, undefined, 'en').at(-1)!;
    expect(last.visitedNodes).toEqual([0, 1, 3, 4, 2, 5, 6]);
  });

  it('visit order matches reference recursive DFS (default, edge cases, 20 seeded graphs)', () => {
    for (const { n, edges } of CASES) {
      const last = generateDFSSteps(edges, n, 'en').at(-1)!;
      expect(last.visitedNodes).toEqual(dfsRef(n, edges));
      expect(last.stack).toEqual([]);
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateDFSSteps(undefined, undefined, 'ko'), ['DONE']);
    for (const { n, edges } of CASES) expectStepInvariants(generateDFSSteps(edges, n, 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { n, edges } of CASES) expectLangIndependent(generateDFSSteps(edges, n, 'ko'), generateDFSSteps(edges, n, 'en'));
  });
});

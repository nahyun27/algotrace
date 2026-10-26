import { describe, it, expect } from 'vitest';
import { generatePrimSteps } from './solver';
import { generateKruskalSteps } from '../kruskal/solver';
import { PRIM_EDGES, PRIM_N, PRIM_NODES, type Edge, type KruskalNode } from './types';
import { SEEDS, bruteForceMstCost, expectLangIndependent, expectStepInvariants, isSpanningTree, mulberry32, randInt, randomConnectedUndirectedEdges } from '../../test/utils';

interface MstCase { nodes: KruskalNode[]; edges: Edge[]; N: number }

const DEFAULT: MstCase = { nodes: PRIM_NODES, edges: PRIM_EDGES, N: PRIM_N };
const RANDOM: MstCase[] = SEEDS.map(seed => {
  const rng = mulberry32(seed + 1);
  const n = randInt(rng, 2, 7);
  return {
    N: n,
    nodes: Array.from({ length: n }, (_, i) => ({ id: i, x: 0, y: 0 })),
    edges: randomConnectedUndirectedEdges(rng, n, 0.5, 1, 6).map(([u, v, weight]) => ({ u, v, weight })),
  };
});
const CASES = [DEFAULT, ...RANDOM];

describe('Prim', () => {
  it('default arguments: total cost equals brute force', () => {
    const last = generatePrimSteps(undefined, undefined, undefined, 'en').at(-1)!;
    expect(last.totalCost).toBe(bruteForceMstCost(PRIM_N, PRIM_EDGES));
  });

  it('20 seeded connected graphs (many equal weights): Prim == Kruskal == brute force', () => {
    for (const c of RANDOM) {
      const last = generatePrimSteps(c.nodes, c.edges, c.N, 'en').at(-1)!;
      const kruskal = generateKruskalSteps(c.nodes, c.edges, c.N, 'en').at(-1)!;
      const expected = bruteForceMstCost(c.N, c.edges);
      expect(last.totalCost).toBe(expected);
      expect(kruskal.totalCost).toBe(expected);
    }
  });

  it('final MST edges form a spanning tree whose weights sum to totalCost', () => {
    for (const c of CASES) {
      const last = generatePrimSteps(c.nodes, c.edges, c.N, 'en').at(-1)!;
      expect(isSpanningTree(c.N, last.mstEdges)).toBe(true);
      expect(last.mstEdges.reduce((s, e) => s + e.weight, 0)).toBe(last.totalCost);
      expect(last.visited.every(Boolean)).toBe(true);
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generatePrimSteps(undefined, undefined, undefined, 'ko'), ['DONE']);
    for (const c of CASES) expectStepInvariants(generatePrimSteps(c.nodes, c.edges, c.N, 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const c of CASES) {
      expectLangIndependent(generatePrimSteps(c.nodes, c.edges, c.N, 'ko'), generatePrimSteps(c.nodes, c.edges, c.N, 'en'));
    }
  });
});

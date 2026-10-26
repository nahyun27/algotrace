import { describe, it, expect } from 'vitest';
import { generateKruskalSteps } from './solver';
import { generatePrimSteps } from '../prim/solver';
import { KRUSKAL_EDGES, KRUSKAL_N, KRUSKAL_NODES, type Edge, type KruskalNode } from './types';
import { SEEDS, bruteForceMstCost, expectLangIndependent, expectStepInvariants, isSpanningTree, mulberry32, randInt, randomConnectedUndirectedEdges } from '../../test/utils';

interface MstCase { nodes: KruskalNode[]; edges: Edge[]; N: number }

const toCase = (n: number, raw: [number, number, number][]): MstCase => ({
  N: n,
  nodes: Array.from({ length: n }, (_, i) => ({ id: i, x: 0, y: 0 })),
  edges: raw.map(([u, v, weight]) => ({ u, v, weight })),
});

const DEFAULT: MstCase = { nodes: KRUSKAL_NODES, edges: KRUSKAL_EDGES, N: KRUSKAL_N };
const RANDOM: MstCase[] = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const n = randInt(rng, 2, 7);
  return toCase(n, randomConnectedUndirectedEdges(rng, n, 0.4, 1, 9));
});
const CASES = [DEFAULT, ...RANDOM];

describe('Kruskal', () => {
  it('default graph: total cost equals brute force (11) and equals Prim', () => {
    const last = generateKruskalSteps(DEFAULT.nodes, DEFAULT.edges, DEFAULT.N, 'en').at(-1)!;
    const prim = generatePrimSteps(DEFAULT.nodes, DEFAULT.edges, DEFAULT.N, 'en').at(-1)!;
    expect(bruteForceMstCost(DEFAULT.N, DEFAULT.edges)).toBe(11);
    expect(last.totalCost).toBe(11);
    expect(prim.totalCost).toBe(11);
  });

  it('20 seeded connected graphs: Kruskal == Prim == brute force, result is a spanning tree', () => {
    for (const c of RANDOM) {
      const last = generateKruskalSteps(c.nodes, c.edges, c.N, 'en').at(-1)!;
      const prim = generatePrimSteps(c.nodes, c.edges, c.N, 'en').at(-1)!;
      const expected = bruteForceMstCost(c.N, c.edges);
      expect(last.totalCost).toBe(expected);
      expect(prim.totalCost).toBe(expected);
      expect(isSpanningTree(c.N, last.mstEdges)).toBe(true);
      expect(last.mstEdges.reduce((s, e) => s + e.weight, 0)).toBe(last.totalCost);
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    for (const c of CASES) expectStepInvariants(generateKruskalSteps(c.nodes, c.edges, c.N, 'ko'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const c of CASES) {
      expectLangIndependent(generateKruskalSteps(c.nodes, c.edges, c.N, 'ko'), generateKruskalSteps(c.nodes, c.edges, c.N, 'en'));
    }
  });
});

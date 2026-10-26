import { describe, it, expect } from 'vitest';
import { generateDijkstraSteps } from './solver';
import { EDGES, INF, N } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, floydWarshallRef, mulberry32, randInt, randomDirectedEdges } from '../../test/utils';

type Edges = [number, number, number][];

/** Reference distances from node 0, with the solver's INF sentinel for unreachable nodes. */
const refDist = (n: number, edges: Edges) => floydWarshallRef(n, edges)[0].map(d => (d === Infinity ? INF : d));

const RANDOM: { n: number; edges: Edges }[] = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const n = randInt(rng, 2, 9);
  return { n, edges: randomDirectedEdges(rng, n, 0.3, 0, 20) };
});

const CASES = [
  { n: N, edges: EDGES },
  { n: 4, edges: [[0, 1, 2], [2, 3, 1]] as Edges }, // nodes 2, 3 unreachable
  { n: 1, edges: [] as Edges },
  ...RANDOM,
];

describe('Dijkstra', () => {
  it('default graph: final distances equal the reference', () => {
    const last = generateDijkstraSteps(undefined, undefined, 'en').at(-1)!;
    expect(last.dist).toEqual(refDist(N, EDGES));
    expect(last.dist).toEqual([0, 7, 3, 6, 5]);
  });

  it('matches reference on edge cases and 20 seeded random graphs (non-negative weights)', () => {
    for (const { n, edges } of CASES) {
      const last = generateDijkstraSteps(edges, n, 'en').at(-1)!;
      expect(last.dist).toEqual(refDist(n, edges));
      // every reachable node is settled
      expect(last.visited).toEqual(refDist(n, edges).map(d => d < INF));
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateDijkstraSteps(undefined, undefined, 'ko'), ['DONE']);
    for (const { n, edges } of CASES) expectStepInvariants(generateDijkstraSteps(edges, n, 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { n, edges } of CASES) {
      expectLangIndependent(generateDijkstraSteps(edges, n, 'ko'), generateDijkstraSteps(edges, n, 'en'));
    }
  });
});

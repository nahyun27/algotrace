import { describe, it, expect } from 'vitest';
import { generateBellmanFordSteps } from './solver';
import { EXAMPLE1_EDGES, EXAMPLE1_N, EXAMPLE2_EDGES, EXAMPLE2_N, INF } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, floydWarshallRef, mulberry32, randInt, randomDirectedEdges } from '../../test/utils';

type Edges = [number, number, number][];

/** Reference via Floyd-Warshall: is a negative cycle reachable from 0, and the distances from 0. */
function reference(n: number, edges: Edges) {
  const d = floydWarshallRef(n, edges);
  const negCycle = d.some((row, c) => row[c] < 0 && d[0][c] < Infinity);
  return { negCycle, dist: d[0].map(x => (x === Infinity ? INF : x)) };
}

const RANDOM: { n: number; edges: Edges }[] = SEEDS.map(seed => {
  const rng = mulberry32(seed);
  const n = randInt(rng, 2, 8);
  return { n, edges: randomDirectedEdges(rng, n, 0.3, -4, 12) };
});

const CASES = [
  { n: EXAMPLE1_N, edges: EXAMPLE1_EDGES },
  { n: EXAMPLE2_N, edges: EXAMPLE2_EDGES },
  { n: 4, edges: [[0, 1, 3], [2, 3, -5], [3, 2, -5]] as Edges }, // unreachable negative cycle
  ...RANDOM,
];

describe('Bellman-Ford', () => {
  it('example 1 (negative edges): final distances equal the reference', () => {
    const last = generateBellmanFordSteps(undefined, undefined, 'en').at(-1)!;
    expect(last.type).toBe('DONE');
    expect(last.dist).toEqual(reference(EXAMPLE1_N, EXAMPLE1_EDGES).dist);
  });

  it('example 2 reports a negative cycle', () => {
    const last = generateBellmanFordSteps(EXAMPLE2_EDGES, EXAMPLE2_N, 'en').at(-1)!;
    expect(reference(EXAMPLE2_N, EXAMPLE2_EDGES).negCycle).toBe(true);
    expect(last.type).toBe('NEGATIVE_CYCLE');
    expect(last.negativeCycleEdges.length).toBeGreaterThan(0);
  });

  it('matches the reference on all cases incl. 20 seeded random graphs with negative weights', () => {
    let sawCycle = false, sawDone = false;
    for (const { n, edges } of CASES) {
      const ref = reference(n, edges);
      const last = generateBellmanFordSteps(edges, n, 'en').at(-1)!;
      if (ref.negCycle) {
        sawCycle = true;
        expect(last.type).toBe('NEGATIVE_CYCLE');
      } else {
        sawDone = true;
        expect(last.type).toBe('DONE');
        expect(last.dist).toEqual(ref.dist);
      }
    }
    expect(sawCycle && sawDone).toBe(true);
  });

  it('satisfies step invariants and ends with DONE or NEGATIVE_CYCLE', () => {
    expectStepInvariants(generateBellmanFordSteps(undefined, undefined, 'ko'), ['DONE', 'NEGATIVE_CYCLE']);
    for (const { n, edges } of CASES) {
      expectStepInvariants(generateBellmanFordSteps(edges, n, 'en'), ['DONE', 'NEGATIVE_CYCLE']);
    }
  });

  it('produces the same step structure in ko and en', () => {
    for (const { n, edges } of CASES) {
      expectLangIndependent(generateBellmanFordSteps(edges, n, 'ko'), generateBellmanFordSteps(edges, n, 'en'));
    }
  });
});

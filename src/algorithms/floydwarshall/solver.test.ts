import { describe, it, expect } from 'vitest';
import { generateFloydWarshallSteps, reconstructPath } from './solver';
import { FW_EDGES, FW_N, INF } from './types';
import { expectLangIndependent, expectStepInvariants } from '../../test/utils';

// The solver only runs on the built-in example (it takes no graph input),
// so correctness is checked against an independent Bellman-Ford from every source.

function bellmanFordRef(n: number, edges: [number, number, number][], src: number): number[] {
  const d = Array(n).fill(Infinity);
  d[src] = 0;
  for (let i = 0; i < n - 1; i++) {
    for (const [u, v, w] of edges) if (d[u] + w < d[v]) d[v] = d[u] + w;
  }
  return d.map(x => (x === Infinity ? INF : x));
}

describe('Floyd-Warshall', () => {
  const steps = generateFloydWarshallSteps('en');
  const last = steps.at(-1)!;

  it('final matrix equals all-sources Bellman-Ford reference', () => {
    expect(last.type).toBe('DONE');
    const expected = Array.from({ length: FW_N }, (_, s) => bellmanFordRef(FW_N, FW_EDGES, s));
    expect(last.distMatrix).toEqual(expected);
  });

  it('reconstructed paths have length equal to the distance', () => {
    const w = new Map(FW_EDGES.map(([u, v, wt]) => [`${u}-${v}`, wt]));
    for (let i = 0; i < FW_N; i++) {
      for (let j = 0; j < FW_N; j++) {
        if (i === j || last.distMatrix[i][j] >= INF) continue;
        const path = reconstructPath(last.nextMatrix, i, j);
        expect(path[0]).toBe(i);
        expect(path.at(-1)).toBe(j);
        let cost = 0;
        for (let k = 1; k < path.length; k++) cost += w.get(`${path[k - 1]}-${path[k]}`)!;
        expect(cost).toBe(last.distMatrix[i][j]);
      }
    }
  });

  it('distance matrix entries never increase across steps', () => {
    for (let s = 1; s < steps.length; s++) {
      for (let i = 0; i < FW_N; i++) {
        for (let j = 0; j < FW_N; j++) {
          expect(steps[s].distMatrix[i][j]).toBeLessThanOrEqual(steps[s - 1].distMatrix[i][j]);
        }
      }
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateFloydWarshallSteps('ko'), ['DONE']);
    expectStepInvariants(steps, ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    expectLangIndependent(generateFloydWarshallSteps('ko'), steps);
  });
});

describe('Floyd-Warshall negative cycles', () => {
  it('reports a negative cycle reachable through the diagonal', () => {
    // 0 → 1 → 2 → 0 sums to -1
    const steps = generateFloydWarshallSteps('en', { n: 3, edges: [[0, 1, 1], [1, 2, -3], [2, 0, 1]] });
    expect(steps.at(-1)!.type).toBe('NEGATIVE_CYCLE');
  });

  it('does not report a cycle when all cycles are non-negative', () => {
    const steps = generateFloydWarshallSteps('en', { n: 3, edges: [[0, 1, 1], [1, 2, -1], [2, 0, 1]] });
    expect(steps.at(-1)!.type).toBe('DONE');
  });
});

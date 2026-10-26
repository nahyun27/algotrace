import { describe, it, expect } from 'vitest';
import { generateTSPStepsTopDown } from './solverTopDown';
import { generateTSPStepsBottomUp } from './solverBottomUp';
import { CITIES, INF, W as DEFAULT_W, type TSPStep } from './shared';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

/** Brute force over all permutations of cities 1..N-1 (weight 0 off the diagonal = no edge). */
function bruteForceTsp(W: number[][], N: number): number {
  let best = Infinity;
  const rest = Array.from({ length: N - 1 }, (_, i) => i + 1);
  const permute = (arr: number[], k: number) => {
    if (k === arr.length) {
      const tour = [0, ...arr, 0];
      let cost = 0;
      for (let i = 0; i + 1 < tour.length; i++) {
        const w = W[tour[i]][tour[i + 1]];
        if (w === 0) return;
        cost += w;
      }
      best = Math.min(best, cost);
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  permute(rest, 0);
  return best;
}

function randomMatrix(seed: number): { W: number[][]; N: number } {
  const rng = mulberry32(seed);
  const N = randInt(rng, 3, 6);
  const W = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 0 : randInt(rng, 1, 30))));
  return { W, N };
}

const topDownCost = (steps: TSPStep[]) => steps.at(-1)!.dpTable[1][0];

function bottomUpCost(steps: TSPStep[], W: number[][], N: number): number {
  const last = steps.at(-1)!;
  if (!last.activeEdge) return INF;
  const [lastCity] = last.activeEdge;
  return last.dpTable[(1 << N) - 1][lastCity] + W[lastCity][0];
}

const SPARSE: { W: number[][]; N: number } = {
  // missing edges (0) — the only tour is 0→1→2→3→0 (cost 19)
  N: 4,
  W: [
    [0, 4, 0, 0],
    [0, 0, 6, 0],
    [0, 0, 0, 2],
    [7, 0, 0, 0],
  ],
};
const INFEASIBLE: { W: number[][]; N: number } = {
  N: 3,
  W: [
    [0, 5, 5],
    [0, 0, 3],
    [0, 3, 0], // nobody can return to city 0
  ],
};

const RANDOM = SEEDS.map(randomMatrix);
const ALL = [{ W: DEFAULT_W, N: CITIES }, SPARSE, ...RANDOM];

describe('TSP top-down (memoized DFS)', () => {
  it('default matrix: optimal tour cost equals brute force (35)', () => {
    const steps = generateTSPStepsTopDown(undefined, undefined, 'en');
    expect(bruteForceTsp(DEFAULT_W, CITIES)).toBe(35);
    expect(topDownCost(steps)).toBe(35);
  });

  it('matches brute force on sparse and 20 seeded random matrices', () => {
    for (const { W, N } of ALL) {
      expect(topDownCost(generateTSPStepsTopDown(W, N, 'en'))).toBe(bruteForceTsp(W, N));
    }
  });

  it('reports INF when no tour exists', () => {
    const { W, N } = INFEASIBLE;
    expect(bruteForceTsp(W, N)).toBe(Infinity);
    expect(topDownCost(generateTSPStepsTopDown(W, N, 'en'))).toBe(INF);
  });

  it('satisfies step invariants and ends with DONE', () => {
    for (const { W, N } of [...ALL, INFEASIBLE]) expectStepInvariants(generateTSPStepsTopDown(W, N, 'ko'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { W, N } of [...ALL, INFEASIBLE]) {
      expectLangIndependent(generateTSPStepsTopDown(W, N, 'ko'), generateTSPStepsTopDown(W, N, 'en'));
    }
  });
});

describe('TSP bottom-up (tabulation)', () => {
  it('default matrix: optimal tour cost equals brute force (35)', () => {
    const steps = generateTSPStepsBottomUp(undefined, undefined, 'en');
    expect(bottomUpCost(steps, DEFAULT_W, CITIES)).toBe(35);
    expect(steps.at(-1)!.description).toContain('35');
  });

  it('matches brute force on sparse and 20 seeded random matrices', () => {
    for (const { W, N } of ALL) {
      const steps = generateTSPStepsBottomUp(W, N, 'en');
      const expected = bruteForceTsp(W, N);
      expect(bottomUpCost(steps, W, N)).toBe(expected);
      expect(steps.at(-1)!.description).toContain(String(expected));
    }
  });

  it('agrees with top-down on every case', () => {
    for (const { W, N } of ALL) {
      expect(bottomUpCost(generateTSPStepsBottomUp(W, N, 'en'), W, N))
        .toBe(topDownCost(generateTSPStepsTopDown(W, N, 'en')));
    }
  });

  it('reports unreachable when no tour exists', () => {
    const { W, N } = INFEASIBLE;
    const last = generateTSPStepsBottomUp(W, N, 'en').at(-1)!;
    expect(last.activeEdge).toBeNull();
    expect(last.description).toContain('unreachable');
  });

  it('satisfies step invariants and ends with DONE', () => {
    for (const { W, N } of [...ALL, INFEASIBLE]) expectStepInvariants(generateTSPStepsBottomUp(W, N, 'ko'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const { W, N } of [...ALL, INFEASIBLE]) {
      expectLangIndependent(generateTSPStepsBottomUp(W, N, 'ko'), generateTSPStepsBottomUp(W, N, 'en'));
    }
  });
});

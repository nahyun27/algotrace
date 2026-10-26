import { describe, it, expect } from 'vitest';
import { generateZeroOneBFSSteps } from './solver';
import { DEFAULT_GRID, INF, parseGrid } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

/** Reference: Bellman-Ford style relaxation until fixpoint (min walls to break, start excluded). */
function refMinWalls(grid: number[][]): number {
  const n = grid.length, m = grid[0].length;
  const d = Array.from({ length: n }, () => Array<number>(m).fill(Infinity));
  d[0][0] = 0;
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < n; r++)
      for (let c = 0; c < m; c++)
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const pr = r + dr, pc = c + dc;
          if (pr < 0 || pr >= n || pc < 0 || pc >= m) continue;
          if (d[pr][pc] + grid[r][c] < d[r][c]) { d[r][c] = d[pr][pc] + grid[r][c]; changed = true; }
        }
  }
  return d[n - 1][m - 1];
}

function randomGrid(seed: number): number[][] {
  const rng = mulberry32(seed);
  const n = randInt(rng, 1, 8), m = randInt(rng, 1, 8);
  const g = Array.from({ length: n }, () => Array.from({ length: m }, () => (rng() < 0.45 ? 1 : 0)));
  g[0][0] = 0;
  g[n - 1][m - 1] = 0;
  return g;
}

const CASES: number[][][] = [
  DEFAULT_GRID,
  [[0]],
  parseGrid(['0000', '0000']),
  parseGrid(['01', '10']),
  ...SEEDS.map(randomGrid),
];

describe('0-1 BFS (BOJ 1261)', () => {
  it('BOJ 1261 sample 1 → 3', () => {
    const last = generateZeroOneBFSSteps(DEFAULT_GRID, 'en').at(-1)!;
    expect(last.type).toBe('DONE');
    expect(last.answer).toBe(3);
  });

  it('matches the reference on edge cases and 20 seeded random grids', () => {
    for (const g of CASES) {
      const last = generateZeroOneBFSSteps(g, 'en').at(-1)!;
      expect(last.answer).toBe(refMinWalls(g));
    }
  });

  it('final path is a 4-connected walk from start to goal whose wall count equals the answer', () => {
    for (const g of CASES) {
      const last = generateZeroOneBFSSteps(g, 'en').at(-1)!;
      const { path } = last;
      expect(path[0]).toEqual({ r: 0, c: 0 });
      expect(path.at(-1)).toEqual({ r: g.length - 1, c: g[0].length - 1 });
      for (let i = 1; i < path.length; i++) {
        expect(Math.abs(path[i].r - path[i - 1].r) + Math.abs(path[i].c - path[i - 1].c)).toBe(1);
      }
      expect(path.slice(1).filter(p => g[p.r][p.c] === 1).length).toBe(last.answer);
    }
  });

  it('deque stays 0-1 sorted: front-to-back dists are non-decreasing and span at most 1', () => {
    for (const g of CASES) {
      const bad = generateZeroOneBFSSteps(g, 'en').filter(s => {
        const ds = s.deque.map(x => x.d);
        if (ds.some((d, i) => i > 0 && d < ds[i - 1])) return true;
        if (ds.length && ds.at(-1)! - ds[0] > 1) return true;
        const nb = s.neighbor;
        if (s.type === 'PUSH_FRONT') return !(nb && s.deque[0].r === nb.r && s.deque[0].c === nb.c && g[nb.r][nb.c] === 0);
        if (s.type === 'PUSH_BACK') return !(nb && s.deque.at(-1)!.r === nb.r && s.deque.at(-1)!.c === nb.c && g[nb.r][nb.c] === 1);
        return false;
      });
      expect(bad).toEqual([]);
    }
  });

  it('a settled cell never changes its dist afterwards', () => {
    for (const g of CASES) {
      const steps = generateZeroOneBFSSteps(g, 'en');
      const last = steps.at(-1)!;
      const ok = steps.every(s => s.done.every((row, r) => row.every((isDone, c) =>
        !isDone || (s.dist[r][c] < INF && last.dist[r][c] === s.dist[r][c]))));
      expect(ok).toBe(true);
    }
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateZeroOneBFSSteps(DEFAULT_GRID, 'ko'), ['DONE']);
    for (const g of CASES) expectStepInvariants(generateZeroOneBFSSteps(g, 'en'), ['DONE']);
  });

  it('produces the same step structure in ko and en', () => {
    for (const g of CASES) expectLangIndependent(generateZeroOneBFSSteps(g, 'ko'), generateZeroOneBFSSteps(g, 'en'));
  });
});

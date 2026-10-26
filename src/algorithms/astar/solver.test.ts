import { describe, it, expect } from 'vitest';
import { generateAStarSteps } from './solver';
import { generateGridAStarSteps, generateGridDijkstraSteps } from './solverGrid';
import { PRESETS, type GridMap, type GridPos } from './gridTypes';
import { ASTAR_DEFAULT_GRAPH } from '../../types/graph';
import { SEEDS, expectLangIndependent, expectStepInvariants, floydWarshallRef, mulberry32, randInt } from '../../test/utils';

/* ─────────────── Graph A* ─────────────── */

/** The default graph in the solver's own index space (nodes sorted by id). */
function defaultGraph() {
  const sorted = [...ASTAR_DEFAULT_GRAPH.nodes].sort((a, b) => a.id - b.id);
  const idMap = new Map(sorted.map((n, i) => [n.id, i]));
  const edges = ASTAR_DEFAULT_GRAPH.edges.map(e => [idMap.get(e.from)!, idMap.get(e.to)!, e.weight] as [number, number, number]);
  const positions = sorted.map((n, i) => ({ id: i, x: n.x, y: n.y }));
  return { N: sorted.length, edges, positions };
}

/**
 * Random graph whose weights never undercut the solver's heuristic
 * (euclidean / 30), so the heuristic is admissible and consistent and
 * A* must return the true shortest distance.
 */
function admissibleRandomGraph(seed: number) {
  const rng = mulberry32(seed);
  const N = randInt(rng, 3, 8);
  const positions = Array.from({ length: N }, (_, i) => ({ id: i, x: randInt(rng, 0, 600), y: randInt(rng, 0, 400) }));
  const edges: [number, number, number][] = [];
  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      if (u === v || rng() > 0.4) continue;
      const d = Math.hypot(positions[u].x - positions[v].x, positions[u].y - positions[v].y) / 30;
      edges.push([u, v, Math.ceil(d) + 1 + randInt(rng, 0, 5)]);
    }
  }
  return { N, edges, positions };
}

describe('A* (graph)', () => {
  // BUG: HEURISTIC_SCALE = 30 makes the default graph's heuristic inadmissible
  // (h(S) = 650/30 ≈ 21.7 while the true distance S→G is 12), so A* reaches G
  // through S→2→4→G with g = 14 instead of the optimal S→2→1→3→G = 12.
  it.fails('finds the optimal path cost on the default graph (inadmissible heuristic)', () => {
    const { N, edges } = defaultGraph();
    const steps = generateAStarSteps(undefined, undefined, undefined, 'en');
    const last = steps.at(-1)!;
    expect(last.type).toBe('DONE');
    expect(last.g[N - 1]).toBe(floydWarshallRef(N, edges)[0][N - 1]);
  });

  it('default graph: reaches the goal', () => {
    const { N } = defaultGraph();
    const last = generateAStarSteps(undefined, undefined, undefined, 'en').at(-1)!;
    expect(last.type).toBe('DONE');
    expect(last.currentProcessingNode).toBe(N - 1);
    expect(last.g[N - 1]).toBeLessThan(Infinity);
  });

  it('matches reference shortest distance on 20 admissible random graphs', () => {
    for (const seed of SEEDS) {
      const { N, edges, positions } = admissibleRandomGraph(seed);
      const expected = floydWarshallRef(N, edges)[0][N - 1];
      const last = generateAStarSteps(edges, N, positions, 'en').at(-1)!;
      expect(last.type).toBe('DONE');
      if (expected === Infinity) {
        expect(last.currentProcessingNode).toBeNull();
      } else {
        expect(last.currentProcessingNode).toBe(N - 1);
        expect(last.g[N - 1]).toBe(expected);
      }
    }
  });

  it('parent chain at DONE is a real path with cost g[goal]', () => {
    for (const seed of SEEDS) {
      const { N, edges, positions } = admissibleRandomGraph(seed);
      const last = generateAStarSteps(edges, N, positions, 'en').at(-1)!;
      if (last.currentProcessingNode === null) continue;
      let cost = 0;
      let cur = N - 1;
      let guard = 0;
      while (cur !== 0 && guard++ < N) {
        const p = last.parent[cur];
        const w = Math.min(...edges.filter(([u, v]) => u === p && v === cur).map(e => e[2]));
        cost += w;
        cur = p;
      }
      expect(cur).toBe(0);
      expect(cost).toBe(last.g[N - 1]);
    }
  });

  it('reports DONE with no current node when the goal is unreachable', () => {
    const positions = [0, 1, 2].map(i => ({ id: i, x: i * 100, y: 0 }));
    const last = generateAStarSteps([[0, 1, 5]], 3, positions, 'en').at(-1)!;
    expect(last.type).toBe('DONE');
    expect(last.currentProcessingNode).toBeNull();
    expect(last.g[2]).toBe(Infinity);
  });

  it('satisfies step invariants and ends with DONE', () => {
    expectStepInvariants(generateAStarSteps(undefined, undefined, undefined, 'ko'), ['DONE']);
    for (const seed of SEEDS) {
      const { N, edges, positions } = admissibleRandomGraph(seed);
      expectStepInvariants(generateAStarSteps(edges, N, positions, 'en'), ['DONE']);
    }
  });

  it('produces the same step structure in ko and en', () => {
    expectLangIndependent(
      generateAStarSteps(undefined, undefined, undefined, 'ko'),
      generateAStarSteps(undefined, undefined, undefined, 'en'),
    );
    for (const seed of SEEDS) {
      const { N, edges, positions } = admissibleRandomGraph(seed);
      expectLangIndependent(generateAStarSteps(edges, N, positions, 'ko'), generateAStarSteps(edges, N, positions, 'en'));
    }
  });
});

/* ─────────────── Grid A* / grid Dijkstra ─────────────── */

/** Reference BFS shortest path length on a 4-connected grid (-1 if unreachable). */
function bfsGrid(map: GridMap): number {
  const { rows, cols, walls, start, goal } = map;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));
  dist[start.r][start.c] = 0;
  const q: GridPos[] = [start];
  while (q.length) {
    const { r, c } = q.shift()!;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || walls[nr][nc] || dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      q.push({ r: nr, c: nc });
    }
  }
  return dist[goal.r][goal.c];
}

function seededMaze(seed: number): GridMap {
  const rng = mulberry32(seed);
  const rows = randInt(rng, 4, 10), cols = randInt(rng, 4, 10);
  const walls = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rng() < 0.3));
  const start = { r: 0, c: 0 }, goal = { r: rows - 1, c: cols - 1 };
  walls[0][0] = false;
  walls[rows - 1][cols - 1] = false;
  return { rows, cols, walls, start, goal };
}

/** Goal fully enclosed by walls. */
const BLOCKED: GridMap = {
  rows: 5, cols: 5,
  start: { r: 0, c: 0 },
  goal: { r: 2, c: 2 },
  walls: Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) =>
    (r === 1 && c >= 1 && c <= 3) || (r === 3 && c >= 1 && c <= 3) || (c === 1 && r === 2) || (c === 3 && r === 2))),
};

const GRID_MAPS: [string, GridMap][] = [
  ...Object.entries(PRESETS),
  ...SEEDS.map((s, i) => [`maze#${i}`, seededMaze(s)] as [string, GridMap]),
];

function expectValidPath(path: GridPos[], map: GridMap) {
  expect(path[0]).toEqual(map.start);
  expect(path.at(-1)).toEqual(map.goal);
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    expect(Math.abs(a.r - b.r) + Math.abs(a.c - b.c)).toBe(1);
    expect(map.walls[b.r][b.c]).toBe(false);
  }
}

describe.each([
  ['A* (grid)', generateGridAStarSteps],
  ['Dijkstra (grid)', generateGridDijkstraSteps],
])('%s', (_name, gen) => {
  it('path length equals BFS reference on presets and 20 seeded mazes', () => {
    for (const [, map] of GRID_MAPS) {
      const expected = bfsGrid(map);
      const last = gen(map, 'en').at(-1)!;
      if (expected === -1) {
        expect(last.type).toBe('NO_PATH');
        expect(last.path).toEqual([]);
      } else {
        expect(last.type).toBe('DONE');
        expect(last.path.length - 1).toBe(expected);
        expectValidPath(last.path, map);
      }
    }
  });

  it('reports NO_PATH when the goal is walled in', () => {
    expect(bfsGrid(BLOCKED)).toBe(-1);
    const last = gen(BLOCKED, 'en').at(-1)!;
    expect(last.type).toBe('NO_PATH');
    expect(last.path).toEqual([]);
  });

  it('satisfies step invariants and ends with DONE or NO_PATH', () => {
    for (const [, map] of [...GRID_MAPS, ['blocked', BLOCKED] as [string, GridMap]]) {
      expectStepInvariants(gen(map, 'ko'), ['DONE', 'NO_PATH']);
    }
  });

  it('produces the same step structure in ko and en', () => {
    for (const [, map] of [...GRID_MAPS, ['blocked', BLOCKED] as [string, GridMap]]) {
      expectLangIndependent(gen(map, 'ko'), gen(map, 'en'));
    }
  });
});

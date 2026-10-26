import { describe, it, expect } from 'vitest';
import { generateKahnSteps } from './solverKahn';
import { generateDFSTopoSteps } from './solverDFS';
import { TOPO_EXAMPLES, localizeNodes, type TopoNode, type TopoNodeDef } from './types';
import type { Lang } from '../../i18n';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

interface Case { nodes: TopoNodeDef[]; edges: [number, number][]; N: number }

function plainNodes(n: number): TopoNodeDef[] {
  return Array.from({ length: n }, (_, i) => ({ id: i, label: { ko: `노드${i}`, en: `Node${i}` }, x: 0, y: 0 }));
}

/** Random DAG: edges only go from a lower to a higher position in a shuffled order. */
function randomDag(seed: number): Case {
  const rng = mulberry32(seed);
  const N = randInt(rng, 2, 9);
  const perm = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) { const j = randInt(rng, 0, i); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const edges: [number, number][] = [];
  for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) if (rng() < 0.35) edges.push([perm[a], perm[b]]);
  return { nodes: plainNodes(N), edges, N };
}

/** Reference cycle check (DFS colouring). */
function hasCycleRef({ edges, N }: Case): boolean {
  const adj: number[][] = Array.from({ length: N }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  const color = Array(N).fill(0);
  const visit = (u: number): boolean => {
    color[u] = 1;
    for (const v of adj[u]) {
      if (color[v] === 1) return true;
      if (color[v] === 0 && visit(v)) return true;
    }
    color[u] = 2;
    return false;
  };
  for (let i = 0; i < N; i++) if (color[i] === 0 && visit(i)) return true;
  return false;
}

function expectValidTopoOrder(order: number[], { edges, N }: Case) {
  expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: N }, (_, i) => i));
  const pos = new Map(order.map((u, i) => [u, i]));
  for (const [u, v] of edges) expect(pos.get(u)!).toBeLessThan(pos.get(v)!);
}

const DAG = TOPO_EXAMPLES.dag;
const CYCLE = TOPO_EXAMPLES.cycle;
const RANDOM_DAGS = SEEDS.map(randomDag);
/** Random DAGs with one back edge appended → guaranteed cycle when it closes a path. */
const RANDOM_CYCLIC: Case[] = [
  { nodes: plainNodes(4), edges: [[0, 1], [1, 2], [2, 3], [3, 1]], N: 4 },  // cycle not containing node 0
  { nodes: plainNodes(3), edges: [[0, 0]], N: 3 },                          // self loop
  { nodes: plainNodes(5), edges: [[0, 1], [2, 3], [3, 4], [4, 2]], N: 5 }, // cycle in a second component
];

type Gen = (nodes: TopoNode[], edges: [number, number][], N: number, lang?: Lang) => { type: string; result: number[]; hasCycle: boolean; description: string; codeLine: number }[];

describe.each([
  ['Kahn', generateKahnSteps as Gen],
  ['DFS topological sort', generateDFSTopoSteps as Gen],
])('%s', (_name, gen) => {
  const run = (c: Case, lang: Lang = 'en') => gen(localizeNodes(c.nodes, lang), c.edges, c.N, lang);

  it('default DAG yields an order respecting every edge', () => {
    const last = run(DAG).at(-1)!;
    expect(last.type).toBe('DONE');
    expect(last.hasCycle).toBe(false);
    expectValidTopoOrder(last.result, DAG);
  });

  it('20 seeded random DAGs yield valid orders', () => {
    for (const c of RANDOM_DAGS) {
      expect(hasCycleRef(c)).toBe(false);
      const last = run(c).at(-1)!;
      expect(last.type).toBe('DONE');
      expectValidTopoOrder(last.result, c);
    }
  });

  it('cycle example reports a cycle', () => {
    const last = run(CYCLE).at(-1)!;
    expect(last.type).toBe('CYCLE_DETECTED');
    expect(last.hasCycle).toBe(true);
  });

  it('other cyclic graphs report a cycle', () => {
    for (const c of RANDOM_CYCLIC) {
      expect(hasCycleRef(c)).toBe(true);
      const last = run(c).at(-1)!;
      expect(last.type).toBe('CYCLE_DETECTED');
      expect(last.hasCycle).toBe(true);
    }
  });

  it('satisfies step invariants and ends with DONE or CYCLE_DETECTED', () => {
    for (const c of [DAG, CYCLE, ...RANDOM_DAGS, ...RANDOM_CYCLIC]) {
      expectStepInvariants(run(c, 'ko'), ['DONE', 'CYCLE_DETECTED']);
    }
  });

  it('produces the same step structure in ko and en', () => {
    for (const c of [DAG, CYCLE, ...RANDOM_DAGS, ...RANDOM_CYCLIC]) {
      expectLangIndependent(run(c, 'ko'), run(c, 'en'));
    }
  });
});

import { expect } from 'vitest';

/** Deterministic PRNG (mulberry32) so "random" test cases are reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [lo, hi] (inclusive). */
export function randInt(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

export function randomArray(rng: () => number, len: number, lo = 1, hi = 99): number[] {
  return Array.from({ length: len }, () => randInt(rng, lo, hi));
}

/** Random directed graph without self-loops or duplicate (u,v) pairs. */
export function randomDirectedEdges(
  rng: () => number,
  n: number,
  density: number,
  wLo: number,
  wHi: number,
): [number, number, number][] {
  const edges: [number, number, number][] = [];
  for (let u = 0; u < n; u++) {
    for (let v = 0; v < n; v++) {
      if (u !== v && rng() < density) edges.push([u, v, randInt(rng, wLo, wHi)]);
    }
  }
  return edges;
}

/** Random undirected graph (u < v pairs, no duplicates). */
export function randomUndirectedEdges(
  rng: () => number,
  n: number,
  density: number,
  wLo = 1,
  wHi = 9,
): [number, number, number][] {
  const edges: [number, number, number][] = [];
  for (let u = 0; u < n; u++) {
    for (let v = u + 1; v < n; v++) {
      if (rng() < density) edges.push([u, v, randInt(rng, wLo, wHi)]);
    }
  }
  return edges;
}

/** Random connected undirected graph: a random spanning tree plus extra edges. */
export function randomConnectedUndirectedEdges(
  rng: () => number,
  n: number,
  extraDensity: number,
  wLo = 1,
  wHi = 9,
): [number, number, number][] {
  const has = new Set<string>();
  const edges: [number, number, number][] = [];
  const add = (a: number, b: number) => {
    const u = Math.min(a, b), v = Math.max(a, b);
    const k = `${u}-${v}`;
    if (u === v || has.has(k)) return;
    has.add(k);
    edges.push([u, v, randInt(rng, wLo, wHi)]);
  };
  for (let v = 1; v < n; v++) add(randInt(rng, 0, v - 1), v);
  for (let u = 0; u < n; u++) {
    for (let v = u + 1; v < n; v++) if (rng() < extraDensity) add(u, v);
  }
  return edges;
}

/** Plain Floyd-Warshall reference (Infinity for unreachable). */
export function floydWarshallRef(n: number, edges: [number, number, number][]): number[][] {
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w);
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
  return d;
}

interface MinimalStep {
  type: string;
  description: string;
  codeLine: number;
}

/** Invariants every step generator must satisfy. */
export function expectStepInvariants(steps: MinimalStep[], terminalTypes: string[]): void {
  expect(steps.length).toBeGreaterThan(0);
  for (const s of steps) {
    expect(typeof s.description).toBe('string');
    expect(s.description.trim().length).toBeGreaterThan(0);
    expect(typeof s.codeLine).toBe('number');
    expect(Number.isFinite(s.codeLine)).toBe(true);
  }
  expect(terminalTypes).toContain(steps[steps.length - 1].type);
}

/** Running in 'ko' and 'en' must produce the same step structure with translated text. */
export function expectLangIndependent(ko: MinimalStep[], en: MinimalStep[]): void {
  expect(en.length).toBe(ko.length);
  expect(en.map(s => s.type)).toEqual(ko.map(s => s.type));
  expect(en.map(s => s.codeLine)).toEqual(ko.map(s => s.codeLine));
  expect(en.map(s => s.description).join('\n')).not.toBe(ko.map(s => s.description).join('\n'));
}

/** Seeds for the ~20 deterministic random cases per suite. */
export const SEEDS = Array.from({ length: 20 }, (_, i) => 1000 + i * 7919);

interface WeightedEdge { u: number; v: number; weight: number }

/** True if `tree` has exactly n-1 edges and connects all n nodes without a cycle. */
export function isSpanningTree(n: number, tree: WeightedEdge[]): boolean {
  if (tree.length !== n - 1) return false;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const { u, v } of tree) {
    const a = find(u), b = find(v);
    if (a === b) return false;
    parent[a] = b;
  }
  return true;
}

/** Brute-force MST cost: try every (n-1)-edge subset (only for small graphs). */
export function bruteForceMstCost(n: number, edges: WeightedEdge[]): number {
  let best = Infinity;
  const pick: WeightedEdge[] = [];
  const rec = (start: number) => {
    if (pick.length === n - 1) {
      if (isSpanningTree(n, pick)) best = Math.min(best, pick.reduce((s, e) => s + e.weight, 0));
      return;
    }
    for (let i = start; i < edges.length; i++) {
      pick.push(edges[i]);
      rec(i + 1);
      pick.pop();
    }
  };
  rec(0);
  return best;
}

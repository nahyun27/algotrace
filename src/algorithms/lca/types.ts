export type LCAStepType =
  | 'INIT'
  | 'DFS_VISIT'
  | 'TABLE_FILL'
  | 'QUERY'
  | 'LIFT'
  | 'JUMP_BOTH'
  | 'SKIP_JUMP'
  | 'FOUND'
  | 'DONE';

/** An undirected tree on nodes 1..n, rooted at 1 (BOJ 11437 style). */
export interface TreeInput {
  n: number;
  edges: [number, number][];
}

export interface LCAStep {
  type: LCAStepType;
  description: string;
  codeLine: number;
  /** depth[v] for v = 1..n (index 0 unused); null until the DFS reaches v */
  depth: (number | null)[];
  /** up[k][v]: the 2^k-th ancestor of v (the root's ancestor is the root itself); null until filled */
  up: (number | null)[][];
  /** Node popped from the DFS stack in this step */
  dfsNode: number | null;
  /** Table cell [k, v] written in this step */
  fillCell: [number, number] | null;
  /** Table cells this step reads */
  deps: [number, number][];
  /** Current positions of u and v during the query (null before the query starts) */
  u: number | null;
  v: number | null;
  /** Nodes being considered as ancestors in this step */
  candidates: number[];
  /** Nodes u or v stood on earlier in the query */
  trail: number[];
  /** Power k used in this step */
  k: number | null;
  /** Depth difference the deeper node has to climb (set from QUERY on) */
  diff: number | null;
  /** The answer, once found */
  lca: number | null;
}

/** BOJ 11437 sample tree (15 nodes, depth 4). Its six sample queries answer 2, 4, 2, 1, 3, 1. */
export const DEFAULT_TREE: TreeInput = {
  n: 15,
  edges: [
    [1, 2], [1, 3], [2, 4], [3, 7], [6, 2], [3, 8], [4, 9], [2, 5],
    [5, 11], [7, 13], [10, 4], [11, 15], [12, 5], [14, 7],
  ],
};

export const BOJ_SAMPLE_QUERIES: [number, number, number][] = [
  [6, 11, 2], [10, 9, 4], [2, 6, 2], [7, 6, 1], [8, 13, 3], [8, 15, 1],
];

/** Two preset queries: a pair at different depths and a pair in different subtrees. */
export const PRESET_QUERIES: { id: 'depth' | 'subtree'; u: number; v: number }[] = [
  { id: 'depth', u: 15, v: 6 },
  { id: 'subtree', u: 13, v: 15 },
];

export const MAX_NODES = 16;

/** Number of table rows: the smallest LOG with 2^LOG ≥ n (at least 1), so every depth difference fits. */
export function logOf(n: number): number {
  let log = 1;
  while ((1 << log) < n) log++;
  return log;
}

/**
 * Parses "1 2, 1 3, 2 4" (pairs separated by commas or new lines) into a tree on nodes 1..n.
 * Returns an error code instead when the edges do not form one tree.
 */
export function parseTree(text: string): TreeInput | { error: 'format' | 'size' | 'range' | 'notTree' } {
  const chunks = text.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean);
  const edges: [number, number][] = [];
  for (const c of chunks) {
    const parts = c.split(/[\s-]+/).filter(Boolean).map(Number);
    if (parts.length !== 2 || parts.some(x => !Number.isInteger(x))) return { error: 'format' };
    edges.push([parts[0], parts[1]]);
  }
  const n = edges.length + 1;
  if (n < 2 || n > MAX_NODES) return { error: 'size' };
  if (edges.some(([a, b]) => a < 1 || b < 1 || a > n || b > n || a === b)) return { error: 'range' };
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const [a, b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return { error: 'notTree' };
    parent[ra] = rb;
  }
  return { n, edges };
}

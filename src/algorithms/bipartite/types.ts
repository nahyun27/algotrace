import type { GraphData } from '../../types/graph';
import type { DataItem } from '../bfsdfs/types';

export type { DataItem };

export type StepType = 'INIT' | 'START' | 'DEQUEUE' | 'COLOR' | 'CHECK' | 'CONFLICT' | 'DONE';

/** -1 = not colored yet, 0 = group A, 1 = group B */
export type NodeColor = -1 | 0 | 1;

export interface BipartiteStep {
  type: StepType;
  description: string;
  codeLine: number;
  /** color[v] for every node after this step */
  color: NodeColor[];
  /** Node just dequeued / whose neighbors are being scanned */
  currentNode: number | null;
  /** Neighbor being colored or checked */
  neighborNode: number | null;
  /** Edge (u, v) being looked at */
  activeEdge: [number, number] | null;
  /** Edges along which a color was assigned (BFS tree) */
  treeEdges: [number, number][];
  /** BFS queue */
  queue: DataItem[];
  /** Index of the connected component being explored (0-based), -1 before the first */
  component: number;
  /** Edge whose endpoints share a color (set from CONFLICT on) */
  conflictEdge: [number, number] | null;
  /** Final answer, null until DONE */
  isBipartite: boolean | null;
}

export type ExampleKey = 'yes' | 'no';

/** Even 6-cycle with a chord between opposite nodes (still bipartite) plus a separate edge 6-7. */
export const BIPARTITE_YES_GRAPH: GraphData = {
  directed: false,
  nodes: [
    { id: 0, label: '0', x: 250, y: 60 },
    { id: 1, label: '1', x: 363, y: 125 },
    { id: 2, label: '2', x: 363, y: 255 },
    { id: 3, label: '3', x: 250, y: 320 },
    { id: 4, label: '4', x: 137, y: 255 },
    { id: 5, label: '5', x: 137, y: 125 },
    { id: 6, label: '6', x: 490, y: 125 },
    { id: 7, label: '7', x: 490, y: 255 },
  ],
  edges: [
    { id: '0-1', from: 0, to: 1, weight: 1 },
    { id: '1-2', from: 1, to: 2, weight: 1 },
    { id: '2-3', from: 2, to: 3, weight: 1 },
    { id: '3-4', from: 3, to: 4, weight: 1 },
    { id: '4-5', from: 4, to: 5, weight: 1 },
    { id: '5-0', from: 5, to: 0, weight: 1 },
    { id: '0-3', from: 0, to: 3, weight: 1 },
    { id: '6-7', from: 6, to: 7, weight: 1 },
  ],
};

/** Contains the odd cycle 0-1-3-4-2-0 (length 5). */
export const BIPARTITE_NO_GRAPH: GraphData = {
  directed: false,
  nodes: [
    { id: 0, label: '0', x: 250, y: 50 },
    { id: 1, label: '1', x: 140, y: 140 },
    { id: 2, label: '2', x: 360, y: 140 },
    { id: 3, label: '3', x: 140, y: 270 },
    { id: 4, label: '4', x: 360, y: 270 },
    { id: 5, label: '5', x: 250, y: 350 },
  ],
  edges: [
    { id: '0-1', from: 0, to: 1, weight: 1 },
    { id: '0-2', from: 0, to: 2, weight: 1 },
    { id: '1-3', from: 1, to: 3, weight: 1 },
    { id: '2-4', from: 2, to: 4, weight: 1 },
    { id: '3-5', from: 3, to: 5, weight: 1 },
    { id: '4-5', from: 4, to: 5, weight: 1 },
    { id: '3-4', from: 3, to: 4, weight: 1 },
  ],
};

export const EXAMPLES: Record<ExampleKey, GraphData> = {
  yes: BIPARTITE_YES_GRAPH,
  no: BIPARTITE_NO_GRAPH,
};

/** Converts a GraphData (example or editor output) into 0..N-1 indexed edges. */
export function graphToInput(data: GraphData): { n: number; edges: [number, number][] } {
  const sorted = [...data.nodes].sort((a, b) => a.id - b.id);
  const idMap = new Map(sorted.map((nd, i) => [nd.id, i]));
  const edges: [number, number][] = [];
  for (const e of data.edges) {
    const u = idMap.get(e.from), v = idMap.get(e.to);
    if (u !== undefined && v !== undefined) edges.push([u, v]);
  }
  return { n: sorted.length, edges };
}

export const BIPARTITE_CODE = `from collections import deque

def is_bipartite(n, graph):
    color = [-1] * n  # 0: A, 1: B
    for s in range(n):  # 연결 요소마다
        if color[s] != -1:
            continue
        color[s] = 0
        queue = deque([s])
        while queue:
            u = queue.popleft()
            for v in graph[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    queue.append(v)
                elif color[v] == color[u]:
                    return False
    return True`;

/** Highlighted line range per step type (1-based, inclusive). */
export const CODE_RANGES: Record<number, [number, number]> = {
  4: [4, 4],    // INIT
  8: [5, 9],    // START
  11: [10, 11], // DEQUEUE
  14: [13, 15], // COLOR
  16: [16, 16], // CHECK
  17: [16, 17], // CONFLICT / DONE (NO)
  18: [18, 18], // DONE (YES)
};

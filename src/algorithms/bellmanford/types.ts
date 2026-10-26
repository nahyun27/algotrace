export type BFStepType = 'INIT' | 'ROUND_START' | 'RELAX' | 'ROUND_END' | 'NEGATIVE_CYCLE' | 'DONE';

export interface BellmanFordStep {
  type: BFStepType;
  description: string;
  dist: number[];
  currentNode: number | null;
  neighborNode: number | null;
  activeEdge: [number, number] | null;
  updatedCell: number | null;
  isImprovement: boolean;
  round: number;          // current round (1-based), 0 = init
  totalRounds: number;    // V-1
  updatesThisRound: number;
  roundUpdatesHistory: number[]; // how many updates each round
  negativeCycleEdges: [number, number][]; // edges in negative cycle if detected
  codeLine: number;
}

export const INF = 1e9;

// ─── 예제 1: 음수 간선 포함 (5노드) ───────────────────────────────────
export const EXAMPLE1_N = 5;
export const EXAMPLE1_EDGES: [number, number, number][] = [
  [0, 1, 6],
  [0, 2, 7],
  [1, 2, 8],
  [1, 3, -4],
  [1, 4, 5],
  [2, 3, 9],
  [2, 4, -3],
  [3, 0, 2],
  [4, 3, 7],
];
export const EXAMPLE1_NODES = [
  { id: 0, x: 80,  y: 180 },
  { id: 1, x: 230, y: 70  },
  { id: 2, x: 230, y: 290 },
  { id: 3, x: 380, y: 180 },
  { id: 4, x: 380, y: 320 },
];

// ─── 예제 2: 음수 사이클 (4노드) ─────────────────────────────────────
export const EXAMPLE2_N = 4;
export const EXAMPLE2_EDGES: [number, number, number][] = [
  [0, 1, 1],
  [1, 2, -3],
  [2, 3, 2],
  [3, 1, -1],  // 1→2→3→1 합 = -3+2-1 = -2 (음수 사이클)
];
export const EXAMPLE2_NODES = [
  { id: 0, x: 80,  y: 180 },
  { id: 1, x: 230, y: 90  },
  { id: 2, x: 380, y: 180 },
  { id: 3, x: 230, y: 270 },
];

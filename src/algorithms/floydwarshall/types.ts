export type FWStepType =
  | 'INIT'
  | 'ROUND_START'
  | 'UPDATE'
  | 'NO_UPDATE'
  | 'NEGATIVE_CYCLE'
  | 'DONE';

export interface FloydWarshallStep {
  type: FWStepType;
  description: string;
  distMatrix: number[][];
  nextMatrix: (number | null)[][];
  currentK: number | null;
  currentI: number | null;
  currentJ: number | null;
  isUpdate: boolean;
  prevVal: number | null;   // old dist[i][j] before update
  newVal: number | null;    // dist[i][k] + dist[k][j]
  hasNegCycle: boolean;
  codeLine: number;
}

export const INF = 1e9;
export const FW_N = 5;

export const FW_NODES: { id: number; x: number; y: number }[] = [
  { id: 0, x: 80,  y: 190 },
  { id: 1, x: 220, y: 60  },
  { id: 2, x: 390, y: 100 },
  { id: 3, x: 190, y: 310 },
  { id: 4, x: 390, y: 280 },
];

// directed edges: [from, to, weight]
export const FW_EDGES: [number, number, number][] = [
  [0, 1, 3], [0, 3, 7],
  [1, 0, 8], [1, 2, 2],
  [2, 0, 5], [2, 3, 1],
  [3, 0, 2], [3, 4, 3],
  [4, 2, 4], [4, 3, 6],
];

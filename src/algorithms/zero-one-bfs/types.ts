export type ZeroOneStepType = 'INIT' | 'POP' | 'PUSH_FRONT' | 'PUSH_BACK' | 'SKIP' | 'DONE';

export interface Cell {
  r: number;
  c: number;
}

export interface DequeItem extends Cell {
  /** dist of the cell at the moment it was pushed */
  d: number;
}

export interface ZeroOneStep {
  type: ZeroOneStepType;
  description: string;
  codeLine: number;
  /** dist[r][c], INF when not reached yet */
  dist: number[][];
  /** settled (popped for the first time) cells */
  done: boolean[][];
  /** deque snapshot, index 0 = front */
  deque: DequeItem[];
  /** cell popped from the front and being expanded */
  current: Cell | null;
  /** neighbour being examined (PUSH_* / SKIP) */
  neighbor: Cell | null;
  /** which end the neighbour was just pushed to */
  pushedTo: 'front' | 'back' | null;
  /** SKIP reason: neighbour not improved, or a stale deque entry */
  skipReason: 'no-improve' | 'stale' | null;
  /** final path start → goal (DONE only) */
  path: Cell[];
  /** min walls to break (DONE only) */
  answer: number | null;
  pops: number;
}

export const INF = 1e9;

/** BOJ 1261 sample 1 (M=3 columns, N=3 rows): 1 = wall, 0 = empty. Answer 3. */
export const DEFAULT_GRID: number[][] = [
  [0, 1, 1],
  [1, 1, 1],
  [1, 1, 0],
];

export const parseGrid = (lines: string[]): number[][] => lines.map(l => [...l].map(ch => (ch === '1' ? 1 : 0)));

export const cloneGrid = (g: number[][]) => g.map(row => [...row]);

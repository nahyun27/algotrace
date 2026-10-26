export type KnapsackStepType = 'INIT' | 'CONSIDER' | 'SKIP' | 'TAKE' | 'BACKTRACK' | 'DONE';

export interface Item {
  weight: number;
  value: number;
}

export interface KnapsackInput {
  items: Item[];
  K: number;
}

export interface KnapsackStep {
  type: KnapsackStepType;
  description: string;
  codeLine: number;
  /** dp[i][c] snapshot (row 0 = no items); null = not filled yet */
  dp: (number | null)[][];
  /** Cell being filled / reached by the backtrack */
  cell: [number, number] | null;
  /** Candidate cells: up (skip) and up-left by w_i (take) */
  deps: [number, number][];
  /** Candidate that won (SKIP / TAKE steps) */
  source: [number, number] | null;
  /** Backtrack path so far, starting at (N, K) */
  path: [number, number][];
  /** Chosen items (0-based) found so far by the backtrack, in ascending order */
  chosen: number[];
  /** dp[N][K] once the table is complete */
  result: number | null;
}

export const MAX_ITEMS = 6;
export const MAX_K = 15;
export const MAX_WEIGHT = 15;
export const MAX_VALUE = 99;

/** BOJ 12865 sample: N = 4, K = 7 → 14 */
export const DEFAULT_INPUT: KnapsackInput = {
  items: [
    { weight: 6, value: 13 },
    { weight: 4, value: 8 },
    { weight: 3, value: 6 },
    { weight: 5, value: 12 },
  ],
  K: 7,
};

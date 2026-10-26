/** Input of BOJ 11053 sample: answer 4 (e.g. 10, 20, 30, 50). */
export const DEFAULT_ARRAY = [10, 20, 10, 30, 20, 50];
export const MAX_LEN = 16;
export const MAX_ABS = 999;

export type LISVariant = 'quadratic' | 'fast';

/* ───────── O(n²) DP ───────── */

export type QuadStepType = 'INIT' | 'NEXT_I' | 'COMPARE' | 'UPDATE' | 'BACKTRACK' | 'DONE';

export interface QuadStep {
  type: QuadStepType;
  description: string;
  codeLine: number;
  /** Current index (-1 before / after the main loop) */
  i: number;
  /** Candidate predecessor index (-1 if none) */
  j: number;
  dp: number[];
  prev: number[];
  /** COMPARE / UPDATE: a[j] < a[i] and dp[j] + 1 > dp[i] */
  isImprovement: boolean;
  /** Longest length found so far (max of dp[0..i]) */
  best: number;
  /** Backtracking cursor (input index, -1 if none) */
  k: number;
  /** Indices of the LIS rebuilt so far (ascending) */
  lis: number[];
}

/* ───────── O(n log n) tails + binary search ───────── */

export type FastStepType = 'INIT' | 'SEARCH' | 'REPLACE' | 'APPEND' | 'BACKTRACK' | 'DONE';

export interface FastStep {
  type: FastStepType;
  description: string;
  codeLine: number;
  i: number;
  /** tails[k] = smallest possible last value of an increasing subsequence of length k+1 */
  tails: number[];
  /** Input index of each tails entry */
  tailsIdx: number[];
  /** parent[i] = input index of the element before a[i] in its best subsequence (-1 = none) */
  parent: number[];
  /** Binary search state; -1 when not searching */
  lo: number;
  hi: number;
  mid: number;
  /** REPLACE / APPEND: position written in tails */
  pos: number;
  k: number;
  lis: number[];
}

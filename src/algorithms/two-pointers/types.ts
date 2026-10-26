export type TPVariant = 'sum' | 'window';

export type SumStepType = 'INIT' | 'EXPAND' | 'SHRINK' | 'MATCH' | 'DONE';
export type WindowStepType = 'INIT' | 'SLIDE' | 'BEST' | 'DONE';

/** Subarray-sum step. The window is the closed range arr[l..r] (empty when r < l). */
export interface SumStep {
  type: SumStepType;
  l: number;
  r: number;
  total: number;
  count: number;
  /** Matched intervals found so far, as closed [l, r] */
  matches: [number, number][];
  /** Index just added (EXPAND) or removed (SHRINK) */
  changed: number | null;
  description: string;
  codeLine: number;
}

/** Sliding-window step. The window is the closed range arr[l..r] of length k. */
export interface WindowStep {
  type: WindowStepType;
  l: number;
  r: number;
  total: number;
  best: number;
  bestRange: [number, number];
  /** Sums of every window seen so far, indexed by the window's left end */
  sums: number[];
  /** Index that entered / left the window on SLIDE */
  entered: number | null;
  left: number | null;
  description: string;
  codeLine: number;
}

/** BOJ 2003 sample: answer 3 */
export const DEFAULT_SUM = { arr: [1, 2, 3, 4, 2, 5, 3, 1, 1, 2], m: 5 };
/** BOJ 2559 sample: answer 21 */
export const DEFAULT_WINDOW = { arr: [3, -2, -4, -9, 0, 3, 7, 13, 8, -3], k: 2 };

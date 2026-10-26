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

export const TP_CODES: Record<TPVariant, string> = {
  sum: `def count_subarrays(arr, m):
    count, total = 0, 0
    l, r = 0, -1  # window = arr[l..r]
    while True:
        if total >= m:
            total -= arr[l]
            l += 1
        elif r + 1 == len(arr):
            break
        else:
            r += 1
            total += arr[r]
        if total == m:
            count += 1
    return count`,
  window: `def max_window_sum(arr, k):
    total = sum(arr[:k])
    best = total
    for r in range(k, len(arr)):
        total += arr[r] - arr[r - k]
        if total > best:
            best = total
    return best`,
};

export const TP_FILE: Record<TPVariant, string> = {
  sum: 'two_pointers.py',
  window: 'sliding_window.py',
};

/** codeLine → lines to highlight */
export const TP_HIGHLIGHT: Record<TPVariant, Record<number, number[]>> = {
  sum: { 3: [2, 3], 7: [5, 6, 7], 12: [10, 11, 12], 14: [13, 14], 15: [8, 9, 15] },
  window: { 3: [2, 3], 5: [4, 5], 7: [6, 7], 8: [8] },
};

export type BSVariant = 'find' | 'lower' | 'param';

export type BSStepType =
  | 'INIT'
  | 'MID'
  | 'CHECK'
  | 'GO_LEFT'
  | 'GO_RIGHT'
  | 'FOUND'
  | 'NOT_FOUND'
  | 'DONE';

export interface BSStep {
  type: BSStepType;
  /** Search bounds after this step. find/param: closed [lo, hi]; lower bound: half-open [lo, hi). */
  lo: number;
  hi: number;
  /** Index (find / lower) or candidate height (param) being examined, if any */
  mid: number | null;
  /** Final answer on the terminal step: index (-1 = not found) or the best height */
  result: number | null;
  /** Parametric search: best height found so far */
  best: number | null;
  /** Parametric search: wood collected when cutting at `mid` */
  wood: number | null;
  /** Parametric search: did the predicate (wood >= M) hold at `mid`? */
  ok: boolean | null;
  description: string;
  /** 1-based line in the variant's Python code */
  codeLine: number;
}

export const DEFAULT_FIND = { arr: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 };
export const DEFAULT_LOWER = { arr: [2, 5, 8, 12, 16, 16, 16, 38, 56, 72], target: 16 };
/** BOJ 2805 sample: answer 15 */
export const DEFAULT_PARAM = { trees: [20, 15, 10, 17], m: 7 };

export const BS_CODES: Record<BSVariant, string> = {
  find: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
  lower: `def lower_bound(arr, target):
    lo, hi = 0, len(arr)  # [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo  # first index with arr[i] >= target`,
  param: `def max_height(trees, m):
    lo, hi = 0, max(trees)
    answer = 0
    while lo <= hi:
        mid = (lo + hi) // 2
        wood = sum(t - mid for t in trees if t > mid)
        if wood >= m:
            answer = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return answer`,
};

export const BS_FILE: Record<BSVariant, string> = {
  find: 'binary_search.py',
  lower: 'lower_bound.py',
  param: 'parametric_search.py',
};

/** codeLine → lines to highlight (a step can cover more than one line) */
export const BS_HIGHLIGHT: Record<BSVariant, Record<number, number[]>> = {
  find: { 2: [2], 4: [3, 4], 6: [5, 6], 8: [7, 8], 10: [9, 10], 11: [11] },
  lower: { 2: [2], 4: [3, 4], 6: [5, 6], 8: [7, 8], 9: [9] },
  param: { 2: [2, 3], 6: [4, 5, 6], 9: [7, 8, 9], 11: [10, 11], 12: [12] },
};

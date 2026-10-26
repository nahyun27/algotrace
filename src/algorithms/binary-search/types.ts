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

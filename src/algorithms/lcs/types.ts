export type LCSMode = 'lcs' | 'edit';

export type EditOpType = 'MATCH' | 'REPLACE' | 'INSERT' | 'DELETE';

export type LCSStepType = 'INIT' | 'MISMATCH' | EditOpType | 'BACKTRACK' | 'DONE';

/** One column of the final edit script (alignment of A and B). */
export interface EditOp {
  op: EditOpType;
  /** Character of A (null for INSERT) */
  a: string | null;
  /** Character of B (null for DELETE) */
  b: string | null;
}

export interface LCSStep {
  type: LCSStepType;
  description: string;
  codeLine: number;
  /** dp[i][j] snapshot; null = not filled yet */
  dp: (number | null)[][];
  /** Cell being filled / reached by the backtrack */
  cell: [number, number] | null;
  /** Cells the current cell reads */
  deps: [number, number][];
  /** Dependency that produced the value */
  source: [number, number] | null;
  /** Backtrack path found so far (from (n, m) towards (0, 0)) */
  path: [number, number][];
  /** Final answer (dp[n][m]) once known */
  result: number | null;
  /** LCS: indices of A / B that belong to the LCS (filled while backtracking) */
  matchA: number[];
  matchB: number[];
  /** Edit distance: the edit script in left-to-right order (filled while backtracking) */
  script: EditOp[];
}

export const MAX_LEN = 10;

export const DEFAULT_INPUT: Record<LCSMode, { a: string; b: string }> = {
  lcs: { a: 'ACAYKP', b: 'CAPCAK' }, // BOJ 9251 sample → 4
  edit: { a: 'kitten', b: 'sitting' }, // → 3
};

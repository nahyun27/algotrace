export type Cell = [number, number];

/* ─────────────── N-Queens ─────────────── */

export type QueensStepType = 'INIT' | 'PLACE' | 'CONFLICT' | 'BACKTRACK' | 'SOLUTION' | 'DONE';
export type QueensMode = 'all' | 'first';

export interface QueensStep {
  type: QueensStepType;
  description: string;
  codeLine: number;
  /** board[r] = column of the queen in row r, or -1 */
  board: number[];
  /** Cell being tried / placed / removed in this step */
  cell: Cell | null;
  /** CONFLICT: the earlier queen that attacks `cell` */
  attacker: Cell | null;
  /** Solutions found so far */
  solutions: number;
  /** Every solution found so far (board snapshots) */
  found: number[][];
  /** Placements tried so far (PLACE + CONFLICT) */
  tries: number;
  /** Steps skipped by fast-forward before this step (0 while every step is shown) */
  skipped: number;
}

export const QUEENS_MIN_N = 4;
export const QUEENS_MAX_N = 8;
export const QUEENS_DEFAULT_N = 4;
/** Above this many detailed steps the "count all" run fast-forwards and only shows solutions. */
export const QUEENS_STEP_CAP = 1500;

/* ─────────────── Sudoku ─────────────── */

export type SudokuStepType = 'INIT' | 'TRY' | 'INVALID' | 'FILL_OK' | 'BACKTRACK' | 'SOLVED' | 'DONE';
export type ConflictKind = 'row' | 'col' | 'box';

export interface SudokuStep {
  type: SudokuStepType;
  description: string;
  codeLine: number;
  board: number[][];
  /** Blank cell being worked on */
  cell: Cell | null;
  digit: number | null;
  /** INVALID: the cell that already holds the digit */
  conflict: Cell | null;
  conflictKind: ConflictKind | null;
  /** BACKTRACK: the next blank that ran out of digits (null when the erased cell itself is exhausted) */
  deadEnd: Cell | null;
  /** Index of `cell` in the blank list (recursion depth) */
  depth: number;
  tries: number;
  backtracks: number;
  solved: boolean;
}

export type SudokuPresetId = 'small' | 'small2' | 'boj';

export interface SudokuPreset {
  id: SudokuPresetId;
  label: { ko: string; en: string };
  grid: number[][];
}

export const SUDOKU_PRESETS: SudokuPreset[] = [
  {
    id: 'small',
    label: { ko: '4×4 예제', en: '4×4 example' },
    grid: [
      [4, 0, 0, 0],
      [0, 0, 2, 4],
      [0, 0, 3, 0],
      [2, 0, 0, 1],
    ],
  },
  {
    id: 'small2',
    label: { ko: '4×4 되돌림 많음', en: '4×4 more backtracking' },
    grid: [
      [0, 0, 0, 4],
      [0, 4, 2, 0],
      [0, 3, 0, 1],
      [0, 0, 0, 2],
    ],
  },
  {
    id: 'boj',
    label: { ko: '9×9 (백준 2580 예제)', en: '9×9 (BOJ 2580 sample)' },
    grid: [
      [0, 3, 5, 4, 6, 9, 2, 7, 8],
      [7, 8, 2, 1, 0, 5, 6, 0, 9],
      [0, 6, 0, 2, 7, 8, 1, 3, 5],
      [3, 2, 1, 0, 4, 6, 8, 9, 7],
      [8, 0, 4, 9, 1, 3, 5, 0, 6],
      [5, 9, 6, 8, 2, 0, 4, 1, 3],
      [9, 1, 7, 6, 5, 2, 0, 8, 0],
      [6, 0, 3, 7, 0, 1, 9, 5, 2],
      [2, 5, 8, 3, 9, 4, 7, 6, 0],
    ],
  },
];

/** BOJ 2580 sample output */
export const BOJ_2580_ANSWER = [
  [1, 3, 5, 4, 6, 9, 2, 7, 8],
  [7, 8, 2, 1, 3, 5, 6, 4, 9],
  [4, 6, 9, 2, 7, 8, 1, 3, 5],
  [3, 2, 1, 5, 4, 6, 8, 9, 7],
  [8, 7, 4, 9, 1, 3, 5, 2, 6],
  [5, 9, 6, 8, 2, 7, 4, 1, 3],
  [9, 1, 7, 6, 5, 2, 3, 8, 4],
  [6, 4, 3, 7, 8, 1, 9, 5, 2],
  [2, 5, 8, 3, 9, 4, 7, 6, 1],
];

export const SUDOKU_STEP_CAP = 4000;

export type HeapStepType =
  | 'INIT'
  | 'APPEND'
  | 'COMPARE'
  | 'SWAP'
  | 'SETTLE'
  | 'REMOVE_ROOT'
  | 'MOVE_LAST'
  | 'DONE';

export type HeapOpKind = 'build' | 'insert' | 'extract';

export type HeapOp =
  | { kind: 'build'; values: number[] }
  | { kind: 'insert'; value: number }
  | { kind: 'extract' };

export interface HeapStep {
  type: HeapStepType;
  op: HeapOpKind;
  /** Heap array snapshot after this step */
  heap: number[];
  /** Index being sifted (current) */
  current: number | null;
  /** Indices compared against the current one (candidate) */
  compare: number[];
  /** Pair swapped in this step (danger flash) */
  swapped: [number, number] | null;
  /** Indices that are in their final place (visited) */
  settled: number[];
  /** Index of the root that is being removed (path tone) */
  removed: number | null;
  /** Value taken out by this extract operation (null: none yet, or the heap was empty) */
  extracted: number | null;
  compares: number;
  swaps: number;
  description: string;
  codeLine: number;
}

export const DEFAULT_VALUES = [9, 4, 7, 1, 8, 2, 6, 3, 5];
/** Four levels still fit the tree view comfortably */
export const MAX_HEAP_SIZE = 15;
export const MAX_ABS_VALUE = 99;

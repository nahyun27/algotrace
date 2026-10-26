export type Structure = 'segment' | 'fenwick';
export type Operation = 'query' | 'update';

export interface SegInput {
  arr: number[];
  /** Query range, 0-based inclusive */
  l: number;
  r: number;
  /** Point update: arr[idx] becomes val */
  idx: number;
  val: number;
}

export const DEFAULT_INPUT: SegInput = { arr: [5, 8, 6, 3, 2, 7, 2, 6], l: 2, r: 6, idx: 3, val: 10 };
export const MAX_N = 12;

/* ─────────────── segment tree ─────────────── */

export type SegStepType = 'BUILD' | 'VISIT' | 'FULL' | 'PARTIAL' | 'OUTSIDE' | 'UPDATE' | 'DONE';

/** What happened to a node during the current query / update */
export type SegMark = 'visit' | 'full' | 'partial' | 'outside' | 'updated';

export interface SegShape {
  id: number;
  start: number;
  end: number;
  left: SegShape | null;
  right: SegShape | null;
}

export interface SegStep {
  type: SegStepType;
  /** Node sums by heap index (1-based); null = not built yet */
  tree: (number | null)[];
  arr: number[];
  /** Node being processed */
  node: number | null;
  /** Range [start, end] of `node` */
  span: [number, number] | null;
  marks: Record<number, SegMark>;
  /** Query: running sum of fully covered nodes */
  acc: number | null;
  result: number | null;
  description: string;
  codeLine: number;
}

/* ─────────────── Fenwick tree ─────────────── */

export type FenStepType = 'BUILD' | 'QUERY' | 'PREFIX' | 'COLLECT' | 'PREFIX_DONE' | 'SET' | 'UPDATE' | 'DONE';

export interface FenStep {
  type: FenStepType;
  /** 1-based BIT, tree[0] unused */
  tree: number[];
  arr: number[];
  /** BIT index being processed */
  i: number | null;
  /** Cells 1..built hold their final value (build phase) */
  built: number;
  /** Cells added with a + sign (prefix_sum(r + 1)) */
  plus: number[];
  /** Cells added with a − sign (prefix_sum(l)) */
  minus: number[];
  /** Cells touched by update */
  updated: number[];
  /** Running s inside prefix_sum */
  s: number | null;
  prefR: number | null;
  prefL: number | null;
  result: number | null;
  description: string;
  codeLine: number;
}

export const lowbit = (i: number) => i & -i;

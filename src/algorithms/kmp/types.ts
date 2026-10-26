export type KMPStepType =
  | 'INIT'
  | 'PI_MATCH'
  | 'PI_FALLBACK'
  | 'PI_SET'
  | 'SEARCH_MATCH'
  | 'SEARCH_MISMATCH'
  | 'SEARCH_FALLBACK'
  | 'FOUND'
  | 'DONE';

export interface KMPStep {
  type: KMPStepType;
  /** 'pi': the pattern is matched against itself; 'search': the pattern is matched against the text */
  phase: 'pi' | 'search';
  /** Index in the scanned string (pattern during 'pi', text during 'search') */
  i: number;
  /** Where pattern index 0 sits under the scanned string */
  shift: number;
  /** Pattern cells 0..matched-1 are matched at this shift */
  matched: number;
  /** The pair being compared: scanned[i] vs pattern[cmp.j] */
  cmp: { j: number; ok: boolean } | null;
  /** Failure table so far (null = not computed yet) */
  pi: (number | null)[];
  /** pi index being written on this step */
  piCell: number | null;
  /** pi index read on a fallback (pi[j-1]) */
  piRead: number | null;
  /** 0-based start positions of every match found so far */
  found: number[];
  /** FOUND: start of the match just found */
  hit: number | null;
  description: string;
  codeLine: number;
}

export const DEFAULT_TEXT = 'ABABDABACDABABCABAB';
export const DEFAULT_PATTERN = 'ABABCABAB';
export const MAX_TEXT = 30;
export const MAX_PATTERN = 12;

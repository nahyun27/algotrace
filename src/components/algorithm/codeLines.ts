/**
 * Line ranges to highlight per step, written as a table instead of if-chains:
 *
 *   const CPP_LINES: LineMap = { 1: [[4, 10]], 4: [[12, 14]] };
 *   isLineHighlighted={highlighter(CPP_LINES, codeLine)}
 *
 * Keys are the solver's `codeLine` values; each maps to inclusive [from, to] ranges in that file.
 */
export type LineMap = Record<number, [number, number][]>;

export function highlighter(map: LineMap, codeLine: number) {
  const ranges = map[codeLine] ?? [];
  return (line: number) => ranges.some(([from, to]) => line >= from && line <= to);
}

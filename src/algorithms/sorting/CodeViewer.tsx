import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import { SORT_CODES, SORT_CODES_CPP, SORT_CODES_JAVA } from './types';
import type { SortAlgorithm } from './types';

interface Props {
  codeLine: number;
  algorithm: SortAlgorithm;
}

/**
 * Keys are the solver's codeLine values per algorithm; each maps to the lines the step actually describes
 * (for example a compare step lights the comparison, a swap step the swap).
 */
const PY_LINES: Record<SortAlgorithm, LineMap> = {
  bubble: { 1: [[1, 1]], 3: [[3, 3]], 5: [[5, 6]], 7: [[7, 8]], 10: [[9, 10]], 11: [[11, 11]] },
  selection: { 1: [[1, 1]], 4: [[4, 4]], 6: [[6, 6]], 8: [[8, 8]], 9: [[9, 9]] },
  insertion: { 1: [[1, 1]], 2: [[2, 2]], 3: [[3, 4]], 5: [[5, 5]], 6: [[6, 7]], 7: [[8, 8]], 8: [[9, 9]] },
  merge: { 1: [[1, 1]], 4: [[4, 4]], 7: [[7, 7]], 9: [[9, 11]], 12: [[12, 13]], 13: [[14, 14], [16, 16]], 18: [[18, 21]] },
  quick: { 1: [[1, 1]], 4: [[4, 4]], 6: [[6, 6]], 9: [[9, 10]], 11: [[11, 12]], 13: [[13, 14]], 14: [[15, 16]] },
  heap: { 1: [[1, 1]], 3: [[3, 4]], 5: [[6, 7]], 6: [[5, 7]], 10: [[12, 13]], 12: [[14, 15]], 15: [[17, 18]] },
  counting: { 3: [[3, 3]], 5: [[4, 5]], 7: [[6, 7]], 11: [[10, 11]], 12: [[12, 12]] },
  radix: { 2: [[2, 2]], 3: [[3, 4]], 7: [[6, 7]], 8: [[8, 8]], 10: [[10, 10]] },
};

const CPP_LINES: Record<SortAlgorithm, LineMap> = {
  bubble: { 1: [[4, 5]], 3: [[6, 6]], 5: [[8, 9]], 7: [[10, 11]], 10: [[14, 15]], 11: [[17, 17]] },
  selection: { 1: [[4, 5]], 4: [[7, 7]], 6: [[8, 10]], 8: [[11, 11]], 9: [[13, 13]] },
  insertion: { 1: [[4, 4]], 2: [[5, 5]], 3: [[6, 7]], 5: [[8, 8]], 6: [[9, 10]], 7: [[12, 12]], 8: [[14, 14]] },
  merge: { 1: [[5, 5]], 4: [[7, 7]], 7: [[10, 10]], 9: [[13, 15]], 12: [[16, 17]], 13: [[18, 18], [20, 20]], 18: [[24, 29]] },
  quick: { 1: [[5, 5]], 4: [[7, 7]], 6: [[9, 9]], 9: [[13, 14]], 11: [[15, 16]], 13: [[17, 18]], 14: [[21, 22]] },
  heap: { 1: [[5, 6]], 3: [[7, 8]], 5: [[10, 11]], 6: [[13, 13]], 10: [[18, 19]], 12: [[20, 21]], 15: [[22, 24]] },
  counting: { 3: [[5, 6]], 5: [[7, 8]], 7: [[9, 10]], 11: [[13, 14]], 12: [[16, 17]] },
  radix: { 2: [[5, 5]], 3: [[6, 7]], 7: [[9, 10]], 8: [[12, 13]], 10: [[16, 16]] },
};

const JAVA_LINES: Record<SortAlgorithm, LineMap> = {
  bubble: { 1: [[4, 5]], 3: [[6, 6]], 5: [[8, 9]], 7: [[10, 11]], 10: [[14, 15]], 11: [[17, 17]] },
  selection: { 1: [[4, 5]], 4: [[7, 7]], 6: [[8, 10]], 8: [[11, 11]], 9: [[13, 13]] },
  insertion: { 1: [[4, 4]], 2: [[5, 5]], 3: [[6, 7]], 5: [[8, 8]], 6: [[9, 10]], 7: [[12, 12]], 8: [[14, 14]] },
  merge: { 1: [[4, 4]], 4: [[6, 6]], 7: [[9, 9]], 9: [[12, 14]], 12: [[15, 16]], 13: [[17, 17], [19, 19]], 18: [[23, 28]] },
  quick: { 1: [[4, 4]], 4: [[6, 6]], 6: [[8, 8]], 9: [[12, 13]], 11: [[14, 15]], 13: [[16, 17]], 14: [[20, 21]] },
  heap: { 1: [[4, 5]], 3: [[6, 7]], 5: [[9, 10]], 6: [[12, 12]], 10: [[17, 18]], 12: [[19, 20]], 15: [[21, 23]] },
  counting: { 3: [[5, 6]], 5: [[7, 8]], 7: [[9, 10]], 11: [[13, 14]], 12: [[16, 17]] },
  radix: { 2: [[5, 5]], 3: [[6, 8]], 7: [[10, 11]], 8: [[13, 14]], 10: [[17, 17]] },
};

export default function SortingCodeViewer({ codeLine, algorithm }: Props) {
  return (
    <CodePanel
      title={`${algorithm}_sort.py`}
      code={SORT_CODES[algorithm]}
      isLineHighlighted={highlighter(PY_LINES[algorithm], codeLine)}
      sources={{
        cpp: { code: SORT_CODES_CPP[algorithm], isLineHighlighted: highlighter(CPP_LINES[algorithm], codeLine) },
        java: { code: SORT_CODES_JAVA[algorithm], isLineHighlighted: highlighter(JAVA_LINES[algorithm], codeLine) },
      }}
    />
  );
}

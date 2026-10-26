import CodePanel from '../../components/algorithm/CodePanel';
import { SORT_CODES } from './types';
import type { SortAlgorithm } from './types';

interface Props {
  codeLine: number;
  algorithm: SortAlgorithm;
}

/**
 * Lines highlighted together with the step's codeLine, keyed by algorithm → codeLine.
 * counting: placing reads `count[arr[i]] -= 1` (10) and writes the output (11).
 * radix: a bucket step computes the digit (6) and appends (7).
 */
const COMPANION_LINES: Partial<Record<SortAlgorithm, Record<number, number[]>>> = {
  counting: { 11: [10], 5: [4], 7: [6] },
  radix: { 7: [6], 3: [4] },
};

export default function SortingCodeViewer({ codeLine, algorithm }: Props) {
  const code = SORT_CODES[algorithm];

  return (
    <CodePanel
      title={`${algorithm}_sort.py`}
      code={code}
      isLineHighlighted={(line) => codeLine > 0 && (line === codeLine || !!COMPANION_LINES[algorithm]?.[codeLine]?.includes(line))}
    />
  );
}

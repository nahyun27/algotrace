import CodePanel from '../../components/algorithm/CodePanel';
import { SORT_CODES } from './types';
import type { SortAlgorithm } from './types';

interface Props {
  codeLine: number;
  algorithm: SortAlgorithm;
}

export default function SortingCodeViewer({ codeLine, algorithm }: Props) {
  const code = SORT_CODES[algorithm];

  return (
    <CodePanel
      title={`${algorithm}_sort.py`}
      code={code}
      isLineHighlighted={(line) => codeLine > 0 && line === codeLine}
    />
  );
}

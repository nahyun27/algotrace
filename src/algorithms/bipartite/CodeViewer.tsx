import CodePanel from '../../components/algorithm/CodePanel';
import { BIPARTITE_CODE, CODE_RANGES } from './types';

export default function BipartiteCodeViewer({ codeLine }: { codeLine: number }) {
  const range = CODE_RANGES[codeLine];
  return (
    <CodePanel
      title="bipartite.py"
      code={BIPARTITE_CODE}
      isLineHighlighted={line => !!range && line >= range[0] && line <= range[1]}
    />
  );
}

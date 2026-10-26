import CodePanel from '../../components/algorithm/CodePanel';
import { BS_CODES, BS_FILE, BS_HIGHLIGHT, type BSVariant } from './types';

export default function BinarySearchCodeViewer({ codeLine, variant }: { codeLine: number; variant: BSVariant }) {
  const lines = BS_HIGHLIGHT[variant][codeLine] ?? [];
  return (
    <CodePanel
      title={BS_FILE[variant]}
      code={BS_CODES[variant]}
      isLineHighlighted={line => lines.includes(line)}
    />
  );
}

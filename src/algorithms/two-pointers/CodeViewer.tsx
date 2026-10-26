import CodePanel from '../../components/algorithm/CodePanel';
import { TP_CODES, TP_FILE, TP_HIGHLIGHT, type TPVariant } from './types';

export default function TwoPointersCodeViewer({ codeLine, variant }: { codeLine: number; variant: TPVariant }) {
  const lines = TP_HIGHLIGHT[variant][codeLine] ?? [];
  return (
    <CodePanel
      title={TP_FILE[variant]}
      code={TP_CODES[variant]}
      isLineHighlighted={line => lines.includes(line)}
    />
  );
}

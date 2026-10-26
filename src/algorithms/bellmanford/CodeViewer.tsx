import CodePanel from '../../components/algorithm/CodePanel';
import { BF_CODE } from './types';

export default function BFCodeViewer({ codeLine }: { codeLine: number }) {
  const isHighlighted = (lineNum: number) => {
    if (codeLine === 4  && lineNum >= 3 && lineNum <= 5) return true;   // INIT
    if (codeLine === 8  && lineNum >= 8 && lineNum <= 9) return true;   // ROUND_START
    if (codeLine === 11 && lineNum >= 10 && lineNum <= 11) return true; // RELAX check
    if (codeLine === 12 && lineNum >= 12 && lineNum <= 13) return true; // RELAX update
    if (codeLine === 13 && lineNum === 13) return true;                 // ROUND_END
    if (codeLine === 18 && lineNum >= 16 && lineNum <= 19) return true; // NEGATIVE_CYCLE
    if (codeLine === 20 && lineNum === 21) return true;                 // DONE
    return false;
  };

  return (
    <CodePanel
      title="bellman_ford.py"
      code={BF_CODE}
      isLineHighlighted={(line) => isHighlighted(line)}
    />
  );
}

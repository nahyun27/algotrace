import CodePanel from '../../components/algorithm/CodePanel';
import { BFS_CODE, DFS_CODE } from './types';

interface CodeViewerProps {
  codeLine: number;
  mode: 'BFS' | 'DFS';
}

export default function CodeViewer({ codeLine, mode }: CodeViewerProps) {
  const code = mode === 'BFS' ? BFS_CODE : DFS_CODE;

  const isHighlighted = (lineNum: number) => {
    // Basic highlighting based on solver codeLine
    // In solverBFS/DFS, we pass the "start" of the relevant block usually
    if (mode === 'BFS') {
      if (codeLine === 4 && lineNum >= 4 && lineNum <= 7) return true; // INIT
      if (codeLine === 10 && lineNum >= 10 && lineNum <= 11) return true; // DEQUEUE
      if (codeLine === 12 && lineNum >= 14 && lineNum <= 14) return true; // DISCOVER
      if (codeLine === 15 && lineNum >= 15 && lineNum <= 17) return true; // ENQUEUE
      if (codeLine === 17 && lineNum >= 19) return true; // DONE
    } else {
      if (codeLine === 4 && lineNum >= 2 && lineNum <= 4) return true; // INIT
      if (codeLine === 7 && lineNum >= 7 && lineNum <= 11) return true; // POP
      if (codeLine === 13 && lineNum >= 14 && lineNum <= 14) return true; // DISCOVER
      if (codeLine === 16 && lineNum >= 16 && lineNum <= 17) return true; // PUSH
      if (codeLine === 18 && lineNum >= 19) return true; // DONE
    }
    return false;
  };

  return (
    <CodePanel
      title={mode === 'BFS' ? 'bfs.py' : 'dfs.py'}
      code={code}
      isLineHighlighted={(line) => isHighlighted(line)}
    />
  );
}

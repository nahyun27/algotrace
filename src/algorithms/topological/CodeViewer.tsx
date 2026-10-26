import CodePanel from '../../components/algorithm/CodePanel';
import { KAHN_CODE, DFS_TOPO_CODE } from './types';

/*
  KAHN line map:
   4  = INIT (in_degree array)
   11 = ENQUEUE initial (queue.append in for-loop)
   16 = DEQUEUE (queue.popleft + result.append)
   19 = DECREASE (in_degree[v] -= 1)
   21 = DECREASE+ENQUEUE (if in_degree[v] == 0: queue.append)
   24 = CYCLE_DETECTED
   25 = DONE (return result)

  DFS line map:
   7  = VISIT (visited / in_stack mark)
   11 = VISIT edge (if not visited: dfs)
   13 = CYCLE_DETECTED (back edge)
   16 = FINISH (in_stack=False)
   17 = FINISH (stack.append)
   22 = DONE (return stack[::-1])
*/

function isHighlightedKahn(lineNum: number, codeLine: number): boolean {
  if (codeLine === 4  && lineNum >= 4  && lineNum <= 7)  return true; // INIT
  if (codeLine === 11 && lineNum >= 9  && lineNum <= 12) return true; // ENQUEUE initial
  if (codeLine === 16 && lineNum >= 15 && lineNum <= 17) return true; // DEQUEUE
  if (codeLine === 19 && lineNum >= 19 && lineNum <= 20) return true; // DECREASE
  if (codeLine === 21 && lineNum >= 19 && lineNum <= 22) return true; // DECREASE+ENQUEUE
  if (codeLine === 24 && lineNum >= 24 && lineNum <= 25) return true; // CYCLE_DETECTED
  if (codeLine === 25 && lineNum === 26)                 return true; // DONE
  return false;
}

function isHighlightedDFS(lineNum: number, codeLine: number): boolean {
  if (codeLine === 7  && lineNum >= 7  && lineNum <= 8)  return true; // VISIT
  if (codeLine === 11 && lineNum >= 10 && lineNum <= 12) return true; // traverse edge
  if (codeLine === 13 && lineNum >= 13 && lineNum <= 14) return true; // CYCLE_DETECTED
  if (codeLine === 16 && lineNum >= 16 && lineNum <= 17) return true; // FINISH
  if (codeLine === 22 && lineNum === 22)                 return true; // DONE
  return false;
}

interface Props {
  codeLine: number;
  mode: 'Kahn' | 'DFS';
}

export default function TopoCodeViewer({ codeLine, mode }: Props) {
  const code  = mode === 'Kahn' ? KAHN_CODE : DFS_TOPO_CODE;

  const isHighlighted = (lineNum: number) =>
    mode === 'Kahn'
      ? isHighlightedKahn(lineNum, codeLine)
      : isHighlightedDFS(lineNum, codeLine);

  return (
    <CodePanel
      title={mode === 'Kahn' ? 'topo_sort_kahn.py' : 'topo_sort_dfs.py'}
      code={code}
      isLineHighlighted={(line) => isHighlighted(line)}
    />
  );
}

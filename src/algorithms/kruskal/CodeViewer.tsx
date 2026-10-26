import CodePanel from '../../components/algorithm/CodePanel';
import { KRUSKAL_CODE } from './types';

/*
  Line map:
   2  = find: path compression check
   7  = union: find roots (FIND step)
   9  = cycle check (REJECT)
   13 = parent[ry] = rx (union)
   19 = sort edges (INIT)
   24 = for loop consider edge (CONSIDER)
   25 = if union (ACCEPT - mst append)
   31 = return mst (DONE)
*/

function isHighlighted(lineNum: number, codeLine: number): boolean {
  if (codeLine === 19 && lineNum >= 19 && lineNum <= 22) return true; // INIT
  if (codeLine === 24 && lineNum === 24)                 return true; // CONSIDER
  if (codeLine === 7  && lineNum >= 7  && lineNum <= 10) return true; // FIND
  if (codeLine === 25 && ((lineNum >= 13 && lineNum <= 15) || (lineNum >= 25 && lineNum <= 27))) return true; // ACCEPT
  if (codeLine === 10 && lineNum >= 9  && lineNum <= 10) return true; // REJECT
  if (codeLine === 31 && lineNum === 31)                 return true; // DONE
  return false;
}

interface Props {
  codeLine: number;
}

export default function KruskalCodeViewer({ codeLine }: Props) {
  return (
    <CodePanel
      title="kruskal.py"
      code={KRUSKAL_CODE}
      isLineHighlighted={(line) => isHighlighted(line, codeLine)}
    />
  );
}

import CodePanel from '../../components/algorithm/CodePanel';
import { PRIM_CODE } from './types';

/*
  Line map:
   9-10 = key[0]=0, pq init       (INIT)
   14   = heappop                  (EXTRACT_MIN)
   16-17= if in_mst / continue    (ALREADY_IN_MST)
   19-20= in_mst[u]=True, cost+=k (ADD_TO_MST)
   22-26= for neighbor / update   (UPDATE)
   28   = return                   (DONE)
*/

function isHighlighted(lineNum: number, codeLine: number): boolean {
  if (codeLine === 9  && lineNum >= 9  && lineNum <= 10) return true; // INIT
  if (codeLine === 14 && lineNum === 14)                 return true; // EXTRACT_MIN
  if (codeLine === 16 && lineNum >= 16 && lineNum <= 17) return true; // ALREADY_IN_MST
  if (codeLine === 19 && lineNum >= 19 && lineNum <= 20) return true; // ADD_TO_MST
  if (codeLine === 22 && lineNum >= 22 && lineNum <= 26) return true; // UPDATE
  if (codeLine === 28 && lineNum === 28)                 return true; // DONE
  return false;
}

interface Props {
  codeLine: number;
}

export default function PrimCodeViewer({ codeLine }: Props) {
  return (
    <CodePanel
      title="prim.py"
      code={PRIM_CODE}
      isLineHighlighted={(line) => isHighlighted(line, codeLine)}
    />
  );
}

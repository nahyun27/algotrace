import CodePanel from '../../components/algorithm/CodePanel';
import { ASTAR_GRID_CODE } from './gridTypes';

interface Props {
  codeLine: number;
}

function isHighlighted(lineNum: number, codeLine: number): boolean {
  if (codeLine === 12 && lineNum >= 11 && lineNum <= 14) return true; // INIT
  if (codeLine === 17 && lineNum === 17) return true; // DEQUEUE
  if (codeLine === 19 && lineNum >= 19 && lineNum <= 20) return true; // DONE
  if (codeLine === 22 && lineNum >= 21 && lineNum <= 23) return true; // CLOSE
  if (codeLine === 27 && lineNum >= 25 && lineNum <= 33) return true; // RELAX
  if (codeLine === 32 && lineNum === 35) return true; // NO_PATH
  return false;
}

export default function GridAStarCodeViewer({ codeLine }: Props) {
  return (
    <CodePanel
      title="astar_grid.py"
      code={ASTAR_GRID_CODE}
      isLineHighlighted={(line) => isHighlighted(line, codeLine)}
    />
  );
}

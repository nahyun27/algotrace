import { Crown, Route } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import GridView, { type GridCellState } from '../../components/viz/GridView';
import { useTr } from '../../i18n';
import { attackedCells } from './solver';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/**
 * A 4×4 board for the storyboard. `board[r]` is the queen column of row r (-1 = empty);
 * `marks` overrides the state of single cells, e.g. { '1,2': 'candidate' }.
 */
function board4(board: number[], queenState: GridCellState, marks: Record<string, GridCellState> = {}) {
  const attacked = attackedCells(board);
  return (
    <GridView
      rows={4}
      cols={4}
      cellSize="md"
      wallStyle="hatched"
      isWall={(r, c) => attacked[r][c] && board[r] !== c && !marks[`${r},${c}`]}
      cellState={(r, c) => marks[`${r},${c}`] ?? (board[r] === c ? queenState : 'idle')}
      cellText={(r, c) => (board[r] === c || marks[`${r},${c}`] === 'candidate'
        ? <Crown className="w-5 h-5" strokeWidth={2.4} aria-hidden />
        : null)}
    />
  );
}

export default function BacktrackingInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Crown}
      title={tr('백트래킹', 'Backtracking')}
      subtitle={tr('N-Queen과 스도쿠로 배우는 되돌아가기 탐색', 'Search by stepping back, with N-Queens and Sudoku')}
      summary={tr(
        '하나씩 골라 보다가 규칙이 깨지면 바로 한 걸음 되돌아가서 다른 것을 골라요.',
        'Make one choice at a time. As soon as a rule breaks, step back once and try something else.',
      )}
      analogy={{
        icon: Route,
        title: tr('미로에서 길 찾기', 'Finding your way in a maze'),
        body: tr(
          '갈림길마다 한 길을 골라 들어가요. 막다른 길이 나오면 바로 앞 갈림길로 돌아가서 아직 안 가 본 길을 골라요. 막힌 길 끝까지 다시 가는 일은 없어요.',
          'At every fork, pick one path. When you hit a dead end, walk back to the last fork and pick a path you have not tried. You never walk a blocked path twice.',
        ),
      }}
      storyboard={[
        {
          visual: board4([0, -1, -1, -1], 'current'),
          caption: tr('0번 행 맨 왼쪽에 퀸을 놓아요. 줄무늬 칸은 이 퀸이 공격하는 칸이에요.', 'Put a queen at the left of row 0. Striped squares are attacked by it.'),
        },
        {
          visual: board4([0, 2, -1, -1], 'visited', { '1,2': 'current' }),
          caption: tr('1번 행에서 공격받지 않는 첫 칸은 2번 열이에요. 여기에 놓아요.', 'In row 1, the first safe square is column 2. Put a queen there.'),
        },
        {
          visual: board4([0, 2, -1, -1], 'visited', { '2,0': 'danger', '2,1': 'danger', '2,2': 'danger', '2,3': 'danger' }),
          caption: tr('2번 행은 모든 칸이 공격받아요. 막다른 길이에요.', 'Every square in row 2 is attacked. Dead end.'),
        },
        {
          visual: board4([0, -1, -1, -1], 'visited', { '1,2': 'candidate' }),
          caption: tr('한 걸음 되돌아가요. 1번 행의 퀸을 치우고 다음 칸을 시도해요.', 'Step back. Remove the queen in row 1 and try its next square.'),
        },
        {
          visual: board4([1, -1, -1, -1], 'current', { '0,0': 'candidate' }),
          caption: tr('계속 막히면 0번 행까지 돌아가서 퀸을 한 칸 옮겨요.', 'If it keeps failing, go all the way back to row 0 and move that queen one square.'),
        },
        {
          visual: board4([1, 3, 0, 2], 'path'),
          caption: tr('이번에는 네 행 모두에 퀸을 놓았어요. 해를 하나 찾았어요!', 'This time every row gets a queen. One solution found!'),
        },
      ]}
      steps={[
        tr('맨 위 행부터 한 행에 하나씩 퀸(또는 빈칸의 숫자)을 골라요.', 'Start at the top row and choose one queen per row (or one digit per blank).'),
        tr('고른 것이 규칙을 어기는지 바로 확인해요. 어기면 그 선택은 버려요.', 'Check the rules right away. If the choice breaks one, drop it.'),
        tr('괜찮으면 다음 행으로 내려가요.', 'If it is fine, go down to the next row.'),
        tr('어떤 선택도 안 되면 방금 놓은 것을 치우고 위 행으로 돌아가요.', 'If nothing works, remove the last piece and go back up a row.'),
        tr('마지막 행까지 채우면 해를 하나 찾은 거예요.', 'When the last row is filled, you have found a solution.'),
      ]}
      useWhen={[
        tr('가능한 조합을 모두 찾거나 세야 할 때 (순열, 부분집합)', 'You must list or count every combination (permutations, subsets)'),
        tr('퍼즐처럼 규칙을 지키는 배치를 찾을 때 (N-Queen, 스도쿠)', 'You need a layout that follows rules, like a puzzle (N-Queens, Sudoku)'),
        tr('입력이 작아서 모든 경우를 봐도 될 때', 'The input is small enough to look at every case'),
      ]}
      watchOut={[
        tr('되돌아갈 때 바꾼 것을 꼭 원래대로 돌려놔야 해요.', 'Always undo what you changed when you step back.'),
        tr('규칙 검사가 느리면 전체가 느려져요. 쓴 열과 대각선을 배열에 기록해 두세요.', 'Slow rule checks make everything slow. Keep arrays of used columns and diagonals.'),
        tr('N이 커지면 경우의 수가 폭발해요. 가지치기를 최대한 일찍 하세요.', 'The number of cases explodes as N grows. Prune as early as you can.'),
      ]}
      complexity={{
        time: 'O(N!)',
        space: 'O(N)',
        plain: tr(
          'N-Queen은 행마다 남은 열을 고르니 최악이면 N!가지예요. 기억할 것은 행마다 열 하나뿐이라 메모리는 N이에요. 스도쿠는 빈칸이 E개면 최악 9의 E제곱이고 메모리는 81칸이지만, 가지치기 덕분에 실제로는 금방 끝나요.',
          'N-Queens picks a free column for each row, so the worst case is N! layouts. It only remembers one column per row, so memory is N. Sudoku with E blanks is 9 to the power E in the worst case with 81 cells of memory, but pruning makes it finish quickly in practice.',
        ),
      }}
    />
  );
}

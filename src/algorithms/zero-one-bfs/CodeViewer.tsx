import CodePanel from '../../components/algorithm/CodePanel';
import { LINE } from './solver';

const CODE = `from collections import deque

def zero_one_bfs(grid):  # 1 = wall, 0 = empty
    n, m = len(grid), len(grid[0])
    dist = [[float('inf')] * m for _ in range(n)]
    dist[0][0] = 0
    dq = deque([(0, 0)])
    done = [[False] * m for _ in range(n)]

    while dq:
        r, c = dq.popleft()
        if done[r][c]: continue
        done[r][c] = True
        if (r, c) == (n - 1, m - 1): break

        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < n and 0 <= nc < m): continue
            w = grid[nr][nc]  # cost of entering the cell
            if dist[r][c] + w < dist[nr][nc]:
                dist[nr][nc] = dist[r][c] + w
                if w == 0:
                    dq.appendleft((nr, nc))  # 0-cost: front
                else:
                    dq.append((nr, nc))      # 1-cost: back

    return dist[n - 1][m - 1]`;

/** Lines highlighted for each step's codeLine */
const HIGHLIGHT: Record<number, number[]> = {
  [LINE.INIT]: [4, 5, 6, 7, 8],
  [LINE.POP]: [10, 11, 12, 13],
  [LINE.STALE]: [11, 12],
  [LINE.SKIP]: [19, 20],
  [LINE.PUSH_FRONT]: [19, 20, 21, 22, 23],
  [LINE.PUSH_BACK]: [19, 20, 21, 24, 25],
  [LINE.DONE]: [14, 27],
};

export default function ZeroOneBFSCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="zero_one_bfs.py"
      code={CODE}
      isLineHighlighted={(line) => HIGHLIGHT[codeLine]?.includes(line) ?? false}
    />
  );
}

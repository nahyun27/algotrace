import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
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
const PY_LINES: LineMap = {
  [LINE.INIT]: [[4, 8]],
  [LINE.POP]: [[10, 13]],
  [LINE.STALE]: [[11, 12]],
  [LINE.SKIP]: [[19, 20]],
  [LINE.PUSH_FRONT]: [[19, 23]],
  [LINE.PUSH_BACK]: [[19, 21], [24, 25]],
  [LINE.DONE]: [[14, 14], [27, 27]],
};

const CPP = `#include <bits/stdc++.h>
using namespace std;

int zeroOneBfs(const vector<vector<int>>& grid) {  // 1 = wall, 0 = empty
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> dist(n, vector<int>(m, INT_MAX));
    dist[0][0] = 0;
    deque<pair<int, int>> dq = {{0, 0}};
    vector<vector<bool>> done(n, vector<bool>(m, false));

    int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
    while (!dq.empty()) {
        auto [r, c] = dq.front(); dq.pop_front();
        if (done[r][c]) continue;
        done[r][c] = true;
        if (r == n - 1 && c == m - 1) break;

        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            int w = grid[nr][nc];  // cost of entering the cell
            if (dist[r][c] + w < dist[nr][nc]) {
                dist[nr][nc] = dist[r][c] + w;
                if (w == 0) {
                    dq.push_front({nr, nc});  // 0-cost: front
                } else {
                    dq.push_back({nr, nc});   // 1-cost: back
                }
            }
        }
    }
    return dist[n - 1][m - 1];
}`;

const CPP_LINES: LineMap = {
  [LINE.INIT]: [[5, 9]],
  [LINE.POP]: [[12, 15]],
  [LINE.STALE]: [[13, 14]],
  [LINE.SKIP]: [[21, 22]],
  [LINE.PUSH_FRONT]: [[21, 25]],
  [LINE.PUSH_BACK]: [[21, 23], [26, 27]],
  [LINE.DONE]: [[16, 16], [32, 32]],
};

const JAVA = `import java.util.*;

class ZeroOneBfs {
    static int zeroOneBfs(int[][] grid) {  // 1 = wall, 0 = empty
        int n = grid.length, m = grid[0].length;
        int[][] dist = new int[n][m];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
        dist[0][0] = 0;
        Deque<int[]> dq = new ArrayDeque<>(List.of(new int[]{0, 0}));
        boolean[][] done = new boolean[n][m];

        int[] dr = {-1, 1, 0, 0}, dc = {0, 0, -1, 1};
        while (!dq.isEmpty()) {
            int[] cur = dq.pollFirst();
            int r = cur[0], c = cur[1];
            if (done[r][c]) continue;
            done[r][c] = true;
            if (r == n - 1 && c == m - 1) break;

            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
                int w = grid[nr][nc];  // cost of entering the cell
                if (dist[r][c] + w < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + w;
                    if (w == 0) {
                        dq.addFirst(new int[]{nr, nc});  // 0-cost: front
                    } else {
                        dq.addLast(new int[]{nr, nc});   // 1-cost: back
                    }
                }
            }
        }
        return dist[n - 1][m - 1];
    }
}`;

const JAVA_LINES: LineMap = {
  [LINE.INIT]: [[5, 10]],
  [LINE.POP]: [[13, 17]],
  [LINE.STALE]: [[14, 16]],
  [LINE.SKIP]: [[23, 24]],
  [LINE.PUSH_FRONT]: [[23, 27]],
  [LINE.PUSH_BACK]: [[23, 25], [28, 29]],
  [LINE.DONE]: [[18, 18], [34, 34]],
};

export default function ZeroOneBFSCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="zero_one_bfs.py"
      code={CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

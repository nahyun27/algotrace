import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const ASTAR_GRID_CODE = `import heapq

def astar(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    INF = float('inf')

    def h(p):  # Manhattan distance
        return abs(p[0] - goal[0]) + abs(p[1] - goal[1])

    g = [[INF] * cols for _ in range(rows)]
    parent = [[None] * cols for _ in range(rows)]
    g[start[0]][start[1]] = 0

    open_set = [(h(start), 0, start)]   # (f, g, pos)
    closed = set()

    while open_set:
        f, gc, (r, c) = heapq.heappop(open_set)

        if (r, c) == goal:
            return reconstruct(parent, start, goal)
        if (r, c) in closed:
            continue
        closed.add((r, c))

        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols): continue
            if grid[nr][nc] == 1: continue   # wall
            tentative = gc + 1
            if tentative < g[nr][nc]:
                g[nr][nc] = tentative
                parent[nr][nc] = (r, c)
                heapq.heappush(open_set, (tentative + h((nr, nc)), tentative, (nr, nc)))

    return []  # no path
`;

// Keys are the solver's codeLine values: 12 INIT, 17 DEQUEUE, 19 DONE, 22 CLOSE, 27 RELAX, 32 NO_PATH
const PY_LINES: LineMap = { 12: [[10, 15]], 17: [[17, 18]], 19: [[20, 21]], 22: [[22, 24]], 27: [[26, 34]], 32: [[36, 36]] };

const ASTAR_GRID_CPP = `#include <bits/stdc++.h>
using namespace std;

using Pos = pair<int, int>;
vector<Pos> reconstruct(const vector<vector<Pos>>& parent, Pos start, Pos goal);

vector<Pos> astar(const vector<vector<int>>& grid, Pos start, Pos goal) {
    int rows = grid.size(), cols = grid[0].size();

    auto h = [&](Pos p) {  // Manhattan distance
        return abs(p.first - goal.first) + abs(p.second - goal.second);
    };

    vector<vector<int>> g(rows, vector<int>(cols, INT_MAX));
    vector<vector<Pos>> parent(rows, vector<Pos>(cols, {-1, -1}));
    g[start.first][start.second] = 0;

    // (f, g, pos), smallest f first
    priority_queue<tuple<int, int, Pos>, vector<tuple<int, int, Pos>>, greater<>> openSet;
    openSet.push({h(start), 0, start});
    set<Pos> closed;

    while (!openSet.empty()) {
        auto [f, gc, cur] = openSet.top(); openSet.pop();
        auto [r, c] = cur;

        if (cur == goal) {
            return reconstruct(parent, start, goal);
        }
        if (closed.count(cur)) {
            continue;
        }
        closed.insert(cur);

        int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (grid[nr][nc] == 1) continue;  // wall
            int tentative = gc + 1;
            if (tentative < g[nr][nc]) {
                g[nr][nc] = tentative;
                parent[nr][nc] = cur;
                openSet.push({tentative + h({nr, nc}), tentative, {nr, nc}});
            }
        }
    }
    return {};  // no path
}

vector<Pos> reconstruct(const vector<vector<Pos>>& parent, Pos start, Pos goal) {
    vector<Pos> path;
    for (Pos p = goal; p != start; p = parent[p.first][p.second]) path.push_back(p);
    path.push_back(start);
    reverse(path.begin(), path.end());
    return path;
}`;

const CPP_LINES: LineMap = { 12: [[14, 21]], 17: [[23, 25]], 19: [[27, 29]], 22: [[30, 33]], 27: [[35, 46]], 32: [[48, 48]] };

const ASTAR_GRID_JAVA = `import java.util.*;

class AStarGrid {
    static int h(int r, int c, int[] goal) {  // Manhattan distance
        return Math.abs(r - goal[0]) + Math.abs(c - goal[1]);
    }

    static List<int[]> astar(int[][] grid, int[] start, int[] goal) {
        int rows = grid.length, cols = grid[0].length;
        int[][] g = new int[rows][cols];
        for (int[] row : g) Arrays.fill(row, Integer.MAX_VALUE);
        int[][][] parent = new int[rows][cols][];
        g[start[0]][start[1]] = 0;

        // {f, g, r, c}, smallest f first
        PriorityQueue<int[]> openSet = new PriorityQueue<>((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
        openSet.add(new int[]{h(start[0], start[1], goal), 0, start[0], start[1]});
        boolean[][] closed = new boolean[rows][cols];

        while (!openSet.isEmpty()) {
            int[] top = openSet.poll();
            int gc = top[1], r = top[2], c = top[3];

            if (r == goal[0] && c == goal[1]) {
                return reconstruct(parent, start, goal);
            }
            if (closed[r][c]) {
                continue;
            }
            closed[r][c] = true;

            int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] == 1) continue;  // wall
                int tentative = gc + 1;
                if (tentative < g[nr][nc]) {
                    g[nr][nc] = tentative;
                    parent[nr][nc] = new int[]{r, c};
                    openSet.add(new int[]{tentative + h(nr, nc, goal), tentative, nr, nc});
                }
            }
        }
        return new ArrayList<>();  // no path
    }

    static List<int[]> reconstruct(int[][][] parent, int[] start, int[] goal) {
        List<int[]> path = new ArrayList<>();
        for (int[] p = goal; p[0] != start[0] || p[1] != start[1]; p = parent[p[0]][p[1]]) path.add(p);
        path.add(start);
        Collections.reverse(path);
        return path;
    }
}`;

const JAVA_LINES: LineMap = { 12: [[10, 18]], 17: [[20, 22]], 19: [[24, 26]], 22: [[27, 30]], 27: [[32, 43]], 32: [[45, 45]] };

export default function GridAStarCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="astar_grid.py"
      code={ASTAR_GRID_CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: ASTAR_GRID_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: ASTAR_GRID_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

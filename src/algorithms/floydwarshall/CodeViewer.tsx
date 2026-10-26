import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const FW_CODE = `import math

def floyd_warshall(n, edges):
    # 거리 행렬 초기화
    dist = [[math.inf] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    next_node = [[None] * n for _ in range(n)]
    for u, v, w in edges:
        dist[u][v] = w
        next_node[u][v] = v

    # 경유 노드 k를 하나씩 추가하며 갱신
    for k in range(n):
        for i in range(n):
            for j in range(n):
                new_d = dist[i][k] + dist[k][j]
                if new_d < dist[i][j]:
                    dist[i][j] = new_d
                    next_node[i][j] = next_node[i][k]

    # 음수 사이클 감지: 대각선 확인
    for i in range(n):
        if dist[i][i] < 0:
            return None  # 음수 사이클 존재

    return dist, next_node


def get_path(next_node, u, v):
    if next_node[u][v] is None:
        return []  # 경로 없음
    path = [u]
    while u != v:
        u = next_node[u][v]
        path.append(u)
    return path`;

// Keys are the solver's codeLine values: 5 INIT, 14 ROUND_START, 17 NO_UPDATE, 19 UPDATE, 24 NEGATIVE_CYCLE, 27 DONE
const PY_LINES: LineMap = { 5: [[5, 11]], 14: [[14, 16]], 17: [[17, 18]], 19: [[17, 20]], 24: [[23, 25]], 27: [[27, 27]] };

const FW_CPP = `#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;

// Fills dist and nextNode. Returns false on a negative cycle.
bool floydWarshall(int n, const vector<array<int, 3>>& edges,
                   vector<vector<long long>>& dist, vector<vector<int>>& nextNode) {
    // initialize the distance matrix
    dist.assign(n, vector<long long>(n, INF));
    for (int i = 0; i < n; i++)
        dist[i][i] = 0;
    nextNode.assign(n, vector<int>(n, -1));
    for (auto [u, v, w] : edges) {
        dist[u][v] = w;
        nextNode[u][v] = v;
    }

    // add intermediate nodes k one at a time
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) {
                if (dist[i][k] == INF || dist[k][j] == INF) continue;
                long long newD = dist[i][k] + dist[k][j];
                if (newD < dist[i][j]) {
                    dist[i][j] = newD;
                    nextNode[i][j] = nextNode[i][k];
                }
            }

    // negative cycle check: look at the diagonal
    for (int i = 0; i < n; i++)
        if (dist[i][i] < 0)
            return false;  // negative cycle exists

    return true;
}

vector<int> getPath(const vector<vector<int>>& nextNode, int u, int v) {
    if (nextNode[u][v] == -1)
        return {};  // no path
    vector<int> path = {u};
    while (u != v) {
        u = nextNode[u][v];
        path.push_back(u);
    }
    return path;
}`;

const CPP_LINES: LineMap = { 5: [[10, 17]], 14: [[20, 22]], 17: [[23, 25]], 19: [[23, 28]], 24: [[32, 34]], 27: [[36, 36]] };

const FW_JAVA = `import java.util.*;

class FloydWarshall {
    static final long INF = Long.MAX_VALUE / 4;
    static long[][] dist;
    static int[][] nextNode;

    // Fills dist and nextNode. Returns false on a negative cycle.
    static boolean floydWarshall(int n, int[][] edges) {
        // initialize the distance matrix
        dist = new long[n][n];
        for (long[] row : dist) Arrays.fill(row, INF);
        for (int i = 0; i < n; i++)
            dist[i][i] = 0;
        nextNode = new int[n][n];
        for (int[] row : nextNode) Arrays.fill(row, -1);
        for (int[] e : edges) {
            dist[e[0]][e[1]] = e[2];
            nextNode[e[0]][e[1]] = e[1];
        }

        // add intermediate nodes k one at a time
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++) {
                    if (dist[i][k] == INF || dist[k][j] == INF) continue;
                    long newD = dist[i][k] + dist[k][j];
                    if (newD < dist[i][j]) {
                        dist[i][j] = newD;
                        nextNode[i][j] = nextNode[i][k];
                    }
                }

        // negative cycle check: look at the diagonal
        for (int i = 0; i < n; i++)
            if (dist[i][i] < 0)
                return false;  // negative cycle exists

        return true;
    }

    static List<Integer> getPath(int u, int v) {
        if (nextNode[u][v] == -1)
            return new ArrayList<>();  // no path
        List<Integer> path = new ArrayList<>(List.of(u));
        while (u != v) {
            u = nextNode[u][v];
            path.add(u);
        }
        return path;
    }
}`;

const JAVA_LINES: LineMap = { 5: [[11, 20]], 14: [[23, 25]], 17: [[26, 28]], 19: [[26, 31]], 24: [[35, 37]], 27: [[39, 39]] };

export default function FWCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="floyd_warshall.py"
      code={FW_CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: FW_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: FW_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

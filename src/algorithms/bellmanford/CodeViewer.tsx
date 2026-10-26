import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const BF_CODE = `import math

def bellman_ford(graph, n, start):
    dist = [math.inf] * n
    dist[start] = 0

    # V-1번 반복: 모든 간선 완화
    for i in range(n - 1):
        updated = 0
        for u, v, w in graph:
            if dist[u] != math.inf:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    updated += 1
        if updated == 0:
            break  # 갱신이 없으면 조기 종료

    # V번째 라운드: 음수 사이클 감지
    for u, v, w in graph:
        if dist[u] != math.inf:
            if dist[u] + w < dist[v]:
                return None  # 음수 사이클 존재

    return dist`;

// Keys are the solver's codeLine values:
// 4 INIT, 8 ROUND_START, 11 RELAX (no change), 12 RELAX (update), 13 ROUND_END, 18 NEGATIVE_CYCLE, 20 DONE
const PY_LINES: LineMap = { 4: [[3, 5]], 8: [[8, 9]], 11: [[10, 12]], 12: [[10, 14]], 13: [[15, 16]], 18: [[19, 22]], 20: [[24, 24]] };

const BF_CPP = `#include <bits/stdc++.h>
using namespace std;

const long long INF = LLONG_MAX;

// graph: edges (u, v, w). Returns an empty vector on a negative cycle.
vector<long long> bellmanFord(const vector<array<int, 3>>& graph, int n, int start) {
    vector<long long> dist(n, INF);
    dist[start] = 0;

    // V-1 rounds: relax every edge
    for (int i = 0; i < n - 1; i++) {
        int updated = 0;
        for (auto [u, v, w] : graph) {
            if (dist[u] != INF) {
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    updated++;
                }
            }
        }
        if (updated == 0) {
            break;  // no update: stop early
        }
    }

    // round V: detect a negative cycle
    for (auto [u, v, w] : graph) {
        if (dist[u] != INF) {
            if (dist[u] + w < dist[v]) {
                return {};  // negative cycle exists
            }
        }
    }
    return dist;
}`;

const CPP_LINES: LineMap = { 4: [[7, 9]], 8: [[12, 13]], 11: [[14, 16]], 12: [[14, 18]], 13: [[22, 23]], 18: [[28, 31]], 20: [[35, 35]] };

const BF_JAVA = `import java.util.*;

class BellmanFord {
    static final long INF = Long.MAX_VALUE;

    // graph: edges {u, v, w}. Returns null on a negative cycle.
    static long[] bellmanFord(int[][] graph, int n, int start) {
        long[] dist = new long[n];
        Arrays.fill(dist, INF);
        dist[start] = 0;

        // V-1 rounds: relax every edge
        for (int i = 0; i < n - 1; i++) {
            int updated = 0;
            for (int[] e : graph) {
                int u = e[0], v = e[1], w = e[2];
                if (dist[u] != INF) {
                    if (dist[u] + w < dist[v]) {
                        dist[v] = dist[u] + w;
                        updated++;
                    }
                }
            }
            if (updated == 0) {
                break;  // no update: stop early
            }
        }

        // round V: detect a negative cycle
        for (int[] e : graph) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != INF) {
                if (dist[u] + w < dist[v]) {
                    return null;  // negative cycle exists
                }
            }
        }
        return dist;
    }
}`;

const JAVA_LINES: LineMap = { 4: [[7, 10]], 8: [[13, 14]], 11: [[15, 18]], 12: [[15, 20]], 13: [[24, 25]], 18: [[30, 34]], 20: [[38, 38]] };

export default function BFCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="bellman_ford.py"
      code={BF_CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: BF_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: BF_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

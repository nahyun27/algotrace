import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const DIJKSTRA_CODE = `import heapq

def dijkstra(graph, start):
    dist = [float('inf')] * n
    dist[start] = 0
    pq = [(0, start)]  # (cost, node)

    while pq:
        cost, u = heapq.heappop(pq)
        if visited[u]: continue
        visited[u] = True

        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))

    return dist`;

// Keys are the solver's codeLine values: 1 INIT, 4 DEQUEUE, 6 VISITED, 9 RELAX (no change), 10 RELAX (update), 12 DONE
const PY_LINES: LineMap = { 1: [[3, 6]], 4: [[8, 10]], 6: [[11, 11]], 9: [[13, 14]], 10: [[13, 16]], 12: [[18, 18]] };

const DIJKSTRA_CPP = `#include <bits/stdc++.h>
using namespace std;

vector<long long> dijkstra(vector<vector<pair<int, int>>>& graph, int start) {
    int n = graph.size();
    vector<long long> dist(n, LLONG_MAX);
    vector<bool> visited(n, false);
    dist[start] = 0;
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [cost, u] = pq.top(); pq.pop();
        if (visited[u]) continue;
        visited[u] = true;

        for (auto [v, w] : graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`;

const CPP_LINES: LineMap = { 1: [[4, 10]], 4: [[12, 14]], 6: [[15, 15]], 9: [[17, 18]], 10: [[17, 21]], 12: [[24, 24]] };

const DIJKSTRA_JAVA = `import java.util.*;

class Dijkstra {
    static long[] dijkstra(List<List<int[]>> graph, int start) {
        int n = graph.size();
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE);
        boolean[] visited = new boolean[n];
        dist[start] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
        pq.add(new long[]{0, start});

        while (!pq.isEmpty()) {
            long[] top = pq.poll();
            int u = (int) top[1];
            if (visited[u]) continue;
            visited[u] = true;

            for (int[] e : graph.get(u)) {
                int v = e[0], w = e[1];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.add(new long[]{dist[v], v});
                }
            }
        }
        return dist;
    }
}`;

const JAVA_LINES: LineMap = { 1: [[4, 11]], 4: [[13, 16]], 6: [[17, 17]], 9: [[19, 21]], 10: [[19, 24]], 12: [[27, 27]] };

export default function DijkstraCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="dijkstra.py"
      code={DIJKSTRA_CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: DIJKSTRA_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: DIJKSTRA_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

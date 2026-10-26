import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const ASTAR_CODE_STR = [
  "import heapq",
  "import math",
  "",
  "def heuristic(u, v, pos):",
  "    # 유클리드 거리 (직선 거리) 계산",
  "    x1, y1 = pos[u]",
  "    x2, y2 = pos[v]",
  "    return math.hypot(x1 - x2, y1 - y2)",
  "",
  "def astar(graph, start, goal, pos):",
  "    n = len(graph)",
  "    g_score = {i: float('inf') for i in range(n)}",
  "    f_score = {i: float('inf') for i in range(n)}",
  "    ",
  "    g_score[start] = 0",
  "    f_score[start] = heuristic(start, goal, pos)",
  "    ",
  "    # 우선순위 큐: (f_score, 노드)",
  "    open_set = [(f_score[start], start)]",
  "    closed_set = set()",
  "    parent = {start: None}",
  "",
  "    while open_set:",
  "        current_f, u = heapq.heappop(open_set)",
  "",
  "        if u == goal:",
  "            return reconstruct_path(parent, goal)",
  "            ",
  "        if u in closed_set: continue",
  "        closed_set.add(u)",
  "",
  "        for v, weight in graph[u]:",
  "            tentative_g = g_score[u] + weight",
  "",
  "            # 더 나은 경로를 발견한 경우",
  "            if tentative_g < g_score[v]:",
  "                parent[v] = u",
  "                g_score[v] = tentative_g",
  "                f_score[v] = g_score[v] + heuristic(v, goal, pos)",
  "                ",
  "                # open_set에 업데이트된 정보 추가",
  "                heapq.heappush(open_set, (f_score[v], v))",
  "",
  "    return None # 목표 도달 불가"
].join('\n');

// Keys are the solver's codeLine values: 8 INIT, 13 DEQUEUE / CLOSE, 15 DONE, 18 RELAX
const PY_LINES: LineMap = { 8: [[11, 20]], 13: [[23, 24]], 15: [[26, 27]], 18: [[32, 36]] };

const ASTAR_CPP = `#include <bits/stdc++.h>
using namespace std;

double heuristic(int u, int v, const vector<pair<double, double>>& pos) {
    // Euclidean (straight-line) distance
    auto [x1, y1] = pos[u];
    auto [x2, y2] = pos[v];
    return hypot(x1 - x2, y1 - y2);
}

vector<int> reconstructPath(const vector<int>& parent, int goal);

vector<int> astar(const vector<vector<pair<int, double>>>& graph, int start, int goal,
                  const vector<pair<double, double>>& pos) {
    int n = graph.size();
    vector<double> gScore(n, INFINITY);
    vector<double> fScore(n, INFINITY);

    gScore[start] = 0;
    fScore[start] = heuristic(start, goal, pos);

    // priority queue of (f_score, node), smallest f first
    priority_queue<pair<double, int>, vector<pair<double, int>>, greater<>> openSet;
    openSet.push({fScore[start], start});
    vector<bool> closedSet(n, false);
    vector<int> parent(n, -1);

    while (!openSet.empty()) {
        auto [currentF, u] = openSet.top(); openSet.pop();

        if (u == goal) {
            return reconstructPath(parent, goal);
        }
        if (closedSet[u]) continue;
        closedSet[u] = true;

        for (auto [v, weight] : graph[u]) {
            double tentativeG = gScore[u] + weight;

            // found a better path
            if (tentativeG < gScore[v]) {
                parent[v] = u;
                gScore[v] = tentativeG;
                fScore[v] = gScore[v] + heuristic(v, goal, pos);

                // push the updated entry into the open set
                openSet.push({fScore[v], v});
            }
        }
    }
    return {};  // goal unreachable
}

vector<int> reconstructPath(const vector<int>& parent, int goal) {
    vector<int> path;
    for (int v = goal; v != -1; v = parent[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    return path;
}`;

const CPP_LINES: LineMap = { 8: [[15, 25]], 13: [[28, 29]], 15: [[31, 33]], 18: [[37, 41]] };

const ASTAR_JAVA = `import java.util.*;

class AStar {
    static double heuristic(int u, int v, double[][] pos) {
        // Euclidean (straight-line) distance
        double x1 = pos[u][0], y1 = pos[u][1];
        double x2 = pos[v][0], y2 = pos[v][1];
        return Math.hypot(x1 - x2, y1 - y2);
    }

    static List<Integer> astar(List<List<int[]>> graph, int start, int goal, double[][] pos) {
        int n = graph.size();
        double[] gScore = new double[n];
        double[] fScore = new double[n];
        Arrays.fill(gScore, Double.POSITIVE_INFINITY);
        Arrays.fill(fScore, Double.POSITIVE_INFINITY);
        gScore[start] = 0;
        fScore[start] = heuristic(start, goal, pos);

        // priority queue of (f_score, node), smallest f first
        PriorityQueue<double[]> openSet = new PriorityQueue<>((a, b) -> Double.compare(a[0], b[0]));
        openSet.add(new double[]{fScore[start], start});
        boolean[] closedSet = new boolean[n];
        int[] parent = new int[n];
        Arrays.fill(parent, -1);

        while (!openSet.isEmpty()) {
            double[] top = openSet.poll();
            int u = (int) top[1];

            if (u == goal) {
                return reconstructPath(parent, goal);
            }
            if (closedSet[u]) continue;
            closedSet[u] = true;

            for (int[] e : graph.get(u)) {
                int v = e[0], weight = e[1];
                double tentativeG = gScore[u] + weight;

                // found a better path
                if (tentativeG < gScore[v]) {
                    parent[v] = u;
                    gScore[v] = tentativeG;
                    fScore[v] = gScore[v] + heuristic(v, goal, pos);

                    // push the updated entry into the open set
                    openSet.add(new double[]{fScore[v], v});
                }
            }
        }
        return null;  // goal unreachable
    }

    static List<Integer> reconstructPath(int[] parent, int goal) {
        List<Integer> path = new ArrayList<>();
        for (int v = goal; v != -1; v = parent[v]) path.add(v);
        Collections.reverse(path);
        return path;
    }
}`;

const JAVA_LINES: LineMap = { 8: [[12, 23]], 13: [[27, 29]], 15: [[31, 33]], 18: [[37, 42]] };

export default function CodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="astar.py"
      code={ASTAR_CODE_STR}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: ASTAR_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: ASTAR_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

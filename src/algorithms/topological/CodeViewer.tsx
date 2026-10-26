import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import { KAHN_CODE, DFS_TOPO_CODE } from './types';

/*
  Kahn codeLine values: 4 INIT, 11 ENQUEUE (initial), 16 DEQUEUE, 19 DECREASE,
  21 DECREASE + ENQUEUE, 24 CYCLE_DETECTED, 25 DONE.
  DFS codeLine values: 7 VISIT, 11 traverse edge, 13 CYCLE_DETECTED (back edge), 16 FINISH, 22 DONE.
*/

const KAHN_PY_LINES: LineMap = {
  4: [[4, 7]], 11: [[9, 12]], 16: [[15, 17]], 19: [[19, 20]], 21: [[19, 22]], 24: [[24, 25]], 25: [[26, 26]],
};

const KAHN_CPP = `#include <bits/stdc++.h>
using namespace std;

vector<int> topologicalKahn(vector<vector<int>>& graph, int n) {
    vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++)
        for (int v : graph[u])
            inDegree[v]++;

    queue<int> q;
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0)
            q.push(i);

    vector<int> result;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        result.push_back(u);

        for (int v : graph[u]) {
            inDegree[v]--;
            if (inDegree[v] == 0)
                q.push(v);
        }
    }

    if ((int)result.size() != n)
        return {};  // cycle detected
    return result;
}`;

const KAHN_CPP_LINES: LineMap = {
  4: [[5, 8]], 11: [[10, 13]], 16: [[16, 18]], 19: [[20, 21]], 21: [[20, 23]], 24: [[27, 28]], 25: [[29, 29]],
};

const KAHN_JAVA = `import java.util.*;

class TopologicalKahn {
    static List<Integer> topologicalKahn(List<List<Integer>> graph, int n) {
        int[] inDegree = new int[n];
        for (int u = 0; u < n; u++)
            for (int v : graph.get(u))
                inDegree[v]++;

        Deque<Integer> queue = new ArrayDeque<>();
        for (int i = 0; i < n; i++)
            if (inDegree[i] == 0)
                queue.add(i);

        List<Integer> result = new ArrayList<>();
        while (!queue.isEmpty()) {
            int u = queue.poll();
            result.add(u);

            for (int v : graph.get(u)) {
                inDegree[v]--;
                if (inDegree[v] == 0)
                    queue.add(v);
            }
        }

        if (result.size() != n)
            return null;  // cycle detected
        return result;
    }
}`;

const KAHN_JAVA_LINES: LineMap = {
  4: [[5, 8]], 11: [[10, 13]], 16: [[16, 18]], 19: [[20, 21]], 21: [[20, 23]], 24: [[27, 28]], 25: [[29, 29]],
};

const DFS_PY_LINES: LineMap = { 7: [[7, 8]], 11: [[10, 12]], 13: [[13, 14]], 16: [[16, 17]], 22: [[22, 22]] };

const DFS_CPP = `#include <bits/stdc++.h>
using namespace std;

vector<int> topologicalDFS(vector<vector<int>>& graph, int n) {
    vector<bool> visited(n, false), inStack(n, false);
    vector<int> stack;
    bool hasCycle = false;

    function<void(int)> dfs = [&](int u) {
        visited[u] = true;
        inStack[u] = true;

        for (int v : graph[u]) {
            if (!visited[v]) {
                dfs(v);
            } else if (inStack[v]) {  // back edge: cycle
                hasCycle = true;
                return;
            }
        }

        inStack[u] = false;
        stack.push_back(u);
    };

    for (int i = 0; i < n; i++)
        if (!visited[i])
            dfs(i);

    if (hasCycle) return {};
    reverse(stack.begin(), stack.end());
    return stack;
}`;

const DFS_CPP_LINES: LineMap = { 7: [[10, 11]], 11: [[13, 15]], 13: [[16, 18]], 16: [[22, 23]], 22: [[31, 32]] };

const DFS_JAVA = `import java.util.*;

class TopologicalDFS {
    static boolean[] visited, inStack;
    static List<Integer> stack;
    static boolean hasCycle;

    static void dfs(List<List<Integer>> graph, int u) {
        visited[u] = true;
        inStack[u] = true;

        for (int v : graph.get(u)) {
            if (!visited[v]) {
                dfs(graph, v);
            } else if (inStack[v]) {  // back edge: cycle
                hasCycle = true;
                return;
            }
        }

        inStack[u] = false;
        stack.add(u);
    }

    static List<Integer> topologicalDFS(List<List<Integer>> graph, int n) {
        visited = new boolean[n];
        inStack = new boolean[n];
        stack = new ArrayList<>();
        hasCycle = false;
        for (int i = 0; i < n; i++)
            if (!visited[i])
                dfs(graph, i);

        if (hasCycle) return null;
        Collections.reverse(stack);
        return stack;
    }
}`;

const DFS_JAVA_LINES: LineMap = { 7: [[9, 10]], 11: [[12, 14]], 13: [[15, 17]], 16: [[21, 22]], 22: [[35, 36]] };

interface Props {
  codeLine: number;
  mode: 'Kahn' | 'DFS';
}

export default function TopoCodeViewer({ codeLine, mode }: Props) {
  const kahn = mode === 'Kahn';
  return (
    <CodePanel
      title={kahn ? 'topo_sort_kahn.py' : 'topo_sort_dfs.py'}
      code={kahn ? KAHN_CODE : DFS_TOPO_CODE}
      isLineHighlighted={highlighter(kahn ? KAHN_PY_LINES : DFS_PY_LINES, codeLine)}
      sources={{
        cpp: { code: kahn ? KAHN_CPP : DFS_CPP, isLineHighlighted: highlighter(kahn ? KAHN_CPP_LINES : DFS_CPP_LINES, codeLine) },
        java: { code: kahn ? KAHN_JAVA : DFS_JAVA, isLineHighlighted: highlighter(kahn ? KAHN_JAVA_LINES : DFS_JAVA_LINES, codeLine) },
      }}
    />
  );
}

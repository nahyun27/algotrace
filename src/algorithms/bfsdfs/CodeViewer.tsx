import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import { BFS_CODE, DFS_CODE } from './types';

interface CodeViewerProps {
  codeLine: number;
  mode: 'BFS' | 'DFS';
}

// Keys are the solver's codeLine values: 4 INIT, 10 DEQUEUE, 12 DISCOVER, 15 ENQUEUE, 17 DONE
const BFS_PY_LINES: LineMap = { 4: [[4, 7]], 10: [[10, 11]], 12: [[14, 14]], 15: [[15, 17]], 17: [[19, 19]] };

const BFS_CPP = `#include <bits/stdc++.h>
using namespace std;

vector<int> bfs(vector<vector<int>>& graph, int start) {
    vector<bool> visited(graph.size(), false);
    queue<int> q;
    q.push(start);
    visited[start] = true;
    vector<int> order;

    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);

        for (int v : graph[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    return order;
}`;

const BFS_CPP_LINES: LineMap = { 4: [[5, 9]], 10: [[12, 13]], 12: [[15, 15]], 15: [[16, 18]], 17: [[22, 22]] };

const BFS_JAVA = `import java.util.*;

class BFS {
    static List<Integer> bfs(List<List<Integer>> graph, int start) {
        boolean[] visited = new boolean[graph.size()];
        Deque<Integer> queue = new ArrayDeque<>();
        queue.add(start);
        visited[start] = true;
        List<Integer> order = new ArrayList<>();

        while (!queue.isEmpty()) {
            int u = queue.poll();
            order.add(u);

            for (int v : graph.get(u)) {
                if (!visited[v]) {
                    visited[v] = true;
                    queue.add(v);
                }
            }
        }
        return order;
    }
}`;

const BFS_JAVA_LINES: LineMap = { 4: [[5, 9]], 10: [[12, 13]], 12: [[15, 15]], 15: [[16, 18]], 17: [[22, 22]] };

// Keys are the solver's codeLine values: 4 INIT, 7 POP, 13 DISCOVER, 16 PUSH, 18 DONE
const DFS_PY_LINES: LineMap = { 4: [[2, 4]], 7: [[7, 11]], 13: [[14, 14]], 16: [[16, 17]], 18: [[19, 19]] };

const DFS_CPP = `#include <bits/stdc++.h>
using namespace std;

vector<int> dfs(vector<vector<int>>& graph, int start) {
    vector<bool> visited(graph.size(), false);
    vector<int> stack = {start};
    vector<int> order;

    while (!stack.empty()) {
        int u = stack.back(); stack.pop_back();

        if (!visited[u]) {
            visited[u] = true;
            order.push_back(u);

            for (int i = (int)graph[u].size() - 1; i >= 0; i--) {
                int v = graph[u][i];
                if (!visited[v]) {
                    stack.push_back(v);
                }
            }
        }
    }
    return order;
}`;

const DFS_CPP_LINES: LineMap = { 4: [[5, 7]], 7: [[10, 14]], 13: [[16, 17]], 16: [[18, 19]], 18: [[24, 24]] };

const DFS_JAVA = `import java.util.*;

class DFS {
    static List<Integer> dfs(List<List<Integer>> graph, int start) {
        boolean[] visited = new boolean[graph.size()];
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(start);
        List<Integer> order = new ArrayList<>();

        while (!stack.isEmpty()) {
            int u = stack.pop();

            if (!visited[u]) {
                visited[u] = true;
                order.add(u);

                List<Integer> adj = graph.get(u);
                for (int i = adj.size() - 1; i >= 0; i--) {
                    int v = adj.get(i);
                    if (!visited[v]) {
                        stack.push(v);
                    }
                }
            }
        }
        return order;
    }
}`;

const DFS_JAVA_LINES: LineMap = { 4: [[5, 8]], 7: [[11, 15]], 13: [[17, 19]], 16: [[20, 21]], 18: [[26, 26]] };

export default function CodeViewer({ codeLine, mode }: CodeViewerProps) {
  const bfs = mode === 'BFS';
  return (
    <CodePanel
      title={bfs ? 'bfs.py' : 'dfs.py'}
      code={bfs ? BFS_CODE : DFS_CODE}
      isLineHighlighted={highlighter(bfs ? BFS_PY_LINES : DFS_PY_LINES, codeLine)}
      sources={{
        cpp: { code: bfs ? BFS_CPP : DFS_CPP, isLineHighlighted: highlighter(bfs ? BFS_CPP_LINES : DFS_CPP_LINES, codeLine) },
        java: { code: bfs ? BFS_JAVA : DFS_JAVA, isLineHighlighted: highlighter(bfs ? BFS_JAVA_LINES : DFS_JAVA_LINES, codeLine) },
      }}
    />
  );
}

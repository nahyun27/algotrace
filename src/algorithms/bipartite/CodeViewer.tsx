import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import { BIPARTITE_CODE } from './types';

// Keys are the solver's codeLine values: 4 INIT, 8 START, 11 DEQUEUE, 14 COLOR, 16 CHECK,
// 17 CONFLICT / DONE (not bipartite), 18 DONE (bipartite)
const PY_LINES: LineMap = { 4: [[4, 4]], 8: [[5, 9]], 11: [[10, 11]], 14: [[13, 15]], 16: [[16, 16]], 17: [[16, 17]], 18: [[18, 18]] };

const BIPARTITE_CPP = `#include <bits/stdc++.h>
using namespace std;

bool isBipartite(int n, vector<vector<int>>& graph) {
    vector<int> color(n, -1);  // 0: A, 1: B
    for (int s = 0; s < n; s++) {  // each connected component
        if (color[s] != -1)
            continue;
        color[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : graph[u]) {
                if (color[v] == -1) {
                    color[v] = 1 - color[u];
                    q.push(v);
                } else if (color[v] == color[u]) {
                    return false;
                }
            }
        }
    }
    return true;
}`;

const CPP_LINES: LineMap = { 4: [[5, 5]], 8: [[6, 11]], 11: [[12, 13]], 14: [[15, 17]], 16: [[18, 18]], 17: [[18, 19]], 18: [[24, 24]] };

const BIPARTITE_JAVA = `import java.util.*;

class Bipartite {
    static boolean isBipartite(int n, List<List<Integer>> graph) {
        int[] color = new int[n];
        Arrays.fill(color, -1);  // 0: A, 1: B
        for (int s = 0; s < n; s++) {  // each connected component
            if (color[s] != -1)
                continue;
            color[s] = 0;
            Deque<Integer> queue = new ArrayDeque<>();
            queue.add(s);
            while (!queue.isEmpty()) {
                int u = queue.poll();
                for (int v : graph.get(u)) {
                    if (color[v] == -1) {
                        color[v] = 1 - color[u];
                        queue.add(v);
                    } else if (color[v] == color[u]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}`;

const JAVA_LINES: LineMap = { 4: [[5, 6]], 8: [[7, 12]], 11: [[13, 14]], 14: [[16, 18]], 16: [[19, 19]], 17: [[19, 20]], 18: [[25, 25]] };

export default function BipartiteCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="bipartite.py"
      code={BIPARTITE_CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: BIPARTITE_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: BIPARTITE_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

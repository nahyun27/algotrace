import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const LCA_PY = `LOG = 17  # 2^LOG > N  (N ≤ 100,000)

def build(root, n):
    stack = [(root, root, 0)]  # (node, parent, depth)
    while stack:
        v, p, d = stack.pop()
        depth[v], up[0][v] = d, p
        for w in graph[v]:
            if w != p:
                stack.append((w, v, d + 1))

    for k in range(1, LOG):
        for v in range(1, n + 1):
            up[k][v] = up[k - 1][up[k - 1][v]]

def lca(u, v):
    if depth[u] < depth[v]:
        u, v = v, u
    diff = depth[u] - depth[v]
    for k in range(LOG):
        if diff >> k & 1:
            u = up[k][u]
    if u == v:
        return u

    for k in range(LOG - 1, -1, -1):
        if up[k][u] != up[k][v]:
            u, v = up[k][u], up[k][v]
    return up[0][u]`;

// Keys are the solver's codeLine values: 1 INIT, 2 DFS_VISIT, 3 TABLE_FILL, 4 QUERY, 5 LIFT,
// 6 FOUND (u == v after lifting), 7 JUMP_BOTH, 8 SKIP_JUMP, 9 FOUND (parent of u)
const PY_LINES: LineMap = {
  1: [[3, 4]], 2: [[6, 10]], 3: [[12, 14]], 4: [[17, 19]], 5: [[20, 22]],
  6: [[23, 24]], 7: [[26, 28]], 8: [[26, 27]], 9: [[29, 29]],
};

const LCA_CPP = `#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100001, LOG = 17;  // 2^LOG > N
vector<int> graph[MAXN];
int depth[MAXN], up[LOG][MAXN];

void build(int root, int n) {
    vector<array<int, 3>> stk = {{root, root, 0}};  // (node, parent, depth)
    while (!stk.empty()) {
        auto [v, p, d] = stk.back(); stk.pop_back();
        depth[v] = d; up[0][v] = p;
        for (int w : graph[v])
            if (w != p) stk.push_back({w, v, d + 1});
    }

    for (int k = 1; k < LOG; k++)
        for (int v = 1; v <= n; v++)
            up[k][v] = up[k - 1][up[k - 1][v]];
}

int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = 0; k < LOG; k++)
        if (diff >> k & 1) u = up[k][u];
    if (u == v) return u;

    for (int k = LOG - 1; k >= 0; k--)
        if (up[k][u] != up[k][v]) {
            u = up[k][u];
            v = up[k][v];
        }
    return up[0][u];
}`;

const CPP_LINES: LineMap = {
  1: [[8, 9]], 2: [[11, 14]], 3: [[17, 19]], 4: [[23, 24]], 5: [[25, 26]],
  6: [[27, 27]], 7: [[29, 33]], 8: [[29, 30]], 9: [[34, 34]],
};

const LCA_JAVA = `import java.util.*;

class LCA {
    static final int LOG = 17;  // 2^LOG > N
    static List<Integer>[] graph;
    static int[] depth;
    static int[][] up;

    static void build(int root, int n) {
        depth = new int[n + 1];
        up = new int[LOG][n + 1];
        Deque<int[]> stack = new ArrayDeque<>();
        stack.push(new int[]{root, root, 0});  // (node, parent, depth)
        while (!stack.isEmpty()) {
            int[] top = stack.pop();
            int v = top[0], p = top[1], d = top[2];
            depth[v] = d; up[0][v] = p;
            for (int w : graph[v])
                if (w != p) stack.push(new int[]{w, v, d + 1});
        }

        for (int k = 1; k < LOG; k++)
            for (int v = 1; v <= n; v++)
                up[k][v] = up[k - 1][up[k - 1][v]];
    }

    static int lca(int u, int v) {
        if (depth[u] < depth[v]) { int t = u; u = v; v = t; }
        int diff = depth[u] - depth[v];
        for (int k = 0; k < LOG; k++)
            if ((diff >> k & 1) == 1) u = up[k][u];
        if (u == v) return u;

        for (int k = LOG - 1; k >= 0; k--)
            if (up[k][u] != up[k][v]) {
                u = up[k][u];
                v = up[k][v];
            }
        return up[0][u];
    }
}`;

const JAVA_LINES: LineMap = {
  1: [[9, 13]], 2: [[15, 19]], 3: [[22, 24]], 4: [[28, 29]], 5: [[30, 31]],
  6: [[32, 32]], 7: [[34, 38]], 8: [[34, 35]], 9: [[39, 39]],
};

export default function LCACodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="lca.py"
      code={LCA_PY}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: LCA_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: LCA_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

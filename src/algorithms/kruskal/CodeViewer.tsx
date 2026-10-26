import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import { KRUSKAL_CODE } from './types';

// Keys are the solver's codeLine values: 19 INIT, 24 CONSIDER, 7 FIND, 25 ACCEPT, 10 REJECT, 31 DONE
const PY_LINES: LineMap = {
  19: [[19, 22]], 24: [[24, 24]], 7: [[7, 10]], 25: [[13, 15], [25, 27]], 10: [[9, 10]], 31: [[31, 31]],
};

const KRUSKAL_CPP = `#include <bits/stdc++.h>
using namespace std;

int find(vector<int>& parent, int x) {
    if (parent[x] != x)
        parent[x] = find(parent, parent[x]);  // path compression
    return parent[x];
}

bool unite(vector<int>& parent, vector<int>& rank, int x, int y) {
    int rx = find(parent, x);
    int ry = find(parent, y);
    if (rx == ry)
        return false;  // would form a cycle
    if (rank[rx] < rank[ry])
        swap(rx, ry);  // higher rank becomes the root
    parent[ry] = rx;  // union
    if (rank[rx] == rank[ry])
        rank[rx]++;
    return true;
}

pair<vector<array<int, 3>>, long long> kruskal(int n, vector<array<int, 3>> edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return a[2] < b[2]; });
    vector<int> parent(n), rank(n, 0);
    iota(parent.begin(), parent.end(), 0);
    vector<array<int, 3>> mst;
    long long cost = 0;

    for (auto [u, v, w] : edges) {
        if (unite(parent, rank, u, v)) {
            mst.push_back({u, v, w});
            cost += w;
        }
        if ((int)mst.size() == n - 1)
            break;
    }
    return {mst, cost};
}`;

const CPP_LINES: LineMap = {
  19: [[24, 28]], 24: [[30, 30]], 7: [[11, 14]], 25: [[17, 19], [31, 33]], 10: [[13, 14]], 31: [[38, 38]],
};

const KRUSKAL_JAVA = `import java.util.*;

class Kruskal {
    static int find(int[] parent, int x) {
        if (parent[x] != x)
            parent[x] = find(parent, parent[x]);  // path compression
        return parent[x];
    }

    static boolean union(int[] parent, int[] rank, int x, int y) {
        int rx = find(parent, x);
        int ry = find(parent, y);
        if (rx == ry)
            return false;  // would form a cycle
        if (rank[rx] < rank[ry]) {
            int t = rx; rx = ry; ry = t;  // higher rank becomes the root
        }
        parent[ry] = rx;  // union
        if (rank[rx] == rank[ry])
            rank[rx]++;
        return true;
    }

    static long kruskal(int n, int[][] edges, List<int[]> mst) {
        Arrays.sort(edges, (a, b) -> Integer.compare(a[2], b[2]));
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int[] rank = new int[n];
        long cost = 0;

        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (union(parent, rank, u, v)) {
                mst.add(e);
                cost += w;
            }
            if (mst.size() == n - 1)
                break;
        }
        return cost;
    }
}`;

const JAVA_LINES: LineMap = {
  19: [[25, 29]], 24: [[31, 32]], 7: [[11, 14]], 25: [[18, 20], [33, 35]], 10: [[13, 14]], 31: [[40, 40]],
};

export default function KruskalCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="kruskal.py"
      code={KRUSKAL_CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: KRUSKAL_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: KRUSKAL_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

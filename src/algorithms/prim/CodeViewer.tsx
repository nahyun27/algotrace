import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import { PRIM_CODE } from './types';

// Keys are the solver's codeLine values: 9 INIT, 14 EXTRACT_MIN, 16 ALREADY_IN_MST, 19 ADD_TO_MST, 22 UPDATE, 28 DONE
const PY_LINES: LineMap = { 9: [[9, 10]], 14: [[14, 14]], 16: [[16, 17]], 19: [[19, 20]], 22: [[22, 26]], 28: [[28, 28]] };

const PRIM_CPP = `#include <bits/stdc++.h>
using namespace std;

pair<long long, vector<int>> prim(int n, vector<vector<pair<int, int>>>& adj) {
    const int INF = INT_MAX;
    vector<int> key(n, INF), parent(n, -1);
    vector<bool> inMst(n, false);

    key[0] = 0;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;  // (key, node)
    pq.push({0, 0});
    long long mstCost = 0;

    while (!pq.empty()) {
        auto [k, u] = pq.top(); pq.pop();

        if (inMst[u])  // already in the MST
            continue;

        inMst[u] = true;
        mstCost += k;

        for (auto [v, w] : adj[u]) {
            if (!inMst[v] && w < key[v]) {
                key[v] = w;
                parent[v] = u;
                pq.push({w, v});
            }
        }
    }
    return {mstCost, parent};
}`;

const CPP_LINES: LineMap = { 9: [[9, 11]], 14: [[15, 15]], 16: [[17, 18]], 19: [[20, 21]], 22: [[23, 27]], 28: [[31, 31]] };

const PRIM_JAVA = `import java.util.*;

class Prim {
    static long prim(int n, List<List<int[]>> adj, int[] parent) {
        final int INF = Integer.MAX_VALUE;
        int[] key = new int[n];
        Arrays.fill(key, INF);
        Arrays.fill(parent, -1);
        boolean[] inMst = new boolean[n];

        key[0] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));  // (key, node)
        pq.add(new int[]{0, 0});
        long mstCost = 0;

        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int k = top[0], u = top[1];

            if (inMst[u])  // already in the MST
                continue;

            inMst[u] = true;
            mstCost += k;

            for (int[] e : adj.get(u)) {
                int v = e[0], w = e[1];
                if (!inMst[v] && w < key[v]) {
                    key[v] = w;
                    parent[v] = u;
                    pq.add(new int[]{w, v});
                }
            }
        }
        return mstCost;
    }
}`;

const JAVA_LINES: LineMap = { 9: [[11, 13]], 14: [[17, 18]], 16: [[20, 21]], 19: [[23, 24]], 22: [[26, 31]], 28: [[35, 35]] };

export default function PrimCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="prim.py"
      code={PRIM_CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: PRIM_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: PRIM_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

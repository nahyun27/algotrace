import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const KNAPSACK_CODE = `def knapsack(items, K):
    N = len(items)
    dp = [[0] * (K + 1) for _ in range(N + 1)]
    for i in range(1, N + 1):
        w, v = items[i-1]
        for c in range(K + 1):
            dp[i][c] = dp[i-1][c]  # skip
            if w <= c:
                take = dp[i-1][c-w] + v
                dp[i][c] = max(dp[i][c], take)
    c, chosen = K, []  # backtrack
    for i in range(N, 0, -1):
        if dp[i][c] != dp[i-1][c]:
            chosen.append(i)
            c -= items[i-1][0]
    return dp[N][K], chosen`;

// Keys are the solver's codeLine values: 3 INIT, 6 CONSIDER, 8 SKIP (too heavy), 9 SKIP (taking is not better),
// 10 TAKE, 13 BACKTRACK (not taken), 14 BACKTRACK (taken), 16 DONE
const PY_LINES: LineMap = { 3: [[2, 3]], 6: [[4, 6]], 8: [[7, 8]], 9: [[7, 10]], 10: [[8, 10]], 13: [[11, 13]], 14: [[13, 15]], 16: [[16, 16]] };

const KNAPSACK_CPP = `#include <bits/stdc++.h>
using namespace std;

pair<int, vector<int>> knapsack(vector<pair<int, int>>& items, int K) {
    int N = items.size();
    vector<vector<int>> dp(N + 1, vector<int>(K + 1, 0));
    for (int i = 1; i <= N; i++) {
        auto [w, v] = items[i-1];
        for (int c = 0; c <= K; c++) {
            dp[i][c] = dp[i-1][c];  // skip
            if (w <= c) {
                int take = dp[i-1][c-w] + v;
                dp[i][c] = max(dp[i][c], take);
            }
        }
    }
    int c = K;  // backtrack
    vector<int> chosen;
    for (int i = N; i > 0; i--) {
        if (dp[i][c] != dp[i-1][c]) {
            chosen.push_back(i);
            c -= items[i-1].first;
        }
    }
    return {dp[N][K], chosen};
}`;

const CPP_LINES: LineMap = { 3: [[5, 6]], 6: [[7, 9]], 8: [[10, 11]], 9: [[10, 13]], 10: [[11, 13]], 13: [[17, 20]], 14: [[20, 22]], 16: [[25, 25]] };

const KNAPSACK_JAVA = `import java.util.*;

class Knapsack {
    static int knapsack(int[][] items, int K, List<Integer> chosen) {
        int N = items.length;
        int[][] dp = new int[N + 1][K + 1];
        for (int i = 1; i <= N; i++) {
            int w = items[i-1][0], v = items[i-1][1];
            for (int c = 0; c <= K; c++) {
                dp[i][c] = dp[i-1][c];  // skip
                if (w <= c) {
                    int take = dp[i-1][c-w] + v;
                    dp[i][c] = Math.max(dp[i][c], take);
                }
            }
        }
        int c = K;  // backtrack
        for (int i = N; i > 0; i--) {
            if (dp[i][c] != dp[i-1][c]) {
                chosen.add(i);
                c -= items[i-1][0];
            }
        }
        return dp[N][K];
    }
}`;

const JAVA_LINES: LineMap = { 3: [[5, 6]], 6: [[7, 9]], 8: [[10, 11]], 9: [[10, 13]], 10: [[11, 13]], 13: [[17, 19]], 14: [[19, 21]], 16: [[24, 24]] };

export default function KnapsackCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="knapsack.py"
      code={KNAPSACK_CODE}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: KNAPSACK_CPP, isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: KNAPSACK_JAVA, isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}

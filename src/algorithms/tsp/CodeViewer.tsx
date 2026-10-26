import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

interface CodeViewerProps {
  codeLine: number;
  solverType: 'topDown' | 'bottomUp';
}

const TSP_CODE_TOP_DOWN = `def solve(mask, curr):
    if mask == (1 << N) - 1:
        return W[curr][0] if W[curr][0] else INF

    if dp[mask][curr] != INF:
        return dp[mask][curr]

    ans = INF
    for nxt in range(N):
        if not (mask & (1 << nxt)) and W[curr][nxt]:
            res = solve(mask | (1 << nxt), nxt) + W[curr][nxt]
            ans = min(ans, res)

    dp[mask][curr] = ans
    return ans`;

// Keys are the solver's codeLine values: 1 call, 3 base case, 6 memo hit, 8 loop start,
// 11 recurse, 12 / 13 min update, 15 save and return
const TOP_DOWN_PY_LINES: LineMap = {
  1: [[1, 2]], 3: [[2, 3]], 6: [[5, 6]], 8: [[8, 9]], 11: [[10, 11]], 12: [[12, 12]], 13: [[12, 12]], 15: [[14, 15]],
};

const TOP_DOWN_CPP = `#include <bits/stdc++.h>
using namespace std;

const int INF = 1e9;
int N;
vector<vector<int>> W, dp;  // dp[mask][curr], filled with INF

int solve(int mask, int curr) {
    if (mask == (1 << N) - 1)
        return W[curr][0] ? W[curr][0] : INF;

    if (dp[mask][curr] != INF)
        return dp[mask][curr];

    int ans = INF;
    for (int nxt = 0; nxt < N; nxt++) {
        if (!(mask & (1 << nxt)) && W[curr][nxt]) {
            int res = solve(mask | (1 << nxt), nxt) + W[curr][nxt];
            ans = min(ans, res);
        }
    }

    dp[mask][curr] = ans;
    return ans;
}`;

const TOP_DOWN_CPP_LINES: LineMap = {
  1: [[8, 9]], 3: [[9, 10]], 6: [[12, 13]], 8: [[15, 16]], 11: [[17, 18]], 12: [[19, 19]], 13: [[19, 19]], 15: [[23, 24]],
};

const TOP_DOWN_JAVA = `import java.util.*;

class TSP {
    static final int INF = 1_000_000_000;
    static int N;
    static int[][] W, dp;  // dp[mask][curr], filled with INF

    static int solve(int mask, int curr) {
        if (mask == (1 << N) - 1)
            return W[curr][0] != 0 ? W[curr][0] : INF;

        if (dp[mask][curr] != INF)
            return dp[mask][curr];

        int ans = INF;
        for (int nxt = 0; nxt < N; nxt++) {
            if ((mask & (1 << nxt)) == 0 && W[curr][nxt] != 0) {
                int res = solve(mask | (1 << nxt), nxt) + W[curr][nxt];
                ans = Math.min(ans, res);
            }
        }

        dp[mask][curr] = ans;
        return ans;
    }
}`;

const TOP_DOWN_JAVA_LINES: LineMap = {
  1: [[8, 9]], 3: [[9, 10]], 6: [[12, 13]], 8: [[15, 16]], 11: [[17, 18]], 12: [[19, 19]], 13: [[19, 19]], 15: [[23, 24]],
};

const TSP_CODE_BOTTOM_UP = `dp[1][0] = 0

for mask in range(1, 1 << N):
    if not (mask & 1): continue
    for i in range(N):
        if not (mask & (1 << i)): continue

        for j in range(N):
            if i != j and (mask & (1 << j)) and W[j][i]:
                res = dp[mask ^ (1 << i)][j] + W[j][i]
                dp[mask][i] = min(dp[mask][i], res)

ans = INF
for i in range(1, N):
    if dp[(1 << N) - 1][i] != INF and W[i][0]:
        ans = min(ans, dp[(1 << N) - 1][i] + W[i][0])
return ans`;

// Keys are the solver's codeLine values: 1 init, 5 outer loop, 10 transition, 11 update,
// 14 final phase, 16 last city, 17 update min, 18 done
const BOTTOM_UP_PY_LINES: LineMap = {
  1: [[1, 1]], 5: [[3, 6]], 10: [[8, 10]], 11: [[11, 11]], 14: [[13, 14]], 16: [[15, 16]], 17: [[16, 16]], 18: [[17, 17]],
};

const BOTTOM_UP_CPP = `#include <bits/stdc++.h>
using namespace std;

const int INF = 1e9;

int tsp(int N, vector<vector<int>>& W) {
    vector<vector<int>> dp(1 << N, vector<int>(N, INF));
    dp[1][0] = 0;

    for (int mask = 1; mask < (1 << N); mask++) {
        if (!(mask & 1)) continue;
        for (int i = 0; i < N; i++) {
            if (!(mask & (1 << i))) continue;

            for (int j = 0; j < N; j++) {
                if (i != j && (mask & (1 << j)) && W[j][i]) {
                    int res = dp[mask ^ (1 << i)][j] + W[j][i];
                    dp[mask][i] = min(dp[mask][i], res);
                }
            }
        }
    }

    int ans = INF;
    for (int i = 1; i < N; i++)
        if (dp[(1 << N) - 1][i] != INF && W[i][0])
            ans = min(ans, dp[(1 << N) - 1][i] + W[i][0]);
    return ans;
}`;

const BOTTOM_UP_CPP_LINES: LineMap = {
  1: [[7, 8]], 5: [[10, 13]], 10: [[15, 17]], 11: [[18, 18]], 14: [[24, 25]], 16: [[26, 27]], 17: [[27, 27]], 18: [[28, 28]],
};

const BOTTOM_UP_JAVA = `import java.util.*;

class TSP {
    static final int INF = 1_000_000_000;

    static int tsp(int N, int[][] W) {
        int[][] dp = new int[1 << N][N];
        for (int[] row : dp) Arrays.fill(row, INF);
        dp[1][0] = 0;

        for (int mask = 1; mask < (1 << N); mask++) {
            if ((mask & 1) == 0) continue;
            for (int i = 0; i < N; i++) {
                if ((mask & (1 << i)) == 0) continue;

                for (int j = 0; j < N; j++) {
                    if (i != j && (mask & (1 << j)) != 0 && W[j][i] != 0) {
                        int res = dp[mask ^ (1 << i)][j] + W[j][i];
                        dp[mask][i] = Math.min(dp[mask][i], res);
                    }
                }
            }
        }

        int ans = INF;
        for (int i = 1; i < N; i++)
            if (dp[(1 << N) - 1][i] != INF && W[i][0] != 0)
                ans = Math.min(ans, dp[(1 << N) - 1][i] + W[i][0]);
        return ans;
    }
}`;

const BOTTOM_UP_JAVA_LINES: LineMap = {
  1: [[7, 9]], 5: [[11, 14]], 10: [[16, 18]], 11: [[19, 19]], 14: [[25, 26]], 16: [[27, 28]], 17: [[28, 28]], 18: [[29, 29]],
};

export default function CodeViewer({ codeLine, solverType }: CodeViewerProps) {
  const top = solverType === 'topDown';
  return (
    <CodePanel
      title={top ? 'tsp_top_down.py' : 'tsp_bottom_up.py'}
      code={top ? TSP_CODE_TOP_DOWN : TSP_CODE_BOTTOM_UP}
      isLineHighlighted={highlighter(top ? TOP_DOWN_PY_LINES : BOTTOM_UP_PY_LINES, codeLine)}
      sources={{
        cpp: { code: top ? TOP_DOWN_CPP : BOTTOM_UP_CPP, isLineHighlighted: highlighter(top ? TOP_DOWN_CPP_LINES : BOTTOM_UP_CPP_LINES, codeLine) },
        java: { code: top ? TOP_DOWN_JAVA : BOTTOM_UP_JAVA, isLineHighlighted: highlighter(top ? TOP_DOWN_JAVA_LINES : BOTTOM_UP_JAVA_LINES, codeLine) },
      }}
    />
  );
}

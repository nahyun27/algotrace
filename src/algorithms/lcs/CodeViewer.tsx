import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import type { LCSMode } from './types';

const LCS_CODE = `def lcs(A, B):
    n, m = len(A), len(B)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if A[i-1] == B[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    # backtrack from (n, m)
    i, j, res = n, m, []
    while i > 0 and j > 0:
        if A[i-1] == B[j-1]:
            res.append(A[i-1]); i -= 1; j -= 1
        elif dp[i-1][j] >= dp[i][j-1]: i -= 1
        else: j -= 1
    return dp[n][m], ''.join(reversed(res))`;

// Keys are the solver's codeLine values: 3 INIT, 7 MATCH, 9 MISMATCH, 14 / 15 / 16 BACKTRACK
// (diagonal, up, left), 17 DONE
const LCS_PY_LINES: LineMap = { 3: [[2, 3]], 7: [[6, 7]], 9: [[8, 9]], 14: [[12, 14]], 15: [[12, 12], [15, 15]], 16: [[12, 12], [16, 16]], 17: [[17, 17]] };

const LCS_CPP = `#include <bits/stdc++.h>
using namespace std;

pair<int, string> lcs(const string& A, const string& B) {
    int n = A.size(), m = B.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            if (A[i-1] == B[j-1])
                dp[i][j] = dp[i-1][j-1] + 1;
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
    // backtrack from (n, m)
    int i = n, j = m;
    string res;
    while (i > 0 && j > 0) {
        if (A[i-1] == B[j-1]) {
            res += A[i-1]; i--; j--;
        } else if (dp[i-1][j] >= dp[i][j-1]) i--;
        else j--;
    }
    reverse(res.begin(), res.end());
    return {dp[n][m], res};
}`;

const LCS_CPP_LINES: LineMap = { 3: [[5, 6]], 7: [[9, 10]], 9: [[11, 12]], 14: [[16, 18]], 15: [[16, 16], [19, 19]], 16: [[16, 16], [20, 20]], 17: [[22, 23]] };

const LCS_JAVA = `import java.util.*;

class LCS {
    static String lcs(String A, String B) {
        int n = A.length(), m = B.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                if (A.charAt(i-1) == B.charAt(j-1))
                    dp[i][j] = dp[i-1][j-1] + 1;
                else
                    dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        // backtrack from (n, m)
        int i = n, j = m;
        StringBuilder res = new StringBuilder();
        while (i > 0 && j > 0) {
            if (A.charAt(i-1) == B.charAt(j-1)) {
                res.append(A.charAt(i-1)); i--; j--;
            } else if (dp[i-1][j] >= dp[i][j-1]) i--;
            else j--;
        }
        return res.reverse().toString();  // length is dp[n][m]
    }
}`;

const LCS_JAVA_LINES: LineMap = { 3: [[5, 6]], 7: [[9, 10]], 9: [[11, 12]], 14: [[16, 18]], 15: [[16, 16], [19, 19]], 16: [[16, 16], [20, 20]], 17: [[22, 22]] };

const EDIT_CODE = `def edit_distance(A, B):
    n, m = len(A), len(B)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1): dp[i][0] = i
    for j in range(m + 1): dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if A[i-1] == B[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j-1],  # replace
                    dp[i-1][j],    # delete
                    dp[i][j-1])    # insert
    # backtrack: follow the min cell
    return dp[n][m]`;

// Keys are the solver's codeLine values: 4 INIT, 9 MATCH, 12 REPLACE, 13 DELETE, 14 INSERT, 15 BACKTRACK, 16 DONE
const EDIT_PY_LINES: LineMap = { 4: [[3, 5]], 9: [[8, 9]], 12: [[10, 12]], 13: [[10, 11], [13, 13]], 14: [[10, 11], [14, 14]], 15: [[15, 15]], 16: [[16, 16]] };

const EDIT_CPP = `#include <bits/stdc++.h>
using namespace std;

int editDistance(const string& A, const string& B) {
    int n = A.size(), m = B.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 0; i <= n; i++) dp[i][0] = i;
    for (int j = 0; j <= m; j++) dp[0][j] = j;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            if (A[i-1] == B[j-1])
                dp[i][j] = dp[i-1][j-1];
            else
                dp[i][j] = 1 + min({
                    dp[i-1][j-1],  // replace
                    dp[i-1][j],    // delete
                    dp[i][j-1]});  // insert
    // backtrack: follow the min cell
    return dp[n][m];
}`;

const EDIT_CPP_LINES: LineMap = { 4: [[6, 8]], 9: [[11, 12]], 12: [[13, 15]], 13: [[13, 14], [16, 16]], 14: [[13, 14], [17, 17]], 15: [[18, 18]], 16: [[19, 19]] };

const EDIT_JAVA = `import java.util.*;

class EditDistance {
    static int editDistance(String A, String B) {
        int n = A.length(), m = B.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                if (A.charAt(i-1) == B.charAt(j-1))
                    dp[i][j] = dp[i-1][j-1];
                else
                    dp[i][j] = 1 + Math.min(
                        dp[i-1][j-1],  // replace
                        Math.min(dp[i-1][j],  // delete
                                 dp[i][j-1]));  // insert
        // backtrack: follow the min cell
        return dp[n][m];
    }
}`;

const EDIT_JAVA_LINES: LineMap = { 4: [[6, 8]], 9: [[11, 12]], 12: [[13, 15]], 13: [[13, 14], [16, 16]], 14: [[13, 14], [17, 17]], 15: [[18, 18]], 16: [[19, 19]] };

export default function LCSCodeViewer({ mode, codeLine }: { mode: LCSMode; codeLine: number }) {
  const lcs = mode === 'lcs';
  return (
    <CodePanel
      title={lcs ? 'lcs.py' : 'edit_distance.py'}
      code={lcs ? LCS_CODE : EDIT_CODE}
      isLineHighlighted={highlighter(lcs ? LCS_PY_LINES : EDIT_PY_LINES, codeLine)}
      sources={{
        cpp: { code: lcs ? LCS_CPP : EDIT_CPP, isLineHighlighted: highlighter(lcs ? LCS_CPP_LINES : EDIT_CPP_LINES, codeLine) },
        java: { code: lcs ? LCS_JAVA : EDIT_JAVA, isLineHighlighted: highlighter(lcs ? LCS_JAVA_LINES : EDIT_JAVA_LINES, codeLine) },
      }}
    />
  );
}

import CodePanel from '../../components/algorithm/CodePanel';
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

/** Lines to highlight for each step's codeLine */
const LCS_RANGES: Record<number, number[]> = {
  3: [2, 3],
  7: [6, 7],
  9: [8, 9],
  14: [12, 13, 14],
  15: [12, 15],
  16: [12, 16],
  17: [17],
};

const EDIT_RANGES: Record<number, number[]> = {
  4: [3, 4, 5],
  9: [8, 9],
  12: [10, 11, 12],
  13: [10, 11, 13],
  14: [10, 11, 14],
  15: [15],
  16: [16],
};

export default function LCSCodeViewer({ mode, codeLine }: { mode: LCSMode; codeLine: number }) {
  const ranges = mode === 'lcs' ? LCS_RANGES : EDIT_RANGES;
  return (
    <CodePanel
      title={mode === 'lcs' ? 'lcs.py' : 'edit_distance.py'}
      code={mode === 'lcs' ? LCS_CODE : EDIT_CODE}
      isLineHighlighted={(line) => ranges[codeLine]?.includes(line) ?? false}
    />
  );
}

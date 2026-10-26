import CodePanel from '../../components/algorithm/CodePanel';
import type { LISVariant } from './types';

const QUADRATIC_CODE = `def lis(a):
    n = len(a)
    dp = [1] * n  # LIS ending at a[i]
    prev = [-1] * n  # for rebuilding
    for i in range(n):
        for j in range(i):
            if a[j] < a[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                prev[i] = j

    end = max(range(n), key=lambda x: dp[x])
    seq = []
    while end != -1:
        seq.append(a[end])
        end = prev[end]
    return seq[::-1]`;

const FAST_CODE = `def lis(a):
    tails, tails_idx = [], []
    parent = [-1] * len(a)
    for i, x in enumerate(a):
        lo, hi = 0, len(tails)
        while lo < hi:
            mid = (lo + hi) // 2
            if tails[mid] < x: lo = mid + 1
            else: hi = mid
        parent[i] = tails_idx[lo - 1] if lo > 0 else -1
        if lo == len(tails):
            tails.append(x); tails_idx.append(i)
        else:
            tails[lo] = x; tails_idx[lo] = i
    seq, k = [], tails_idx[-1]
    while k != -1:
        seq.append(a[k])
        k = parent[k]
    return seq[::-1]`;

/** step.codeLine → highlighted source lines */
const HIGHLIGHT: Record<LISVariant, Record<number, number[]>> = {
  quadratic: {
    2: [2, 3, 4],        // INIT
    5: [5],              // NEXT_I
    7: [6, 7],           // COMPARE
    8: [8, 9],           // UPDATE
    11: [11, 12, 13, 14], // BACKTRACK (start)
    14: [14, 15],        // BACKTRACK
    16: [16],            // DONE
  },
  fast: {
    2: [2, 3],           // INIT
    5: [4, 5],           // SEARCH (start)
    7: [6, 7, 8, 9],     // SEARCH (probe)
    12: [10, 11, 12],    // APPEND
    14: [10, 13, 14],    // REPLACE
    15: [15, 16, 17],    // BACKTRACK (start)
    17: [17, 18],        // BACKTRACK
    19: [19],            // DONE
  },
};

export default function LISCodeViewer({ codeLine, variant }: { codeLine: number; variant: LISVariant }) {
  const lines = HIGHLIGHT[variant][codeLine] ?? [];
  return (
    <CodePanel
      title={variant === 'quadratic' ? 'lis_dp.py' : 'lis_binary_search.py'}
      code={variant === 'quadratic' ? QUADRATIC_CODE : FAST_CODE}
      isLineHighlighted={line => lines.includes(line)}
    />
  );
}

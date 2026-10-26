import CodePanel from '../../components/algorithm/CodePanel';

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

/** Lines to highlight for each step's codeLine */
const RANGES: Record<number, number[]> = {
  3: [2, 3],          // INIT
  6: [4, 5, 6],       // CONSIDER
  8: [7, 8],          // SKIP: too heavy
  9: [7, 8, 9, 10],   // SKIP: taking is not better
  10: [8, 9, 10],     // TAKE
  13: [11, 12, 13],   // BACKTRACK: not taken
  14: [13, 14, 15],   // BACKTRACK: taken
  16: [16],           // DONE
};

export default function KnapsackCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="knapsack.py"
      code={KNAPSACK_CODE}
      isLineHighlighted={(line) => RANGES[codeLine]?.includes(line) ?? false}
    />
  );
}

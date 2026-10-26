import CodePanel from '../../components/algorithm/CodePanel';

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

function isHighlightedTopDown(lineNum: number, codeLine: number): boolean {
  if (codeLine === 1  && (lineNum === 1 || lineNum === 2))  return true; // function call
  if (codeLine === 3  && (lineNum === 2 || lineNum === 3))  return true; // base case return
  if (codeLine === 6  && (lineNum === 5 || lineNum === 6))  return true; // memo return
  if (codeLine === 8  && (lineNum === 8 || lineNum === 9))  return true; // start loop
  if (codeLine === 11 && (lineNum === 10 || lineNum === 11)) return true; // recurse
  if ((codeLine === 12 || codeLine === 13) && lineNum === 12) return true; // min update
  if (codeLine === 15 && (lineNum === 14 || lineNum === 15)) return true; // save & return
  return false;
}

function isHighlightedBottomUp(lineNum: number, codeLine: number): boolean {
  if (codeLine === 1  && lineNum === 1)                                          return true; // init
  if (codeLine === 5  && lineNum >= 3  && lineNum <= 6)                          return true; // outer loop
  if (codeLine === 10 && lineNum >= 8  && lineNum <= 10)                         return true; // transition
  if (codeLine === 11 && lineNum === 11)                                          return true; // update
  if (codeLine === 14 && (lineNum === 13 || lineNum === 14))                      return true; // final phase
  if (codeLine === 16 && (lineNum === 15 || lineNum === 16))                      return true; // last city
  if (codeLine === 17 && lineNum === 16)                                          return true; // update min
  if (codeLine === 18 && lineNum === 17)                                          return true; // done
  return false;
}

export default function CodeViewer({ codeLine, solverType }: CodeViewerProps) {
  const codeStr = solverType === 'topDown' ? TSP_CODE_TOP_DOWN : TSP_CODE_BOTTOM_UP;
  const isHighlighted = (lineNum: number) =>
    solverType === 'topDown'
      ? isHighlightedTopDown(lineNum, codeLine)
      : isHighlightedBottomUp(lineNum, codeLine);

  return (
    <CodePanel
      title={solverType === 'topDown' ? 'tsp_top_down.py' : 'tsp_bottom_up.py'}
      code={codeStr}
      isLineHighlighted={(line) => isHighlighted(line)}
    />
  );
}

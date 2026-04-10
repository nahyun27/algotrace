import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
  codeLine: number;
}

const TSP_CODE = `def solve(mask, curr):
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

export default function CodeViewer({ codeLine }: CodeViewerProps) {
  return (
    <div className="border rounded-xl bg-[var(--code-bg)] shadow-sm overflow-hidden flex flex-col h-72">
      <div className="p-3 border-b bg-muted/30">
        <h2 className="font-semibold tracking-tight text-sm">Source Code (Top-down DP)</h2>
      </div>
      <div className="flex-1 overflow-auto text-[13px] bg-[#1e1e1e]">
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
          lineProps={(lineNumber) => ({
            style: {
              display: 'block',
              backgroundColor: lineNumber === codeLine ? 'var(--accent-bg, rgba(170, 59, 255, 0.2))' : 'transparent',
              borderLeft: lineNumber === codeLine ? '3px solid var(--accent, #aa3bff)' : '3px solid transparent',
              paddingLeft: '10px'
            }
          })}
          customStyle={{ margin: 0, padding: '16px 0', background: 'transparent' }}
        >
          {TSP_CODE}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

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

export default function CodeViewer({ codeLine, solverType }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const codeStr = solverType === 'topDown' ? TSP_CODE_TOP_DOWN : TSP_CODE_BOTTOM_UP;
  const title = solverType === 'topDown' ? 'Source Code (Top-down DP)' : 'Source Code (Bottom-up DP)';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = codeStr;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border rounded-xl bg-[var(--code-bg)] shadow-sm overflow-hidden flex flex-col flex-shrink-0 h-[540px]">
      {/* Header */}
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-tight text-sm truncate">{title}</h2>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all shrink-0 ${
            copied
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
              : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border'
          }`}
          title="코드 복사"
        >
          {copied ? (
            <><Check className="w-3 h-3" /> 복사됨!</>
          ) : (
            <><Copy className="w-3 h-3" /> 복사</>
          )}
        </button>
      </div>

      {/* Code — overflow-x: auto for horizontal scroll, no wrapping */}
      <div className="flex-1 overflow-auto text-[13px] bg-[#1e1e1e]" style={{ overflowX: 'auto' }}>
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          showLineNumbers
          wrapLines={false}
          lineProps={(lineNumber) => ({
            style: {
              display: 'block',
              backgroundColor: lineNumber === codeLine
                ? 'rgba(59, 130, 246, 0.18)'
                : 'transparent',
              borderLeft: lineNumber === codeLine
                ? '3px solid #3b82f6'
                : '3px solid transparent',
              paddingLeft: '10px',
              whiteSpace: 'pre',
            }
          })}
          customStyle={{
            margin: 0,
            padding: '16px 0',
            background: 'transparent',
            minWidth: 'max-content',
          }}
        >
          {codeStr}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

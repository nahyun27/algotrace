import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { FW_CODE } from './types';

/*
 Python line numbers (1-indexed):
  1: import math
  2: (blank)
  3: def floyd_warshall(n, edges):
  4:     # 거리 행렬 초기화
  5:     dist = [[math.inf] * n ...]
  6:     for i in range(n):
  7:         dist[i][i] = 0
  8:     next_node = [[None] * n ...]
  9:     for u, v, w in edges:
 10:         dist[u][v] = w
 11:         next_node[u][v] = v
 12: (blank)
 13:     # 경유 노드 k를 ...
 14:     for k in range(n):
 15:         for i in range(n):
 16:             for j in range(n):
 17:                 new_d = dist[i][k] + dist[k][j]
 18:                 if new_d < dist[i][j]:
 19:                     dist[i][j] = new_d
 20:                     next_node[i][j] = next_node[i][k]
 21: (blank)
 22:     # 음수 사이클 감지 ...
 23:     for i in range(n):
 24:         if dist[i][i] < 0:
 25:             return None
 26: (blank)
 27:     return dist, next_node
 28-29: (blank)
 30: def get_path(next_node, u, v):
 31:     if next_node[u][v] is None:
 32:         return []
 33:     path = [u]
 34:     while u != v:
 35:         u = next_node[u][v]
 36:         path.append(u)
 37:     return path
*/

export default function FWCodeViewer({ codeLine }: { codeLine: number }) {
  const [copied, setCopied] = useState(false);

  const isHighlighted = (lineNum: number): boolean => {
    // INIT: lines 5–11
    if (codeLine === 5 && lineNum >= 5 && lineNum <= 11) return true;
    // ROUND_START: line 14
    if (codeLine === 14 && lineNum >= 14 && lineNum <= 16) return true;
    // NO_UPDATE: line 17–18 (comparison only)
    if (codeLine === 17 && lineNum >= 17 && lineNum <= 18) return true;
    // UPDATE: lines 17–20 (comparison + assignment)
    if (codeLine === 19 && lineNum >= 17 && lineNum <= 20) return true;
    // NEGATIVE_CYCLE: lines 23–25
    if (codeLine === 24 && lineNum >= 23 && lineNum <= 25) return true;
    // DONE: line 27
    if (codeLine === 27 && lineNum === 27) return true;
    return false;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FW_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = FW_CODE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col flex-shrink-0 max-h-[540px]">
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-tight text-sm truncate">Source Code (Python Floyd-Warshall)</h2>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all shrink-0 ${
            copied
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
              : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border'
          }`}
          title="코드 복사"
        >
          {copied ? <><Check className="w-3 h-3" /> 복사됨!</> : <><Copy className="w-3 h-3" /> 복사</>}
        </button>
      </div>
      <div className="dark flex-1 overflow-auto text-[11px] sm:text-[13px] bg-[var(--code-bg)]" style={{ overflowX: 'auto' }}>
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          showLineNumbers
          wrapLines={true}
          lineProps={(lineNumber) => ({
            style: {
              display: 'block',
              backgroundColor: isHighlighted(lineNumber) ? 'var(--code-highlight)' : 'transparent',
              borderLeft: isHighlighted(lineNumber) ? '3px solid #8b5cf6' : '3px solid transparent',
              paddingLeft: '10px',
              whiteSpace: 'pre',
            }
          })}
          customStyle={{ margin: 0, padding: '16px 0', background: 'transparent', minWidth: 'max-content' }}
        >
          {FW_CODE}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

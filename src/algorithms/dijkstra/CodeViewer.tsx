import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const DIJKSTRA_CODE = `import heapq

def dijkstra(graph, start):
    dist = [float('inf')] * n
    dist[start] = 0
    pq = [(0, start)]  # (cost, node)

    while pq:
        cost, u = heapq.heappop(pq)
        if visited[u]: continue
        visited[u] = True

        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))

    return dist`;

export default function DijkstraCodeViewer({ codeLine }: { codeLine: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(DIJKSTRA_CODE); }
    catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-xl bg-[var(--code-bg)] shadow-sm overflow-hidden flex flex-col flex-shrink-0 max-h-[540px]">
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-tight text-sm truncate">Source Code (Dijkstra)</h2>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all shrink-0 ${
            copied
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
              : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border'
          }`}
        >
          {copied ? <><Check className="w-3 h-3" /> 복사됨!</> : <><Copy className="w-3 h-3" /> 복사</>}
        </button>
      </div>
      <div className="flex-1 overflow-auto text-[13px] bg-[var(--code-bg)]" style={{ overflowX: 'auto' }}>
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          showLineNumbers
          wrapLines={false}
          lineProps={(lineNumber) => ({
            style: {
              display: 'block',
              backgroundColor: lineNumber === codeLine ? 'var(--code-highlight)' : 'transparent',
              borderLeft: lineNumber === codeLine ? '3px solid #3b82f6' : '3px solid transparent',
              paddingLeft: '10px',
              whiteSpace: 'pre',
            }
          })}
          customStyle={{ margin: 0, padding: '16px 0', background: 'transparent', minWidth: 'max-content' }}
        >
          {DIJKSTRA_CODE}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

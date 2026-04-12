import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const ASTAR_CODE_STR = [
  "import heapq",
  "import math",
  "",
  "def heuristic(u, v, pos):",
  "    # 유클리드 거리 (직선 거리) 계산",
  "    x1, y1 = pos[u]",
  "    x2, y2 = pos[v]",
  "    return math.hypot(x1 - x2, y1 - y2)",
  "",
  "def astar(graph, start, goal, pos):",
  "    n = len(graph)",
  "    g_score = {i: float('inf') for i in range(n)}",
  "    f_score = {i: float('inf') for i in range(n)}",
  "    ",
  "    g_score[start] = 0",
  "    f_score[start] = heuristic(start, goal, pos)",
  "    ",
  "    # 우선순위 큐: (f_score, 노드)",
  "    open_set = [(f_score[start], start)]",
  "    closed_set = set()",
  "    parent = {start: None}",
  "",
  "    while open_set:",
  "        current_f, u = heapq.heappop(open_set)",
  "",
  "        if u == goal:",
  "            return reconstruct_path(parent, goal)",
  "            ",
  "        if u in closed_set: continue",
  "        closed_set.add(u)",
  "",
  "        for v, weight in graph[u]:",
  "            tentative_g = g_score[u] + weight",
  "",
  "            # 더 나은 경로를 발견한 경우",
  "            if tentative_g < g_score[v]:",
  "                parent[v] = u",
  "                g_score[v] = tentative_g",
  "                f_score[v] = g_score[v] + heuristic(v, goal, pos)",
  "                ",
  "                # open_set에 업데이트된 정보 추가",
  "                heapq.heappush(open_set, (f_score[v], v))",
  "",
  "    return None # 목표 도달 불가"
].join('\n');

export default function CodeViewer({ codeLine }: { codeLine: number }) {
  const [copied, setCopied] = useState(false);

  // highlight specific lines based on solver state
  const isHighlighted = (lineNum: number) => {
    if (codeLine === 8 && lineNum >= 11 && lineNum <= 20) return true; // INIT
    if (codeLine === 13 && lineNum >= 23 && lineNum <= 24) return true; // DEQUEUE
    if (codeLine === 15 && lineNum >= 26 && lineNum <= 27) return true; // DONE
    if (codeLine === 18 && lineNum >= 32 && lineNum <= 36) return true; // RELAX
    return false;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ASTAR_CODE_STR);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = ASTAR_CODE_STR;
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
      {/* Header */}
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-tight text-sm truncate">Source Code (Python A*)</h2>
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
              borderLeft: isHighlighted(lineNumber)
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
          {ASTAR_CODE_STR}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

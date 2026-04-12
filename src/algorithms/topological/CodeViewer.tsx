import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { KAHN_CODE, DFS_TOPO_CODE } from './types';

/*
  KAHN line map:
   4  = INIT (in_degree array)
   11 = ENQUEUE initial (queue.append in for-loop)
   16 = DEQUEUE (queue.popleft + result.append)
   19 = DECREASE (in_degree[v] -= 1)
   21 = DECREASE+ENQUEUE (if in_degree[v] == 0: queue.append)
   24 = CYCLE_DETECTED
   25 = DONE (return result)

  DFS line map:
   7  = VISIT (visited / in_stack mark)
   11 = VISIT edge (if not visited: dfs)
   13 = CYCLE_DETECTED (back edge)
   16 = FINISH (in_stack=False)
   17 = FINISH (stack.append)
   22 = DONE (return stack[::-1])
*/

function isHighlightedKahn(lineNum: number, codeLine: number): boolean {
  if (codeLine === 4  && lineNum >= 4  && lineNum <= 7)  return true; // INIT
  if (codeLine === 11 && lineNum >= 9  && lineNum <= 12) return true; // ENQUEUE initial
  if (codeLine === 16 && lineNum >= 15 && lineNum <= 17) return true; // DEQUEUE
  if (codeLine === 19 && lineNum >= 19 && lineNum <= 20) return true; // DECREASE
  if (codeLine === 21 && lineNum >= 19 && lineNum <= 22) return true; // DECREASE+ENQUEUE
  if (codeLine === 24 && lineNum >= 24 && lineNum <= 25) return true; // CYCLE_DETECTED
  if (codeLine === 25 && lineNum === 26)                 return true; // DONE
  return false;
}

function isHighlightedDFS(lineNum: number, codeLine: number): boolean {
  if (codeLine === 7  && lineNum >= 7  && lineNum <= 8)  return true; // VISIT
  if (codeLine === 11 && lineNum >= 10 && lineNum <= 12) return true; // traverse edge
  if (codeLine === 13 && lineNum >= 13 && lineNum <= 14) return true; // CYCLE_DETECTED
  if (codeLine === 16 && lineNum >= 16 && lineNum <= 17) return true; // FINISH
  if (codeLine === 22 && lineNum === 22)                 return true; // DONE
  return false;
}

interface Props {
  codeLine: number;
  mode: 'Kahn' | 'DFS';
}

export default function TopoCodeViewer({ codeLine, mode }: Props) {
  const [copied, setCopied] = useState(false);

  const code  = mode === 'Kahn' ? KAHN_CODE : DFS_TOPO_CODE;
  const title = mode === 'Kahn'
    ? 'Source Code (Kahn\'s Algorithm)'
    : 'Source Code (DFS Topological Sort)';

  const isHighlighted = (lineNum: number) =>
    mode === 'Kahn'
      ? isHighlightedKahn(lineNum, codeLine)
      : isHighlightedDFS(lineNum, codeLine);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col flex-shrink-0 max-h-[540px]">
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
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

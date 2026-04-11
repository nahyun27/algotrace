import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { BFS_CODE, DFS_CODE } from './types';

interface CodeViewerProps {
  codeLine: number;
  mode: 'BFS' | 'DFS';
}

export default function CodeViewer({ codeLine, mode }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const code = mode === 'BFS' ? BFS_CODE : DFS_CODE;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHighlighted = (lineNum: number) => {
    // Basic highlighting based on solver codeLine
    // In solverBFS/DFS, we pass the "start" of the relevant block usually
    if (mode === 'BFS') {
      if (codeLine === 4 && lineNum >= 4 && lineNum <= 7) return true; // INIT
      if (codeLine === 10 && lineNum >= 10 && lineNum <= 11) return true; // DEQUEUE
      if (codeLine === 12 && lineNum >= 14 && lineNum <= 14) return true; // DISCOVER
      if (codeLine === 15 && lineNum >= 15 && lineNum <= 17) return true; // ENQUEUE
      if (codeLine === 17 && lineNum >= 19) return true; // DONE
    } else {
      if (codeLine === 4 && lineNum >= 2 && lineNum <= 4) return true; // INIT
      if (codeLine === 7 && lineNum >= 7 && lineNum <= 11) return true; // POP
      if (codeLine === 13 && lineNum >= 14 && lineNum <= 14) return true; // DISCOVER
      if (codeLine === 16 && lineNum >= 16 && lineNum <= 17) return true; // PUSH
      if (codeLine === 18 && lineNum >= 19) return true; // DONE
    }
    return false;
  };

  return (
    <div className="border rounded-xl bg-[var(--code-bg)] shadow-sm overflow-hidden flex flex-col flex-shrink-0 max-h-[540px]">
      {/* Header */}
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-tight text-sm truncate">
          Source Code (Python {mode})
        </h2>
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

      {/* Code Area */}
      <div className="flex-1 overflow-auto text-[13px] bg-[var(--code-bg)]" style={{ overflowX: 'auto' }}>
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          showLineNumbers
          wrapLines={true}
          lineProps={(lineNumber) => ({
            style: {
              display: 'block',
              backgroundColor: isHighlighted(lineNumber)
                ? 'var(--code-highlight)'
                : 'transparent',
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
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { BF_CODE } from './types';

export default function BFCodeViewer({ codeLine }: { codeLine: number }) {
  const [copied, setCopied] = useState(false);

  const isHighlighted = (lineNum: number) => {
    if (codeLine === 4  && lineNum >= 3 && lineNum <= 5) return true;   // INIT
    if (codeLine === 8  && lineNum >= 8 && lineNum <= 9) return true;   // ROUND_START
    if (codeLine === 11 && lineNum >= 10 && lineNum <= 11) return true; // RELAX check
    if (codeLine === 12 && lineNum >= 12 && lineNum <= 13) return true; // RELAX update
    if (codeLine === 13 && lineNum === 13) return true;                 // ROUND_END
    if (codeLine === 18 && lineNum >= 16 && lineNum <= 19) return true; // NEGATIVE_CYCLE
    if (codeLine === 20 && lineNum === 21) return true;                 // DONE
    return false;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BF_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = BF_CODE;
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
        <h2 className="font-semibold tracking-tight text-sm truncate">Source Code (Python Bellman-Ford)</h2>
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
              borderLeft: isHighlighted(lineNumber) ? '3px solid #3b82f6' : '3px solid transparent',
              paddingLeft: '10px',
              whiteSpace: 'pre',
            }
          })}
          customStyle={{ margin: 0, padding: '16px 0', background: 'transparent', minWidth: 'max-content' }}
        >
          {BF_CODE}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

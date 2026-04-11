import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { PRIM_CODE } from './types';

/*
  Line map:
   9-10 = key[0]=0, pq init       (INIT)
   14   = heappop                  (EXTRACT_MIN)
   16-17= if in_mst / continue    (ALREADY_IN_MST)
   19-20= in_mst[u]=True, cost+=k (ADD_TO_MST)
   22-26= for neighbor / update   (UPDATE)
   28   = return                   (DONE)
*/

function isHighlighted(lineNum: number, codeLine: number): boolean {
  if (codeLine === 9  && lineNum >= 9  && lineNum <= 10) return true; // INIT
  if (codeLine === 14 && lineNum === 14)                 return true; // EXTRACT_MIN
  if (codeLine === 16 && lineNum >= 16 && lineNum <= 17) return true; // ALREADY_IN_MST
  if (codeLine === 19 && lineNum >= 19 && lineNum <= 20) return true; // ADD_TO_MST
  if (codeLine === 22 && lineNum >= 22 && lineNum <= 26) return true; // UPDATE
  if (codeLine === 28 && lineNum === 28)                 return true; // DONE
  return false;
}

interface Props {
  codeLine: number;
}

export default function PrimCodeViewer({ codeLine }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(PRIM_CODE); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = PRIM_CODE;
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
        <h2 className="font-semibold tracking-tight text-sm truncate">Source Code (Prim's MST)</h2>
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

      <div className="dark flex-1 overflow-auto text-[13px] bg-[var(--code-bg)]" style={{ overflowX: 'auto' }}>
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          showLineNumbers
          wrapLines={true}
          lineProps={(lineNumber) => ({
            style: {
              display: 'block',
              backgroundColor: isHighlighted(lineNumber, codeLine) ? 'var(--code-highlight)' : 'transparent',
              borderLeft: isHighlighted(lineNumber, codeLine) ? '3px solid #22c55e' : '3px solid transparent',
              paddingLeft: '10px',
              whiteSpace: 'pre',
            },
          })}
          customStyle={{ margin: 0, padding: '16px 0', background: 'transparent', minWidth: 'max-content' }}
        >
          {PRIM_CODE}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

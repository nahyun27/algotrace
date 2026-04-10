import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { BFS_CODE, DFS_CODE } from './types';

SyntaxHighlighter.registerLanguage('python', python);

interface CodeViewerProps {
  codeLine: number;
  mode: 'BFS' | 'DFS';
}

export default function CodeViewer({ codeLine, mode }: CodeViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const code = mode === 'BFS' ? BFS_CODE : DFS_CODE;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border bg-[#1E1E1E] shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs font-semibold text-zinc-300">
          {mode === 'BFS' ? 'bfs.py' : 'dfs.py'}
        </span>
        <button
          onClick={handleCopy}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title="코드 복사"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm leading-relaxed relative">
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus as any}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: '13px'
          }}
          wrapLines={true}
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: '#6e7681', textAlign: 'right' }}
          lineProps={(lineNumber) => {
            const style: any = { display: 'block', padding: '0 4px' };
            if (lineNumber === codeLine) {
              style.backgroundColor = 'rgba(147, 197, 253, 0.15)'; // blue-300 with opacity
              style.borderLeft = '3px solid #3b82f6'; // blue-500
              style.paddingLeft = '1px';
            } else {
              style.borderLeft = '3px solid transparent';
            }
            return { style };
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { cn } from '../ui';

// Light build: register only the languages the code panels show
SyntaxHighlighter.registerLanguage('python', python);

interface CodeBlockProps {
  code: string;
  language?: string;
  isLineHighlighted?: (lineNum: number) => boolean;
  /** Keep the first highlighted line scrolled into view */
  followHighlight?: boolean;
  className?: string;
  fontSize?: number;
}

/** Syntax-highlighted code with the current step's lines marked. */
export function CodeBlock({ code, language = 'python', isLineHighlighted, followHighlight = true, className, fontSize = 13 }: CodeBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Signature of the highlighted lines: changes whenever the step moves to other lines
  const lineCount = code.split('\n').length;
  let hlKey = '';
  for (let i = 1; i <= lineCount; i++) if (isLineHighlighted?.(i)) hlKey += i + ',';

  useEffect(() => {
    if (!followHighlight || !hlKey) return;
    const box = ref.current;
    const target = box?.querySelector<HTMLElement>('[data-hl="true"]');
    if (!box || !target) return;
    const top = target.offsetTop;
    const bottom = top + target.offsetHeight;
    if (top < box.scrollTop + 24 || bottom > box.scrollTop + box.clientHeight - 24) {
      box.scrollTo({ top: Math.max(0, top - box.clientHeight / 3), behavior: 'smooth' });
    }
  }, [hlKey, followHighlight]);

  return (
    <div ref={ref} className={cn('relative overflow-auto bg-code-bg', className)} style={{ fontSize }}>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers
        wrapLines
        lineNumberStyle={{ minWidth: '2.25em', paddingRight: '1em', color: '#6b7094', userSelect: 'none' }}
        lineProps={(lineNumber) => {
          const hl = isLineHighlighted?.(lineNumber) ?? false;
          return {
            'data-hl': hl ? 'true' : undefined,
            style: {
              display: 'block',
              backgroundColor: hl ? 'var(--code-highlight)' : 'transparent',
              boxShadow: hl ? 'inset 3px 0 0 var(--primary)' : 'none',
              paddingLeft: '12px',
              whiteSpace: 'pre',
              transition: 'background-color 0.2s',
            },
          } as React.HTMLProps<HTMLElement>;
        }}
        customStyle={{ margin: 0, padding: '14px 0', background: 'transparent', minWidth: 'max-content', fontFamily: 'var(--font-mono)', lineHeight: 1.65 }}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/** Copy-to-clipboard with a short "copied" state. Pass a function to read the text at click time (e.g. the URL). */
export function useCopy(text: string | (() => string)) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const value = typeof text === 'function' ? text() : text;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return { copied, copy };
}

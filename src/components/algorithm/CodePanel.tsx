import { useState } from 'react';
import { Copy, Check, Maximize2 } from 'lucide-react';
import { IconButton } from '../ui';
import CodeModal from './CodeModal';
import { CodeBlock, useCopy } from './CodeBlock';
import { useTr } from '../../i18n';

interface CodePanelProps {
  title: string;
  code: string;
  language?: string;
  isLineHighlighted?: (lineNum: number) => boolean;
}

/** Source code view for the right panel: fills the available height, follows the highlighted line. */
export default function CodePanel({ title, code, language = 'python', isLineHighlighted }: CodePanelProps) {
  const tr = useTr();
  const [isExpanded, setIsExpanded] = useState(false);
  const { copied, copy } = useCopy(code);

  return (
    <div className="flex flex-col h-full min-h-0 rounded-2xl overflow-hidden border border-border bg-code-bg">
      <div className="flex items-center justify-between gap-2 pl-4 pr-2 py-1.5 bg-[#25284a] text-[#e3e5f7] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex gap-1 shrink-0" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd166]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#06d6a0]" />
          </span>
          <h2 className="text-xs font-semibold truncate opacity-90">{title}</h2>
        </div>
        <div className="flex items-center shrink-0">
          <IconButton size="sm" label={tr('코드 확대', 'Expand code')} onClick={() => setIsExpanded(true)} className="text-[#b9bce0] hover:text-white hover:bg-white/10">
            <Maximize2 className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton size="sm" label={copied ? tr('복사됨!', 'Copied!') : tr('코드 복사', 'Copy code')} onClick={copy} className={copied ? 'text-[#06d6a0] hover:bg-white/10' : 'text-[#b9bce0] hover:text-white hover:bg-white/10'}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </IconButton>
        </div>
      </div>
      <CodeBlock code={code} language={language} isLineHighlighted={isLineHighlighted} className="flex-1 min-h-0" />
      <CodeModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        code={code}
        title={title}
        language={language}
        isLineHighlighted={isLineHighlighted}
      />
    </div>
  );
}

import { useState } from 'react';
import { Copy, Check, Maximize2 } from 'lucide-react';
import { IconButton, cn } from '../ui';
import CodeModal from './CodeModal';
import { CodeBlock, useCopy } from './CodeBlock';
import { CODE_LANGS, CODE_LANG_LABEL, setCodeLang, useCodeLang, type CodeLang } from './codeLang';
import { useTr } from '../../i18n';

export interface CodeSource {
  code: string;
  /** Which lines the current step highlights, in this language's numbering */
  isLineHighlighted?: (lineNum: number) => boolean;
}

interface CodePanelProps {
  /** File name of the Python version, e.g. "dijkstra.py"; other languages swap the extension */
  title: string;
  /** Python source (always present) */
  code: string;
  language?: string;
  isLineHighlighted?: (lineNum: number) => boolean;
  /** Optional C++ / Java versions with their own line mapping */
  sources?: Partial<Record<Exclude<CodeLang, 'python'>, CodeSource>>;
}

const EXT: Record<CodeLang, string> = { python: '.py', cpp: '.cpp', java: '.java' };

/** Source code view for the right panel: fills the available height, follows the highlighted line. */
export default function CodePanel({ title, code, language = 'python', isLineHighlighted, sources }: CodePanelProps) {
  const tr = useTr();
  const preferred = useCodeLang();
  const [isExpanded, setIsExpanded] = useState(false);

  const available = CODE_LANGS.filter(l => l === 'python' || sources?.[l]);
  const lang: CodeLang = available.includes(preferred) ? preferred : 'python';
  const active: CodeSource = lang === 'python' ? { code, isLineHighlighted } : sources![lang]!;
  const prismLang = lang === 'python' ? language : lang;
  const fileName = lang === 'python' ? title : title.replace(/\.py$/, '') + EXT[lang];

  const { copied, copy } = useCopy(active.code);

  return (
    <div className="flex flex-col h-full min-h-0 rounded-2xl overflow-hidden border border-border bg-code-bg">
      <div className="flex items-center justify-between gap-2 pl-4 pr-2 py-1.5 bg-[#25284a] text-[#e3e5f7] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex gap-1 shrink-0" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd166]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#06d6a0]" />
          </span>
          <h2 className="text-xs font-semibold truncate opacity-90">{fileName}</h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {available.length > 1 && (
            <div className="flex rounded-lg bg-white/10 p-0.5 mr-1" role="group" aria-label={tr('코드 언어', 'Code language')}>
              {available.map(l => (
                <button
                  key={l}
                  onClick={() => setCodeLang(l)}
                  aria-pressed={l === lang}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors',
                    l === lang ? 'bg-white/20 text-white' : 'text-[#b9bce0] hover:text-white',
                  )}
                >
                  {CODE_LANG_LABEL[l]}
                </button>
              ))}
            </div>
          )}
          <IconButton size="sm" label={tr('코드 확대', 'Expand code')} onClick={() => setIsExpanded(true)} className="text-[#b9bce0] hover:text-white hover:bg-white/10">
            <Maximize2 className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton size="sm" label={copied ? tr('복사됨!', 'Copied!') : tr('코드 복사', 'Copy code')} onClick={copy} className={copied ? 'text-[#06d6a0] hover:bg-white/10' : 'text-[#b9bce0] hover:text-white hover:bg-white/10'}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </IconButton>
        </div>
      </div>
      <CodeBlock code={active.code} language={prismLang} isLineHighlighted={active.isLineHighlighted} className="flex-1 min-h-0" />
      <CodeModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        code={active.code}
        title={fileName}
        language={prismLang}
        isLineHighlighted={active.isLineHighlighted}
      />
    </div>
  );
}

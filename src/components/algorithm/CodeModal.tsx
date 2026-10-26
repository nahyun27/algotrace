import { Copy, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button, Kbd } from '../ui';
import { CodeBlock, useCopy } from './CodeBlock';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  title: string;
  language?: string;
  isLineHighlighted?: (lineNum: number) => boolean;
}

export default function CodeModal({ isOpen, onClose, code, title, language = 'python', isLineHighlighted }: Props) {
  const tr = useTr();
  const { copied, copy } = useCopy(code);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      bodyClassName="px-0 sm:px-0 pb-0 flex flex-col"
      header={
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight truncate">{title}</h2>
          <Button onClick={copy} className={copied ? 'text-state-visited' : ''}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? tr('복사됨!', 'Copied!') : tr('복사', 'Copy')}
          </Button>
        </div>
      }
      footer={
        <span className="mr-auto text-xs text-muted-foreground flex items-center gap-1.5">
          <Kbd>Esc</Kbd> {tr('키로 닫기', 'to close')}
        </span>
      }
    >
      <CodeBlock code={code} language={language} isLineHighlighted={isLineHighlighted} fontSize={15} className="flex-1 min-h-0" />
    </Modal>
  );
}

import type { ReactNode } from 'react';
import { ArrowLeft, Check, Lightbulb, Link2, PencilRuler } from 'lucide-react';
import { Button, cn } from '../ui';
import { toneText } from '../ui/tone';
import { useTr } from '../../i18n';
import { useCopy } from './CodeBlock';

interface AlgorithmHeaderProps {
  title: ReactNode;
  /** Opens the concept modal */
  onInfo?: () => void;
  /** Variant / mode switch (SegmentedControl) shown next to the title */
  tabs?: ReactNode;
  /** Right-aligned controls (example picker, counters, …) */
  controls?: ReactNode;
  /** Show the "copy link" button (the URL carries the variant, example and step). Default true. */
  shareLink?: boolean;
}

export default function AlgorithmHeader({ title, onInfo, tabs, controls, shareLink = true }: AlgorithmHeaderProps) {
  const tr = useTr();
  return (
    <div className="px-4 sm:px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate">{title}</h1>
        {onInfo && (
          <Button variant="soft" onClick={onInfo} className="h-7 px-2.5 rounded-full">
            <Lightbulb className="w-3.5 h-3.5" />
            {tr('개념 보기', 'Learn')}
          </Button>
        )}
      </div>
      {tabs}
      {(controls || shareLink) && (
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {controls}
          {shareLink && <CopyLinkButton />}
        </div>
      )}
    </div>
  );
}

/** Copies the current page URL (variant / example / step live in the query string). */
export function CopyLinkButton() {
  const tr = useTr();
  const { copied, copy } = useCopy(() => window.location.href);
  return (
    <Button
      variant="secondary"
      onClick={copy}
      title={tr('현재 단계까지 담긴 링크를 복사해요', 'Copy a link to this exact step')}
      aria-live="polite"
      className={cn(copied && toneText.visited)}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
      {copied ? tr('복사됨', 'Copied') : tr('링크 복사', 'Copy link')}
    </Button>
  );
}

/** "← 시각화로 돌아가기": shown in the header while the graph editor is open. */
export function BackToVisualizationButton({ onClick }: { onClick: () => void }) {
  const tr = useTr();
  return (
    <Button variant="secondary" onClick={onClick}>
      <ArrowLeft className="w-3.5 h-3.5" />
      {tr('시각화로 돌아가기', 'Back to visualization')}
    </Button>
  );
}

/** Floating "직접 만들기" button placed over a graph canvas (parent must be `relative`). */
export function EditGraphButton({ onClick }: { onClick: () => void }) {
  const tr = useTr();
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      title={tr('그래프 직접 만들기', 'Build your own graph')}
      className="absolute top-3 right-3 z-10 bg-card/90 backdrop-blur"
    >
      <PencilRuler className="w-3.5 h-3.5" />
      {tr('직접 만들기', 'Edit graph')}
    </Button>
  );
}

import type { ReactNode } from 'react';
import { ArrowLeft, Lightbulb, PencilRuler } from 'lucide-react';
import { Button } from '../ui';
import { useTr } from '../../i18n';

interface AlgorithmHeaderProps {
  title: ReactNode;
  /** Opens the concept modal */
  onInfo?: () => void;
  /** Variant / mode switch (SegmentedControl) shown next to the title */
  tabs?: ReactNode;
  /** Right-aligned controls (example picker, counters, …) */
  controls?: ReactNode;
}

export default function AlgorithmHeader({ title, onInfo, tabs, controls }: AlgorithmHeaderProps) {
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
      {controls && <div className="ml-auto flex flex-wrap items-center gap-2">{controls}</div>}
    </div>
  );
}

/** "← 시각화로 돌아가기" — shown in the header while the graph editor is open. */
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

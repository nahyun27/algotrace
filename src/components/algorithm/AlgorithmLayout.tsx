import type { ReactNode } from 'react';

interface AlgorithmLayoutProps {
  /** The fixed top header bar (AlgorithmHeader) */
  header: ReactNode;
  /** Everything that scrolls as one unit: banner + graph + table etc. */
  scrollable?: ReactNode;
  /** The fixed bottom playback controller */
  stepController?: ReactNode;
  /** The right side code/problem panel */
  rightPanel?: ReactNode;
  /** Editor mode replaces scrollable + stepController */
  editor?: ReactNode;
  isEditorMode?: boolean;
}

/**
 * Full-height layout for all algorithm pages.
 *
 *   ┌───────────────────────────────┐ ┌──────────┐
 *   │ header                        │ │ right    │
 *   ├───────────────────────────────┤ │ panel    │
 *   │ scrollable (banner, viz, …)   │ │ (code /  │
 *   ├───────────────────────────────┤ │ problems)│
 *   │ step controller               │ │          │
 *   └───────────────────────────────┘ └──────────┘
 *
 * Only the scrollable area shrinks when the window gets shorter: the header and
 * step controller always stay visible.
 */
export default function AlgorithmLayout({
  header,
  scrollable,
  stepController,
  rightPanel,
  editor,
  isEditorMode = false,
}: AlgorithmLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 h-full min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col rounded-[var(--radius-card)] overflow-hidden border border-border bg-card text-card-foreground shadow-card">
        <div className="shrink-0 border-b border-border">{header}</div>

        {isEditorMode && editor ? (
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">{editor}</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0">{scrollable}</div>
            {stepController && <div className="shrink-0">{stepController}</div>}
          </>
        )}
      </div>

      {rightPanel}
    </div>
  );
}

import { ReactNode } from 'react';

interface AlgorithmLayoutProps {
  /** The fixed top header bar (title, buttons) */
  header: ReactNode;
  /** Everything that scrolls as one unit: banner + graph + table etc. */
  scrollable: ReactNode;
  /** The fixed bottom playback controller */
  stepController?: ReactNode;
  /** The right side code/problem panel */
  rightPanel?: ReactNode;
  /** Editor mode replaces scrollable + stepController */
  editor?: ReactNode;
  isEditorMode?: boolean;
}

/**
 * Strict 100vh layout for all algorithm pages.
 *
 * Structure of center panel:
 *   ┌────────────────────────────────┐ ← shrink-0 (header)
 *   │  scrollable content area       │ ← flex-1 overflow-y-auto
 *   │  (banner + graph + table …)    │
 *   └────────────────────────────────┘
 *   │  StepController                │ ← shrink-0 (footer)
 *   └────────────────────────────────┘
 *
 * When the window gets shorter, only the scrollable area shrinks and
 * gains a scrollbar — the header and step controller always stay visible.
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
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 sm:p-6 md:p-8 pt-4 lg:pt-6 h-full min-h-0 overflow-hidden">

      {/* ── Center Panel ── */}
      <div className="flex-1 flex flex-col lg:min-w-[600px] border border-border/40 rounded-2xl overflow-hidden bg-card/80 backdrop-blur-md text-card-foreground shadow-xl dark:shadow-[0_8px_30px_rgba(99,102,241,0.08)] min-h-0 h-full">

        {isEditorMode && editor ? (
          /* Editor mode – fills the whole panel */
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {editor}
          </div>
        ) : (
          <>
            {/* ① Fixed Header */}
            <div className="shrink-0 bg-muted/30 border-b border-border/40">
              {header}
            </div>

            {/* ② Scrollable body (banner + graph + table) – ONE scroll context */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {scrollable}
            </div>

            {/* ③ Fixed Step Controller */}
            {stepController && (
              <div className="shrink-0 border-t border-border/40">
                {stepController}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Right Panel (code + problems) ── */}
      {rightPanel}
    </div>
  );
}

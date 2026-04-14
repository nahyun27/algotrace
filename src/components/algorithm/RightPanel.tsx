import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { useIsNarrow } from '../../hooks/useIsNarrow';

interface Props {
  children: ReactNode;
}

/**
 * At ≥1200px ("nw"): renders inline as the right sidebar panel.
 * At <1200px: invisible inline; content is instead rendered in a
 * slide-in drawer portal when codeDrawerOpen is true.
 */
export default function RightPanel({ children }: Props) {
  const { codeDrawerOpen, setCodeDrawerOpen } = useLayout();
  const isNarrow = useIsNarrow(1200);

  // Close drawer when this panel unmounts (page navigation)
  useEffect(() => {
    return () => setCodeDrawerOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isNarrow) {
    return (
      <div className="hidden nw:flex flex-col gap-6 shrink-0 w-[340px] wp:w-[420px] h-full overflow-y-auto pb-4 [&>div]:bg-card/50 [&>div]:backdrop-blur-md [&>div]:border-border/40 [&>div]:shadow-xl [&>div]:rounded-2xl dark:[&>div]:shadow-[0_8px_30px_rgba(99,102,241,0.08)] [&>div]:shrink-0">
        {children}
      </div>
    );
  }

  // Narrow mode: portal drawer
  return createPortal(
    <AnimatePresence>
      {codeDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="code-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onClick={() => setCodeDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
          {/* Drawer */}
          <motion.div
            key="code-drawer"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed right-0 top-14 bottom-0 w-[320px] bg-background/95 backdrop-blur-xl border-l border-border/50 z-50 flex flex-col shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20 shrink-0">
              <span className="text-sm font-semibold">코드 & 문제</span>
              <button
                onClick={() => setCodeDrawerOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 [&>div]:bg-card/50 [&>div]:backdrop-blur-md [&>div]:border-border/40 [&>div]:shadow-lg [&>div]:rounded-2xl">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

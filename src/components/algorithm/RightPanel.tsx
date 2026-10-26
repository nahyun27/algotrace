import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, BookOpen, Sparkles } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { useIsNarrow } from '../../hooks/useIsNarrow';
import { cn, IconButton } from '../ui';
import { useTr } from '../../i18n';

/** Below this width the panel turns into a slide-in drawer (matches Tailwind `lg`). */
export const PANEL_BREAKPOINT = 1023;

const MIN_W = 320;
const MAX_W = 720;

type TabId = 'code' | 'problems' | 'extra';

interface Props {
  /** Source code view (CodePanel) — fills the panel height */
  code?: ReactNode;
  /** Related problem list */
  problems?: ReactNode;
  /** Optional extra insight panel (stats, comparisons) */
  extra?: ReactNode;
  extraLabel?: string;
  /** @deprecated legacy stacked content — pass code/problems instead */
  children?: ReactNode;
}

function usePanelWidth() {
  const [width, setWidth] = useState(() => {
    try { return Number(localStorage.getItem('rightPanelWidth')) || 420; } catch { return 420; }
  });
  useEffect(() => {
    try { localStorage.setItem('rightPanelWidth', String(width)); } catch { /* storage unavailable */ }
  }, [width]);
  return [width, setWidth] as const;
}

/**
 * Code / problems side panel.
 * ≥1024px: inline, resizable, collapsible from the top bar.
 * <1024px: slide-in drawer toggled from the top bar.
 */
export default function RightPanel({ code, problems, extra, extraLabel, children }: Props) {
  const tr = useTr();
  const { codeDrawerOpen, setCodeDrawerOpen, codePanelHidden } = useLayout();
  const isNarrow = useIsNarrow(PANEL_BREAKPOINT);
  const [width, setWidth] = usePanelWidth();
  const [tab, setTab] = useState<TabId>('code');
  const dragging = useRef(false);

  // Close drawer when this panel unmounts (page navigation)
  useEffect(() => () => setCodeDrawerOpen(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs: { id: TabId; label: string; icon: typeof Code2 }[] = [];
  if (code) tabs.push({ id: 'code', label: tr('코드', 'Code'), icon: Code2 });
  if (extra) tabs.push({ id: 'extra', label: extraLabel ?? tr('분석', 'Insights'), icon: Sparkles });
  if (problems) tabs.push({ id: 'problems', label: tr('연습 문제', 'Practice'), icon: BookOpen });
  const activeTab = tabs.some(t => t.id === tab) ? tab : tabs[0]?.id;

  const startDrag = (e: React.PointerEvent) => {
    dragging.current = true;
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) return;
      setWidth(Math.min(MAX_W, Math.max(MIN_W, startW + (startX - ev.clientX))));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const content = children && !code ? (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-4">{children}</div>
  ) : (
    <>
      {tabs.length > 1 && (
        <div role="tablist" className="shrink-0 flex gap-1 p-1 mx-3 mt-3 rounded-xl bg-muted">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors',
                  active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex-1 min-h-0 p-3 flex flex-col">
        {activeTab === 'code' && <div className="flex-1 min-h-[320px] flex flex-col">{code}</div>}
        {activeTab === 'extra' && <div className="flex-1 min-h-0 overflow-y-auto">{extra}</div>}
        {activeTab === 'problems' && <div className="flex-1 min-h-0 overflow-y-auto">{problems}</div>}
      </div>
    </>
  );

  if (!isNarrow) {
    if (codePanelHidden) return null;
    return (
      <aside
        className="relative hidden lg:flex flex-col shrink-0 h-full min-h-0 rounded-[var(--radius-card)] border border-border bg-card shadow-card overflow-hidden"
        style={{ width }}
      >
        <div
          onPointerDown={startDrag}
          onDoubleClick={() => setWidth(420)}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 hover:bg-primary/30 active:bg-primary/50 transition-colors"
          title={tr('드래그해서 너비 조절 (더블클릭: 초기화)', 'Drag to resize (double-click to reset)')}
        />
        {content}
      </aside>
    );
  }

  return createPortal(
    <AnimatePresence>
      {codeDrawerOpen && (
        <>
          <motion.div
            key="code-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCodeDrawerOpen(false)}
            className="fixed inset-0 bg-[#0b0d1f]/45 z-[150]"
          />
          <motion.aside
            key="code-drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[min(440px,92vw)] bg-card border-l border-border z-[151] flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
              <span className="text-sm font-bold">{tr('코드 & 연습 문제', 'Code & practice')}</span>
              <IconButton label={tr('닫기', 'Close')} onClick={() => setCodeDrawerOpen(false)}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            {content}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

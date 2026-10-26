import { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Code2, Moon, Sun, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from './Logo';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';
import { useIsNarrow } from '../../hooks/useIsNarrow';
import { PANEL_BREAKPOINT } from '../algorithm/RightPanel';
import { getAlgorithm, getCategory } from '../../algorithms/registry';
import { useTheme } from '../../theme/ThemeProvider';
import { useLang, useTr } from '../../i18n';
import { cn, IconButton } from '../ui';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-xl bg-muted p-0.5" role="group" aria-label="Language">
      {(['ko', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-bold transition-colors',
            lang === l ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l === 'ko' ? '한국어' : 'EN'}
        </button>
      ))}
    </div>
  );
}

function TopBar() {
  const { setSidebarOpen, codeDrawerOpen, setCodeDrawerOpen, codePanelHidden, setCodePanelHidden } = useLayout();
  const { isDark, toggleTheme } = useTheme();
  const { lang } = useLang();
  const tr = useTr();
  const location = useLocation();
  const panelIsDrawer = useIsNarrow(PANEL_BREAKPOINT);

  const slug = location.pathname.startsWith('/algorithm/') ? location.pathname.split('/')[2] : undefined;
  const algo = getAlgorithm(slug);
  const category = algo ? getCategory(algo.category) : undefined;

  return (
    <header className="h-14 shrink-0 z-40 flex items-center gap-2 px-3 sm:px-4 border-b border-border bg-card/85 backdrop-blur-md">
      <IconButton label={tr('메뉴 열기', 'Open menu')} onClick={() => setSidebarOpen(true)} className="nw:hidden -ml-1">
        <Menu className="w-5 h-5" />
      </IconButton>
      <Link to="/" className="nw:hidden flex items-center gap-2 shrink-0" aria-label="AlgoTrace">
        <Logo className="w-7 h-7" />
      </Link>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="flex items-center gap-1.5 min-w-0 text-sm">
        {algo && category ? (
          <>
            <span className="hidden sm:inline text-muted-foreground truncate">{category.name[lang]}</span>
            <ChevronRight className="hidden sm:block w-4 h-4 text-hint shrink-0" />
            <span className="font-bold truncate">{algo.name[lang]}</span>
          </>
        ) : (
          <span className="font-bold truncate nw:hidden">AlgoTrace</span>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        <LangToggle />
        <IconButton label={isDark ? tr('라이트 모드', 'Light mode') : tr('다크 모드', 'Dark mode')} onClick={toggleTheme}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? 'sun' : 'moon'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </motion.span>
          </AnimatePresence>
        </IconButton>
        <a
          href="https://github.com/nahyun27/algotrace"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
          className="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <GitHubIcon />
        </a>

        {algo && (
          panelIsDrawer ? (
            <button
              onClick={() => setCodeDrawerOpen(!codeDrawerOpen)}
              className={cn(
                'ml-1 inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-colors',
                codeDrawerOpen ? 'bg-primary text-primary-foreground' : 'bg-primary-soft text-primary hover:brightness-95',
              )}
            >
              <Code2 className="w-4 h-4" />
              {tr('코드', 'Code')}
            </button>
          ) : (
            <IconButton
              label={codePanelHidden ? tr('코드 패널 열기', 'Show code panel') : tr('코드 패널 닫기', 'Hide code panel')}
              onClick={() => setCodePanelHidden(!codePanelHidden)}
              active={!codePanelHidden}
            >
              {codePanelHidden ? <PanelRightOpen className="w-[18px] h-[18px]" /> : <PanelRightClose className="w-[18px] h-[18px]" />}
            </IconButton>
          )
        )}
      </div>
    </header>
  );
}

function LayoutInner() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useLayout();
  const location = useLocation();

  // Close the drawer sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground w-full">
      {/* Desktop sidebar (≥1200px) */}
      <aside
        className={cn(
          'hidden nw:block h-full shrink-0 border-r border-border z-40 transition-[width] duration-200',
          sidebarCollapsed ? 'w-[76px]' : 'w-[248px]',
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </aside>

      {/* Drawer sidebar (<1200px) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-[#0b0d1f]/45 z-[100] nw:hidden"
            />
            <motion.aside
              key="sidebar-panel"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-dvh w-[272px] max-w-[85vw] border-r border-border z-[101] nw:hidden shadow-xl"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <LayoutProvider>
      <LayoutInner />
    </LayoutProvider>
  );
}

import { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Code2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';

function LayoutInner() {
  const { sidebarOpen, setSidebarOpen, codeDrawerOpen, setCodeDrawerOpen } = useLayout();
  const location = useLocation();
  const isAlgorithmPage = location.pathname.startsWith('/algorithm/');

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen bg-background text-foreground w-full">
      
      {/* ── Desktop sidebar (sticky, ≥1200px) ── */}
      <aside className="hidden nw:block sticky top-0 h-screen w-[260px] shrink-0 border-r border-border/50 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(99,102,241,0.12)] z-40">
        <Sidebar />
      </aside>

      {/* ── Mobile/Tablet Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] nw:hidden"
            />
            <motion.aside
              key="sidebar-panel"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-[260px] bg-card border-r border-border z-[101] nw:hidden overflow-y-auto shadow-2xl"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* ── Mobile Top Bar ── */}
        <header className="nw:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-card/80 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="font-bold text-sm tracking-tight text-foreground/80 hover:text-primary transition-colors">
              AlgoTrace
            </Link>
          </div>

          <div className="flex items-center">
            <AnimatePresence>
              {isAlgorithmPage && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setCodeDrawerOpen(!codeDrawerOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-sm ${
                    codeDrawerOpen 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-card text-foreground border-border/50 hover:bg-muted'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  Code
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden min-w-0 relative">
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

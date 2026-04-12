import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';

function LayoutInner() {
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground w-full">
      <Header />

      <div className="flex flex-1 relative overflow-hidden">
        {/* ── Desktop sidebar (sticky, ≥1200px) ── */}
        <aside className="hidden nw:block sticky top-14 h-[calc(100vh-3.5rem)] w-[220px] shrink-0 border-r border-border overflow-y-auto">
          <Sidebar />
        </aside>

        {/* ── Overlay sidebar (<1200px) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                key="sidebar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 z-40 nw:hidden"
              />
              <motion.aside
                key="sidebar-panel"
                initial={{ x: -220 }}
                animate={{ x: 0 }}
                exit={{ x: -220 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-[220px] bg-background border-r border-border z-50 nw:hidden overflow-y-auto shadow-xl"
              >
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main className="flex-1 py-3 sm:py-6 lg:py-8 px-2 sm:px-4 overflow-x-hidden min-w-0">
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

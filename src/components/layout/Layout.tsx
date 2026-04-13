import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
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
    <div className="flex min-h-screen bg-background text-foreground w-full">
      
      {/* ── Desktop sidebar (sticky, ≥1200px) ── */}
      <aside className="hidden nw:block sticky top-0 h-screen w-[260px] shrink-0 border-r border-border/50 overflow-y-auto">
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
              className="fixed left-0 top-0 h-screen w-[260px] bg-background border-r border-border z-[101] nw:hidden overflow-y-auto shadow-2xl"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Floating Mobile Menu Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(true)}
          className="nw:hidden fixed top-4 left-4 z-40 p-3 rounded-2xl glass shadow-lg text-foreground border border-border/50"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

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

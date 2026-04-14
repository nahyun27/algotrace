import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronDown, Hash, LayoutGrid, Zap, Search, Activity, Box, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose?: () => void;
}

interface CategoryItem {
  name: string;
  path: string;
  icon: any;
}

interface Category {
  label: string;
  items: CategoryItem[];
}

const CATEGORIES: Category[] = [
  {
    label: 'Shortest Path',
    items: [
      { name: 'Dijkstra',       path: '/algorithm/dijkstra', icon: Activity },
      { name: 'A* Search',      path: '/algorithm/astar', icon: Zap },
      { name: 'Bellman-Ford',   path: '/algorithm/bellmanford', icon: Hash },
      { name: 'Floyd-Warshall', path: '/algorithm/floyd-warshall', icon: LayoutGrid },
    ],
  },
  {
    label: 'Graph & Tree',
    items: [
      { name: 'BFS / DFS',        path: '/algorithm/bfsdfs', icon: Search },
      { name: 'Topological Sort',  path: '/algorithm/topological', icon: Activity },
      { name: 'Kruskal / Prim',    path: '/algorithm/kruskal', icon: Box },
    ],
  },
  {
    label: 'Dynamic Programming',
    items: [
      { name: 'TSP',  path: '/algorithm/tsp', icon: Hash },
    ],
  },
  {
    label: 'Sorting',
    items: [
      { name: 'All Sorting',  path: '/algorithm/sorting', icon: Activity },
    ],
  },
];

export default function Sidebar({ onClose }: Props) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  const toggleDark = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  const toggle = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  const isActive = (path: string) => location.pathname === path;
  const categoryContainsActive = (cat: Category) => cat.items.some(item => isActive(item.path));

  return (
    <div className="py-8 px-4 h-full flex flex-col gap-6 select-none bg-card">
      
      {/* Brand Identity */}
      <div className="px-2 mb-2">
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 leading-none">
              AlgoTrace
            </span>
            <span className="text-[9px] font-bold text-muted-foreground tracking-[0.2em] uppercase mt-1">
              Visualizer v1.0.4
            </span>
          </div>
        </Link>
      </div>

      <div className="h-px bg-border/40 mx-2" />

      {/* Navigation */}
      <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1 pb-4">
        <div>
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              isActive('/') 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                : 'text-foreground/70 hover:bg-muted hover:text-foreground'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            Overview
          </Link>
        </div>

        {CATEGORIES.map(cat => {
          const hasActive = categoryContainsActive(cat);
          const isCollapsed = collapsed[cat.label] && !hasActive;

          return (
            <div key={cat.label} className="space-y-1">
              <button
                onClick={() => toggle(cat.label)}
                className="w-full flex items-center justify-between px-3 py-1 group cursor-pointer"
              >
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                  {cat.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/30 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex flex-col gap-1 mt-1 overflow-hidden"
                  >
                    {cat.items.map(item => {
                      const active = isActive(item.path);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all ${
                            active
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground/60 hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-primary' : 'text-muted-foreground/40'}`} />
                          {item.name}
                          {active && (
                            <motion.div 
                              layoutId="active-pill"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer Tools */}
      <div className="mt-auto space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/nahyun27/algotrace"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl glass hover:bg-muted transition-all text-foreground/70 hover:text-foreground hover:scale-110"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
            <button
              onClick={toggleDark}
              className="p-2.5 rounded-xl glass hover:bg-muted transition-all text-foreground/70 hover:text-foreground hover:scale-110"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/30">
              AlgoTrace System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

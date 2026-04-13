import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronDown } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

interface CategoryItem {
  name: string;
  path: string;
}

interface Category {
  label: string;
  items: CategoryItem[];
}

const CATEGORIES: Category[] = [
  {
    label: 'SHORTEST PATH',
    items: [
      { name: 'Dijkstra',       path: '/algorithm/dijkstra' },
      { name: 'A* Search',      path: '/algorithm/astar' },
      { name: 'Bellman-Ford',   path: '/algorithm/bellmanford' },
      { name: 'Floyd-Warshall', path: '/algorithm/floyd-warshall' },
    ],
  },
  {
    label: 'GRAPH',
    items: [
      { name: 'BFS / DFS',        path: '/algorithm/bfsdfs' },
      { name: 'Topological Sort',  path: '/algorithm/topological' },
      { name: 'Kruskal / Prim',    path: '/algorithm/kruskal' },
    ],
  },
  {
    label: 'DP',
    items: [
      { name: 'TSP',  path: '/algorithm/tsp' },
    ],
  },
  {
    label: 'SORTING',
    items: [
      { name: 'Sorting',  path: '/algorithm/sorting' },
    ],
  },
];

export default function Sidebar({ onClose }: Props) {
  const location = useLocation();

  // Determine which categories start open: all of them + whichever contains the active page
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  const isActive = (path: string) => location.pathname === path;

  // Force-open a category if it contains the active page
  const categoryContainsActive = (cat: Category) =>
    cat.items.some(item => isActive(item.path));

  return (
    <div className="py-4 px-3 h-full flex flex-col gap-1">

      {/* Home link */}
      <Link
        to="/"
        onClick={onClose}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
          isActive('/') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
        }`}
      >
        <Home className="w-4 h-4 shrink-0" />
        Home
      </Link>

      <div className="my-1.5 border-t border-border/60" />

      {/* Categories */}
      {CATEGORIES.map(cat => {
        const hasActive = categoryContainsActive(cat);
        const isCollapsed = collapsed[cat.label] && !hasActive;

        return (
          <div key={cat.label}>
            {/* Category header */}
            <button
              onClick={() => toggle(cat.label)}
              className="w-full flex items-center justify-between px-3 py-1.5 group cursor-pointer"
            >
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/70 group-hover:text-muted-foreground transition-colors select-none">
                {cat.label}
              </span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground/40 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
            </button>

            {/* Items */}
            {!isCollapsed && (
              <div className="flex flex-col gap-0.5 mt-0.5 mb-2">
                {cat.items.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`block rounded-md ml-1 px-3 py-1.5 text-[13px] font-medium transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

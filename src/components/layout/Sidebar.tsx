import { Link, useLocation } from 'react-router-dom';
import { FileCode2, Home } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: 'Home',       path: '/',                 icon: Home       },
    { name: 'TSP',        path: '/algorithm/tsp',    icon: FileCode2  },
    { name: 'Dijkstra',   path: '/algorithm/dijkstra', icon: FileCode2 },
  ];

  return (
    <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r border-border py-6 pr-4 pl-4">
      <div className="h-full py-2">
        <div className="space-y-4">
          <div className="py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Algorithms</h2>
            <div className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-muted ${
                      isActive ? 'bg-muted text-primary' : 'text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

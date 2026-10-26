import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALGORITHMS, ACTIVE_CATEGORIES as CATEGORIES } from '../../algorithms/registry';
import { useLang, useTr } from '../../i18n';
import { cn, IconButton } from '../ui';
import Logo from './Logo';

interface Props {
  onClose?: () => void;
  /** Icon-only rail (desktop collapsed) */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function Sidebar({ onClose, collapsed = false, onToggleCollapsed }: Props) {
  const location = useLocation();
  const { lang } = useLang();
  const tr = useTr();
  const [closedCats, setClosedCats] = useState<Record<string, boolean>>({});

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-full flex flex-col bg-card select-none">
      {/* Brand */}
      <div className={cn('h-16 shrink-0 flex items-center', collapsed ? 'justify-center' : 'px-5 justify-between')}>
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5 group" aria-label="AlgoTrace">
          <Logo className="w-9 h-9 group-hover:rotate-[-6deg] transition-transform" />
          {!collapsed && (
            <span className="font-black text-lg tracking-tight">
              Algo<span className="text-primary">Trace</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto no-scrollbar pb-4 flex flex-col gap-4', collapsed ? 'px-2.5' : 'px-3')}>
        <NavItem
          to="/"
          active={isActive('/')}
          collapsed={collapsed}
          onClick={onClose}
          icon={<Home className="w-[18px] h-[18px]" />}
          label={tr('홈', 'Home')}
          strong
        />

        {CATEGORIES.map(cat => {
          const items = ALGORITHMS.filter(a => a.category === cat.id);
          const hasActive = items.some(a => isActive(`/algorithm/${a.slug}`));
          const isClosed = !collapsed && closedCats[cat.id] && !hasActive;

          return (
            <div key={cat.id} className="flex flex-col gap-0.5">
              {collapsed ? (
                <div className="mx-auto my-1 w-6 h-px bg-border" />
              ) : (
                <button
                  onClick={() => setClosedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                  className="flex items-center justify-between px-3 py-1.5 group rounded-lg"
                  aria-expanded={!isClosed}
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                    <span className={cn('w-1.5 h-1.5 rounded-full bg-gradient-to-br', cat.gradient)} />
                    {cat.name[lang]}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-hint transition-transform duration-200', isClosed && '-rotate-90')} />
                </button>
              )}

              <AnimatePresence initial={false}>
                {!isClosed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="flex flex-col gap-0.5 overflow-hidden"
                  >
                    {items.map(algo => {
                      const Icon = algo.icon;
                      const path = `/algorithm/${algo.slug}`;
                      return (
                        <NavItem
                          key={algo.slug}
                          to={path}
                          active={isActive(path)}
                          collapsed={collapsed}
                          onClick={onClose}
                          icon={<Icon className="w-[18px] h-[18px]" />}
                          label={algo.name[lang]}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {onToggleCollapsed && (
        <div className={cn('shrink-0 border-t border-border p-3 flex', collapsed ? 'justify-center' : 'justify-end')}>
          <IconButton
            label={collapsed ? tr('사이드바 펼치기', 'Expand sidebar') : tr('사이드바 접기', 'Collapse sidebar')}
            onClick={onToggleCollapsed}
          >
            {collapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          </IconButton>
        </div>
      )}
    </div>
  );
}

interface NavItemProps {
  to: string;
  active: boolean;
  collapsed: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  strong?: boolean;
}

function NavItem({ to, active, collapsed, icon, label, onClick, strong }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-xl text-sm transition-colors',
        collapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-3 py-2.5',
        strong ? 'font-bold' : 'font-medium',
        active ? 'bg-primary-soft text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {active && !collapsed && (
        <motion.span layoutId="sidebar-active" className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
      )}
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

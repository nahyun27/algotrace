import { Moon, Sun, Menu, Code2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';

export default function Header() {
  const { setSidebarOpen, codeDrawerOpen, setCodeDrawerOpen } = useLayout();
  const location = useLocation();
  const isAlgorithmPage = location.pathname.startsWith('/algorithm/');

  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(d => !d);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-3 max-w-screen-2xl mx-auto">

        {/* Left: hamburger (narrow) + logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="메뉴 열기"
            className="nw:hidden p-2 rounded-md hover:bg-muted transition-colors text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-base">AlgoTrace</span>
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: code button (narrow + algorithm page only) + github + dark mode */}
        <div className="flex items-center gap-1">
          {isAlgorithmPage && (
            <button
              onClick={() => setCodeDrawerOpen(!codeDrawerOpen)}
              aria-label="코드 보기"
              className={`nw:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                codeDrawerOpen
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted text-foreground'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              코드 보기
            </button>
          )}

          {/* GitHub button with star tooltip */}
          <div className="relative group">
            <a
              href="https://github.com/nahyun27/algotrace"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 저장소"
              className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-muted transition-colors text-foreground"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
            {/* Tooltip bubble */}
            <div className="
              pointer-events-none absolute right-0 top-full mt-2 z-50
              opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
              transition-all duration-200
              whitespace-nowrap
            ">
              <div className="relative bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
                유용하셨다면 ⭐ Star 눌러주세요!
                {/* Arrow */}
                <span className="absolute -top-1.5 right-3 w-3 h-3 bg-zinc-900 dark:bg-zinc-100 rotate-45 rounded-sm" />
              </div>
            </div>
          </div>

          <button
            onClick={toggleDark}
            aria-label="다크모드 전환"
            className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-muted transition-colors"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

      </div>
    </header>
  );
}

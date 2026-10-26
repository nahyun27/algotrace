import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface LayoutContextValue {
  /** Mobile/tablet sidebar drawer */
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  /** Desktop sidebar collapsed to an icon rail */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  /** Code/problem panel drawer on narrow screens */
  codeDrawerOpen: boolean;
  setCodeDrawerOpen: (v: boolean) => void;
  /** Code/problem panel hidden on wide screens */
  codePanelHidden: boolean;
  setCodePanelHidden: (v: boolean) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  codeDrawerOpen: false,
  setCodeDrawerOpen: () => {},
  codePanelHidden: false,
  setCodePanelHidden: () => {},
});

function useStoredBool(key: string, initial: boolean) {
  const [value, setValue] = useState(() => {
    try { return localStorage.getItem(key) === null ? initial : localStorage.getItem(key) === '1'; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, value ? '1' : '0'); } catch { /* storage unavailable */ }
  }, [key, value]);
  return [value, setValue] as const;
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useStoredBool('sidebarCollapsed', false);
  const [codePanelHidden, setCodePanelHidden] = useStoredBool('codePanelHidden', false);
  return (
    <LayoutContext.Provider value={{
      sidebarOpen, setSidebarOpen,
      sidebarCollapsed, setSidebarCollapsed,
      codeDrawerOpen, setCodeDrawerOpen,
      codePanelHidden, setCodePanelHidden,
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}

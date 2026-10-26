import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'ko' | 'en';

/** Picks the string for the given language. Strings live next to the code that uses them. */
export type Tr = (ko: string, en: string) => string;

export function makeTr(lang: Lang): Tr {
  return lang === 'en' ? (_ko, en) => en : (ko) => ko;
}

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'ko',
  setLang: () => {},
  toggleLang: () => {},
});

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'ko';
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'ko' || saved === 'en') return saved;
  } catch { /* storage unavailable */ }
  return navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch { /* storage unavailable */ }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState(l => (l === 'ko' ? 'en' : 'ko')), []);

  const value = useMemo(() => ({ lang, setLang, toggleLang }), [lang, setLang, toggleLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** `const tr = useTr(); tr('한국어', 'English')` */
export function useTr(): Tr {
  const { lang } = useLang();
  return useMemo(() => makeTr(lang), [lang]);
}

import { useSyncExternalStore } from 'react';

/** Languages the code panels can show. Python is always available; the others are optional per algorithm. */
export type CodeLang = 'python' | 'cpp' | 'java';

export const CODE_LANGS: CodeLang[] = ['python', 'cpp', 'java'];

export const CODE_LANG_LABEL: Record<CodeLang, string> = {
  python: 'Python',
  cpp: 'C++',
  java: 'Java',
};

const STORAGE_KEY = 'codeLang';
const listeners = new Set<() => void>();

function read(): CodeLang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'python' || v === 'cpp' || v === 'java') return v;
  } catch { /* storage unavailable */ }
  return 'python';
}

let current: CodeLang = typeof window === 'undefined' ? 'python' : read();

export function setCodeLang(lang: CodeLang) {
  current = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage unavailable */ }
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The reader's preferred code language, shared by every code panel. */
export function useCodeLang(): CodeLang {
  return useSyncExternalStore(subscribe, () => current, () => 'python');
}

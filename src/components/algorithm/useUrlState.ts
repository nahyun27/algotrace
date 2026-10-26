import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { encodeEnum, parseEnum, patchSearch } from './urlState';

/**
 * Returns a function that patches the current query string in place (`replace: true`, no history entries).
 * The patch is applied to `window.location.search`, so several writes in the same tick don't clobber each other.
 */
export function useQueryPatcher() {
  const [, setSearchParams] = useSearchParams();
  return useCallback((patch: Record<string, string | null>) => {
    const current = window.location.search.replace(/^\?/, '');
    const next = patchSearch(current, patch);
    if (next === current) return;
    setSearchParams(new URLSearchParams(next), { replace: true, preventScrollReset: true });
  }, [setSearchParams]);
}

/**
 * A page variant / example stored in the query string, a drop-in replacement for `useState`:
 *
 *   const [algoMode, setAlgoMode] = useUrlState('mode', ['BFS', 'DFS'] as const, 'BFS');
 *   // → /algorithm/bfsdfs?mode=dfs
 *
 * The default value is omitted from the URL. Changing the value also drops `?step=` (pages reset playback on a
 * variant change). Custom user-built inputs never go in the URL.
 */
export function useUrlState<T extends string>(key: string, allowed: readonly T[], fallback: T): [T, (next: T) => void] {
  const [params] = useSearchParams();
  const value = parseEnum(params.get(key), allowed, fallback);
  const patch = useQueryPatcher();
  const setValue = useCallback((next: T) => {
    patch({ [key]: next === fallback ? null : encodeEnum(next), step: null });
  }, [patch, key, fallback]);
  return [value, setValue];
}

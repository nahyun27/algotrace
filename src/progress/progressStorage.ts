/** Learning progress persisted in localStorage: pure helpers (unit-tested in progressStorage.test.ts). */

export const PROGRESS_KEY = 'algotrace:completed';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/** Completed algorithm slugs; an empty list when storage is missing, blocked or corrupted. */
export function readCompleted(storage: StorageLike | undefined | null): string[] {
  try {
    const raw = storage?.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((s): s is string => typeof s === 'string'))];
  } catch {
    return [];
  }
}

/** Persist the list; returns false when storage is unavailable (private mode, quota, …). */
export function writeCompleted(storage: StorageLike | undefined | null, slugs: readonly string[]): boolean {
  try {
    if (!storage) return false;
    storage.setItem(PROGRESS_KEY, JSON.stringify([...new Set(slugs)]));
    return true;
  } catch {
    return false;
  }
}

/** Add a slug to the list (returns the same array when already present). */
export function addCompleted(slugs: readonly string[], slug: string): readonly string[] {
  return slugs.includes(slug) ? slugs : [...slugs, slug];
}

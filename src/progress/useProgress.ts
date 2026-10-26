import { useCallback, useSyncExternalStore } from 'react';
import { addCompleted, PROGRESS_KEY, readCompleted, writeCompleted } from './progressStorage';

/*
 * A tiny external store over localStorage, so every subscriber (sidebar, home cards) re-renders as soon as an
 * algorithm is completed, also across tabs via the `storage` event. No provider needed.
 */

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

let completed: readonly string[] = readCompleted(getStorage());
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== PROGRESS_KEY) return;
  completed = readCompleted(getStorage());
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = () => completed;

/** Mark an algorithm (by slug) as completed: persisted and broadcast to every `useProgress` subscriber. */
export function markCompleted(slug: string) {
  const next = addCompleted(completed, slug);
  if (next === completed) return;
  completed = next;
  writeCompleted(getStorage(), next);
  emit();
}

/** `{ completed, isCompleted(slug), markCompleted(slug) }`: the live list of completed algorithm slugs. */
export function useProgress() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const isCompleted = useCallback((slug: string) => list.includes(slug), [list]);
  return { completed: list, isCompleted, markCompleted };
}

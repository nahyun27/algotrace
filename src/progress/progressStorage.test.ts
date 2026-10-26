import { describe, it, expect } from 'vitest';
import { addCompleted, PROGRESS_KEY, readCompleted, writeCompleted, type StorageLike } from './progressStorage';

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = v; },
  };
}

const throwing: StorageLike = {
  getItem: () => { throw new Error('SecurityError'); },
  setItem: () => { throw new Error('QuotaExceededError'); },
};

describe('progress storage', () => {
  it('uses the algotrace:completed key', () => {
    expect(PROGRESS_KEY).toBe('algotrace:completed');
  });

  it('reads an empty list when nothing is stored', () => {
    expect(readCompleted(memoryStorage())).toEqual([]);
    expect(readCompleted(null)).toEqual([]);
    expect(readCompleted(undefined)).toEqual([]);
  });

  it('round-trips a list through write/read', () => {
    const s = memoryStorage();
    expect(writeCompleted(s, ['dijkstra', 'bfsdfs'])).toBe(true);
    expect(JSON.parse(s.data[PROGRESS_KEY])).toEqual(['dijkstra', 'bfsdfs']);
    expect(readCompleted(s)).toEqual(['dijkstra', 'bfsdfs']);
  });

  it('dedupes and ignores non-string entries', () => {
    const s = memoryStorage({ [PROGRESS_KEY]: JSON.stringify(['a', 'a', 3, null, 'b']) });
    expect(readCompleted(s)).toEqual(['a', 'b']);
    writeCompleted(s, ['x', 'x']);
    expect(readCompleted(s)).toEqual(['x']);
  });

  it('survives corrupted JSON and non-array values', () => {
    expect(readCompleted(memoryStorage({ [PROGRESS_KEY]: '{not json' }))).toEqual([]);
    expect(readCompleted(memoryStorage({ [PROGRESS_KEY]: '{"a":1}' }))).toEqual([]);
    expect(readCompleted(memoryStorage({ [PROGRESS_KEY]: '"dijkstra"' }))).toEqual([]);
  });

  it('never throws when storage is blocked', () => {
    expect(readCompleted(throwing)).toEqual([]);
    expect(writeCompleted(throwing, ['a'])).toBe(false);
    expect(writeCompleted(null, ['a'])).toBe(false);
  });

  it('addCompleted appends once and keeps identity when already present', () => {
    const list = ['a'];
    expect(addCompleted(list, 'b')).toEqual(['a', 'b']);
    expect(addCompleted(list, 'a')).toBe(list);
  });
});

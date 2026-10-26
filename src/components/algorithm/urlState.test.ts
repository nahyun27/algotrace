import { describe, it, expect } from 'vitest';
import { clampStep, encodeEnum, encodeStep, parseEnum, parseStep, parseStepParam, patchSearch } from './urlState';

describe('step query param', () => {
  it('parses valid indices', () => {
    expect(parseStep('0', 20)).toBe(0);
    expect(parseStep('10', 20)).toBe(10);
    expect(parseStep('19', 20)).toBe(19);
  });

  it('clamps to the step count', () => {
    expect(parseStep('20', 20)).toBe(19);
    expect(parseStep('9999', 5)).toBe(4);
    expect(parseStep('-3', 20)).toBe(0);
    expect(parseStep('5', 0)).toBe(0);
    expect(clampStep(7, 1)).toBe(0);
  });

  it('falls back to 0 for missing / invalid values and floors fractions', () => {
    for (const raw of [null, undefined, '', '  ', 'abc', 'NaN', 'Infinity']) expect(parseStep(raw, 20)).toBe(0);
    expect(parseStep('3.7', 20)).toBe(3);
    expect(parseStepParam('12')).toBe(12);
  });

  it('omits the first step from the URL', () => {
    expect(encodeStep(0)).toBeNull();
    expect(encodeStep(12)).toBe('12');
  });
});

describe('enum query param', () => {
  const modes = ['BFS', 'DFS'] as const;

  it('matches case-insensitively and round-trips through encodeEnum', () => {
    expect(parseEnum('dfs', modes, 'BFS')).toBe('DFS');
    expect(parseEnum('DFS', modes, 'BFS')).toBe('DFS');
    for (const m of modes) expect(parseEnum(encodeEnum(m), modes, 'BFS')).toBe(m);
    expect(parseEnum(encodeEnum('bottomUp'), ['topDown', 'bottomUp'], 'topDown')).toBe('bottomUp');
  });

  it('falls back on unknown or missing values', () => {
    expect(parseEnum('dijkstra', modes, 'BFS')).toBe('BFS');
    expect(parseEnum(null, modes, 'BFS')).toBe('BFS');
    expect(parseEnum('', modes, 'DFS')).toBe('DFS');
  });
});

describe('patchSearch', () => {
  it('sets, replaces and deletes keys, keeping the rest', () => {
    expect(patchSearch('', { step: '3' })).toBe('step=3');
    expect(patchSearch('?mode=dfs&step=3', { step: '12' })).toBe('mode=dfs&step=12');
    expect(patchSearch('mode=dfs&step=3', { step: null })).toBe('mode=dfs');
    expect(patchSearch('mode=dfs', { mode: null, step: null })).toBe('');
    expect(patchSearch('a=1', { b: '2' })).toBe('a=1&b=2');
  });
});

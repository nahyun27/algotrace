import { describe, it, expect } from 'vitest';
import { attackedCells, cellsBetween, countQueens, findConflict, generateQueensSteps, generateSudokuSteps, isValidSolution } from './solver';
import { BOJ_2580_ANSWER, QUEENS_DEFAULT_N, QUEENS_STEP_CAP, SUDOKU_PRESETS } from './types';
import { SEEDS, expectLangIndependent, expectStepInvariants, mulberry32, randInt } from '../../test/utils';

/** Queens on `board` never attack each other. */
function queensSafe(board: number[]): boolean {
  const placed = board.map((c, r) => [r, c]).filter(([, c]) => c >= 0);
  return placed.every(([r1, c1], i) => placed.slice(i + 1).every(([r2, c2]) => c1 !== c2 && Math.abs(c1 - c2) !== Math.abs(r1 - r2)));
}

describe('N-Queens', () => {
  it('default N = 4 counts 2 solutions; N = 8 counts 92 (BOJ 9663 sample)', () => {
    expect(generateQueensSteps(QUEENS_DEFAULT_N, 'all', 'en').at(-1)!.solutions).toBe(2);
    expect(generateQueensSteps(8, 'all', 'en').at(-1)!.solutions).toBe(92);
  });

  it('matches a reference count for N = 4..8 and lists distinct valid solutions', () => {
    for (let n = 4; n <= 8; n++) {
      const last = generateQueensSteps(n, 'all', 'en').at(-1)!;
      expect(last.solutions).toBe(countQueens(n));
      expect(new Set(last.found.map(f => f.join(','))).size).toBe(last.found.length);
      for (const f of last.found) {
        expect(f.every(c => c >= 0)).toBe(true);
        expect(queensSafe(f)).toBe(true);
      }
    }
  });

  it('first-solution mode stops at the first SOLUTION', () => {
    for (let n = 4; n <= 8; n++) {
      const steps = generateQueensSteps(n, 'first', 'en');
      expect(steps.filter(s => s.type === 'SOLUTION')).toHaveLength(1);
      expect(steps.at(-2)!.type).toBe('SOLUTION');
      expect(steps.at(-1)!.found[0]).toEqual(generateQueensSteps(n, 'all', 'en').at(-1)!.found[0]);
    }
  });

  it('board stays conflict free; PLACE and CONFLICT steps are consistent', () => {
    for (let n = 4; n <= 6; n++) {
      for (const s of generateQueensSteps(n, 'all', 'en')) {
        expect(queensSafe(s.board)).toBe(true);
        if (s.type === 'PLACE') expect(s.board[s.cell![0]]).toBe(s.cell![1]);
        if (s.type === 'BACKTRACK') expect(s.board[s.cell![0]]).toBe(-1);
        if (s.type === 'CONFLICT') {
          const [r, c] = s.cell!;
          const [ar, ac] = s.attacker!;
          expect(ar).toBeLessThan(r);
          expect(s.board[ar]).toBe(ac);
          expect(ac === c || Math.abs(ac - c) === r - ar).toBe(true);
          expect(attackedCells(s.board)[r][c]).toBe(true);
        }
      }
    }
  });

  it('long count-all runs are capped and fast-forward through solutions', () => {
    const steps = generateQueensSteps(8, 'all', 'en');
    expect(steps.length).toBeLessThan(QUEENS_STEP_CAP + 100);
    expect(steps.at(-1)!.skipped).toBeGreaterThan(0);
    expect(steps.filter(s => s.type === 'SOLUTION')).toHaveLength(92);
  });

  it('cellsBetween walks a column or diagonal', () => {
    expect(cellsBetween([0, 0], [3, 3])).toEqual([[1, 1], [2, 2]]);
    expect(cellsBetween([0, 2], [2, 2])).toEqual([[1, 2]]);
    expect(cellsBetween([1, 1], [2, 2])).toEqual([]);
  });

  it('satisfies step invariants and is language independent', () => {
    for (let n = 4; n <= 8; n++) {
      for (const mode of ['all', 'first'] as const) {
        expectStepInvariants(generateQueensSteps(n, mode, 'en'), ['DONE']);
        expectLangIndependent(generateQueensSteps(n, mode, 'ko'), generateQueensSteps(n, mode, 'en'));
      }
    }
  });
});

/* ─────────── Sudoku ─────────── */

/** Random complete sudoku: shuffle digits, rows within bands and columns within stacks of a base pattern. */
function randomSolved(rng: () => number, n: number): number[][] {
  const b = Math.round(Math.sqrt(n));
  const base = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => ((r % b) * b + Math.floor(r / b) + c) % n));
  const shuffle = <T,>(a: T[]) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(rng, 0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const digits = shuffle(Array.from({ length: n }, (_, i) => i + 1));
  const order = (): number[] => shuffle(Array.from({ length: b }, (_, i) => i)).flatMap(g => shuffle(Array.from({ length: b }, (_, i) => g * b + i)));
  const rows = order(), cols = order();
  return rows.map(r => cols.map(c => digits[base[r][c]]));
}

const RANDOM_PUZZLES: number[][][] = SEEDS.map((seed, i) => {
  const rng = mulberry32(seed);
  const n = i % 4 === 3 ? 9 : 4;
  const solved = randomSolved(rng, n);
  const keep = n === 9 ? 0.7 : 0.35;
  return solved.map(row => row.map(v => (rng() < keep ? v : 0)));
});

describe('Sudoku', () => {
  it('BOJ 2580 sample reproduces the sample output', () => {
    const boj = SUDOKU_PRESETS.find(p => p.id === 'boj')!;
    const last = generateSudokuSteps(boj.grid, 'en').at(-1)!;
    expect(last.solved).toBe(true);
    expect(last.board).toEqual(BOJ_2580_ANSWER);
  });

  it('every preset is solved and the 4×4 presets backtrack', () => {
    for (const p of SUDOKU_PRESETS) {
      const steps = generateSudokuSteps(p.grid, 'en');
      const last = steps.at(-1)!;
      expect(last.solved).toBe(true);
      expect(isValidSolution(p.grid, last.board)).toBe(true);
      if (p.grid.length === 4) expect(steps.some(s => s.type === 'BACKTRACK')).toBe(true);
    }
  });

  it('solves 20 seeded random puzzles (valid, keeps the givens)', () => {
    for (const p of RANDOM_PUZZLES) {
      const last = generateSudokuSteps(p, 'en').at(-1)!;
      expect(last.solved).toBe(true);
      expect(isValidSolution(p, last.board)).toBe(true);
    }
  });

  it('reports puzzles with clashing givens or no solution', () => {
    const clash = [[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    const steps = generateSudokuSteps(clash, 'en');
    expect(steps.at(-1)!.solved).toBe(false);
    expect(steps.some(s => s.type === 'SOLVED')).toBe(false);
    // no clash among givens, but (0,0) can't take any digit: row has 2, 3; column has 4; box has 1
    const stuck = [[0, 2, 3, 0], [0, 1, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]];
    const last = generateSudokuSteps(stuck, 'en').at(-1)!;
    expect(last.solved).toBe(false);
    expect(last.type).toBe('DONE');
  });

  it('INVALID steps name a real conflict; FILL_OK digits are legal', () => {
    for (const p of [...SUDOKU_PRESETS.map(x => x.grid), ...RANDOM_PUZZLES.slice(0, 6)]) {
      for (const s of generateSudokuSteps(p, 'en')) {
        if (s.type === 'INVALID') {
          const [r, c] = s.conflict!;
          expect(s.board[r][c]).toBe(s.digit);
          expect(findConflict(s.board, s.cell![0], s.cell![1], s.digit!)?.kind).toBe(s.conflictKind);
        }
        if (s.type === 'FILL_OK') expect(s.board[s.cell![0]][s.cell![1]]).toBe(s.digit);
        if (s.type === 'BACKTRACK') expect(s.board[s.cell![0]][s.cell![1]]).toBe(0);
      }
    }
  });

  it('satisfies step invariants and is language independent', () => {
    for (const p of [...SUDOKU_PRESETS.map(x => x.grid), ...RANDOM_PUZZLES]) {
      expectStepInvariants(generateSudokuSteps(p, 'en'), ['DONE']);
      expectLangIndependent(generateSudokuSteps(p, 'ko'), generateSudokuSteps(p, 'en'));
    }
  });
});

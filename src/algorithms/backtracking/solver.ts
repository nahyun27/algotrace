import { makeTr, type Lang } from '../../i18n';
import {
  QUEENS_STEP_CAP,
  SUDOKU_STEP_CAP,
  type Cell,
  type ConflictKind,
  type QueensMode,
  type QueensStep,
  type SudokuStep,
} from './types';

/* ═════════════════════════ N-Queens ═════════════════════════ */

/**
 * Code line keys (see CodeViewer): 1 INIT, 2 PLACE, 3 CONFLICT, 4 BACKTRACK, 5 SOLUTION, 6 DONE.
 *
 * In "count all" mode a run longer than `cap` detailed steps fast-forwards: after the cap only the
 * SOLUTION steps (and DONE) are recorded, each carrying how many steps were skipped before it.
 */
export function generateQueensSteps(
  n: number,
  mode: QueensMode = 'all',
  lang: Lang = 'ko',
  cap: number = QUEENS_STEP_CAP,
): QueensStep[] {
  const tr = makeTr(lang);
  const steps: QueensStep[] = [];
  const board: number[] = Array(n).fill(-1);
  const found: number[][] = [];
  let tries = 0;
  let skipped = 0;
  let fast = false;
  let stop = false;

  const cellStr = (r: number, c: number) => `(${r}, ${c})`;

  const push = (s: Omit<QueensStep, 'board' | 'solutions' | 'found' | 'tries' | 'skipped'>, always = false) => {
    if (fast && !always) {
      skipped++;
      return;
    }
    steps.push({ ...s, board: [...board], solutions: found.length, found: found.map(f => [...f]), tries, skipped });
    if (mode === 'all' && !fast && steps.length >= cap) fast = true;
  };

  push({
    type: 'INIT',
    description: tr(
      `N = ${n}: 0번 행부터 한 행에 퀸을 하나씩 놓아 봐요. 각 칸은 위쪽 퀸들과 같은 열이나 대각선에 있으면 안 돼요.`,
      `N = ${n}: place one queen per row, starting at row 0. A square must not share a column or diagonal with any queen above it.`,
    ),
    codeLine: 1,
    cell: null,
    attacker: null,
  });

  const attackerOf = (row: number, col: number): Cell | null => {
    for (let r = 0; r < row; r++) {
      const c = board[r];
      if (c === col || Math.abs(c - col) === row - r) return [r, c];
    }
    return null;
  };

  const solve = (row: number) => {
    if (row === n) {
      found.push([...board]);
      const cols = board.join(', ');
      const skippedNote = fast && skipped > 0
        ? tr(` (빠르게 넘긴 단계: ${skipped}개)`, ` (fast-forwarded past ${skipped} steps)`)
        : '';
      push({
        type: 'SOLUTION',
        description: mode === 'first'
          ? tr(`퀸 ${n}개를 모두 놓았어요! 첫 번째 해는 열 [${cols}]이에요.`, `All ${n} queens are placed! The first solution has columns [${cols}].`)
          : tr(
            `퀸 ${n}개를 모두 놓았어요! ${found.length}번째 해: 열 [${cols}]. 개수를 세고 계속 탐색해요.${skippedNote}`,
            `All ${n} queens are placed! Solution #${found.length}: columns [${cols}]. Count it and keep searching.${skippedNote}`,
          ),
        codeLine: 5,
        cell: null,
        attacker: null,
      }, true);
      if (mode === 'first') stop = true;
      return;
    }
    for (let col = 0; col < n && !stop; col++) {
      tries++;
      const att = attackerOf(row, col);
      if (att) {
        const how = att[1] === col ? tr('같은 열', 'the same column') : tr('같은 대각선', 'the same diagonal');
        push({
          type: 'CONFLICT',
          description: tr(
            `${cellStr(row, col)}은 ${cellStr(att[0], att[1])}의 퀸과 ${how}에 있어요. 공격받으니 놓을 수 없어요.`,
            `${cellStr(row, col)} is on ${how} as the queen at ${cellStr(att[0], att[1])}. It is attacked, so skip it.`,
          ),
          codeLine: 3,
          cell: [row, col],
          attacker: att,
        });
        continue;
      }
      board[row] = col;
      push({
        type: 'PLACE',
        description: row + 1 < n
          ? tr(
            `${cellStr(row, col)}을 공격하는 퀸이 없어요. 퀸을 놓고 ${row + 1}번 행으로 내려가요 (깊이 ${row + 1}).`,
            `No queen attacks ${cellStr(row, col)}. Place a queen and go down to row ${row + 1} (depth ${row + 1}).`,
          )
          : tr(
            `${cellStr(row, col)}을 공격하는 퀸이 없어요. 마지막 행까지 퀸을 놓았어요.`,
            `No queen attacks ${cellStr(row, col)}. A queen now stands on the last row too.`,
          ),
        codeLine: 2,
        cell: [row, col],
        attacker: null,
      });
      solve(row + 1);
      if (stop) return;
      board[row] = -1;
      push({
        type: 'BACKTRACK',
        description: col + 1 < n
          ? tr(
            `${cellStr(row, col)}의 퀸을 치워요 (백트래킹). 같은 행의 다음 열 ${col + 1}을 시도해요.`,
            `Remove the queen at ${cellStr(row, col)} (backtrack). Try the next column ${col + 1} in the same row.`,
          )
          : row > 0
            ? tr(
              `${cellStr(row, col)}의 퀸을 치워요. ${row}번 행의 열을 모두 시도했으니 ${row - 1}번 행으로 돌아가요.`,
              `Remove the queen at ${cellStr(row, col)}. Every column of row ${row} has been tried, so return to row ${row - 1}.`,
            )
            : tr(
              `${cellStr(row, col)}의 퀸을 치워요. 0번 행의 열을 모두 시도했어요.`,
              `Remove the queen at ${cellStr(row, col)}. Every column of row 0 has been tried.`,
            ),
        codeLine: 4,
        cell: [row, col],
        attacker: null,
      });
    }
  };

  solve(0);

  const total = found.length;
  push({
    type: 'DONE',
    description: mode === 'first'
      ? total > 0
        ? tr(`첫 번째 해를 찾았으니 탐색을 멈춰요. 시도한 칸은 ${tries}개예요.`, `The first solution is found, so the search stops. ${tries} squares were tried.`)
        : tr('해가 없어요.', 'There is no solution.')
      : tr(
        `탐색 끝! N = ${n}에서 퀸을 놓는 방법은 모두 ${total}가지예요 (시도한 칸 ${tries}개).`,
        `Search finished! There are ${total} ways to place ${n} queens (${tries} squares tried).`,
      ),
    codeLine: 6,
    cell: null,
    attacker: null,
  }, true);
  return steps;
}

/** Simple reference count of N-Queens solutions. */
export function countQueens(n: number): number {
  const cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>();
  const rec = (r: number): number => {
    if (r === n) return 1;
    let total = 0;
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r + c) || d2.has(r - c)) continue;
      cols.add(c); d1.add(r + c); d2.add(r - c);
      total += rec(r + 1);
      cols.delete(c); d1.delete(r + c); d2.delete(r - c);
    }
    return total;
  };
  return rec(0);
}

/** Cells attacked by the placed queens (queen squares excluded). */
export function attackedCells(board: number[]): boolean[][] {
  const n = board.length;
  const out = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  board.forEach((qc, qr) => {
    if (qc < 0) return;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (r === qr && c === qc) continue;
        if (r === qr || c === qc || Math.abs(r - qr) === Math.abs(c - qc)) out[r][c] = true;
      }
    }
  });
  return out;
}

/** Squares strictly between two cells on a shared column / diagonal. */
export function cellsBetween(a: Cell, b: Cell): Cell[] {
  const dr = Math.sign(b[0] - a[0]), dc = Math.sign(b[1] - a[1]);
  const out: Cell[] = [];
  let r = a[0] + dr, c = a[1] + dc;
  while (r !== b[0] || c !== b[1]) {
    out.push([r, c]);
    r += dr; c += dc;
  }
  return out;
}

/* ═════════════════════════ Sudoku ═════════════════════════ */

const boxSizeOf = (n: number) => Math.round(Math.sqrt(n));

/** First cell that already holds `d` in the row, column or box of (r, c), in the order the code checks them. */
export function findConflict(board: number[][], r: number, c: number, d: number): { cell: Cell; kind: ConflictKind } | null {
  const n = board.length;
  const b = boxSizeOf(n);
  for (let i = 0; i < n; i++) {
    if (board[r][i] === d) return { cell: [r, i], kind: 'row' };
    if (board[i][c] === d) return { cell: [i, c], kind: 'col' };
  }
  const br = r - (r % b), bc = c - (c % b);
  for (let i = br; i < br + b; i++) {
    for (let j = bc; j < bc + b; j++) {
      if (board[i][j] === d) return { cell: [i, j], kind: 'box' };
    }
  }
  return null;
}

/**
 * Code line keys (see CodeViewer): 1 INIT, 2 TRY, 3 INVALID (row/column), 4 INVALID (box), 5 FILL_OK,
 * 6 BACKTRACK, 7 SOLVED, 8 DONE.
 */
export function generateSudokuSteps(puzzle: number[][], lang: Lang = 'ko', cap: number = SUDOKU_STEP_CAP): SudokuStep[] {
  const tr = makeTr(lang);
  const n = puzzle.length;
  const board = puzzle.map(row => [...row]);
  const blanks: Cell[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (board[r][c] === 0) blanks.push([r, c]);

  const steps: SudokuStep[] = [];
  let tries = 0;
  let backtracks = 0;
  let fast = false;
  let skipped = 0;
  const cellStr = (cell: Cell) => `(${cell[0]}, ${cell[1]})`;

  type Partial = Pick<SudokuStep, 'type' | 'description' | 'codeLine'> & Partial2;
  type Partial2 = { cell?: Cell | null; digit?: number | null; conflict?: Cell | null; conflictKind?: ConflictKind | null; deadEnd?: Cell | null; depth?: number; solved?: boolean };
  const push = (s: Partial, always = false) => {
    if (fast && !always) {
      skipped++;
      return;
    }
    steps.push({
      cell: null, digit: null, conflict: null, conflictKind: null, deadEnd: null, depth: 0, solved: false,
      ...s,
      board: board.map(row => [...row]),
      tries,
      backtracks,
    });
    if (!fast && steps.length >= cap) fast = true;
  };

  // A puzzle whose givens already clash has no solution: report it instead of searching.
  let clash: { a: Cell; b: Cell } | null = null;
  for (let r = 0; r < n && !clash; r++) {
    for (let c = 0; c < n && !clash; c++) {
      const d = board[r][c];
      if (!d) continue;
      board[r][c] = 0;
      const hit = findConflict(board, r, c, d);
      board[r][c] = d;
      if (hit) clash = { a: [r, c], b: hit.cell };
    }
  }

  push({
    type: 'INIT',
    description: tr(
      `${n}×${n} 스도쿠: 빈칸 ${blanks.length}개를 위에서 아래, 왼쪽에서 오른쪽 순서로 채워요. 각 칸에 1부터 ${n}까지 넣어 보고, 막히면 되돌아가요.`,
      `${n}×${n} Sudoku: fill the ${blanks.length} blanks top to bottom, left to right. Try 1 to ${n} in each one and step back when stuck.`,
    ),
    codeLine: 1,
  });

  const solve = (k: number): boolean => {
    if (k === blanks.length) return true;
    const [r, c] = blanks[k];
    for (let d = 1; d <= n; d++) {
      tries++;
      push({
        type: 'TRY',
        description: tr(`빈칸 ${cellStr([r, c])}에 ${d}를 넣을 수 있는지 확인해요 (깊이 ${k}).`, `Can ${d} go into the blank at ${cellStr([r, c])}? (depth ${k})`),
        codeLine: 2,
        cell: [r, c],
        digit: d,
        depth: k,
      });
      const hit = findConflict(board, r, c, d);
      if (hit) {
        const where = hit.kind === 'row' ? tr('같은 행', 'the same row') : hit.kind === 'col' ? tr('같은 열', 'the same column') : tr('같은 박스', 'the same box');
        push({
          type: 'INVALID',
          description: tr(
            `${where}의 ${cellStr(hit.cell)}에 이미 ${d}가 있어요. ${d}는 넣을 수 없어요.`,
            `${cellStr(hit.cell)} in ${where} already holds ${d}, so ${d} does not fit.`,
          ),
          codeLine: hit.kind === 'box' ? 4 : 3,
          cell: [r, c],
          digit: d,
          conflict: hit.cell,
          conflictKind: hit.kind,
          depth: k,
        });
        continue;
      }
      board[r][c] = d;
      push({
        type: 'FILL_OK',
        description: k + 1 < blanks.length
          ? tr(
            `${d}는 행, 열, 박스 어디에도 없어요. ${cellStr([r, c])}에 ${d}를 쓰고 다음 빈칸 ${cellStr(blanks[k + 1])}로 가요.`,
            `${d} appears nowhere in the row, column or box. Write ${d} at ${cellStr([r, c])} and move on to the next blank ${cellStr(blanks[k + 1])}.`,
          )
          : tr(
            `${d}는 행, 열, 박스 어디에도 없어요. 마지막 빈칸 ${cellStr([r, c])}에 ${d}를 써요.`,
            `${d} appears nowhere in the row, column or box. Write ${d} into the last blank ${cellStr([r, c])}.`,
          ),
        codeLine: 5,
        cell: [r, c],
        digit: d,
        depth: k,
      });
      if (solve(k + 1)) return true;
      board[r][c] = 0;
      backtracks++;
      const next = k + 1 < blanks.length ? blanks[k + 1] : null;
      push({
        type: 'BACKTRACK',
        description: next
          ? tr(
            `${cellStr(next)}에는 어떤 숫자도 들어갈 수 없어요. ${cellStr([r, c])}의 ${d}를 지우고 (백트래킹) 다음 숫자를 시도해요.`,
            `Nothing fits at ${cellStr(next)}. Erase the ${d} at ${cellStr([r, c])} (backtrack) and try the next digit.`,
          )
          : tr(`${cellStr([r, c])}의 ${d}를 지워요 (백트래킹).`, `Erase the ${d} at ${cellStr([r, c])} (backtrack).`),
        codeLine: 6,
        cell: [r, c],
        digit: d,
        deadEnd: next,
        depth: k,
      });
    }
    return false;
  };

  const ok = clash ? false : solve(0);
  const skippedNote = skipped > 0 ? tr(` (빠르게 넘긴 단계: ${skipped}개)`, ` (fast-forwarded past ${skipped} steps)`) : '';
  if (ok) {
    push({
      type: 'SOLVED',
      description: tr(`빈칸을 모두 채웠어요! 모든 행, 열, 박스에 1부터 ${n}까지 한 번씩 들어 있어요.${skippedNote}`, `Every blank is filled! Each row, column and box holds 1 to ${n} exactly once.${skippedNote}`),
      codeLine: 7,
      depth: blanks.length,
      solved: true,
    }, true);
  }
  push({
    type: 'DONE',
    description: ok
      ? tr(`완성! 숫자 ${tries}번을 시도했고, ${backtracks}번 되돌아갔어요.`, `Done! ${tries} digits were tried with ${backtracks} backtracks.`)
      : clash
        ? tr(
          `처음부터 ${cellStr(clash.a)}과 ${cellStr(clash.b)}의 숫자가 겹쳐서 풀 수 없어요.`,
          `The givens at ${cellStr(clash.a)} and ${cellStr(clash.b)} already clash, so there is no solution.`,
        )
        : tr(`모든 경우를 시도했지만 해가 없어요.${skippedNote}`, `Every option was tried and there is no solution.${skippedNote}`),
    codeLine: 8,
    conflict: clash ? clash.b : null,
    cell: clash ? clash.a : null,
    solved: ok,
  }, true);
  return steps;
}

/** True if `board` is a complete valid sudoku that keeps every given of `puzzle`. */
export function isValidSolution(puzzle: number[][], board: number[][]): boolean {
  const n = puzzle.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const d = board[r][c];
      if (d < 1 || d > n) return false;
      if (puzzle[r][c] && puzzle[r][c] !== d) return false;
      const copy = board.map(row => [...row]);
      copy[r][c] = 0;
      if (findConflict(copy, r, c, d)) return false;
    }
  }
  return true;
}

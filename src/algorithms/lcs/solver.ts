import { makeTr, type Lang } from '../../i18n';
import type { EditOp, LCSStep } from './types';

type Cell = [number, number];

const snapshot = (dp: (number | null)[][]) => dp.map(row => [...row]);
const copyPath = (path: Cell[]) => path.map(c => [...c] as Cell);

/** Code lines of lcs.py (see CodeViewer) */
export const LCS_LINE = { INIT: 3, MATCH: 7, MISMATCH: 9, BT_MATCH: 14, BT_UP: 15, BT_LEFT: 16, DONE: 17 } as const;

/** Longest common subsequence: fill dp, then walk back from (n, m). */
export function generateLCSSteps(A: string, B: string, lang: Lang = 'ko'): LCSStep[] {
  const tr = makeTr(lang);
  const n = A.length, m = B.length;
  const dp: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)));
  const steps: LCSStep[] = [];
  const base = { path: [] as Cell[], result: null, matchA: [] as number[], matchB: [] as number[], script: [] as EditOp[] };

  steps.push({
    ...base, type: 'INIT', codeLine: LCS_LINE.INIT, dp: snapshot(dp), cell: null, deps: [], source: null,
    description: tr(
      `빈 문자열과의 LCS는 0이므로 0행과 0열을 0으로 채워요. (|A| = ${n}, |B| = ${m})`,
      `The LCS with an empty string is 0, so row 0 and column 0 start at 0. (|A| = ${n}, |B| = ${m})`,
    ),
  });

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const a = A[i - 1], b = B[j - 1];
      if (a === b) {
        const diag = dp[i - 1][j - 1] as number;
        dp[i][j] = diag + 1;
        steps.push({
          ...base, type: 'MATCH', codeLine: LCS_LINE.MATCH, dp: snapshot(dp), cell: [i, j],
          deps: [[i - 1, j - 1]], source: [i - 1, j - 1],
          description: tr(
            `A[${i}] = B[${j}] = '${a}' 일치! 대각선 값에 1을 더해요: dp[${i}][${j}] = ${diag} + 1 = ${diag + 1}`,
            `A[${i}] = B[${j}] = '${a}' match! Diagonal + 1: dp[${i}][${j}] = ${diag} + 1 = ${diag + 1}`,
          ),
        });
      } else {
        const up = dp[i - 1][j] as number, left = dp[i][j - 1] as number;
        const best = Math.max(up, left);
        dp[i][j] = best;
        steps.push({
          ...base, type: 'MISMATCH', codeLine: LCS_LINE.MISMATCH, dp: snapshot(dp), cell: [i, j],
          deps: [[i - 1, j], [i, j - 1]], source: up >= left ? [i - 1, j] : [i, j - 1],
          description: tr(
            `'${a}' ≠ '${b}'이므로 위(${up})와 왼쪽(${left}) 중 큰 값을 가져와요: dp[${i}][${j}] = ${best}`,
            `'${a}' ≠ '${b}', so take the larger of up (${up}) and left (${left}): dp[${i}][${j}] = ${best}`,
          ),
        });
      }
    }
  }

  const val = (r: number, c: number) => dp[r][c] as number;
  const result = val(n, m);
  const path: Cell[] = [[n, m]];
  const matchA: number[] = [], matchB: number[] = [];
  let i = n, j = m;
  while (i > 0 && j > 0) {
    let codeLine: number, description: string;
    if (A[i - 1] === B[j - 1]) {
      matchA.unshift(i - 1); matchB.unshift(j - 1);
      codeLine = LCS_LINE.BT_MATCH;
      description = tr(
        `(${i}, ${j}): '${A[i - 1]}'가 같으니 LCS에 넣고 대각선으로 이동해요.`,
        `(${i}, ${j}): '${A[i - 1]}' matches, so add it to the LCS and move diagonally.`,
      );
      i--; j--;
    } else if (val(i - 1, j) >= val(i, j - 1)) {
      codeLine = LCS_LINE.BT_UP;
      description = tr(
        `(${i}, ${j}): 문자가 다르고 위쪽 값(${val(i - 1, j)})이 더 작지 않으니 위로 이동해요.`,
        `(${i}, ${j}): characters differ and up (${val(i - 1, j)}) is not smaller, so move up.`,
      );
      i--;
    } else {
      codeLine = LCS_LINE.BT_LEFT;
      description = tr(
        `(${i}, ${j}): 문자가 다르고 왼쪽 값(${val(i, j - 1)})이 더 크니 왼쪽으로 이동해요.`,
        `(${i}, ${j}): characters differ and left (${val(i, j - 1)}) is larger, so move left.`,
      );
      j--;
    }
    path.push([i, j]);
    steps.push({
      ...base, type: 'BACKTRACK', codeLine, dp: snapshot(dp), cell: [i, j], deps: [], source: null,
      path: copyPath(path), result, matchA: [...matchA], matchB: [...matchB], description,
    });
  }

  const lcs = matchA.map(k => A[k]).join('');
  steps.push({
    ...base, type: 'DONE', codeLine: LCS_LINE.DONE, dp: snapshot(dp), cell: null, deps: [], source: null,
    path, result, matchA, matchB,
    description: tr(
      `완료! LCS 길이 = ${result}${lcs ? `, LCS = "${lcs}"` : ''}`,
      `Done! LCS length = ${result}${lcs ? `, LCS = "${lcs}"` : ''}`,
    ),
  });
  return steps;
}

/** Code lines of edit_distance.py (see CodeViewer) */
export const EDIT_LINE = { INIT: 4, MATCH: 9, REPLACE: 12, DELETE: 13, INSERT: 14, BACKTRACK: 15, DONE: 16 } as const;

/** Levenshtein distance (insert / delete / replace cost 1). */
export function generateEditSteps(A: string, B: string, lang: Lang = 'ko'): LCSStep[] {
  const tr = makeTr(lang);
  const n = A.length, m = B.length;
  const dp: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : null)));
  const steps: LCSStep[] = [];
  const base = { path: [] as Cell[], result: null, matchA: [] as number[], matchB: [] as number[], script: [] as EditOp[] };

  steps.push({
    ...base, type: 'INIT', codeLine: EDIT_LINE.INIT, dp: snapshot(dp), cell: null, deps: [], source: null,
    description: tr(
      '빈 문자열로 만들려면 전부 삭제, 빈 문자열에서 만들려면 전부 삽입해야 하므로 dp[i][0] = i, dp[0][j] = j로 시작해요.',
      'Turning a prefix into "" takes i deletions and building one from "" takes j insertions, so dp[i][0] = i and dp[0][j] = j.',
    ),
  });

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const a = A[i - 1], b = B[j - 1];
      const diag = dp[i - 1][j - 1] as number, up = dp[i - 1][j] as number, left = dp[i][j - 1] as number;
      if (a === b) {
        dp[i][j] = diag;
        steps.push({
          ...base, type: 'MATCH', codeLine: EDIT_LINE.MATCH, dp: snapshot(dp), cell: [i, j],
          deps: [[i - 1, j - 1]], source: [i - 1, j - 1],
          description: tr(
            `'${a}' = '${b}'이므로 고칠 필요가 없어요. 대각선 값을 그대로 가져와요: dp[${i}][${j}] = ${diag}`,
            `'${a}' = '${b}', so nothing to fix. Copy the diagonal: dp[${i}][${j}] = ${diag}`,
          ),
        });
        continue;
      }
      const best = Math.min(diag, up, left);
      const value = best + 1;
      dp[i][j] = value;
      const deps: Cell[] = [[i - 1, j - 1], [i - 1, j], [i, j - 1]];
      const costs = tr(
        `교체 ${diag}+1, 삭제 ${up}+1, 삽입 ${left}+1`,
        `replace ${diag}+1, delete ${up}+1, insert ${left}+1`,
      );
      if (diag === best) {
        steps.push({
          ...base, type: 'REPLACE', codeLine: EDIT_LINE.REPLACE, dp: snapshot(dp), cell: [i, j], deps, source: [i - 1, j - 1],
          description: tr(
            `'${a}' ≠ '${b}' (${costs}) → '${a}'를 '${b}'로 교체가 가장 싸요: dp[${i}][${j}] = ${value}`,
            `'${a}' ≠ '${b}' (${costs}) → replacing '${a}' with '${b}' is cheapest: dp[${i}][${j}] = ${value}`,
          ),
        });
      } else if (up === best) {
        steps.push({
          ...base, type: 'DELETE', codeLine: EDIT_LINE.DELETE, dp: snapshot(dp), cell: [i, j], deps, source: [i - 1, j],
          description: tr(
            `'${a}' ≠ '${b}' (${costs}) → '${a}' 삭제가 가장 싸요: dp[${i}][${j}] = ${value}`,
            `'${a}' ≠ '${b}' (${costs}) → deleting '${a}' is cheapest: dp[${i}][${j}] = ${value}`,
          ),
        });
      } else {
        steps.push({
          ...base, type: 'INSERT', codeLine: EDIT_LINE.INSERT, dp: snapshot(dp), cell: [i, j], deps, source: [i, j - 1],
          description: tr(
            `'${a}' ≠ '${b}' (${costs}) → '${b}' 삽입이 가장 싸요: dp[${i}][${j}] = ${value}`,
            `'${a}' ≠ '${b}' (${costs}) → inserting '${b}' is cheapest: dp[${i}][${j}] = ${value}`,
          ),
        });
      }
    }
  }

  const val = (r: number, c: number) => dp[r][c] as number;
  const result = val(n, m);
  const path: Cell[] = [[n, m]];
  const script: EditOp[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    let description: string;
    if (i > 0 && j > 0 && A[i - 1] === B[j - 1] && val(i, j) === val(i - 1, j - 1)) {
      script.unshift({ op: 'MATCH', a: A[i - 1], b: B[j - 1] });
      description = tr(`(${i}, ${j}): '${A[i - 1]}'는 그대로 두고 대각선으로 이동해요.`, `(${i}, ${j}): keep '${A[i - 1]}' and move diagonally.`);
      i--; j--;
    } else if (i > 0 && j > 0 && val(i, j) === val(i - 1, j - 1) + 1) {
      script.unshift({ op: 'REPLACE', a: A[i - 1], b: B[j - 1] });
      description = tr(`(${i}, ${j}): '${A[i - 1]}' → '${B[j - 1]}' 교체, 대각선으로 이동해요.`, `(${i}, ${j}): replace '${A[i - 1]}' → '${B[j - 1]}', move diagonally.`);
      i--; j--;
    } else if (i > 0 && val(i, j) === val(i - 1, j) + 1) {
      script.unshift({ op: 'DELETE', a: A[i - 1], b: null });
      description = tr(`(${i}, ${j}): '${A[i - 1]}' 삭제, 위로 이동해요.`, `(${i}, ${j}): delete '${A[i - 1]}', move up.`);
      i--;
    } else {
      script.unshift({ op: 'INSERT', a: null, b: B[j - 1] });
      description = tr(`(${i}, ${j}): '${B[j - 1]}' 삽입, 왼쪽으로 이동해요.`, `(${i}, ${j}): insert '${B[j - 1]}', move left.`);
      j--;
    }
    path.push([i, j]);
    steps.push({
      ...base, type: 'BACKTRACK', codeLine: EDIT_LINE.BACKTRACK, dp: snapshot(dp), cell: [i, j], deps: [], source: null,
      path: copyPath(path), result, script: [...script], description,
    });
  }

  steps.push({
    ...base, type: 'DONE', codeLine: EDIT_LINE.DONE, dp: snapshot(dp), cell: null, deps: [], source: null,
    path, result, script,
    description: tr(
      `완료! "${A}" → "${B}" 편집 거리 = ${result}`,
      `Done! Edit distance "${A}" → "${B}" = ${result}`,
    ),
  });
  return steps;
}

import { makeTr, type Lang } from '../../i18n';
import { INF, type Cell, type DequeItem, type ZeroOneStep } from './types';

/** Neighbour order: up, down, left, right */
const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/** Code lines of the Python in CodeViewer (1-based) */
export const LINE = {
  INIT: 6,
  POP: 11,
  STALE: 12,
  SKIP: 20,
  PUSH_FRONT: 23,
  PUSH_BACK: 25,
  DONE: 14,
} as const;

/**
 * 0-1 BFS on a grid (BOJ 1261): entering an empty cell (0) costs 0, breaking a wall (1) costs 1.
 * Start = top-left, goal = bottom-right. Stops when the goal is popped (its dist is final then).
 */
export function generateZeroOneBFSSteps(grid: number[][], lang: Lang = 'ko'): ZeroOneStep[] {
  const tr = makeTr(lang);
  const n = grid.length;
  const m = grid[0]?.length ?? 0;
  const steps: ZeroOneStep[] = [];
  if (n === 0 || m === 0) {
    steps.push({
      type: 'DONE', description: tr('격자가 비어 있어요.', 'The grid is empty.'), codeLine: LINE.DONE,
      dist: [], done: [], deque: [], current: null, neighbor: null, pushedTo: null, skipReason: null,
      path: [], answer: null, pops: 0,
    });
    return steps;
  }

  const dist = Array.from({ length: n }, () => Array<number>(m).fill(INF));
  const done = Array.from({ length: n }, () => Array<boolean>(m).fill(false));
  const parent: (Cell | null)[][] = Array.from({ length: n }, () => Array<Cell | null>(m).fill(null));
  const dq: DequeItem[] = [];
  let pops = 0;
  const p = (x: Cell) => `(${x.r},${x.c})`;
  const kind = (w: number) => (w === 1 ? tr('벽', 'wall') : tr('빈 칸', 'empty cell'));

  const push = (
    type: ZeroOneStep['type'], description: string, codeLine: number,
    extra: Partial<Pick<ZeroOneStep, 'current' | 'neighbor' | 'pushedTo' | 'skipReason' | 'path' | 'answer'>> = {},
  ) => {
    steps.push({
      type, description, codeLine,
      dist: dist.map(row => [...row]),
      done: done.map(row => [...row]),
      deque: dq.map(x => ({ ...x })),
      current: null, neighbor: null, pushedTo: null, skipReason: null, path: [], answer: null,
      pops,
      ...extra,
    });
  };

  dist[0][0] = 0;
  dq.push({ r: 0, c: 0, d: 0 });
  push('INIT', tr(
    `dist를 ∞로 채우고 출발 칸 (0,0)의 dist를 0으로 둔 뒤 덱에 넣어요. 목표는 (${n - 1},${m - 1}) 칸이에요.`,
    `Fill dist with ∞, set dist(0,0) = 0 and put the start cell in the deque. The goal is (${n - 1},${m - 1}).`,
  ), LINE.INIT);

  const goal = { r: n - 1, c: m - 1 };
  let reached = false;

  while (dq.length > 0) {
    const cur = dq.shift()!;
    const cell = { r: cur.r, c: cur.c };
    if (done[cell.r][cell.c]) {
      push('SKIP', tr(
        `덱 앞에서 ${p(cell)} 칸을 꺼냈지만 이미 dist ${dist[cell.r][cell.c]}로 확정된 칸이라 건너뛰어요.`,
        `Popped ${p(cell)} from the front, but it is already settled with dist ${dist[cell.r][cell.c]}, so skip this stale entry.`,
      ), LINE.STALE, { current: cell, skipReason: 'stale' });
      continue;
    }
    done[cell.r][cell.c] = true;
    pops++;
    const d = dist[cell.r][cell.c];

    if (cell.r === goal.r && cell.c === goal.c) {
      reached = true;
      break;
    }

    push('POP', tr(
      `덱 앞에서 ${p(cell)} 칸을 꺼내 확정해요 (dist ${d}). 덱 앞쪽은 항상 dist가 가장 작아요.`,
      `Pop ${p(cell)} from the front and settle it (dist ${d}). The front always holds the smallest dist.`,
    ), LINE.POP, { current: cell });

    for (const [dr, dc] of DIRS) {
      const nr = cell.r + dr;
      const nc = cell.c + dc;
      if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
      const nb = { r: nr, c: nc };
      const w = grid[nr][nc] === 1 ? 1 : 0;
      const nd = d + w;
      if (nd < dist[nr][nc]) {
        const old = dist[nr][nc];
        dist[nr][nc] = nd;
        parent[nr][nc] = cell;
        const oldTxt = old >= INF ? '∞' : String(old);
        if (w === 0) {
          dq.unshift({ r: nr, c: nc, d: nd });
          push('PUSH_FRONT', tr(
            `${p(nb)} 칸은 빈 칸이라 비용 0: dist ${oldTxt} → ${nd}. 거리가 그대로이니 덱 앞에 넣어요.`,
            `${p(nb)} is empty, cost 0: dist ${oldTxt} → ${nd}. Same distance, so push it to the front.`,
          ), LINE.PUSH_FRONT, { current: cell, neighbor: nb, pushedTo: 'front' });
        } else {
          dq.push({ r: nr, c: nc, d: nd });
          push('PUSH_BACK', tr(
            `${p(nb)} 칸은 벽이라 부수는 비용 1: dist ${oldTxt} → ${nd}. 한 칸 더 멀어지니 덱 뒤에 넣어요.`,
            `${p(nb)} is a wall, breaking it costs 1: dist ${oldTxt} → ${nd}. One farther, so push it to the back.`,
          ), LINE.PUSH_BACK, { current: cell, neighbor: nb, pushedTo: 'back' });
        }
      } else {
        push('SKIP', tr(
          `${p(nb)}(${kind(w)}): ${d} + ${w} = ${nd} ≥ dist ${dist[nr][nc]}이라 갱신하지 않아요.`,
          `${p(nb)} (${kind(w)}): ${d} + ${w} = ${nd} ≥ dist ${dist[nr][nc]}, no improvement.`,
        ), LINE.SKIP, { current: cell, neighbor: nb, skipReason: 'no-improve' });
      }
    }
  }

  const path: Cell[] = [];
  if (reached) {
    for (let x: Cell | null = goal; x; x = parent[x.r][x.c]) path.unshift(x);
  }
  const answer = reached ? dist[goal.r][goal.c] : null;
  const broken = path.filter(x => grid[x.r][x.c] === 1).length;
  push('DONE', reached
    ? tr(
      `목표 ${p(goal)} 칸을 덱에서 꺼냈어요. 부숴야 하는 벽의 최소 개수는 ${answer}개예요 (경로 위 벽 ${broken}개).`,
      `Popped the goal ${p(goal)}. The minimum number of walls to break is ${answer} (${broken} on the path).`,
    )
    : tr('덱이 비었어요.', 'The deque is empty.'),
  LINE.DONE, { current: reached ? goal : null, path, answer });

  return steps;
}

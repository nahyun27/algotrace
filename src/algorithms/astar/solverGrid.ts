import type { GridMap, GridStep, GridPos } from './gridTypes';
import { INF, manhattan } from './gridTypes';
import { makeTr, type Lang } from '../../i18n';

interface PQItem { f: number; g: number; r: number; c: number; }

function clone2D<T>(arr: T[][]): T[][] {
  return arr.map(row => [...row]);
}

function buildHGrid(rows: number, cols: number, goal: GridPos, walls: boolean[][]): number[][] {
  const h: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      h[r][c] = walls[r][c] ? INF : manhattan({ r, c }, goal);
    }
  }
  return h;
}

function reconstructPath(parent: (GridPos | null)[][], start: GridPos, goal: GridPos): GridPos[] {
  const path: GridPos[] = [];
  let cur: GridPos | null = goal;
  while (cur && !(cur.r === start.r && cur.c === start.c)) {
    path.push(cur);
    cur = parent[cur.r][cur.c];
    if (!cur) return [];
  }
  path.push(start);
  return path.reverse();
}

export function generateGridAStarSteps(map: GridMap, lang: Lang = 'ko'): GridStep[] {
  const tr = makeTr(lang);
  const { rows, cols, walls, start, goal } = map;
  const steps: GridStep[] = [];

  const g: number[][] = Array.from({ length: rows }, () => Array(cols).fill(INF));
  const parent: (GridPos | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const h = buildHGrid(rows, cols, goal, walls);
  const f: number[][] = Array.from({ length: rows }, () => Array(cols).fill(INF));

  const closedSet: GridPos[] = [];
  const closedFlag: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const pq: PQItem[] = [];

  let nodesExplored = 0;

  const snap = (type: GridStep['type'], description: string, currentCell: GridPos | null, neighborCell: GridPos | null, codeLine: number, isImprovement = false, path: GridPos[] = []): GridStep => ({
    type, description,
    g: clone2D(g), h: clone2D(h), f: clone2D(f),
    parent: clone2D(parent),
    openSet: [...pq].sort((a, b) => a.f - b.f).map(it => ({ r: it.r, c: it.c })),
    closedSet: [...closedSet],
    currentCell, neighborCell, isImprovement,
    path,
    nodesExplored,
    codeLine,
  });

  // INIT
  g[start.r][start.c] = 0;
  f[start.r][start.c] = h[start.r][start.c];
  pq.push({ f: f[start.r][start.c], g: 0, r: start.r, c: start.c });
  steps.push(snap('INIT', tr(`시작 (${start.r},${start.c}) → 목표 (${goal.r},${goal.c}). 맨해튼 거리 h=${h[start.r][start.c]}`, `Start (${start.r},${start.c}) → goal (${goal.r},${goal.c}). Manhattan distance h=${h[start.r][start.c]}`), start, null, 12));

  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (pq.length > 0) {
    // Sort to extract min
    pq.sort((a, b) => a.f - b.f || a.g - b.g);
    const cur = pq.shift()!;
    const curPos: GridPos = { r: cur.r, c: cur.c };

    steps.push(snap('DEQUEUE', tr(`f=${cur.f}인 셀 (${cur.r},${cur.c}) 꺼냄 — g=${cur.g}, h=${h[cur.r][cur.c]}`, `Pop cell (${cur.r},${cur.c}) with f=${cur.f} — g=${cur.g}, h=${h[cur.r][cur.c]}`), curPos, null, 17));

    if (closedFlag[cur.r][cur.c]) continue;

    // Goal check
    if (cur.r === goal.r && cur.c === goal.c) {
      const path = reconstructPath(parent, start, goal);
      steps.push(snap('DONE', tr(`목표 도달! 경로 길이 ${path.length - 1}, 탐색한 셀 ${nodesExplored + 1}개`, `Goal reached! Path length ${path.length - 1}, cells explored: ${nodesExplored + 1}`), curPos, null, 19, false, path));
      return steps;
    }

    closedFlag[cur.r][cur.c] = true;
    closedSet.push(curPos);
    nodesExplored++;
    steps.push(snap('CLOSE', tr(`셀 (${cur.r},${cur.c})을 closed set에 추가`, `Add cell (${cur.r},${cur.c}) to the closed set`), curPos, null, 22));

    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (walls[nr][nc]) continue;
      if (closedFlag[nr][nc]) continue;

      const tentative = cur.g + 1;
      const isImprovement = tentative < g[nr][nc];

      if (isImprovement) {
        g[nr][nc] = tentative;
        f[nr][nc] = tentative + h[nr][nc];
        parent[nr][nc] = curPos;
        pq.push({ f: f[nr][nc], g: tentative, r: nr, c: nc });
        steps.push(snap('RELAX', tr(`이웃 (${nr},${nc}) 갱신: g=${tentative}, h=${h[nr][nc]}, f=${f[nr][nc]}`, `Update neighbor (${nr},${nc}): g=${tentative}, h=${h[nr][nc]}, f=${f[nr][nc]}`), curPos, { r: nr, c: nc }, 27, true));
      }
    }
  }

  steps.push(snap('NO_PATH', tr('경로 없음! 목표에 도달할 수 없습니다.', 'No path! The goal cannot be reached.'), null, null, 32));
  return steps;
}

/* ─── Dijkstra on grid (for comparison) ─── */
export function generateGridDijkstraSteps(map: GridMap, lang: Lang = 'ko'): GridStep[] {
  const tr = makeTr(lang);
  const { rows, cols, walls, start, goal } = map;
  const steps: GridStep[] = [];

  const g: number[][] = Array.from({ length: rows }, () => Array(cols).fill(INF));
  const parent: (GridPos | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const h: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0)); // Dijkstra has no h
  const f = g; // f = g for Dijkstra

  const closedSet: GridPos[] = [];
  const closedFlag: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const pq: PQItem[] = [];
  let nodesExplored = 0;

  const snap = (type: GridStep['type'], description: string, currentCell: GridPos | null, codeLine: number, path: GridPos[] = []): GridStep => ({
    type, description,
    g: clone2D(g), h: clone2D(h), f: clone2D(f),
    parent: clone2D(parent),
    openSet: [...pq].sort((a, b) => a.f - b.f).map(it => ({ r: it.r, c: it.c })),
    closedSet: [...closedSet],
    currentCell, neighborCell: null, isImprovement: false,
    path,
    nodesExplored,
    codeLine,
  });

  g[start.r][start.c] = 0;
  pq.push({ f: 0, g: 0, r: start.r, c: start.c });
  steps.push(snap('INIT', tr(`다익스트라 시작: (${start.r},${start.c})`, `Dijkstra starts at (${start.r},${start.c})`), start, 1));

  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (pq.length > 0) {
    pq.sort((a, b) => a.f - b.f);
    const cur = pq.shift()!;
    const curPos: GridPos = { r: cur.r, c: cur.c };

    if (closedFlag[cur.r][cur.c]) continue;

    if (cur.r === goal.r && cur.c === goal.c) {
      const path = reconstructPath(parent, start, goal);
      closedFlag[cur.r][cur.c] = true;
      closedSet.push(curPos);
      nodesExplored++;
      steps.push(snap('DONE', tr(`목표 도달. 탐색한 셀 ${nodesExplored}개`, `Goal reached. Cells explored: ${nodesExplored}`), curPos, 10, path));
      return steps;
    }

    closedFlag[cur.r][cur.c] = true;
    closedSet.push(curPos);
    nodesExplored++;

    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (walls[nr][nc]) continue;
      if (closedFlag[nr][nc]) continue;

      const tentative = cur.g + 1;
      if (tentative < g[nr][nc]) {
        g[nr][nc] = tentative;
        parent[nr][nc] = curPos;
        pq.push({ f: tentative, g: tentative, r: nr, c: nc });
      }
    }
  }

  steps.push(snap('NO_PATH', tr('경로 없음', 'No path'), null, 12));
  return steps;
}

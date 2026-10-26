export type GridCellType = 'empty' | 'wall' | 'start' | 'goal';

export interface GridPos {
  r: number;
  c: number;
}

export type GridStepType = 'INIT' | 'DEQUEUE' | 'RELAX' | 'CLOSE' | 'NO_PATH' | 'DONE';

export interface GridStep {
  type: GridStepType;
  description: string;

  // Cell-level state (indexed [r][c])
  g: number[][];      // g-score per cell
  h: number[][];      // h-score per cell (constant once goal is fixed)
  f: number[][];      // f = g + h
  parent: (GridPos | null)[][];

  openSet: GridPos[]; // sorted by f ascending (for display)
  closedSet: GridPos[];

  currentCell: GridPos | null;
  neighborCell: GridPos | null;
  isImprovement: boolean;

  // Final path (filled in last steps)
  path: GridPos[];

  nodesExplored: number;
  codeLine: number;
}

export const GRID_ROWS = 10;
export const GRID_COLS = 10;
export const INF = Infinity;

export interface GridMap {
  rows: number;
  cols: number;
  walls: boolean[][];       // [r][c] true = wall
  start: GridPos;
  goal: GridPos;
}

/* ─── Preset maps ─── */

function makeEmptyGrid(rows: number, cols: number): boolean[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

function withWalls(rows: number, cols: number, wallList: [number, number][]): boolean[][] {
  const g = makeEmptyGrid(rows, cols);
  for (const [r, c] of wallList) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) g[r][c] = true;
  }
  return g;
}

export const PRESET_BASIC: GridMap = {
  rows: 10, cols: 10,
  start: { r: 1, c: 1 },
  goal:  { r: 8, c: 8 },
  walls: withWalls(10, 10, [
    [3, 3], [3, 4], [3, 5], [3, 6],
    [5, 1], [5, 2], [5, 3], [5, 4],
    [6, 6], [6, 7], [7, 6], [7, 7],
  ]),
};

export const PRESET_MAZE: GridMap = {
  rows: 10, cols: 10,
  start: { r: 0, c: 0 },
  goal:  { r: 9, c: 9 },
  walls: withWalls(10, 10, [
    [1,0],[1,1],[1,2],[1,3],[1,4],[1,6],[1,7],[1,8],
    [3,1],[3,2],[3,3],[3,5],[3,6],[3,7],[3,8],[3,9],
    [5,0],[5,1],[5,2],[5,4],[5,5],[5,6],[5,7],[5,8],
    [7,1],[7,2],[7,3],[7,4],[7,6],[7,7],[7,8],[7,9],
    [2,5],[4,4],[6,3],[8,5],
  ]),
};

export const PRESET_EMPTY: GridMap = {
  rows: 10, cols: 10,
  start: { r: 4, c: 1 },
  goal:  { r: 4, c: 8 },
  walls: makeEmptyGrid(10, 10),
};

export const PRESETS = {
  basic: PRESET_BASIC,
  maze:  PRESET_MAZE,
  empty: PRESET_EMPTY,
};

/* ─── Random maze generation ─── */
export function randomMaze(rows: number, cols: number, density = 0.25): GridMap {
  const walls = makeEmptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < density) walls[r][c] = true;
    }
  }
  const start: GridPos = { r: 0, c: 0 };
  const goal: GridPos = { r: rows - 1, c: cols - 1 };
  walls[start.r][start.c] = false;
  walls[goal.r][goal.c] = false;
  return { rows, cols, walls, start, goal };
}

export function cloneWalls(walls: boolean[][]): boolean[][] {
  return walls.map(row => [...row]);
}

export function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

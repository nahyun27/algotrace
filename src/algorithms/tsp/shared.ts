/**
 * Step type codes (shown as the StepBanner badge: keep them English).
 * Top-down:  CALL → BASE | MEMO | EXPLORE → MOVE → COMPARE … → SAVE (root save = DONE)
 * Bottom-up: INIT → STATE → MOVE → UPDATE … → RETURN → BEST … → DONE
 */
export type TSPStepType =
  | 'INIT'
  | 'CALL'
  | 'BASE'
  | 'MEMO'
  | 'EXPLORE'
  | 'MOVE'
  | 'COMPARE'
  | 'SAVE'
  | 'STATE'
  | 'UPDATE'
  | 'RETURN'
  | 'BEST'
  | 'DONE';

export interface TSPStep {
  type: TSPStepType;
  mask: number;
  currentCity: number;
  nextCity: number | null;
  edgeWeight: number | null;
  dpTable: number[][];
  activeEdge: [number, number] | null;
  description: string;
  isImprovement: boolean;
  codeLine: number;
}

export const INF = 1e9;
export const CITIES = 4;

export const W = [
  [0, 10, 15, 20],
  [5,  0,  9, 10],
  [6, 13,  0, 12],
  [8,  8,  9,  0]
];

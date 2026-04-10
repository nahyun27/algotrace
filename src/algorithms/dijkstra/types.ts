export type StepType = 'INIT' | 'DEQUEUE' | 'RELAX' | 'VISITED' | 'DONE';

export interface PQItem {
  cost: number;
  node: number;
}

export interface DijkstraStep {
  type: StepType;
  currentNode: number;         // 현재 처리 중 노드
  neighborNode: number | null; // RELAX 시 대상 이웃
  activeEdge: [number, number] | null;
  dist: number[];              // 현재 dist 배열 스냅샷
  pq: PQItem[];                // 우선순위 큐 스냅샷
  visited: boolean[];          // 방문 확정 여부
  updatedCell: number | null;  // 방금 갱신된 노드 인덱스
  isImprovement: boolean;
  description: string;
  codeLine: number;
}

// 그래프 정의 (공유)
export const N = 5;
export const INF = 1e9;

// 방향 간선: [u, v, weight]
export const EDGES: [number, number, number][] = [
  [0, 1, 10],
  [0, 2, 3],
  [1, 3, 2],
  [2, 1, 4],
  [2, 3, 8],
  [2, 4, 2],
  [3, 4, 5],
  [4, 3, 1],
];

// 인접 리스트 (adj[u] = [{v, w}, ...])
export const ADJ: { v: number; w: number }[][] = Array.from({ length: N }, () => []);
for (const [u, v, w] of EDGES) {
  ADJ[u].push({ v, w });
}

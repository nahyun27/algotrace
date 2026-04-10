import { type DijkstraStep, INF, N, ADJ } from './types';

export function generateDijkstraSteps(): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  const dist = Array(N).fill(INF);
  const visited = Array(N).fill(false);

  // Min-heap simulation (sorted array)
  const pq: { cost: number; node: number }[] = [];

  const cloneDist    = () => [...dist];
  const cloneVisited = () => [...visited];
  const clonePQ      = () => pq.map(x => ({ ...x }));

  // 초기화
  dist[0] = 0;
  pq.push({ cost: 0, node: 0 });
  pq.sort((a, b) => a.cost - b.cost);

  steps.push({
    type: 'INIT',
    currentNode: 0, neighborNode: null, activeEdge: null,
    dist: cloneDist(), pq: clonePQ(), visited: cloneVisited(),
    updatedCell: 0, isImprovement: true,
    description: '초기화: dist[0] = 0, 나머지 = ∞. 시작 노드 0을 큐에 삽입.',
    codeLine: 1,
  });

  while (pq.length > 0) {
    // DEQUEUE
    const { cost, node: u } = pq.shift()!;
    pq.sort((a, b) => a.cost - b.cost);

    steps.push({
      type: 'DEQUEUE',
      currentNode: u, neighborNode: null, activeEdge: null,
      dist: cloneDist(), pq: clonePQ(), visited: cloneVisited(),
      updatedCell: null, isImprovement: false,
      description: `큐에서 (dist=${cost}, 노드=${u}) 꺼냄. ${visited[u] ? '이미 방문 확정된 노드 → 건너뜀.' : ''}`,
      codeLine: 4,
    });

    if (visited[u]) continue;

    // VISITED
    visited[u] = true;

    steps.push({
      type: 'VISITED',
      currentNode: u, neighborNode: null, activeEdge: null,
      dist: cloneDist(), pq: clonePQ(), visited: cloneVisited(),
      updatedCell: u, isImprovement: true,
      description: `노드 ${u} 방문 확정! 최단 거리 = ${dist[u]}`,
      codeLine: 6,
    });

    // RELAX 각 이웃
    for (const { v, w } of ADJ[u]) {
      const newDist = dist[u] + w;
      const improved = newDist < dist[v];

      steps.push({
        type: 'RELAX',
        currentNode: u, neighborNode: v, activeEdge: [u, v],
        dist: cloneDist(), pq: clonePQ(), visited: cloneVisited(),
        updatedCell: improved ? v : null,
        isImprovement: improved,
        description: improved
          ? `완화 성공: dist[${v}] ${dist[v] === INF ? '∞' : dist[v]} → ${newDist} (경유: 노드 ${u}, 가중치 ${w})`
          : `완화 실패: dist[${v}]=${dist[v] === INF ? '∞' : dist[v]} ≤ ${newDist} — 갱신 없음`,
        codeLine: improved ? 10 : 9,
      });

      if (improved) {
        dist[v] = newDist;
        pq.push({ cost: newDist, node: v });
        pq.sort((a, b) => a.cost - b.cost);
      }
    }
  }

  steps.push({
    type: 'DONE',
    currentNode: -1, neighborNode: null, activeEdge: null,
    dist: cloneDist(), pq: [], visited: cloneVisited(),
    updatedCell: null, isImprovement: false,
    description: `[완료] 최단 거리: ${dist.map((d, i) => `${i}→${d === INF ? '∞' : d}`).join(', ')}`,
    codeLine: 12,
  });

  return steps;
}

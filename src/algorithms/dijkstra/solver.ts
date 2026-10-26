import { type DijkstraStep, INF, N as DEFAULT_N, ADJ as DEFAULT_ADJ } from './types';
import { makeTr, type Lang } from '../../i18n';

/** Build adjacency list from edge array */
function buildAdj(edges: [number, number, number][], n: number): { v: number; w: number }[][] {
  const adj: { v: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) adj[u].push({ v, w });
  return adj;
}

export function generateDijkstraSteps(
  customEdges?: [number, number, number][],
  customN?: number,
  lang: Lang = 'ko',
): DijkstraStep[] {
  const tr = makeTr(lang);
  const fmt = (d: number) => (d === INF ? '∞' : String(d));
  const N   = customN ?? DEFAULT_N;
  const ADJ = customEdges ? buildAdj(customEdges, N) : DEFAULT_ADJ;
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
    description: tr('초기화: dist[0] = 0, 나머지 = ∞. 시작 노드 0을 큐에 넣어요.', 'Init: dist[0] = 0, all others = ∞. Push source node 0 into the priority queue.'),
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
      description: visited[u]
        ? tr(`큐에서 (dist=${cost}, 노드=${u})를 꺼냈지만 이미 확정된 노드라 건너뛰어요.`, `Pop (dist=${cost}, node=${u}) — node ${u} is already settled, so skip it.`)
        : tr(`큐에서 가장 가까운 (dist=${cost}, 노드=${u})를 꺼내요.`, `Pop the closest entry (dist=${cost}, node=${u}) from the priority queue.`),
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
      description: tr(`노드 ${u} 방문 확정! 최단 거리 = ${dist[u]}`, `Node ${u} settled! Shortest distance = ${dist[u]}`),
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
          ? tr(`완화 성공: dist[${v}] ${fmt(dist[v])} → ${newDist} (노드 ${u} 경유, 가중치 ${w})`, `Relaxed: dist[${v}] ${fmt(dist[v])} → ${newDist} (via node ${u}, weight ${w})`)
          : tr(`완화 실패: dist[${v}]=${fmt(dist[v])} ≤ ${newDist} — 갱신하지 않아요`, `No improvement: dist[${v}]=${fmt(dist[v])} ≤ ${newDist} — no change`),
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
    description: tr('[완료] 최단 거리: ', '[Done] Shortest distances: ') + dist.map((d, i) => `${i}→${fmt(d)}`).join(', '),
    codeLine: 12,
  });

  return steps;
}

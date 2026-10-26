import type { PrimStep, PQItem } from './types';
import { INF } from './types';
import type { Edge, KruskalNode } from '../kruskal/types';
import { KRUSKAL_N, KRUSKAL_NODES, KRUSKAL_EDGES } from '../kruskal/types';
import { makeTr, type Lang } from '../../i18n';

function buildAdj(edges: Edge[], N: number): { node: number; weight: number }[][] {
  const adj: { node: number; weight: number }[][] = Array.from({ length: N }, () => []);
  for (const e of edges) {
    adj[e.u].push({ node: e.v, weight: e.weight });
    adj[e.v].push({ node: e.u, weight: e.weight });
  }
  return adj;
}

export function generatePrimSteps(
  _nodes: KruskalNode[] = KRUSKAL_NODES, // eslint-disable-line @typescript-eslint/no-unused-vars
  edges: Edge[]         = KRUSKAL_EDGES,
  N: number             = KRUSKAL_N,
  lang: Lang            = 'ko',
): PrimStep[] {
  const tr = makeTr(lang);
  const fmt = (k: number) => (k >= INF ? '∞' : String(k));
  const steps: PrimStep[] = [];
  const adj = buildAdj(edges, N);

  const key    = Array<number>(N).fill(INF);
  const parent = Array<number>(N).fill(-1);
  const visited = Array<boolean>(N).fill(false);
  const mstEdges: { u: number; v: number; weight: number }[] = [];
  let totalCost = 0;
  const pq: PQItem[] = [];

  const snap = (
    type: PrimStep['type'],
    description: string,
    currentNode: number | null,
    currentNeighbor: number | null,
    updatedNode: number | null,
    codeLine: number,
  ): PrimStep => ({
    type,
    description,
    key: [...key],
    parent: [...parent],
    visited: [...visited],
    pq: [...pq].sort((a, b) => a.key - b.key),
    mstEdges: mstEdges.map(e => ({ ...e })),
    currentNode,
    currentNeighbor,
    updatedNode,
    totalCost,
    codeLine,
  });

  // INIT
  key[0] = 0;
  pq.push({ node: 0, key: 0 });
  steps.push(snap('INIT', tr('노드 0에서 시작: key[0] = 0, 나머지 ∞로 초기화', 'Start at node 0: key[0] = 0, every other key = ∞'), null, null, null, 9));

  while (pq.length > 0) {
    pq.sort((a, b) => a.key - b.key);
    const { node: u, key: k } = pq.shift()!;

    steps.push(snap(
      'EXTRACT_MIN',
      tr(`우선순위 큐에서 key=${fmt(k)}인 노드 ${u} 꺼냄`, `Pop node ${u} (key=${fmt(k)}) from the priority queue`),
      u, null, null, 14,
    ));

    if (visited[u]) {
      steps.push(snap(
        'ALREADY_IN_MST',
        tr(`노드 ${u}는 이미 MST에 포함됨 — 스킵`, `Node ${u} is already in the MST — skip`),
        u, null, null, 16,
      ));
      continue;
    }

    visited[u] = true;
    totalCost += k;
    if (parent[u] !== -1) {
      mstEdges.push({ u: parent[u], v: u, weight: k });
    }
    steps.push(snap(
      'ADD_TO_MST',
      parent[u] === -1
        ? tr(`노드 ${u}를 MST에 추가 (시작 노드, 비용 +0)`, `Add node ${u} to the MST (start node, cost +0)`)
        : tr(`노드 ${u}를 MST에 추가 — 간선 ${parent[u]}–${u} (비용 +${k})`, `Add node ${u} to the MST via edge ${parent[u]}–${u} (cost +${k})`),
      u, null, null, 19,
    ));

    if (mstEdges.length === N - 1) break;

    for (const { node: v, weight: w } of adj[u]) {
      if (!visited[v] && w < key[v]) {
        const oldKey = key[v];
        key[v] = w;
        parent[v] = u;
        pq.push({ node: v, key: w });
        steps.push(snap(
          'UPDATE',
          tr(`노드 ${v}의 key 갱신: ${fmt(oldKey)} → ${w}  (간선 ${u}–${v})`, `Update key of node ${v}: ${fmt(oldKey)} → ${w}  (edge ${u}–${v})`),
          u, v, v, 22,
        ));
      }
    }
  }

  steps.push(snap(
    'DONE',
    tr(`MST 완성! 총 비용 = ${totalCost}  ✓ 크루스칼과 동일한 결과`, `MST complete! Total cost = ${totalCost}  ✓ same result as Kruskal`),
    null, null, null, 28,
  ));

  return steps;
}

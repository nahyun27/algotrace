import type { KruskalStep, Edge, KruskalNode } from './types';
import { makeTr, type Lang } from '../../i18n';

function cloneParent(p: number[]): number[] { return [...p]; }

// Mutating find with path compression (modifies parent in place)
function find(parent: number[], x: number): number {
  if (parent[x] !== x) parent[x] = find(parent, parent[x]);
  return parent[x];
}

export function generateKruskalSteps(
  _nodes: KruskalNode[],
  edges: Edge[],
  N: number,
  lang: Lang = 'ko',
): KruskalStep[] {
  const tr = makeTr(lang);
  const steps: KruskalStep[] = [];

  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const parent = Array.from({ length: N }, (_, i) => i);
  const rank = new Array<number>(N).fill(0);
  const mstEdges: Edge[] = [];
  const rejectedEdges: Edge[] = [];
  let totalCost = 0;

  // INIT
  steps.push({
    type: 'INIT',
    description: tr(
      `간선 ${sorted.length}개를 가중치 오름차순 정렬 완료. Union-Find 초기화 — 각 노드가 독립된 집합입니다.`,
      `Sorted ${sorted.length} edges by weight (ascending). Union-Find initialized — each node starts in its own set.`,
    ),
    parent: cloneParent(parent), rank: [...rank],
    mstEdges: [], sortedEdges: sorted,
    currentEdge: null, rejectedEdges: [],
    codeLine: 19, totalCost: 0,
  });

  for (const edge of sorted) {
    const { u, v, weight } = edge;

    // CONSIDER
    steps.push({
      type: 'CONSIDER',
      description: tr(`간선 (${u}–${v}, 가중치 ${weight}) 검토 중...`, `Checking edge (${u}–${v}, weight ${weight})…`),
      parent: cloneParent(parent), rank: [...rank],
      mstEdges: [...mstEdges], sortedEdges: sorted,
      currentEdge: edge, rejectedEdges: [...rejectedEdges],
      codeLine: 24, totalCost,
    });

    const ru = find(parent, u);
    const rv = find(parent, v);

    // FIND
    steps.push({
      type: 'FIND',
      description: `Find(${u})=${ru}, Find(${v})=${rv}. ` + (ru === rv
        ? tr('같은 집합 → 사이클 발생!', 'Same set → adding this edge would create a cycle!')
        : tr('다른 집합 → MST에 추가 가능!', 'Different sets → safe to add to the MST!')),
      parent: cloneParent(parent), rank: [...rank],
      mstEdges: [...mstEdges], sortedEdges: sorted,
      currentEdge: edge, rejectedEdges: [...rejectedEdges],
      codeLine: 7, totalCost,
      findResult: { ru, rv },
    });

    if (ru === rv) {
      rejectedEdges.push(edge);
      steps.push({
        type: 'REJECT',
        description: tr(
          `간선 (${u}–${v}, ${weight}) 스킵! 같은 집합(루트: ${ru}) → 사이클 발생.`,
          `Skip edge (${u}–${v}, ${weight}): both ends share root ${ru}, so it would create a cycle.`,
        ),
        parent: cloneParent(parent), rank: [...rank],
        mstEdges: [...mstEdges], sortedEdges: sorted,
        currentEdge: edge, rejectedEdges: [...rejectedEdges],
        codeLine: 10, totalCost,
        findResult: { ru, rv },
      });
    } else {
      if (rank[ru] < rank[rv]) {
        parent[ru] = rv;
      } else {
        parent[rv] = ru;
        if (rank[ru] === rank[rv]) rank[ru]++;
      }
      mstEdges.push(edge);
      totalCost += weight;

      steps.push({
        type: 'ACCEPT',
        description: tr(
          `간선 (${u}–${v}, ${weight}) MST에 추가! Union(${ru}, ${rv}). 현재 총 비용: ${totalCost}`,
          `Add edge (${u}–${v}, ${weight}) to the MST! Union(${ru}, ${rv}). Total cost so far: ${totalCost}`,
        ),
        parent: cloneParent(parent), rank: [...rank],
        mstEdges: [...mstEdges], sortedEdges: sorted,
        currentEdge: edge, rejectedEdges: [...rejectedEdges],
        codeLine: 25, totalCost,
        findResult: { ru, rv },
      });

      if (mstEdges.length === N - 1) break;
    }
  }

  // DONE
  steps.push({
    type: 'DONE',
    description: tr(`MST 완성! 간선 ${mstEdges.length}개, 총 비용: ${totalCost}`, `MST complete! ${mstEdges.length} edge${mstEdges.length === 1 ? '' : 's'}, total cost: ${totalCost}`),
    parent: cloneParent(parent), rank: [...rank],
    mstEdges: [...mstEdges], sortedEdges: sorted,
    currentEdge: null, rejectedEdges: [...rejectedEdges],
    codeLine: 31, totalCost,
  });

  return steps;
}

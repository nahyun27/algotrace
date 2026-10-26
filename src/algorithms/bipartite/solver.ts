import type { BipartiteStep, DataItem, NodeColor, StepType } from './types';
import { makeTr, type Lang } from '../../i18n';

const CODE_LINE: Record<Exclude<StepType, 'DONE'>, number> = {
  INIT: 4,
  START: 8,
  DEQUEUE: 11,
  COLOR: 14,
  CHECK: 16,
  CONFLICT: 17,
};

const GROUP = ['A', 'B'] as const;

/** Undirected adjacency list with ascending neighbor order (deterministic traversal). */
export function buildAdjacency(n: number, edges: [number, number][]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    if (u !== v) adj[v].push(u);
  }
  for (const a of adj) a.sort((x, y) => x - y);
  return adj;
}

/**
 * BFS 2-coloring. Starts a new BFS from every still-uncolored node so disconnected graphs are
 * handled; stops at the first edge whose endpoints share a color.
 */
export function generateBipartiteSteps(n: number, edges: [number, number][], lang: Lang = 'ko'): BipartiteStep[] {
  const tr = makeTr(lang);
  const adj = buildAdjacency(n, edges);
  const steps: BipartiteStep[] = [];

  const color: NodeColor[] = Array(n).fill(-1);
  const queue: DataItem[] = [];
  const treeEdges: [number, number][] = [];
  let entryId = 0;
  let component = -1;
  let conflictEdge: [number, number] | null = null;

  const push = (
    type: StepType,
    description: string,
    cur: number | null = null,
    nbr: number | null = null,
    isBipartite: boolean | null = null,
    codeLine?: number,
  ) => {
    steps.push({
      type,
      description,
      codeLine: codeLine ?? CODE_LINE[type as Exclude<StepType, 'DONE'>],
      color: [...color],
      currentNode: cur,
      neighborNode: nbr,
      activeEdge: cur !== null && nbr !== null ? [cur, nbr] : null,
      treeEdges: treeEdges.map(e => [...e] as [number, number]),
      queue: queue.map(q => ({ ...q })),
      component,
      conflictEdge: conflictEdge ? [...conflictEdge] as [number, number] : null,
      isBipartite,
    });
  };

  push('INIT', tr(
    `초기화: 노드 ${n}개를 모두 '미색칠(-1)'로 둡니다. 인접한 두 노드가 항상 다른 그룹(A/B)이 되도록 칠할 수 있는지 확인해요.`,
    `Init: all ${n} nodes start uncolored (-1). We check whether every edge can join a group-A node to a group-B node.`,
  ));

  let ok = true;
  outer: for (let s = 0; s < n; s++) {
    if (color[s] !== -1) continue;
    component++;
    color[s] = 0;
    queue.push({ id: `q-${entryId++}`, value: s });
    push('START', component === 0
      ? tr(`노드 ${s}에서 BFS를 시작해요. 노드 ${s}를 그룹 A로 칠하고 큐에 넣습니다.`, `Start a BFS at node ${s}: color it group A and enqueue it.`)
      : tr(
        `노드 ${s}는 아직 색이 없어요 → 새 연결 요소(${component + 1}번째)입니다. 노드 ${s}를 그룹 A로 칠하고 BFS를 다시 시작해요.`,
        `Node ${s} is still uncolored → it starts a new connected component (#${component + 1}). Color it group A and run a new BFS.`,
      ), s);

    while (queue.length > 0) {
      const { value: u } = queue.shift()!;
      push('DEQUEUE', tr(
        `큐에서 노드 ${u}(그룹 ${GROUP[color[u] as 0 | 1]})를 꺼내 이웃을 살펴봐요.`,
        `Dequeue node ${u} (group ${GROUP[color[u] as 0 | 1]}) and scan its neighbors.`,
      ), u);

      for (const v of adj[u]) {
        const cu = color[u] as 0 | 1;
        if (color[v] === -1) {
          color[v] = (1 - cu) as NodeColor;
          queue.push({ id: `q-${entryId++}`, value: v });
          treeEdges.push([u, v]);
          push('COLOR', tr(
            `이웃 ${v}는 색이 없어요 → ${u}와 반대인 그룹 ${GROUP[1 - cu]}로 칠하고 큐에 넣습니다.`,
            `Neighbor ${v} is uncolored → give it the opposite group ${GROUP[1 - cu]} and enqueue it.`,
          ), u, v);
        } else if (color[v] !== cu) {
          push('CHECK', tr(
            `이웃 ${v}는 이미 그룹 ${GROUP[color[v] as 0 | 1]} → ${u}(그룹 ${GROUP[cu]})와 색이 달라 문제없어요.`,
            `Neighbor ${v} is already group ${GROUP[color[v] as 0 | 1]}, which differs from ${u} (group ${GROUP[cu]}), so this edge is fine.`,
          ), u, v);
        } else {
          conflictEdge = [u, v];
          push('CONFLICT', u === v
            ? tr(`노드 ${u}에 자기 자신으로 가는 간선이 있어요 → 양 끝이 같은 색이라 이분 그래프가 될 수 없어요!`, `Node ${u} has a self-loop → both ends always share a color, so the graph cannot be bipartite!`)
            : tr(
              `충돌! 이웃 ${v}도 그룹 ${GROUP[cu]}예요. 간선 ${u}-${v}의 양 끝이 같은 색이므로 홀수 길이 사이클이 있어요.`,
              `Conflict! Neighbor ${v} is also group ${GROUP[cu]}. Edge ${u}-${v} joins two nodes of the same color, so there is an odd cycle.`,
            ), u, v);
          ok = false;
          break outer;
        }
      }
    }
  }

  if (ok) {
    push('DONE', tr(
      `모든 간선이 A와 B를 잇습니다 → 이분 그래프예요 (YES). 연결 요소 ${component + 1}개를 모두 확인했어요.`,
      `Every edge joins A to B → the graph is bipartite (YES). All ${component + 1} connected component(s) checked.`,
    ), null, null, true, 18);
  } else {
    const [u, v] = conflictEdge!;
    queue.length = 0;
    push('DONE', tr(
      `간선 ${u}-${v}에서 충돌이 났으므로 이분 그래프가 아니에요 (NO).`,
      `Edge ${u}-${v} caused a conflict, so the graph is not bipartite (NO).`,
    ), null, null, false, 17);
  }

  return steps;
}

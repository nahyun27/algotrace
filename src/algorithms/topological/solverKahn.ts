import type { KahnStep, TopoNode } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateKahnSteps(
  nodes: TopoNode[],
  edges: [number, number][],
  N: number,
  lang: Lang = 'ko',
): KahnStep[] {
  const tr = makeTr(lang);
  const steps: KahnStep[] = [];

  const adj: number[][] = Array.from({ length: N }, () => []);
  for (const [u, v] of edges) adj[u].push(v);

  const inDeg = Array(N).fill(0);
  for (const [, v] of edges) inDeg[v]++;

  const snap = () => [...inDeg];

  // INIT
  steps.push({
    type: 'INIT',
    description: tr(`진입차수 초기화: [${inDeg.join(', ')}]`, `Initial in-degrees: [${inDeg.join(', ')}]`),
    inDegree: snap(), queue: [], result: [],
    currentNode: null, activeEdge: null,
    decreasedNode: null, newlyEnqueued: null,
    hasCycle: false, codeLine: 4,
  });

  const queue: number[] = [];
  const result: number[] = [];

  // Initial enqueue of zero-in-degree nodes
  for (let i = 0; i < N; i++) {
    if (inDeg[i] === 0) {
      queue.push(i);
      steps.push({
        type: 'ENQUEUE',
        description: tr(`"${nodes[i].label}" 진입차수=0 → 큐 삽입`, `"${nodes[i].label}" has in-degree 0 → enqueue`),
        inDegree: snap(), queue: [...queue], result: [...result],
        currentNode: i, activeEdge: null,
        decreasedNode: null, newlyEnqueued: i,
        hasCycle: false, codeLine: 11,
      });
    }
  }

  while (queue.length > 0) {
    const u = queue.shift()!;
    result.push(u);

    steps.push({
      type: 'DEQUEUE',
      description: tr(
        `큐에서 "${nodes[u].label}" 꺼냄 → 결과: [${result.map(n => nodes[n].label).join(' → ')}]`,
        `Dequeue "${nodes[u].label}" → result: [${result.map(n => nodes[n].label).join(' → ')}]`,
      ),
      inDegree: snap(), queue: [...queue], result: [...result],
      currentNode: u, activeEdge: null,
      decreasedNode: null, newlyEnqueued: null,
      hasCycle: false, codeLine: 16,
    });

    for (const v of adj[u]) {
      inDeg[v]--;
      const enqueued = inDeg[v] === 0;
      if (enqueued) queue.push(v);

      steps.push({
        type: 'DECREASE',
        description: tr(
          `간선 ${nodes[u].label}→${nodes[v].label}: 진입차수 ${inDeg[v] + 1}→${inDeg[v]}${enqueued ? ` ✓ "${nodes[v].label}" 큐 삽입` : ''}`,
          `Edge ${nodes[u].label}→${nodes[v].label}: in-degree ${inDeg[v] + 1}→${inDeg[v]}${enqueued ? ` ✓ enqueue "${nodes[v].label}"` : ''}`,
        ),
        inDegree: snap(), queue: [...queue], result: [...result],
        currentNode: u, activeEdge: [u, v],
        decreasedNode: v, newlyEnqueued: enqueued ? v : null,
        hasCycle: false, codeLine: enqueued ? 21 : 19,
      });
    }
  }

  const hasCycle = result.length < N;

  steps.push({
    type: hasCycle ? 'CYCLE_DETECTED' : 'DONE',
    description: hasCycle
      ? tr(`⚠️ 사이클 감지! 처리된 노드 수(${result.length}) < 전체(${N}). 위상정렬 불가.`, `⚠️ Cycle detected! Processed nodes (${result.length}) < total (${N}). No topological order exists.`)
      : tr(`[완료] 위상정렬: ${result.map(n => nodes[n].label).join(' → ')}`, `[Done] Topological order: ${result.map(n => nodes[n].label).join(' → ')}`),
    inDegree: snap(), queue: [...queue], result: [...result],
    currentNode: null, activeEdge: null,
    decreasedNode: null, newlyEnqueued: null,
    hasCycle, codeLine: hasCycle ? 24 : 25,
  });

  return steps;
}

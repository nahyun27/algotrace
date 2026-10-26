import type { DFSTopoStep, TopoNode } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateDFSTopoSteps(
  nodes: TopoNode[],
  edges: [number, number][],
  N: number,
  lang: Lang = 'ko',
): DFSTopoStep[] {
  const tr = makeTr(lang);
  const steps: DFSTopoStep[] = [];

  const adj: number[][] = Array.from({ length: N }, () => []);
  for (const [u, v] of edges) adj[u].push(v);

  const visited  = Array(N).fill(false);
  const inStack  = Array(N).fill(false);
  const finished = Array(N).fill(false);
  const stack: number[] = [];
  let hasCycle = false;

  const snapV  = () => [...visited];
  const snapIS = () => [...inStack];
  const snapF  = () => [...finished];
  const snapS  = () => [...stack];

  function dfs(u: number) {
    if (hasCycle) return;

    visited[u] = true;
    inStack[u] = true;

    steps.push({
      type: 'VISIT',
      description: tr(`"${nodes[u].label}" 방문 시작`, `Visit "${nodes[u].label}"`),
      visited: snapV(), inStack: snapIS(), finished: snapF(), stack: snapS(),
      result: [], currentNode: u, activeEdge: null,
      hasCycle: false, codeLine: 7,
    });

    for (const v of adj[u]) {
      if (hasCycle) return;

      if (!visited[v]) {
        steps.push({
          type: 'VISIT',
          description: tr(`간선 ${nodes[u].label}→${nodes[v].label} 탐색`, `Follow edge ${nodes[u].label}→${nodes[v].label}`),
          visited: snapV(), inStack: snapIS(), finished: snapF(), stack: snapS(),
          result: [], currentNode: u, activeEdge: [u, v],
          hasCycle: false, codeLine: 11,
        });
        dfs(v);
      } else if (inStack[v]) {
        hasCycle = true;
        steps.push({
          type: 'CYCLE_DETECTED',
          description: tr(`역방향 간선 ${nodes[u].label}→${nodes[v].label} 발견! 사이클이 존재합니다.`, `Back edge ${nodes[u].label}→${nodes[v].label} found! The graph has a cycle.`),
          visited: snapV(), inStack: snapIS(), finished: snapF(), stack: snapS(),
          result: [], currentNode: u, activeEdge: [u, v],
          hasCycle: true, codeLine: 13,
        });
        return;
      }
    }

    if (!hasCycle) {
      inStack[u] = false;
      finished[u] = true;
      stack.push(u);

      steps.push({
        type: 'FINISH',
        description: tr(
          `"${nodes[u].label}" DFS 완료 → 스택 push. 스택: [${stack.map(n => nodes[n].label).join(', ')}]`,
          `"${nodes[u].label}" finished → push it onto the stack. Stack: [${stack.map(n => nodes[n].label).join(', ')}]`,
        ),
        visited: snapV(), inStack: snapIS(), finished: snapF(), stack: snapS(),
        result: [], currentNode: u, activeEdge: null,
        hasCycle: false, codeLine: 16,
      });
    }
  }

  for (let i = 0; i < N; i++) {
    if (!visited[i] && !hasCycle) dfs(i);
  }

  const result = [...stack].reverse();

  steps.push({
    type: hasCycle ? 'CYCLE_DETECTED' : 'DONE',
    description: hasCycle
      ? tr('사이클이 감지되어 위상정렬이 불가능합니다.', 'A cycle was detected, so no topological order exists.')
      : tr(`[완료] 스택 역순 = 위상정렬: ${result.map(n => nodes[n].label).join(' → ')}`, `[Done] Reversed stack = topological order: ${result.map(n => nodes[n].label).join(' → ')}`),
    visited: snapV(), inStack: snapIS(), finished: snapF(), stack: snapS(),
    result: hasCycle ? [] : result,
    currentNode: null, activeEdge: null,
    hasCycle, codeLine: hasCycle ? 0 : 22,
  });

  return steps;
}

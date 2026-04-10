import type { BFSStep } from './types';
import { BFS_DFS_DEFAULT_GRAPH } from './types';

// Converts edges into undirected adjacency list
function buildAdj(edges: [number, number, number][], n: number): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u); // BFS/DFS here are undirected
  }
  // Sort for deterministic traversal order
  for (let i = 0; i < n; i++) adj[i].sort((a, b) => a - b);
  return adj;
}

export function generateBFSSteps(
  customEdges?: [number, number, number][],
  customN?: number
): BFSStep[] {
  const N = customN ?? BFS_DFS_DEFAULT_GRAPH.nodes.length;
  const edges: [number, number, number][] = customEdges ?? BFS_DFS_DEFAULT_GRAPH.edges.map(e => [e.from, e.to, e.weight]);
  
  const adj = buildAdj(edges, N);
  const steps: BFSStep[] = [];
  
  const queue: number[] = [];
  const visitedSet = new Set<number>();
  const visitedNodes: number[] = [];
  const treeEdges: [number, number][] = [];
  
  const start = 0;

  const cloneQueue = () => [...queue];
  const cloneVisitedSet = () => Array.from(visitedSet);
  const cloneVisitedNodes = () => [...visitedNodes];
  const cloneTreeEdges = () => [...treeEdges] as [number, number][];

  function getCodeLine(type: BFSStep['type']): number {
    switch (type) {
      case 'INIT': return 4;
      case 'ENQUEUE': return 15;
      case 'DEQUEUE': return 10;
      case 'DISCOVER': return 12;
      case 'DONE': return 17;
      default: return 0;
    }
  }

  const addStep = (
    type: BFSStep['type'],
    desc: string,
    cur: number | null,
    nbr: number | null,
    edge: [number, number] | null
  ) => {
    steps.push({
      type,
      description: desc,
      currentNode: cur,
      neighborNode: nbr,
      activeEdge: edge,
      visitedNodes: cloneVisitedNodes(),
      visitedSet: cloneVisitedSet(),
      treeEdges: cloneTreeEdges(),
      queue: cloneQueue(),
      isImprovement: false, // NA for BFS
      codeLine: getCodeLine(type)
    });
  };

  // INIT
  queue.push(start);
  visitedSet.add(start);
  
  addStep('INIT', `초기화: 시작 노드 ${start}을(를) 큐에 삽입하고 방문 처리.`, null, null, null);

  while (queue.length > 0) {
    const u = queue.shift()!;
    visitedNodes.push(u);
    
    addStep('DEQUEUE', `큐에서 노드 ${u}을(를) 꺼냄. 방문 순서 최종 확정.`, u, null, null);

    for (const v of adj[u]) {
      addStep('DISCOVER', `노드 ${u}의 인접 노드 ${v} 탐색.`, u, v, [u, v]);
      
      if (!visitedSet.has(v)) {
        visitedSet.add(v);
        queue.push(v);
        treeEdges.push([u, v]);
        addStep('ENQUEUE', `노드 ${v} 방문 안됨 → 큐에 삽입.`, u, v, [u, v]);
      } else {
        addStep('DISCOVER', `노드 ${v}는 이미 방문(발견)되어 무시함.`, u, v, [u, v]);
      }
    }
  }
  
  addStep('DONE', `큐가 비었습니다. 탐색 완료!`, null, null, null);
  
  return steps;
}

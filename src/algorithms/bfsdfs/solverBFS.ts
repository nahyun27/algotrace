import type { BFSStep, DataItem } from './types';
import { BFS_DFS_DEFAULT_GRAPH } from './types';
import { makeTr, type Lang } from '../../i18n';

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
  customN?: number,
  lang: Lang = 'ko',
): BFSStep[] {
  const tr = makeTr(lang);
  const N = customN ?? BFS_DFS_DEFAULT_GRAPH.nodes.length;
  const edges: [number, number, number][] = customEdges ?? BFS_DFS_DEFAULT_GRAPH.edges.map(e => [e.from, e.to, e.weight]);
  
  const adj = buildAdj(edges, N);
  const steps: BFSStep[] = [];
  
  let entryId = 0;
  const queue: DataItem[] = [];
  const visitedSet = new Set<number>();
  const visitedNodes: number[] = [];
  const treeEdges: [number, number][] = [];
  
  const start = 0;

  const cloneQueue = () => queue.map(item => ({ ...item }));
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
  queue.push({ id: `e-${entryId++}`, value: start });
  visitedSet.add(start);
  
  addStep('INIT', tr(`초기화: 시작 노드 ${start}을(를) 큐에 삽입하고 방문 처리.`, `Init: push start node ${start} into the queue and mark it discovered.`), null, null, null);

  while (queue.length > 0) {
    const { value: u } = queue.shift()!;
    visitedNodes.push(u);
    
    addStep('DEQUEUE', tr(`큐에서 노드 ${u}을(를) 꺼냄. 방문 순서 최종 확정.`, `Dequeue node ${u} — its place in the visit order is now final.`), u, null, null);

    for (const v of adj[u]) {
      addStep('DISCOVER', tr(`노드 ${u}의 인접 노드 ${v} 탐색.`, `Check neighbor ${v} of node ${u}.`), u, v, [u, v]);
      
      if (!visitedSet.has(v)) {
        visitedSet.add(v);
        queue.push({ id: `e-${entryId++}`, value: v });
        treeEdges.push([u, v]);
        addStep('ENQUEUE', tr(`노드 ${v} 방문 안됨 → 큐에 삽입.`, `Node ${v} is undiscovered → mark it discovered and enqueue it.`), u, v, [u, v]);
      } else {
        addStep('DISCOVER', tr(`노드 ${v}는 이미 방문(발견)되어 무시함.`, `Node ${v} is already discovered — skip it.`), u, v, [u, v]);
      }
    }
  }
  
  addStep('DONE', tr('큐가 비었습니다. 탐색 완료!', 'The queue is empty. Traversal complete!'), null, null, null);
  
  return steps;
}

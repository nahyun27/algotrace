import type { DFSStep, DataItem } from './types';
import { BFS_DFS_DEFAULT_GRAPH } from './types';
import { makeTr, type Lang } from '../../i18n';

// Converts edges into undirected adjacency list
function buildAdj(edges: [number, number, number][], n: number): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u); // Undirected
  }
  // Sort for deterministic traversal order
  for (let i = 0; i < n; i++) adj[i].sort((a, b) => a - b);
  return adj;
}

export function generateDFSSteps(
  customEdges?: [number, number, number][],
  customN?: number,
  lang: Lang = 'ko',
): DFSStep[] {
  const tr = makeTr(lang);
  const N = customN ?? BFS_DFS_DEFAULT_GRAPH.nodes.length;
  const edges: [number, number, number][] = customEdges ?? BFS_DFS_DEFAULT_GRAPH.edges.map(e => [e.from, e.to, e.weight]);
  
  const adj = buildAdj(edges, N);
  const steps: DFSStep[] = [];
  
  let entryId = 0;
  const stack: DataItem[] = [];
  const visitedSet = new Set<number>();
  const visitedNodes: number[] = [];
  const treeEdges: [number, number][] = [];
  
  const start = 0;

  const cloneStack = () => stack.map(item => ({ ...item }));
  const cloneVisitedSet = () => Array.from(visitedSet);
  const cloneVisitedNodes = () => [...visitedNodes];
  const cloneTreeEdges = () => [...treeEdges] as [number, number][];

  function getCodeLine(type: DFSStep['type']): number {
    switch (type) {
      case 'INIT': return 4;
      case 'PUSH': return 16;
      case 'POP': return 7;
      case 'DISCOVER': return 13; // for v in reversed(graph)
      case 'DONE': return 18;
      default: return 0;
    }
  }

  const addStep = (
    type: DFSStep['type'],
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
      stack: cloneStack(),
      isImprovement: false, // NA for DFS
      codeLine: getCodeLine(type)
    });
  };

  // INIT
  stack.push({ id: `e-${entryId++}`, value: start });
  
  addStep('INIT', tr(`초기화: 시작 노드 ${start}을(를) 스택에 삽입.`, `Init: push start node ${start} onto the stack.`), null, null, null);

  while (stack.length > 0) {
    const { value: u } = stack.pop()!;
    addStep('POP', tr(`스택에서 노드 ${u}을(를) 꺼냄.`, `Pop node ${u} from the stack.`), u, null, null);
    
    if (!visitedSet.has(u)) {
      visitedSet.add(u);
      visitedNodes.push(u);
      
      addStep('POP', tr(`노드 ${u} 방문 처리 및 방문 순서 확정.`, `Mark node ${u} as visited and fix its place in the visit order.`), u, null, null);

      // To maintain numeric smallest-first, we process reversed children so smallest is at top of stack.
      const neighbors = [...adj[u]].reverse();
      for (const v of neighbors) {
        addStep('DISCOVER', tr(`노드 ${u}의 인접 노드 ${v} 탐색.`, `Look at neighbor ${v} of node ${u}.`), u, v, [u, v]);
        
        if (!visitedSet.has(v)) {
          treeEdges.push([u, v]);
          stack.push({ id: `e-${entryId++}`, value: v });
          addStep('PUSH', tr(`노드 ${v} 아직 방문 안됨 → 스택에 삽입.`, `Node ${v} isn't visited yet → push it onto the stack.`), u, v, [u, v]);
        } else {
          addStep('DISCOVER', tr(`노드 ${v}는 이미 방문되어 무시함.`, `Node ${v} is already visited — skip it.`), u, v, [u, v]);
        }
      }
    } else {
      addStep('POP', tr(`스택에서 꺼낸 노드 ${u}는 이미 방문 완료됨 → 무시.`, `Popped node ${u} was already visited → skip.`), u, null, null);
    }
  }
  
  addStep('DONE', tr('스택이 비었습니다. 깊이 우선 탐색(DFS) 완료!', 'The stack is empty. Depth-first search complete!'), null, null, null);
  
  return steps;
}

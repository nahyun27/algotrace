import type { AStarStep } from './types';
import { ASTAR_DEFAULT_GRAPH } from '../../types/graph';
import { makeTr, type Lang } from '../../i18n';

// calculate euclidean distance
function calcDist(p1: {x: number, y: number}, p2: {x: number, y: number}) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Custom scale factor to make euclidean distances (often 100-300 in pixels) mapped closer to logical weights (like 2-8).
const HEURISTIC_SCALE = 30; 

export function generateAStarSteps(
  edges?: [number, number, number][],
  N?: number,
  nodePositions?: { id: number; x: number; y: number }[],
  lang: Lang = 'ko',
): AStarStep[] {
  const tr = makeTr(lang);
  // If not provided, use default
  if (!edges || N === undefined || !nodePositions) {
    const sorted = [...ASTAR_DEFAULT_GRAPH.nodes].sort((a, b) => a.id - b.id);
    N = sorted.length;
    const idMap = new Map(sorted.map((n, i) => [n.id, i]));
    edges = ASTAR_DEFAULT_GRAPH.edges.map(e => [
      idMap.get(e.from)!, idMap.get(e.to)!, e.weight
    ]) as [number, number, number][];
    nodePositions = sorted.map((n, i) => ({ id: i, x: n.x, y: n.y }));
  }

  const steps: AStarStep[] = [];
  const start = 0;
  const goal = N - 1;

  const adj: [number, number][][] = Array.from({ length: N }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push([v, w]);
  }

  // Pre-calculate h(x)
  const goalPos = nodePositions.find(p => p.id === goal)!;
  const h = new Array(N).fill(0);
  for (let i = 0; i < N; i++) {
    const pos = nodePositions.find(p => p.id === i)!;
    h[i] = Math.round(calcDist(pos, goalPos) / HEURISTIC_SCALE * 10) / 10; // keep one decimal
  }

  const g = new Array(N).fill(Infinity);
  const f = new Array(N).fill(Infinity);
  const parent = new Array(N).fill(-1);
  const closedSet = new Set<number>();
  
  // openSet queue: [f, g, u]
  const openQueue: [number, number, number][] = [];
  
  let nodesExplored = 0;

  // Snapshot helper
  const addStep = (
    type: AStarStep['type'],
    desc: string,
    curNode: number | null,
    actEdge: [number, number] | null,
    isImp: boolean
  ) => {
    steps.push({
      type,
      description: desc,
      g: [...g],
      h: [...h],
      f: [...f],
      parent: [...parent],
      openSet: Array.from(new Set(
        openQueue
          .filter(item => !closedSet.has(item[2]))
          .map(item => item[2])
      )),
      closedSet: Array.from(closedSet),
      currentProcessingNode: curNode,
      activeEdge: actEdge,
      isImprovement: isImp,
      nodesExplored,
      codeLine: getCodeLine(type)
    });
  };

  function getCodeLine(type: AStarStep['type']): number {
    switch(type) {
      case 'INIT': return 8; // start of algorithm setup
      case 'DEQUEUE': return 13; // while q: u = heappop
      case 'DONE': return 15; // if u == goal: return
      case 'RELAX': return 18; // for v, w in adj[u]
      case 'CLOSE': return 13; // conceptually part of the loop end
      default: return 0;
    }
  }

  // INIT
  g[start] = 0;
  f[start] = g[start] + h[start];
  openQueue.push([f[start], g[start], start]);
  
  addStep('INIT', tr(`A* 시작: 출발점(S=${start}), 목표점(G=${goal}). 초기화 완료 f=g+h`, `A* starts: start S=${start}, goal G=${goal}. Initialized with f = g + h.`), null, null, false);

  while (openQueue.length > 0) {
    // pop min f
    openQueue.sort((a, b) => {
      if (a[0] !== b[0]) return a[0] - b[0]; // sort by f ascending
      return a[1] - b[1]; // sort by g ascending (if f same, pick shorter path taken, or whatever tie breaker)
    });
    
    const [currF, currG, u] = openQueue.shift()!;

    if (closedSet.has(u)) continue;

    nodesExplored++;
    addStep('DEQUEUE', tr(`Open Set에서 f값이 가장 작은 노드 ${u} (f=${currF})를 꺼냄.`, `Pop node ${u} with the smallest f (f=${currF}) from the open set.`), u, null, false);

    if (u === goal) {
      addStep('DONE', tr(`[종료] 목표 노드 ${goal}에 도달했습니다! 총 탐색 노드: ${nodesExplored}개.`, `[Done] Reached goal node ${goal}! Nodes explored: ${nodesExplored}.`), u, null, false);
      return steps;
    }

    if (currG > g[u]) continue; // outdated

    // RELAX neighbors
    for (const [v, weight] of adj[u]) {
      const nextG = g[u] + weight;
      const nextF = nextG + h[v];
      
      const isImprovement = nextG < g[v];
      
      let desc = '';
      if (isImprovement) {
        desc = tr(`노드 ${v} 갱신: 기존 g=${g[v] === Infinity ? '∞' : g[v]} > 새 g=${nextG}. f값은 ${nextF}로 갱신.`, `Update node ${v}: old g=${g[v] === Infinity ? '∞' : g[v]} > new g=${nextG}. f becomes ${nextF}.`);
      } else {
        desc = tr(`노드 ${v} 갱신 실패: 새 g=${nextG} 가 기존 g=${g[v]} 보다 크거나 같음.`, `No update for node ${v}: new g=${nextG} is not smaller than current g=${g[v]}.`);
      }
      addStep('RELAX', desc, u, [u, v], isImprovement);

      if (isImprovement) {
        g[v] = nextG;
        f[v] = nextF;
        parent[v] = u;
        openQueue.push([f[v], g[v], v]);
      }
    }

    closedSet.add(u);
    addStep('CLOSE', tr(`노드 ${u} 처리 완료. Closed Set에 추가.`, `Node ${u} done. Added to the closed set.`), u, null, false);
  }

  addStep('DONE', tr(`[종료] 목표 노드 ${goal}에 도달할 수 없습니다.`, `[Done] Goal node ${goal} cannot be reached.`), null, null, false);
  return steps;
}

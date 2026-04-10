import type { GraphData } from '../../types/graph';

export interface BaseStep {
  type: 'ENQUEUE' | 'PUSH' | 'DEQUEUE' | 'POP' | 'DISCOVER' | 'DONE' | 'INIT';
  description: string;
  currentNode: number | null;
  neighborNode: number | null;
  activeEdge: [number, number] | null;
  visitedNodes: number[]; // order of visits finalized
  visitedSet: number[]; // Set of marked as seen (for coloring in BFS when pushed, DFS when popped)
  treeEdges: [number, number][]; // Tracks the edges that form the BFS/DFS tree
  isImprovement: boolean;
  codeLine: number;
}

export interface BFSStep extends BaseStep {
  queue: number[];
}

export interface DFSStep extends BaseStep {
  stack: number[];
}

export const BFS_DFS_DEFAULT_GRAPH: GraphData = {
  directed: false,
  nodes: [
    { id: 0, label: '0', x: 300, y: 50 },
    { id: 1, label: '1', x: 200, y: 150 },
    { id: 2, label: '2', x: 400, y: 150 },
    { id: 3, label: '3', x: 150, y: 250 },
    { id: 4, label: '4', x: 250, y: 250 },
    { id: 5, label: '5', x: 350, y: 250 },
    { id: 6, label: '6', x: 450, y: 250 },
  ],
  edges: [
    { id: '0-1', from: 0, to: 1, weight: 1 },
    { id: '0-2', from: 0, to: 2, weight: 1 },
    { id: '1-3', from: 1, to: 3, weight: 1 },
    { id: '1-4', from: 1, to: 4, weight: 1 },
    { id: '2-5', from: 2, to: 5, weight: 1 },
    { id: '2-6', from: 2, to: 6, weight: 1 },
  ]
};

export const BFS_CODE = `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    visited_order = []

    while queue:
        u = queue.popleft()
        visited_order.append(u)

        # 인접 노드 발견
        for v in graph[u]:
            if v not in visited:
                visited.add(v)
                queue.append(v)
                
    return visited_order`;

export const DFS_CODE = `def dfs(graph, start):
    visited = set()
    stack = [start]
    visited_order = []

    while stack:
        u = stack.pop()
        
        # 스택에서 꺼낼 때 방문 처리
        if u not in visited:
            visited.add(u)
            visited_order.append(u)

            # 정방향을 유지하려면 스택엔 인접 노드를 역순 삽입
            for v in reversed(graph[u]):
                if v not in visited:
                    stack.append(v)
                    
    return visited_order`;

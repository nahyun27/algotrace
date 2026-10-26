import type { Lang } from '../../i18n';

// ── Step types ────────────────────────────────────────────────────────────────

export type KahnStepType =
  | 'INIT'
  | 'ENQUEUE'
  | 'DEQUEUE'
  | 'DECREASE'
  | 'CYCLE_DETECTED'
  | 'DONE';

export type DFSTopoStepType =
  | 'VISIT'
  | 'FINISH'
  | 'CYCLE_DETECTED'
  | 'DONE';

export interface KahnStep {
  type: KahnStepType;
  description: string;
  inDegree: number[];
  queue: number[];
  result: number[];
  currentNode: number | null;
  activeEdge: [number, number] | null;
  decreasedNode: number | null;
  newlyEnqueued: number | null;
  hasCycle: boolean;
  codeLine: number;
}

export interface DFSTopoStep {
  type: DFSTopoStepType;
  description: string;
  visited: boolean[];
  inStack: boolean[];
  finished: boolean[];
  stack: number[];     // push order
  result: number[];    // reverse of stack (final answer, only set on DONE)
  currentNode: number | null;
  activeEdge: [number, number] | null;
  hasCycle: boolean;
  codeLine: number;
}

// ── Graph data ────────────────────────────────────────────────────────────────

/** Display text in both languages */
export interface LocalizedText {
  ko: string;
  en: string;
}

/** Node as consumed by solvers and components (label already localized) */
export interface TopoNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

/** Node as defined in the example data (label in both languages) */
export interface TopoNodeDef {
  id: number;
  label: LocalizedText;
  x: number;
  y: number;
}

export const TOPO_N = 7;

export const TOPO_NODES: TopoNodeDef[] = [
  { id: 0, label: { ko: '수학',     en: 'Math' },     x: 70,  y: 190 },
  { id: 1, label: { ko: '물리',     en: 'Physics' },  x: 200, y: 90  },
  { id: 2, label: { ko: '알고리즘', en: 'Algo' },     x: 200, y: 290 },
  { id: 3, label: { ko: '자료구조', en: 'DS' },       x: 335, y: 190 },
  { id: 4, label: { ko: '운영체제', en: 'OS' },       x: 465, y: 90  },
  { id: 5, label: { ko: '컴파일러', en: 'Compiler' }, x: 465, y: 290 },
  { id: 6, label: { ko: '졸업',     en: 'Graduate' }, x: 590, y: 190 },
];

export const TOPO_EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3],
  [1, 4],
  [2, 3],
  [3, 4], [3, 5],
  [4, 6],
  [5, 6],
];

// Cycle example
export const CYCLE_N = 3;

export const CYCLE_NODES: TopoNodeDef[] = [
  { id: 0, label: { ko: 'A', en: 'A' }, x: 150, y: 190 },
  { id: 1, label: { ko: 'B', en: 'B' }, x: 370, y: 90  },
  { id: 2, label: { ko: 'C', en: 'C' }, x: 370, y: 290 },
];

export const CYCLE_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 0],
];

export type TopoExampleId = 'dag' | 'cycle';

export interface TopoExample {
  name: LocalizedText;
  nodes: TopoNodeDef[];
  edges: [number, number][];
  N: number;
}

export const TOPO_EXAMPLES: Record<TopoExampleId, TopoExample> = {
  dag:   { name: { ko: '수강신청 (DAG)', en: 'Course plan (DAG)' }, nodes: TOPO_NODES,  edges: TOPO_EDGES,  N: TOPO_N },
  cycle: { name: { ko: '사이클',         en: 'Cycle' },             nodes: CYCLE_NODES, edges: CYCLE_EDGES, N: CYCLE_N },
};

/** Resolve node labels for the current language */
export function localizeNodes(nodes: TopoNodeDef[], lang: Lang): TopoNode[] {
  return nodes.map(n => ({ ...n, label: n.label[lang] }));
}

// ── Source code ────────────────────────────────────────────────────────────────

export const KAHN_CODE = `from collections import deque

def topological_kahn(graph, n):
    in_degree = [0] * n
    for u in range(n):
        for v in graph[u]:
            in_degree[v] += 1

    queue = deque()
    for i in range(n):
        if in_degree[i] == 0:
            queue.append(i)

    result = []
    while queue:
        u = queue.popleft()
        result.append(u)

        for v in graph[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    if len(result) != n:
        return None  # 사이클 감지
    return result`;

export const DFS_TOPO_CODE = `def topological_dfs(graph, n):
    visited  = [False] * n
    in_stack = [False] * n
    stack    = []

    def dfs(u):
        visited[u]  = True
        in_stack[u] = True

        for v in graph[u]:
            if not visited[v]:
                dfs(v)
            elif in_stack[v]:   # back edge → 사이클
                return

        in_stack[u] = False
        stack.append(u)

    for i in range(n):
        if not visited[i]:
            dfs(i)

    return stack[::-1]`;

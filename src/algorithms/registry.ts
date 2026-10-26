import type { LucideIcon } from 'lucide-react';
import { Waypoints, Navigation, TrendingDown, Grid3x3, Network, ListOrdered, Share2, Route, BarChart3 } from 'lucide-react';

/**
 * Single source of truth for the algorithm catalogue — the sidebar, home page,
 * top bar breadcrumb and router all read from here.
 */

export interface Localized {
  ko: string;
  en: string;
}

export type CategoryId = 'shortest-path' | 'graph' | 'dp' | 'sorting';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Category {
  id: CategoryId;
  name: Localized;
  /** Gradient used for icon tiles of this category */
  gradient: string;
}

export interface AlgorithmMeta {
  slug: string;
  category: CategoryId;
  icon: LucideIcon;
  name: Localized;
  description: Localized;
  difficulty: Difficulty;
  time: string;
  space: string;
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  { id: 'shortest-path', name: { ko: '최단 경로', en: 'Shortest Path' },        gradient: 'from-sky-400 to-blue-500' },
  { id: 'graph',         name: { ko: '그래프 & 트리', en: 'Graph & Tree' },      gradient: 'from-emerald-400 to-teal-500' },
  { id: 'dp',            name: { ko: '동적 계획법', en: 'Dynamic Programming' }, gradient: 'from-violet-400 to-fuchsia-500' },
  { id: 'sorting',       name: { ko: '정렬', en: 'Sorting' },                   gradient: 'from-amber-400 to-orange-500' },
];

export const ALGORITHMS: AlgorithmMeta[] = [
  {
    slug: 'dijkstra', category: 'shortest-path', icon: Waypoints,
    name: { ko: '다익스트라', en: 'Dijkstra' },
    description: {
      ko: '가중치 그래프에서 한 출발점으로부터 모든 노드까지의 최단 거리를 구해요.',
      en: 'Shortest distances from a single source to every node in a weighted graph.',
    },
    difficulty: 'medium', time: 'O((V+E) log V)', space: 'O(V)', keywords: ['dijkstra', 'shortest', 'priority queue', 'heap'],
  },
  {
    slug: 'astar', category: 'shortest-path', icon: Navigation,
    name: { ko: 'A* 탐색', en: 'A* Search' },
    description: {
      ko: '휴리스틱으로 목적지 방향을 먼저 살펴서 더 빠르게 최단 경로를 찾아요.',
      en: 'Uses a heuristic to head toward the goal and find the shortest path faster.',
    },
    difficulty: 'hard', time: 'O(E log V)', space: 'O(V)', keywords: ['astar', 'a*', 'heuristic', 'grid', 'maze'],
  },
  {
    slug: 'bellmanford', category: 'shortest-path', icon: TrendingDown,
    name: { ko: '벨만-포드', en: 'Bellman-Ford' },
    description: {
      ko: '음수 간선이 있어도 최단 경로를 구하고, 음수 사이클을 찾아내요.',
      en: 'Handles negative edges and detects negative-weight cycles.',
    },
    difficulty: 'medium', time: 'O(V·E)', space: 'O(V)', keywords: ['bellman', 'ford', 'negative cycle'],
  },
  {
    slug: 'floyd-warshall', category: 'shortest-path', icon: Grid3x3,
    name: { ko: '플로이드-워셜', en: 'Floyd-Warshall' },
    description: {
      ko: '모든 노드 쌍 사이의 최단 거리를 동적 계획법으로 한 번에 구해요.',
      en: 'All-pairs shortest paths with dynamic programming.',
    },
    difficulty: 'medium', time: 'O(V³)', space: 'O(V²)', keywords: ['floyd', 'warshall', 'all pairs'],
  },
  {
    slug: 'bfsdfs', category: 'graph', icon: Network,
    name: { ko: 'BFS / DFS', en: 'BFS / DFS' },
    description: {
      ko: '큐(BFS)와 스택(DFS)으로 그래프를 탐색하는 가장 기본적인 방법이에요.',
      en: 'The two fundamental graph traversals, using a queue (BFS) and a stack (DFS).',
    },
    difficulty: 'easy', time: 'O(V+E)', space: 'O(V)', keywords: ['bfs', 'dfs', 'breadth', 'depth', 'queue', 'stack', 'traversal'],
  },
  {
    slug: 'topological', category: 'graph', icon: ListOrdered,
    name: { ko: '위상 정렬', en: 'Topological Sort' },
    description: {
      ko: '방향 비순환 그래프(DAG)에서 선후 관계를 지키는 순서를 찾아요.',
      en: 'Orders the vertices of a DAG so every edge points forward.',
    },
    difficulty: 'medium', time: 'O(V+E)', space: 'O(V+E)', keywords: ['topological', 'kahn', 'dag', 'indegree'],
  },
  {
    slug: 'kruskal', category: 'graph', icon: Share2,
    name: { ko: '크루스칼 / 프림', en: 'Kruskal / Prim' },
    description: {
      ko: '모든 노드를 가장 적은 비용으로 잇는 최소 신장 트리(MST)를 만들어요.',
      en: 'Builds a minimum spanning tree (MST) that connects every node at the lowest cost.',
    },
    difficulty: 'hard', time: 'O(E log E)', space: 'O(V+E)', keywords: ['kruskal', 'prim', 'mst', 'spanning', 'union find'],
  },
  {
    slug: 'tsp', category: 'dp', icon: Route,
    name: { ko: '외판원 순회 (TSP)', en: 'Traveling Salesperson' },
    description: {
      ko: '모든 도시를 한 번씩 방문하고 돌아오는 가장 짧은 경로를 비트마스크 DP로 구해요.',
      en: 'Shortest tour visiting every city once, solved with bitmask DP.',
    },
    difficulty: 'hard', time: 'O(N²·2ᴺ)', space: 'O(N·2ᴺ)', keywords: ['tsp', 'traveling', 'salesman', 'bitmask', 'dp'],
  },
  {
    slug: 'sorting', category: 'sorting', icon: BarChart3,
    name: { ko: '정렬 알고리즘', en: 'Sorting Suite' },
    description: {
      ko: '버블·선택·삽입·병합·퀵·힙 정렬이 배열을 정리하는 과정을 비교해요.',
      en: 'Compare bubble, selection, insertion, merge, quick and heap sort side by side.',
    },
    difficulty: 'easy', time: 'O(n log n)', space: 'O(n)', keywords: ['sort', 'bubble', 'merge', 'quick', 'heap', 'insertion', 'selection'],
  },
];

export function getAlgorithm(slug: string | undefined) {
  return ALGORITHMS.find(a => a.slug === slug);
}

export function getCategory(id: CategoryId) {
  return CATEGORIES.find(c => c.id === id)!;
}

export const DIFFICULTY_LABEL: Record<Difficulty, Localized> = {
  easy:   { ko: '쉬움', en: 'Easy' },
  medium: { ko: '보통', en: 'Medium' },
  hard:   { ko: '어려움', en: 'Hard' },
};

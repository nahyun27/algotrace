import { Navigation } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'astar', category: 'shortest-path', order: 2, icon: Navigation,
  name: { ko: 'A* 탐색', en: 'A* search' },
  description: {
    ko: '휴리스틱으로 목적지 방향을 먼저 살펴서 더 빠르게 최단 경로를 찾아요.',
    en: 'Uses a heuristic to head toward the goal and find the shortest path faster.',
  },
  difficulty: 'hard', time: 'O((V+E) log V)', space: 'O(V)', keywords: ['astar', 'a*', 'heuristic', 'grid', 'maze'],
  load: () => import('../../pages/algorithms/AStarPage'),
});

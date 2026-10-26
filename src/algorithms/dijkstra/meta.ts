import { Waypoints } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'dijkstra', category: 'shortest-path', order: 1, icon: Waypoints,
  name: { ko: '다익스트라', en: 'Dijkstra' },
  description: {
    ko: '가중치 그래프에서 한 출발점으로부터 모든 노드까지의 최단 거리를 구해요.',
    en: 'Shortest distances from a single source to every node in a weighted graph.',
  },
  difficulty: 'medium', time: 'O((V+E) log V)', space: 'O(V)', keywords: ['dijkstra', 'shortest', 'priority queue', 'heap'],
  load: () => import('../../pages/algorithms/DijkstraPage'),
});

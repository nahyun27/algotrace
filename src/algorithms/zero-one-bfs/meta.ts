import { BrickWall } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'zero-one-bfs', category: 'shortest-path', order: 5, icon: BrickWall,
  name: { ko: '0-1 BFS', en: '0-1 BFS' },
  description: {
    ko: '간선 가중치가 0 또는 1뿐일 때 덱 하나로 최단 거리를 선형 시간에 구해요.',
    en: 'Shortest paths in linear time with a deque when every edge weighs 0 or 1.',
  },
  difficulty: 'medium', time: 'O(V+E)', space: 'O(V)',
  keywords: ['0-1 bfs', '01bfs', 'zero one', 'deque', 'bfs', 'shortest', 'grid', 'wall', '알고스팟'],
  load: () => import('../../pages/algorithms/ZeroOneBFSPage'),
});

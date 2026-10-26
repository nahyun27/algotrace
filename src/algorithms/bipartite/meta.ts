import { Split } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'bipartite', category: 'graph', order: 4, icon: Split,
  name: { ko: '이분 그래프 판별', en: 'Bipartite check' },
  description: {
    ko: 'BFS로 노드를 두 색으로 칠해서, 모든 간선이 다른 색끼리 잇는지 확인해요.',
    en: 'Two-color the nodes with BFS and check that every edge joins different colors.',
  },
  difficulty: 'medium', time: 'O(V+E)', space: 'O(V)', keywords: ['bipartite', 'two coloring', 'bfs', 'odd cycle', 'two color'],
  load: () => import('../../pages/algorithms/BipartitePage'),
});

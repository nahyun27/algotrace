import { Network } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'bfsdfs', category: 'graph', order: 1, icon: Network,
  name: { ko: 'BFS / DFS', en: 'BFS / DFS' },
  description: {
    ko: '큐(BFS)와 스택(DFS)으로 그래프를 탐색하는 가장 기본적인 방법이에요.',
    en: 'The two fundamental graph traversals, using a queue (BFS) and a stack (DFS).',
  },
  difficulty: 'easy', time: 'O(V+E)', space: 'O(V)', keywords: ['bfs', 'dfs', 'breadth', 'depth', 'queue', 'stack', 'traversal'],
  load: () => import('../../pages/algorithms/BFSDFSPage'),
});

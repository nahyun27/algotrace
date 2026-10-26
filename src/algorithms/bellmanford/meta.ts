import { TrendingDown } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'bellmanford', category: 'shortest-path', order: 3, icon: TrendingDown,
  name: { ko: '벨만-포드', en: 'Bellman-Ford' },
  description: {
    ko: '음수 간선이 있어도 최단 경로를 구하고, 음수 사이클을 찾아내요.',
    en: 'Handles negative edges and detects negative-weight cycles.',
  },
  difficulty: 'medium', time: 'O(V·E)', space: 'O(V)', keywords: ['bellman', 'ford', 'negative cycle'],
  load: () => import('../../pages/algorithms/BellmanFordPage'),
});

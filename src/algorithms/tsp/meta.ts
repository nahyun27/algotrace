import { Route } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'tsp', category: 'dp', order: 1, icon: Route,
  name: { ko: '외판원 순회 (TSP)', en: 'Traveling salesperson' },
  description: {
    ko: '모든 도시를 한 번씩 방문하고 돌아오는 가장 짧은 경로를 비트마스크 DP로 구해요.',
    en: 'Shortest tour visiting every city once, solved with bitmask DP.',
  },
  difficulty: 'hard', time: 'O(N²·2ᴺ)', space: 'O(N·2ᴺ)', keywords: ['tsp', 'traveling', 'salesman', 'bitmask', 'dp'],
  load: () => import('../../pages/algorithms/TSPPage'),
});

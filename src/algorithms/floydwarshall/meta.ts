import { Grid3x3 } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'floyd-warshall', category: 'shortest-path', order: 4, icon: Grid3x3,
  name: { ko: '플로이드-워셜', en: 'Floyd-Warshall' },
  description: {
    ko: '모든 노드 쌍 사이의 최단 거리를 동적 계획법으로 한 번에 구해요.',
    en: 'All-pairs shortest paths with dynamic programming.',
  },
  difficulty: 'medium', time: 'O(V³)', space: 'O(V²)', keywords: ['floyd', 'warshall', 'all pairs'],
  load: () => import('../../pages/algorithms/FloydWarshallPage'),
});

import { Share2 } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'kruskal', category: 'graph', order: 3, icon: Share2,
  name: { ko: '크루스칼 / 프림', en: 'Kruskal / Prim' },
  description: {
    ko: '모든 노드를 가장 적은 비용으로 잇는 최소 신장 트리(MST)를 만들어요.',
    en: 'Builds a minimum spanning tree (MST) that connects every node at the lowest cost.',
  },
  difficulty: 'hard', time: 'O(E log E)', space: 'O(V+E)', keywords: ['kruskal', 'prim', 'mst', 'spanning', 'union find'],
  load: () => import('../../pages/algorithms/KruskalPage'),
});

import { ListOrdered } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'topological', category: 'graph', order: 2, icon: ListOrdered,
  name: { ko: '위상 정렬', en: 'Topological sort' },
  description: {
    ko: '방향 비순환 그래프(DAG)에서 선후 관계를 지키는 순서를 찾아요.',
    en: 'Orders the nodes of a DAG so every edge points forward.',
  },
  difficulty: 'medium', time: 'O(V+E)', space: 'O(V+E)', keywords: ['topological', 'kahn', 'dag', 'indegree'],
  load: () => import('../../pages/algorithms/TopologicalPage'),
});

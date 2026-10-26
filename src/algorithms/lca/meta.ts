import { GitMerge } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'lca', category: 'graph', order: 5, icon: GitMerge,
  name: { ko: '최소 공통 조상 (LCA)', en: 'Lowest common ancestor (LCA)' },
  shortName: { ko: '최소 공통 조상', en: 'LCA' },
  description: {
    ko: '2^k번째 조상 표(binary lifting)를 미리 만들어 두 노드의 가장 가까운 공통 조상을 O(log N)에 찾아요.',
    en: 'Precompute every 2^k-th ancestor (binary lifting) to find the lowest common ancestor of two nodes in O(log N).',
  },
  difficulty: 'hard', time: 'O(N log N)', space: 'O(N log N)',
  keywords: ['lca', 'lowest common ancestor', 'binary lifting', 'sparse table', 'tree', 'ancestor', 'common ancestor'],
  load: () => import('../../pages/algorithms/LCAPage'),
});

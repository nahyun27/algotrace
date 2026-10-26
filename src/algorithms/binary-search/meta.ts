import { Search } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'binary-search', category: 'search', order: 1, icon: Search,
  name: { ko: '이분 탐색', en: 'Binary search' },
  description: {
    ko: '정렬된 배열에서 탐색 구간을 절반씩 줄여 값을 찾고, 답의 범위를 이분 탐색하는 파라메트릭 서치까지 다뤄요.',
    en: 'Halve the search range of a sorted array each step. Also covers lower bound and parametric search over the answer.',
  },
  difficulty: 'easy', time: 'O(log n)', space: 'O(1)',
  keywords: ['binary', 'search', 'lower bound', 'parametric', 'bisect', '이분', '이진'],
  load: () => import('../../pages/algorithms/BinarySearchPage'),
});

import { BarChart3 } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'sorting', category: 'sorting', order: 1, icon: BarChart3,
  name: { ko: '정렬 알고리즘', en: 'Sorting algorithms' },
  description: {
    ko: '버블·선택·삽입·병합·퀵·힙 정렬이 배열을 정리하는 과정을 비교해요.',
    en: 'Compare bubble, selection, insertion, merge, quick and heap sort side by side.',
  },
  difficulty: 'easy', time: 'O(n log n)', space: 'O(n)', keywords: ['sort', 'bubble', 'merge', 'quick', 'heap', 'insertion', 'selection'],
  load: () => import('../../pages/algorithms/SortingPage'),
});

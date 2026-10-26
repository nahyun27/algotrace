import { Triangle } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'heap', category: 'data-structure', order: 1, icon: Triangle,
  name: { ko: '힙 (우선순위 큐)', en: 'Heap (priority queue)' },
  shortName: { ko: '힙', en: 'Heap' },
  description: {
    ko: '배열로 만든 완전 이진 트리에서 값을 위로 올리고 아래로 내려 최솟값을 항상 루트에 둬요.',
    en: 'A complete binary tree stored in an array that keeps the minimum at the root by sifting values up and down.',
  },
  difficulty: 'easy', time: 'O(log n)', space: 'O(n)',
  keywords: ['heap', 'priority queue', 'heapq', 'min heap', 'max heap', 'heapify', 'sift', '힙', '우선순위 큐', '최소 힙', '최대 힙'],
  load: () => import('../../pages/algorithms/HeapPage'),
});

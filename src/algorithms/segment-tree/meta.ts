import { Network } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'segment-tree', category: 'data-structure', order: 2, icon: Network,
  name: { ko: '세그먼트 트리 · 펜윅 트리', en: 'Segment tree · Fenwick tree' },
  shortName: { ko: '세그먼트 트리', en: 'Segment tree' },
  description: {
    ko: '값이 바뀌는 배열에서 구간 합과 값 바꾸기를 모두 O(log n)에 처리해요. 펜윅 트리(BIT)도 함께 다뤄요.',
    en: 'Range sums and point updates on a changing array, both in O(log n). Includes the Fenwick tree (BIT).',
  },
  difficulty: 'hard', time: 'O(log n)', space: 'O(n)',
  keywords: ['segment tree', 'fenwick', 'bit', 'binary indexed tree', 'range sum', 'range query', '세그먼트 트리', '펜윅 트리', '구간 합'],
  load: () => import('../../pages/algorithms/SegmentTreePage'),
});

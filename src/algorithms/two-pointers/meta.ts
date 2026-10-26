import { MoveHorizontal } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'two-pointers', category: 'search', order: 2, icon: MoveHorizontal,
  name: { ko: '투 포인터', en: 'Two pointers' },
  description: {
    ko: '두 포인터로 연속 구간을 늘리고 줄이며 조건을 만족하는 구간을 O(n)에 찾아요. 슬라이딩 윈도우도 함께 다뤄요.',
    en: 'Grow and shrink a contiguous window with two pointers to find matching subarrays in O(n). Includes the sliding window.',
  },
  difficulty: 'easy', time: 'O(n)', space: 'O(1)',
  keywords: ['two pointers', 'sliding window', 'subarray', 'window', '투 포인터', '슬라이딩 윈도우', '구간 합'],
  load: () => import('../../pages/algorithms/TwoPointersPage'),
});

import { TrendingUp } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'lis', category: 'dp', order: 2, icon: TrendingUp,
  name: { ko: '최장 증가 부분 수열 (LIS)', en: 'Longest increasing subsequence' },
  shortName: { ko: '최장 증가 부분 수열', en: 'LIS' },
  description: {
    ko: '수열에서 값이 계속 커지는 가장 긴 부분 수열을 O(n²) DP와 O(n log n) 이분 탐색으로 구해요.',
    en: 'Longest strictly increasing subsequence, with O(n²) DP and the O(n log n) binary-search method.',
  },
  difficulty: 'medium', time: 'O(n log n)', space: 'O(n)',
  keywords: ['lis', 'longest', 'increasing', 'subsequence', 'dp', 'binary search'],
  load: () => import('../../pages/algorithms/LISPage'),
});

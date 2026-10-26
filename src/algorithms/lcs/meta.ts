import { GitCompareArrows } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'lcs', category: 'dp', order: 3, icon: GitCompareArrows,
  name: { ko: 'LCS · 편집 거리', en: 'LCS · Edit distance' },
  description: {
    ko: '두 문자열의 최장 공통 부분 수열과 최소 편집 횟수를 2차원 DP 표로 구해요.',
    en: 'Longest common subsequence and minimum edit count of two strings, with a 2-D DP table.',
  },
  difficulty: 'medium', time: 'O(nm)', space: 'O(nm)',
  keywords: ['lcs', 'longest common subsequence', 'edit distance', 'levenshtein', 'string', 'dp'],
  load: () => import('../../pages/algorithms/LCSPage'),
});

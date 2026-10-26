import { Backpack } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'knapsack', category: 'dp', order: 4, icon: Backpack,
  name: { ko: '0/1 배낭 문제', en: '0/1 knapsack' },
  description: {
    ko: '무게 제한 안에서 가치의 합이 가장 크도록 물건을 고르는 방법을 DP 표로 구해요.',
    en: 'Pick items to maximize total value within a weight limit, using a DP table.',
  },
  difficulty: 'medium', time: 'O(NK)', space: 'O(NK)',
  keywords: ['knapsack', '0/1', 'backpack', 'dp', 'subset'],
  load: () => import('../../pages/algorithms/KnapsackPage'),
});

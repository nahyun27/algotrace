import { Crown } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'backtracking', category: 'backtracking', order: 1, icon: Crown,
  name: { ko: 'N-Queen · 스도쿠', en: 'N-Queens · Sudoku' },
  shortName: { ko: '백트래킹', en: 'Backtracking' },
  description: {
    ko: '하나씩 놓아 보고, 막히면 되돌아가며 모든 경우를 탐색해요.',
    en: 'Place one piece at a time and step back as soon as a choice leads to a dead end.',
  },
  difficulty: 'medium', time: 'O(N!)', space: 'O(N)',
  keywords: ['backtracking', 'n-queen', 'n queens', 'queen', 'sudoku', 'dfs', 'recursion'],
  load: () => import('../../pages/algorithms/BacktrackingPage'),
});

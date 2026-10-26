import { ListTree } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'trie', category: 'string', order: 2, icon: ListTree,
  name: { ko: '트라이', en: 'Trie' },
  description: {
    ko: '문자열을 글자 단위 트리에 저장해 단어와 접두사를 길이 L에 비례하는 시간에 찾아요.',
    en: 'Stores strings in a character tree so words and prefixes are found in time proportional to their length.',
  },
  difficulty: 'medium', time: 'O(L)', space: 'O(total characters)',
  keywords: ['trie', 'prefix tree', 'prefix', 'string', 'starts with', 'autocomplete', '트라이', '접두사', '문자열'],
  load: () => import('../../pages/algorithms/TriePage'),
});

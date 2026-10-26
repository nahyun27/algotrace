import { TextSearch } from 'lucide-react';
import { defineAlgorithm } from '../catalog';

export default defineAlgorithm({
  slug: 'kmp', category: 'string', order: 1, icon: TextSearch,
  name: { ko: 'KMP 문자열 검색', en: 'KMP string search' },
  shortName: { ko: 'KMP', en: 'KMP' },
  description: {
    ko: '실패 함수(pi)로 이미 맞은 글자를 다시 비교하지 않고, 텍스트를 한 번만 훑어 패턴을 모두 찾아요.',
    en: 'Uses a failure table (pi) to never re-compare matched characters, finding every occurrence in one pass over the text.',
  },
  difficulty: 'hard', time: 'O(n + m)', space: 'O(m)',
  keywords: ['kmp', 'knuth', 'morris', 'pratt', 'string', 'pattern', 'failure function', 'pi', '문자열', '실패 함수'],
  load: () => import('../../pages/algorithms/KMPPage'),
});

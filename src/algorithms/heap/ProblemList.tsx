import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function HeapProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1927,  title: '최소 힙',          tier: 'Silver II', nLimit: 'N ≤ 100,000', note: tr('삽입과 최솟값 꺼내기', 'Insert and extract min') },
        { id: 11279, title: '최대 힙',          tier: 'Silver II', nLimit: 'N ≤ 100,000', note: tr('비교 방향만 뒤집기', 'Flip the comparison') },
        { id: 11286, title: '절댓값 힙',        tier: 'Silver I',  nLimit: 'N ≤ 100,000', note: tr('(절댓값, 값) 순서로 비교', 'Compare by (|x|, x)') },
        { id: 1655,  title: '가운데를 말해요',  tier: 'Gold II',   nLimit: 'N ≤ 100,000', note: tr('최대 힙 + 최소 힙 두 개', 'Two heaps: max and min') },
      ]}
    />
  );
}

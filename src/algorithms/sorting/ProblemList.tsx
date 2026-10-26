import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function SortingProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 2750,  title: '수 정렬하기',   tier: 'Bronze II', nLimit: 'N ≤ 1,000',      note: tr('기본 정렬', 'Basic sorting') },
        { id: 2751,  title: '수 정렬하기 2', tier: 'Silver V',  nLimit: 'N ≤ 1,000,000',  note: tr('O(N log N) 필요', 'Needs O(N log N)') },
        { id: 10989, title: '수 정렬하기 3', tier: 'Silver V',  nLimit: 'N ≤ 10,000,000', note: tr('계수 정렬 (메모리 8MB)', 'Counting sort (8 MB memory)') },
        { id: 11931, title: '수 정렬하기 4', tier: 'Silver V',  nLimit: 'N ≤ 1,000,000',  note: tr('내림차순 정렬', 'Sort in descending order') },
      ]}
    />
  );
}

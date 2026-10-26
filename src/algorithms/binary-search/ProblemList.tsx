import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function BinarySearchProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1920, title: '수 찾기',     tier: 'Silver IV', nLimit: 'N ≤ 100,000',   note: tr('기본 이분 탐색', 'Classic binary search') },
        { id: 10816, title: '숫자 카드 2', tier: 'Silver IV', nLimit: 'N ≤ 500,000',   note: tr('upper − lower bound로 개수 세기', 'Count with upper − lower bound') },
        { id: 2805, title: '나무 자르기', tier: 'Silver II', nLimit: 'N ≤ 1,000,000', note: tr('파라메트릭 서치 (이 화면의 예제)', 'Parametric search (this example)') },
        { id: 1654, title: '랜선 자르기', tier: 'Silver II', nLimit: 'N ≤ 1,000,000', note: tr('파라메트릭 서치 · 범위 주의', 'Parametric search · mind the range') },
      ]}
    />
  );
}

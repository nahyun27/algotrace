import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function KMPProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1786, title: '찾기',        tier: 'Platinum V', nLimit: 'n, m ≤ 1,000,000', note: tr('KMP 기본: 모든 등장 위치 출력', 'Classic KMP: print every occurrence') },
        { id: 1701, title: 'Cubeditor',   tier: 'Gold III',   nLimit: 'L ≤ 5,000',        note: tr('모든 접미사의 pi 최댓값', 'Max of pi over every suffix') },
        { id: 4354, title: '문자열 제곱', tier: 'Gold I',     nLimit: 'L ≤ 1,000,000',    note: tr('반복 단위 길이 = n - pi[n-1]', 'Period length = n - pi[n-1]') },
      ]}
    />
  );
}

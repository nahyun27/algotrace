import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function TwoPointersProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 2003, title: '수들의 합 2', tier: 'Silver IV', nLimit: 'N ≤ 10,000',  note: tr('구간 합 (이 화면의 예제)', 'Subarray sum (this example)') },
        { id: 1806, title: '부분합',      tier: 'Gold IV',   nLimit: 'N < 100,000', note: tr('합이 S 이상인 가장 짧은 구간', 'Shortest window with sum ≥ S') },
        { id: 2559, title: '수열',        tier: 'Silver III', nLimit: 'N ≤ 100,000', note: tr('슬라이딩 윈도우 (이 화면의 예제)', 'Sliding window (this example)') },
      ]}
    />
  );
}

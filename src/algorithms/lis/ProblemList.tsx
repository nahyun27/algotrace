import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function LISProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 11053, title: '가장 긴 증가하는 부분 수열',   tier: 'Silver II', nLimit: 'N ≤ 1,000',     note: tr('O(n²) DP 기본', 'Classic O(n²) DP') },
        { id: 12015, title: '가장 긴 증가하는 부분 수열 2', tier: 'Gold II',   nLimit: 'N ≤ 1,000,000', note: tr('O(n log n) 이분 탐색 필수', 'Needs O(n log n) binary search') },
        { id: 14002, title: '가장 긴 증가하는 부분 수열 4', tier: 'Gold IV',   nLimit: 'N ≤ 1,000',     note: tr('수열 자체도 출력 (역추적)', 'Print the subsequence too (backtracking)') },
      ]}
    />
  );
}

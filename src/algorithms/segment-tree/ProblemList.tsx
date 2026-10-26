import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function SegmentTreeProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 11659, title: '구간 합 구하기 4', tier: 'Silver III', nLimit: 'N ≤ 100,000',   note: tr('값이 안 바뀌면 누적 합으로 충분', 'No updates: prefix sums are enough') },
        { id: 2042,  title: '구간 합 구하기',   tier: 'Gold I',     nLimit: 'N ≤ 1,000,000', note: tr('기본 세그먼트 트리 · 펜윅 트리', 'Classic segment tree or Fenwick tree') },
        { id: 2357,  title: '최솟값과 최댓값',  tier: 'Gold I',     nLimit: 'N ≤ 100,000',   note: tr('합 대신 min, max를 저장', 'Store min and max instead of sums') },
        { id: 11505, title: '구간 곱 구하기',   tier: 'Gold I',     nLimit: 'N ≤ 1,000,000', note: tr('곱 (mod), 0 때문에 세그먼트 트리', 'Products mod p; zeros call for a segment tree') },
      ]}
    />
  );
}

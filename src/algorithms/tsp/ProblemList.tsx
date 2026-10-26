import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function TSPProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 10971, title: '외판원 순회 2', tier: 'Silver II', nLimit: 'N ≤ 10', note: tr('O(N!) 완전탐색 가능', 'O(N!) brute force works') },
        { id: 2098,  title: '외판원 순회',   tier: 'Gold I',    nLimit: 'N ≤ 16', note: tr('O(N² 2^N) DP 필수', 'O(N² 2^N) DP required') },
        { id: 16991, title: '외판원 순회 3', tier: 'Gold I',    nLimit: 'N ≤ 16', note: tr('O(N² 2^N) 좌표 거리 DP', 'O(N² 2^N) DP on coordinate distances') },
      ]}
    />
  );
}

import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function KnapsackProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 12865, title: '평범한 배낭', tier: 'Gold V',    nLimit: 'N ≤ 100, K ≤ 100,000', note: tr('0/1 배낭의 기본형', 'The classic 0/1 knapsack') },
        { id: 7579,  title: '앱',          tier: 'Gold III',  nLimit: 'N ≤ 100',              note: tr('비용을 용량 축으로 바꿔서 풀기', 'Index the table by cost instead of memory') },
        { id: 1535,  title: '안녕',        tier: 'Silver II', nLimit: 'N ≤ 20',               note: tr('체력을 무게로 보는 배낭', 'Knapsack with health as the weight') },
      ]}
    />
  );
}

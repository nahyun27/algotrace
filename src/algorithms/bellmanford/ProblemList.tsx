import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function BFProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 11657, title: '타임머신',      tier: 'Gold IV', nLimit: 'N ≤ 500',   note: tr('기본 벨만-포드', 'Classic Bellman-Ford') },
        { id: 1219,  title: '오민식의 고민', tier: 'Gold II', nLimit: 'N ≤ 1,000', note: tr('음수 사이클', 'Negative cycles') },
        { id: 1738,  title: '골목길',        tier: 'Gold I',  nLimit: 'N ≤ 1,000', note: tr('음수 가중치 최장 경로', 'Longest path with negative weights') },
      ]}
    />
  );
}

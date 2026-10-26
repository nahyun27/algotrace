import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function TopoProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 2252, title: '줄 세우기',    tier: 'Gold III', nLimit: 'N ≤ 32,000',  note: tr('기본 위상정렬', 'Classic topological sort') },
        { id: 1005, title: 'ACM Craft',    tier: 'Gold III', nLimit: 'T,N ≤ 1,000', note: tr('위상정렬 + DP', 'Topological sort + DP') },
        { id: 1516, title: '게임 개발',    tier: 'Gold III', nLimit: 'N ≤ 500',     note: tr('위상정렬 + DP', 'Topological sort + DP') },
        { id: 2623, title: '음악프로그램', tier: 'Gold III', nLimit: 'N ≤ 1,000',   note: tr('위상정렬 응용', 'Topological sort application') },
      ]}
    />
  );
}

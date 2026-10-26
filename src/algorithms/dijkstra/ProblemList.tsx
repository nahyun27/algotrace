import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function DijkstraProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1753, title: '최단경로',        tier: 'Gold V',   nLimit: 'V ≤ 20,000', note: tr('기본 다익스트라', 'Classic Dijkstra') },
        { id: 1916, title: '최소비용 구하기', tier: 'Gold V',   nLimit: 'N ≤ 1,000',  note: tr('단일 출발-도착', 'Single source → target') },
        { id: 1238, title: '파티',            tier: 'Gold III', nLimit: 'N ≤ 1,000',  note: tr('역방향 그래프 활용', 'Use the reversed graph') },
      ]}
    />
  );
}

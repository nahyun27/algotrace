import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function AStarProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1504, title: '특정한 최단 경로', tier: 'Gold IV',  nLimit: 'N ≤ 800',   note: tr('다익스트라/A* 기초 응용', 'Basic Dijkstra / A* application') },
        { id: 1238, title: '파티',            tier: 'Gold III', nLimit: 'N ≤ 1,000', note: tr('방향 그래프 최단경로', 'Shortest paths on a directed graph') },
        { id: 9370, title: '미확인 도착지',    tier: 'Gold II',  nLimit: 'N ≤ 2,000', note: tr('최단경로 역추적', 'Trace back the shortest path') },
      ]}
    />
  );
}

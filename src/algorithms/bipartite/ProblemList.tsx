import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function BipartiteProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1260, title: 'DFS와 BFS', tier: 'Silver II', nLimit: 'N ≤ 1,000', note: tr('먼저 BFS 구현에 익숙해지기', 'Warm up: get comfortable with BFS first') },
        { id: 1707, title: '이분 그래프', tier: 'Gold IV', nLimit: 'V ≤ 20,000, E ≤ 200,000', note: tr('여러 테스트 케이스 · 연결되지 않은 그래프 주의', 'Several test cases; the graph may be disconnected') },
      ]}
    />
  );
}

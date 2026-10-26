import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function GridAStarProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1261, title: '알고스팟',           tier: 'Gold IV',  nLimit: 'N,M ≤ 100',  note: tr('0-1 BFS (벽 부수기)', '0-1 BFS (breaking walls)') },
        { id: 3055, title: '탈출',               tier: 'Gold IV',  nLimit: 'R,C ≤ 50',   note: tr('BFS 격자 탐색', 'BFS on a grid') },
        { id: 1600, title: '말이 되고픈 원숭이', tier: 'Gold III', nLimit: 'W,H ≤ 200',  note: tr('상태 확장 BFS', 'BFS with extended state') },
        { id: 1753, title: '최단경로',           tier: 'Gold IV',  nLimit: 'V ≤ 20,000', note: tr('A* 적용 가능', 'A* can be applied') },
      ]}
    />
  );
}

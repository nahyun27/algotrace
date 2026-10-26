import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function BFSDFSProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1260, title: 'DFS와 BFS',      tier: 'Silver II', nLimit: 'N ≤ 1,000', note: tr('가장 기본적인 구현', 'The most basic implementation') },
        { id: 2178, title: '미로 탐색',      tier: 'Silver I',  nLimit: 'N,M ≤ 100', note: tr('BFS(최단경로)', 'BFS for shortest path') },
        { id: 1012, title: '유기농 배추',    tier: 'Silver II', nLimit: 'T, N ≤ 50', note: tr('DFS/BFS 연결요소 탐색', 'Count connected components with DFS/BFS') },
        { id: 2667, title: '단지번호붙이기', tier: 'Silver I',  nLimit: 'N ≤ 25',    note: tr('방문 영역 넓이 구하기', 'Measure the size of each region') },
      ]}
    />
  );
}

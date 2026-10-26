import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function PrimProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1197, title: '최소 스패닝 트리', tier: 'Gold IV',  nLimit: 'V,E ≤ 10,000', note: tr('크루스칼 / 프림 둘 다 가능', 'Kruskal or Prim both work') },
        { id: 1922, title: '네트워크 연결',     tier: 'Gold IV',  nLimit: 'N ≤ 1,000',     note: tr('프림 또는 크루스칼', 'Prim or Kruskal') },
        { id: 9372, title: '상근이의 여행',     tier: 'Gold V',   nLimit: 'T,N ≤ 1,000',   note: tr('MST 간선 수 = N-1', 'MST edge count = N-1') },
        { id: 4386, title: '별자리 만들기',     tier: 'Gold III', nLimit: 'N ≤ 100',        note: tr('좌표 MST', 'MST over coordinates') },
      ]}
    />
  );
}

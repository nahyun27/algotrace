import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function KruskalProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1197, title: '최소 스패닝 트리', tier: 'Gold IV',  nLimit: 'V,E ≤ 10,000', note: tr('기본 크루스칼 / 프림', 'Classic Kruskal / Prim') },
        { id: 1922, title: '네트워크 연결',     tier: 'Gold IV',  nLimit: 'N ≤ 1,000',     note: tr('크루스칼 + Union-Find', 'Kruskal + Union-Find') },
        { id: 4386, title: '별자리 만들기',     tier: 'Gold III', nLimit: 'N ≤ 100',        note: tr('좌표 MST', 'MST over coordinates') },
        { id: 1647, title: '도시 분할 계획',   tier: 'Gold II',  nLimit: 'N ≤ 100,000',   note: tr('MST 변형 (두 마을 분리)', 'MST twist (split into two villages)') },
      ]}
    />
  );
}
